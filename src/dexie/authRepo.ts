import db from './db';
import type { UserProfile } from '../types/auth';
import { genId } from '../types/novel';

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export const authRepo = {
  async findByUsername(username: string): Promise<UserProfile | undefined> {
    return db.users.where('username').equals(username).first();
  },

  async findByPhone(phone: string): Promise<UserProfile | undefined> {
    return db.users.where('phone').equals(phone).first();
  },

  async findByFeishuOpenId(openId: string): Promise<UserProfile | undefined> {
    return db.users.where('feishuOpenId').equals(openId).first();
  },

  async register(data: {
    username: string;
    phone?: string;
    password: string;
    feishuOpenId?: string;
    feishuName?: string;
    avatar?: string;
  }): Promise<UserProfile> {
    const now = Date.now();
    const user: UserProfile = {
      id: genId(),
      username: data.username,
      phone: data.phone,
      avatar: data.avatar || '',
      passwordHash: data.password ? hashPassword(data.password) : undefined,
      feishuOpenId: data.feishuOpenId,
      feishuName: data.feishuName,
      createdAt: now,
      lastLoginAt: now,
    };
    await db.users.add(user);
    return { ...user, passwordHash: undefined };
  },

  async validatePassword(username: string, password: string): Promise<UserProfile | null> {
    const user = await this.findByUsername(username);
    if (!user || !user.passwordHash) return null;
    if (user.passwordHash === hashPassword(password)) {
      await db.users.update(user.id, { lastLoginAt: Date.now() });
      return { ...user, passwordHash: undefined };
    }
    return null;
  },

  async validatePhoneCode(phone: string, _code: string): Promise<UserProfile | null> {
    const user = await this.findByPhone(phone);
    if (!user) return null;
    await db.users.update(user.id, { lastLoginAt: Date.now() });
    return { ...user, passwordHash: undefined };
  },

  async loginOrRegisterWithFeishu(openId: string, name: string, avatar?: string): Promise<UserProfile> {
    let user = await this.findByFeishuOpenId(openId);
    if (user) {
      const updates: Partial<UserProfile> = { lastLoginAt: Date.now() };
      if (avatar) updates.avatar = avatar;
      await db.users.update(user.id, updates);
      return { ...user, ...updates, passwordHash: undefined };
    }
    return this.register({
      username: name || `飞书用户_${openId.slice(-4)}`,
      feishuOpenId: openId,
      feishuName: name,
      avatar: avatar || '',
      password: '',
    });
  },

  async updateProfile(id: string, updates: Partial<Pick<UserProfile, 'username' | 'avatar' | 'phone' | 'feishuName' | 'feishuOpenId' | 'wechatOpenId'>>): Promise<void> {
    await db.users.update(id, updates);
  },

  async autoRegisterPhone(phone: string): Promise<UserProfile> {
    let user = await this.findByPhone(phone);
    if (user) return { ...user, passwordHash: undefined };
    return this.register({
      username: `用户${phone.slice(-4)}`,
      phone,
      password: '',
    });
  },
};
