const URLS = {
  auth: 'https://functions.poehali.dev/bb18ef03-428d-4810-9b28-843086bfab5d',
  api: 'https://functions.poehali.dev/388afd8f-94d9-4eb2-b7ae-5f137ecb7a64',
  generate: 'https://functions.poehali.dev/7ee80f61-76ac-415d-9a48-f09d5f9cef63',
};

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  credits: number;
  plan: string;
  avatar_url?: string | null;
}

const TOKEN_KEY = 'neuroart_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['X-Auth-Token'] = t;
  return h;
}

async function handle(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

export const authApi = {
  register: (email: string, password: string, name: string) =>
    fetch(`${URLS.auth}?action=register`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, password, name }) }).then(handle),
  login: (email: string, password: string) =>
    fetch(`${URLS.auth}?action=login`, { method: 'POST', headers: headers(), body: JSON.stringify({ email, password }) }).then(handle),
  me: () => fetch(`${URLS.auth}?action=me`, { headers: headers() }).then(handle),
};

export const api = {
  plans: () => fetch(`${URLS.api}?resource=plans`, { headers: headers() }).then(handle),
  providers: () => fetch(`${URLS.api}?resource=providers`, { headers: headers() }).then(handle),
  gallery: () => fetch(`${URLS.api}?resource=gallery`, { headers: headers() }).then(handle),
  history: () => fetch(`${URLS.api}?resource=history`, { headers: headers() }).then(handle),
  like: (image_id: number) =>
    fetch(`${URLS.api}?resource=like`, { method: 'POST', headers: headers(), body: JSON.stringify({ image_id }) }).then(handle),
  updateProfile: (data: { name?: string; avatar_url?: string }) =>
    fetch(`${URLS.api}?resource=profile`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handle),
  setImagePublic: (image_id: number, is_public: boolean) =>
    fetch(`${URLS.api}?resource=image`, { method: 'PUT', headers: headers(), body: JSON.stringify({ image_id, is_public }) }).then(handle),
  deleteImage: (id: number) =>
    fetch(`${URLS.api}?resource=image&id=${id}`, { method: 'DELETE', headers: headers() }).then(handle),
  subscribe: (plan: string) =>
    fetch(`${URLS.api}?resource=subscribe`, { method: 'POST', headers: headers(), body: JSON.stringify({ plan }) }).then(handle),
  contact: (data: { name: string; email: string; subject?: string; message: string }) =>
    fetch(`${URLS.api}?resource=contact`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handle),
  generate: (data: { prompt: string; style: string; provider: string; size: string; steps: number; is_public: boolean }) =>
    fetch(URLS.generate, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handle),
  // admin
  adminStats: () => fetch(`${URLS.api}?resource=admin_stats`, { headers: headers() }).then(handle),
  adminUsers: () => fetch(`${URLS.api}?resource=admin_users`, { headers: headers() }).then(handle),
  adminUpdateUser: (data: { id: number; role?: string; is_blocked?: boolean; credits?: number }) =>
    fetch(`${URLS.api}?resource=admin_user`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handle),
  adminProviders: () => fetch(`${URLS.api}?resource=admin_providers`, { headers: headers() }).then(handle),
  adminUpdateProvider: (data: { id: number; is_active: boolean; credit_cost: number; model: string }) =>
    fetch(`${URLS.api}?resource=admin_provider`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handle),
  adminMessages: () => fetch(`${URLS.api}?resource=admin_messages`, { headers: headers() }).then(handle),
};
