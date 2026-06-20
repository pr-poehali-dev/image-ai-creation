CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(120) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    credits INTEGER NOT NULL DEFAULT 30,
    plan VARCHAR(30) NOT NULL DEFAULT 'free',
    avatar_url TEXT,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    base_url TEXT NOT NULL,
    model VARCHAR(120) NOT NULL,
    secret_name VARCHAR(80),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    credit_cost INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    prompt TEXT NOT NULL,
    negative_prompt TEXT,
    style VARCHAR(60),
    provider_slug VARCHAR(50),
    size VARCHAR(20),
    steps INTEGER DEFAULT 30,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    error TEXT,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    likes_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    image_id INTEGER NOT NULL REFERENCES images(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, image_id)
);

CREATE TABLE IF NOT EXISTS plans (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(60) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    credits INTEGER NOT NULL DEFAULT 0,
    features JSONB NOT NULL DEFAULT '[]',
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_images_user ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_public ON images(is_public, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_image ON likes(image_id);
