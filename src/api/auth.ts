import { api } from './client';

export interface UserInfo {
  openId: string;
  name: string;
  avatar: string;
}

export interface LoginResult {
  token: string;
  user: UserInfo;
}

export const authApi = {
  getUrl: () => api.get<{ url: string }>('/auth/url'),
  login: (code: string) => api.post<LoginResult>('/auth/login', { code }),
  getProfile: () => api.get<UserInfo>('/auth/me'),
};
