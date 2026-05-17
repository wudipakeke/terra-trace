const BASE_URL = '/api';

let getToken: (() => string | null) = () => localStorage.getItem('terra-trace-auth');
let onUnauthorized: (() => void) | null = null;

export function setTokenGetter(fn: () => string | null) {
  getToken = fn;
}

export function setOnUnauthorized(fn: () => void) {
  onUnauthorized = fn;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem('terra-trace-auth');
    if (onUnauthorized) {
      onUnauthorized();
    } else {
      window.location.href = '/auth';
    }
    throw new Error('登录已过期');
  }

  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(json.message || '请求失败');
  }
  return json.data as T;
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
