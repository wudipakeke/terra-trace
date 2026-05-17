export interface UserProfile {
  id: string;
  username: string;
  phone?: string;
  avatar: string;
  passwordHash?: string;
  feishuOpenId?: string;
  feishuName?: string;
  wechatOpenId?: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthMethod = 'password' | 'phone' | 'wechat' | 'feishu';

export interface LoginFormData {
  method: AuthMethod;
  account?: string;
  password?: string;
  verifyCode?: string;
}

export interface RegisterFormData {
  username: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}
