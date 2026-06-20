INSERT INTO providers (slug, name, base_url, model, secret_name, credit_cost, sort_order)
SELECT 'caila', 'Caila', 'https://caila.io/api/adapters/openai/v1', 'just-ai/dalle-3', 'CAILA_API_KEY', 2, 1
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE slug='caila');

INSERT INTO providers (slug, name, base_url, model, secret_name, credit_cost, sort_order)
SELECT 'chutes', 'Chutes', 'https://image.chutes.ai/v1', 'FLUX.1-schnell', 'CHUTES_API_KEY', 1, 2
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE slug='chutes');

INSERT INTO providers (slug, name, base_url, model, secret_name, credit_cost, sort_order)
SELECT 'cerebras', 'Cerebras', 'https://api.cerebras.ai/v1', 'flux-pro', 'CEREBRAS_API_KEY', 2, 3
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE slug='cerebras');

INSERT INTO providers (slug, name, base_url, model, secret_name, credit_cost, sort_order)
SELECT 'openai', 'OpenAI', 'https://api.openai.com/v1', 'dall-e-3', 'OPENAI_API_KEY', 3, 4
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE slug='openai');

INSERT INTO plans (slug, name, price, credits, features, is_popular, sort_order)
SELECT 'free', 'Старт', 0, 30, '["30 кредитов в месяц","Базовые стили","Публичная галерея","Размер до 1024px"]'::jsonb, FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE slug='free');

INSERT INTO plans (slug, name, price, credits, features, is_popular, sort_order)
SELECT 'pro', 'Профи', 990, 500, '["500 кредитов в месяц","Все стили и провайдеры","Приватные генерации","Размер до 1792px","Приоритетная очередь"]'::jsonb, TRUE, 2
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE slug='pro');

INSERT INTO plans (slug, name, price, credits, features, is_popular, sort_order)
SELECT 'business', 'Бизнес', 2990, 2000, '["2000 кредитов в месяц","Все возможности Профи","API-доступ","Без водяных знаков","Командный доступ","Поддержка 24/7"]'::jsonb, FALSE, 3
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE slug='business');
