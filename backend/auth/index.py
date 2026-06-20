import json
import os
import hashlib
import hmac
import base64
import time
import psycopg2


def _secret() -> str:
    return os.environ.get('DATABASE_URL', 'fallback-secret')[:32] or 'fallback-secret'


def make_token(user_id: int, role: str) -> str:
    payload = {'uid': user_id, 'role': role, 'exp': int(time.time()) + 60 * 60 * 24 * 30}
    raw = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()
    sig = hmac.new(_secret().encode(), raw.encode(), hashlib.sha256).hexdigest()[:32]
    return f'{raw}.{sig}'


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


def hash_password(password: str) -> str:
    salt = 'neuroart_salt_v1'
    return hashlib.sha256((salt + password).encode()).hexdigest()


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


def _user_public(row) -> dict:
    return {
        'id': row[0], 'email': row[1], 'name': row[2], 'role': row[3],
        'credits': row[4], 'plan': row[5], 'avatar_url': row[6],
    }


def handler(event: dict, context) -> dict:
    '''Авторизация: регистрация, вход и получение текущего пользователя по токену.'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return _resp(200, {})

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'me')

    if method == 'GET' and action == 'me':
        headers = event.get('headers') or {}
        token = headers.get('X-Auth-Token') or headers.get('x-auth-token', '')
        payload = verify_token(token)
        if not payload:
            return _resp(401, {'error': 'Не авторизован'})
        conn = _conn()
        cur = conn.cursor()
        cur.execute('SELECT id, email, name, role, credits, plan, avatar_url, is_blocked FROM users WHERE id = %s', (payload['uid'],))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row or row[7]:
            return _resp(401, {'error': 'Пользователь не найден или заблокирован'})
        return _resp(200, {'user': _user_public(row)})

    body = json.loads(event.get('body') or '{}')

    if method == 'POST' and action == 'register':
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''
        name = (body.get('name') or '').strip()
        if not email or len(password) < 6 or not name:
            return _resp(400, {'error': 'Заполните все поля, пароль от 6 символов'})
        conn = _conn()
        cur = conn.cursor()
        cur.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cur.fetchone():
            cur.close()
            conn.close()
            return _resp(409, {'error': 'Email уже зарегистрирован'})
        cur.execute('SELECT COUNT(*) FROM users')
        is_first = cur.fetchone()[0] == 0
        role = 'admin' if is_first else 'user'
        cur.execute(
            "INSERT INTO users (email, password_hash, name, role, last_login_at) VALUES (%s, %s, %s, %s, NOW()) "
            "RETURNING id, email, name, role, credits, plan, avatar_url",
            (email, hash_password(password), name, role),
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        token = make_token(row[0], row[3])
        return _resp(200, {'token': token, 'user': _user_public(row)})

    if method == 'POST' and action == 'login':
        email = (body.get('email') or '').strip().lower()
        password = body.get('password') or ''
        conn = _conn()
        cur = conn.cursor()
        cur.execute('SELECT id, email, name, role, credits, plan, avatar_url, password_hash, is_blocked FROM users WHERE email = %s', (email,))
        row = cur.fetchone()
        if not row or row[7] != hash_password(password):
            cur.close()
            conn.close()
            return _resp(401, {'error': 'Неверный email или пароль'})
        if row[8]:
            cur.close()
            conn.close()
            return _resp(403, {'error': 'Аккаунт заблокирован'})
        cur.execute('UPDATE users SET last_login_at = NOW() WHERE id = %s', (row[0],))
        conn.commit()
        cur.close()
        conn.close()
        token = make_token(row[0], row[3])
        return _resp(200, {'token': token, 'user': _user_public(row)})

    return _resp(404, {'error': 'Неизвестное действие'})
