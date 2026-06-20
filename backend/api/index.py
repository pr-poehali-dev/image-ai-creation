import json
import os
import hashlib
import hmac
import base64
import time
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


def _resp(status: int, body):
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


def _auth(event):
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
    return verify_token(token)


def handler(event: dict, context) -> dict:
    '''Главное API: галерея, история, лайки, тарифы, провайдеры, контакты и админ-операции.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return _resp(200, {})

    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', '')
    body = json.loads(event.get('body') or '{}')
    auth = _auth(event)

    conn = _conn()
    cur = conn.cursor()

    try:
        # ---- PUBLIC: тарифы ----
        if resource == 'plans' and method == 'GET':
            cur.execute('SELECT slug, name, price, credits, features, is_popular FROM plans ORDER BY sort_order')
            plans = [{'slug': r[0], 'name': r[1], 'price': r[2], 'credits': r[3], 'features': r[4], 'is_popular': r[5]} for r in cur.fetchall()]
            return _resp(200, {'plans': plans})

        # ---- PUBLIC: активные провайдеры ----
        if resource == 'providers' and method == 'GET' and not params.get('admin'):
            cur.execute('SELECT slug, name, credit_cost FROM providers WHERE is_active = TRUE ORDER BY sort_order')
            provs = [{'slug': r[0], 'name': r[1], 'credit_cost': r[2]} for r in cur.fetchall()]
            return _resp(200, {'providers': provs})

        # ---- PUBLIC: галерея ----
        if resource == 'gallery' and method == 'GET':
            uid = auth['uid'] if auth else 0
            cur.execute(
                "SELECT i.id, i.prompt, i.style, i.provider_slug, i.size, i.image_url, i.likes_count, "
                "u.name, i.created_at, "
                "EXISTS(SELECT 1 FROM likes l WHERE l.image_id=i.id AND l.user_id=%s) AS liked "
                "FROM images i JOIN users u ON u.id=i.user_id "
                "WHERE i.is_public=TRUE AND i.status='done' ORDER BY i.created_at DESC LIMIT 60",
                (uid,))
            rows = cur.fetchall()
            items = [{'id': r[0], 'prompt': r[1], 'style': r[2], 'provider': r[3], 'size': r[4],
                      'image_url': r[5], 'likes': r[6], 'author': r[7], 'created_at': r[8], 'liked': r[9]} for r in rows]
            return _resp(200, {'images': items})

        # ---- PUBLIC: форма контактов ----
        if resource == 'contact' and method == 'POST':
            name = (body.get('name') or '').strip()
            email = (body.get('email') or '').strip()
            message = (body.get('message') or '').strip()
            if not name or not email or not message:
                return _resp(400, {'error': 'Заполните все поля'})
            cur.execute('INSERT INTO contact_messages (name, email, subject, message) VALUES (%s,%s,%s,%s)',
                        (name, email, body.get('subject', ''), message))
            conn.commit()
            return _resp(200, {'ok': True})

        # ===== AUTH REQUIRED =====
        if not auth:
            return _resp(401, {'error': 'Не авторизован'})
        uid = auth['uid']
        role = auth['role']

        # ---- история текущего пользователя ----
        if resource == 'history' and method == 'GET':
            cur.execute(
                "SELECT id, prompt, style, provider_slug, size, image_url, status, is_public, likes_count, created_at "
                "FROM images WHERE user_id=%s ORDER BY created_at DESC LIMIT 100", (uid,))
            rows = cur.fetchall()
            items = [{'id': r[0], 'prompt': r[1], 'style': r[2], 'provider': r[3], 'size': r[4],
                      'image_url': r[5], 'status': r[6], 'is_public': r[7], 'likes': r[8], 'created_at': r[9]} for r in rows]
            return _resp(200, {'images': items})

        # ---- лайк/анлайк ----
        if resource == 'like' and method == 'POST':
            image_id = int(body.get('image_id'))
            cur.execute('SELECT id FROM likes WHERE user_id=%s AND image_id=%s', (uid, image_id))
            if cur.fetchone():
                cur.execute('DELETE FROM likes WHERE user_id=%s AND image_id=%s', (uid, image_id))
                cur.execute('UPDATE images SET likes_count = GREATEST(likes_count-1,0) WHERE id=%s RETURNING likes_count', (image_id,))
                liked = False
            else:
                cur.execute('INSERT INTO likes (user_id, image_id) VALUES (%s,%s)', (uid, image_id))
                cur.execute('UPDATE images SET likes_count = likes_count+1 WHERE id=%s RETURNING likes_count', (image_id,))
                liked = True
            new_count = cur.fetchone()[0]
            conn.commit()
            return _resp(200, {'liked': liked, 'likes': new_count})

        # ---- обновление профиля ----
        if resource == 'profile' and method == 'PUT':
            name = (body.get('name') or '').strip()
            avatar = body.get('avatar_url')
            if name:
                cur.execute('UPDATE users SET name=%s WHERE id=%s', (name, uid))
            if avatar is not None:
                cur.execute('UPDATE users SET avatar_url=%s WHERE id=%s', (avatar, uid))
            conn.commit()
            cur.execute('SELECT id, email, name, role, credits, plan, avatar_url FROM users WHERE id=%s', (uid,))
            r = cur.fetchone()
            return _resp(200, {'user': {'id': r[0], 'email': r[1], 'name': r[2], 'role': r[3], 'credits': r[4], 'plan': r[5], 'avatar_url': r[6]}})

        # ---- смена видимости / удаление изображения ----
        if resource == 'image' and method == 'PUT':
            image_id = int(body.get('image_id'))
            cur.execute('UPDATE images SET is_public=%s WHERE id=%s AND user_id=%s', (bool(body.get('is_public')), image_id, uid))
            conn.commit()
            return _resp(200, {'ok': True})

        if resource == 'image' and method == 'DELETE':
            image_id = int(params.get('id'))
            cur.execute('DELETE FROM likes WHERE image_id=%s', (image_id,))
            cur.execute('DELETE FROM images WHERE id=%s AND user_id=%s', (image_id, uid))
            conn.commit()
            return _resp(200, {'ok': True})

        # ---- покупка тарифа (демо: начисление кредитов) ----
        if resource == 'subscribe' and method == 'POST':
            plan_slug = body.get('plan')
            cur.execute('SELECT credits FROM plans WHERE slug=%s', (plan_slug,))
            prow = cur.fetchone()
            if not prow:
                return _resp(400, {'error': 'Тариф не найден'})
            cur.execute('UPDATE users SET plan=%s, credits=credits+%s WHERE id=%s', (plan_slug, prow[0], uid))
            conn.commit()
            cur.execute('SELECT credits, plan FROM users WHERE id=%s', (uid,))
            r = cur.fetchone()
            return _resp(200, {'credits': r[0], 'plan': r[1]})

        # ===== ADMIN ONLY =====
        if role != 'admin':
            return _resp(403, {'error': 'Недостаточно прав'})

        if resource == 'admin_stats' and method == 'GET':
            cur.execute('SELECT COUNT(*) FROM users')
            users_count = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM images')
            images_count = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM images WHERE status='done'")
            done_count = cur.fetchone()[0]
            cur.execute('SELECT COUNT(*) FROM contact_messages')
            msgs_count = cur.fetchone()[0]
            cur.execute("SELECT provider_slug, COUNT(*) FROM images GROUP BY provider_slug")
            by_provider = [{'provider': r[0], 'count': r[1]} for r in cur.fetchall()]
            cur.execute("SELECT TO_CHAR(created_at,'DD.MM') d, COUNT(*) FROM images GROUP BY d ORDER BY MIN(created_at) DESC LIMIT 7")
            by_day = [{'day': r[0], 'count': r[1]} for r in reversed(cur.fetchall())]
            return _resp(200, {'users': users_count, 'images': images_count, 'done': done_count,
                               'messages': msgs_count, 'by_provider': by_provider, 'by_day': by_day})

        if resource == 'admin_users' and method == 'GET':
            cur.execute('SELECT id, email, name, role, credits, plan, is_blocked, created_at, '
                        '(SELECT COUNT(*) FROM images WHERE user_id=users.id) FROM users ORDER BY created_at DESC')
            users = [{'id': r[0], 'email': r[1], 'name': r[2], 'role': r[3], 'credits': r[4], 'plan': r[5],
                      'is_blocked': r[6], 'created_at': r[7], 'images': r[8]} for r in cur.fetchall()]
            return _resp(200, {'users': users})

        if resource == 'admin_user' and method == 'PUT':
            target = int(body.get('id'))
            if 'role' in body:
                cur.execute('UPDATE users SET role=%s WHERE id=%s', (body['role'], target))
            if 'is_blocked' in body:
                cur.execute('UPDATE users SET is_blocked=%s WHERE id=%s', (bool(body['is_blocked']), target))
            if 'credits' in body:
                cur.execute('UPDATE users SET credits=%s WHERE id=%s', (int(body['credits']), target))
            conn.commit()
            return _resp(200, {'ok': True})

        if resource == 'admin_providers' and method == 'GET':
            cur.execute('SELECT id, slug, name, base_url, model, secret_name, is_active, credit_cost FROM providers ORDER BY sort_order')
            provs = [{'id': r[0], 'slug': r[1], 'name': r[2], 'base_url': r[3], 'model': r[4],
                      'secret_name': r[5], 'is_active': r[6], 'credit_cost': r[7]} for r in cur.fetchall()]
            return _resp(200, {'providers': provs})

        if resource == 'admin_provider' and method == 'PUT':
            pid = int(body.get('id'))
            cur.execute('UPDATE providers SET is_active=%s, credit_cost=%s, model=%s WHERE id=%s',
                        (bool(body.get('is_active', True)), int(body.get('credit_cost', 1)), body.get('model', ''), pid))
            conn.commit()
            return _resp(200, {'ok': True})

        if resource == 'admin_messages' and method == 'GET':
            cur.execute('SELECT id, name, email, subject, message, status, created_at FROM contact_messages ORDER BY created_at DESC')
            msgs = [{'id': r[0], 'name': r[1], 'email': r[2], 'subject': r[3], 'message': r[4], 'status': r[5], 'created_at': r[6]} for r in cur.fetchall()]
            return _resp(200, {'messages': msgs})

        return _resp(404, {'error': 'Ресурс не найден'})
    finally:
        cur.close()
        conn.close()
