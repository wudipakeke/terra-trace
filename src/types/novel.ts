export type SaveStatus = 'saved' | 'saving' | 'unsaved';

export interface NovelMeta {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverUrl: string;
  coverTextColor?: string;
  coverSubtitle?: string;
  coverLayout?: 'horizontal' | 'vertical';
  coverAlign?: 'left' | 'center' | 'right';
  wordCount: number;
  status: 'draft' | 'active';
  deletedAt: number | null;
  createdAt: number;
  updatedAt: number;
  serverId: number | null;
}

export interface Chapter {
  id: string;
  novelId: string;
  title: string;
  order: number;
  content: string; // TipTap JSON serialized
  wordCount: number;
  status: 'draft' | 'published';
  createdAt: number;
  updatedAt: number;
  serverId: number | null;
}

export interface CharacterCard {
  id: string;
  novelId: string;
  name: string;
  role: string;
  description: string;
  traits: string;
  relationships: string;
  avatar: string;
  createdAt: number;
  updatedAt: number;
}

export interface Outline {
  id: string;
  novelId: string;
  title: string;
  content: string;
  order: number;
  type: 'plot' | 'character_arc' | 'setting' | 'note';
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  novelId: string;
  title: string;
  content: string;
  tags: string;
  createdAt: number;
  updatedAt: number;
}

export const NOVEL_GENRES = [
  '玄幻', '仙侠', '都市', '言情', '历史',
  '科幻', '悬疑', '武侠', '奇幻', '游戏',
  '轻小说', '现实', '短篇',
] as const;

export function genId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
