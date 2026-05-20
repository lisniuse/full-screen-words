import axios, { AxiosError } from 'axios';
import { message } from 'antd';

const TOKEN_KEY = 'fsw-token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

const client = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

client.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as any).Authorization = `Bearer ${token}`;
  }
  return cfg;
});

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

client.interceptors.response.use(
  (res) => res,
  (err: AxiosError<any>) => {
    const status = err.response?.status;
    const msg =
      (err.response?.data as any)?.message ||
      (err.response?.data as any)?.error ||
      err.message ||
      '请求失败';
    if (status === 401) {
      setToken(null);
      onUnauthorized?.();
    } else if (status && status >= 400) {
      message.error(Array.isArray(msg) ? msg.join('; ') : msg);
    }
    return Promise.reject(err);
  },
);

export default client;
