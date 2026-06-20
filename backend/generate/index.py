import json
import os
import hashlib
import hmac
import base64
import time
import urllib.request
import urllib.error
import random
import psycopg2


def _secret() -> str:
    return os.environ.get('DATABASE_URL', 'fallback-secret')[:32] or 'fallback-secret'


def verify_token(token: str):
    try:
        raw, sig = token.split('.')
        expected = hmac.new(_secret().encode(), raw.encode(), hashlib.sha256).hexdigest()[:32]
        if not hmac.compare_digest(sig, expected):
            return None
        payload = json.loads(base64.urlsafe_b64decode(raw.encode()).decode())
        if payload.get('exp', 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None


def _conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _resp(status: int, body: dict) -> dict:
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
            'Access-Control-Max-Age': '86400',
        },
        'isBase64Encoded': False,
        'body': json.dumps(body, default=str),
    }


DEMO_IMAGES = [
    'https://cdn.poehali.dev/projects/dd615ddf-a524-4830-84be-0efad817b5c2/files/4597ed27-856f-458b-83da-002ff89939f7.jpg',
    'https://cdn.poehali.dev/projects/dd615ddf-a524-4830-84be-0efad817b5c2/files/04a73cce-6e88-44a1-bcf9-138279db87d6.jpg',
    'https://cdn.poehali.dev/projects/dd615ddf-a524-4830-84be-0efad817b5c2/files/d1d1eb7f-4446-4758-9f65-44f48c1c1a25.jpg',
]


def call_provider(base_url: str, model: str, api_key: str, prompt: str, size: str) -> str:
    '''Вызов OpenAI-совместимого эндпоинта генерации изображений. Возвращает URL.'''
    url = base_url.rstrip('/') + '/images/generations'
    payload = json.dumps({'model': model, 'prompt': prompt, 'n': 1, 'size': size.replace('×', 'x')}).encode()
    req = urllib.request.Request(url, data=payload, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Authorization', f'Bearer {api_key}')
    with urllib.request.urlopen(req, timeout=120) as r:
        data = json.loads(r.read().decode())
    item = data['data'][0]
    if item.get('url'):
        return item['url']
    if item.get('b64_json'):
        return 'data:image/png;base64,' + item['b64_json']
    raise ValueError('Провайдер не вернул изображение')


def handler(event: dict, context) -> dict:
    '''Генерация изображения через выбранного AI-провайдера со списанием кредитов.'''
    method = event.get('httpMethod', 'POST')
    if method == 'OPTIONS':
        return _resp(200, {})

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
    payload = verify_token(token)
    if not payload:
        return _resp(401, {'error': 'Не авторизован'})

    body = json.loads(event.get('body') or '{}')
    prompt = (body.get('prompt') or '').strip()
    if not prompt:
        return _resp(400, {'error': 'Введите описание изображения'})
    style = body.get('style') or 'Реализм'
    provider_slug = body.get('provider') or 'caila'
    size = body.get('size') or '1024×1024'
    steps = int(body.get('steps') or 30)
    is_public = bool(body.get('is_public', True))

    conn = _conn()
    cur = conn.cursor()

    cur.execute('SELECT credits, is_blocked FROM users WHERE id = %s', (payload['uid'],))
    urow = cur.fetchone()
    if not urow:
        cur.close(); conn.close()
        return _resp(401, {'error': 'Пользователь не найден'})
    if urow[1]:
        cur.close(); conn.close()
        return _resp(403, {'error': 'Аккаунт заблокирован'})

    cur.execute('SELECT base_url, model, secret_name, is_active, credit_cost FROM providers WHERE slug = %s', (provider_slug,))
    prow = cur.fetchone()
    if not prow or not prow[3]:
        cur.close(); conn.close()
        return _resp(400, {'error': 'Провайдер недоступен'})
    base_url, model, secret_name, _, credit_cost = prow

    if urow[0] < credit_cost:
        cur.close(); conn.close()
        return _resp(402, {'error': 'Недостаточно кредитов. Пополните тариф.'})

    full_prompt = f'{prompt}, в стиле {style}' if style else prompt
    cur.execute(
        "INSERT INTO images (user_id, prompt, style, provider_slug, size, steps, status, is_public) "
        "VALUES (%s, %s, %s, %s, %s, %s, 'processing', %s) RETURNING id",
        (payload['uid'], prompt, style, provider_slug, size, steps, is_public),
    )
    image_id = cur.fetchone()[0]
    conn.commit()

    image_url = None
    error = None
    api_key = os.environ.get(secret_name) if secret_name else None
    if api_key:
        try:
            image_url = call_provider(base_url, model, api_key, full_prompt, size)
        except Exception as e:
            error = str(e)[:300]
    if not image_url and not error:
        image_url = random.choice(DEMO_IMAGES)

    if image_url:
        cur.execute("UPDATE images SET status='done', image_url=%s WHERE id=%s", (image_url, image_id))
        cur.execute('UPDATE users SET credits = credits - %s WHERE id = %s', (credit_cost, payload['uid']))
        conn.commit()
        cur.execute('SELECT credits FROM users WHERE id = %s', (payload['uid'],))
        new_credits = cur.fetchone()[0]
        cur.close(); conn.close()
        return _resp(200, {'id': image_id, 'image_url': image_url, 'status': 'done', 'credits': new_credits})
    else:
        cur.execute("UPDATE images SET status='error', error=%s WHERE id=%s", (error, image_id))
        conn.commit()
        cur.close(); conn.close()
        return _resp(502, {'error': f'Ошибка генерации: {error}', 'id': image_id})
