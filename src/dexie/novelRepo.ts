import db from './db';
import type { NovelMeta, Chapter, CharacterCard, Outline, Note } from '../types/novel';
import { genId } from '../types/novel';

// ---- Novels ----
export async function listNovels(): Promise<NovelMeta[]> {
  return db.novels.orderBy('updatedAt').reverse().toArray();
}

export async function getNovel(id: string): Promise<NovelMeta | undefined> {
  return db.novels.get(id);
}

export async function createNovel(title: string, author: string, genre: string): Promise<NovelMeta> {
  const now = Date.now();
  const novel: NovelMeta = {
    id: genId(),
    title,
    author,
    genre,
    description: '',
    coverUrl: '',
    wordCount: 0,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    serverId: null,
  };
  await db.novels.add(novel);
  return novel;
}

export async function updateNovel(id: string, updates: Partial<NovelMeta>): Promise<void> {
  await db.novels.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteNovel(id: string): Promise<void> {
  await db.transaction('rw', [db.novels, db.chapters, db.characters, db.outlines, db.notes], async () => {
    await db.novels.delete(id);
    await db.chapters.where('novelId').equals(id).delete();
    await db.characters.where('novelId').equals(id).delete();
    await db.outlines.where('novelId').equals(id).delete();
    await db.notes.where('novelId').equals(id).delete();
  });
}

// ---- Chapters ----
export async function listChapters(novelId: string): Promise<Chapter[]> {
  return db.chapters.where('novelId').equals(novelId).sortBy('order');
}

export async function getChapter(id: string): Promise<Chapter | undefined> {
  return db.chapters.get(id);
}

export async function createChapter(
  novelId: string,
  title: string,
  order?: number
): Promise<Chapter> {
  const chapters = await listChapters(novelId);
  const nextOrder = order ?? chapters.length + 1;
  const now = Date.now();
  const chapter: Chapter = {
    id: genId(),
    novelId,
    title,
    order: nextOrder,
    content: '', // empty TipTap JSON
    wordCount: 0,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    serverId: null,
  };
  await db.chapters.add(chapter);
  return chapter;
}

export async function updateChapter(id: string, updates: Partial<Chapter>): Promise<void> {
  await db.chapters.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteChapter(id: string): Promise<void> {
  await db.chapters.delete(id);
}

export async function reorderChapters(novelId: string, chapterIds: string[]): Promise<void> {
  await db.transaction('rw', [db.chapters], async () => {
    for (let i = 0; i < chapterIds.length; i++) {
      await db.chapters.update(chapterIds[i], { order: i + 1 });
    }
  });
}

// ---- Characters ----
export async function listCharacters(novelId: string): Promise<CharacterCard[]> {
  return db.characters.where('novelId').equals(novelId).toArray();
}

export async function createCharacter(novelId: string, name: string, role: string): Promise<CharacterCard> {
  const now = Date.now();
  const card: CharacterCard = {
    id: genId(),
    novelId,
    name,
    role,
    description: '',
    traits: '[]',
    relationships: '[]',
    avatar: '',
    createdAt: now,
    updatedAt: now,
  };
  await db.characters.add(card);
  return card;
}

// ---- Outlines ----
export async function listOutlines(novelId: string): Promise<Outline[]> {
  return db.outlines.where('novelId').equals(novelId).sortBy('order');
}

// ---- Notes ----
export async function listNotes(novelId: string): Promise<Note[]> {
  return db.notes.where('novelId').equals(novelId).toArray();
}

// ---- Storage info ----
export async function getStorageInfo(): Promise<{ used: string; percent: string }> {
  if (!navigator.storage?.estimate) {
    return { used: '--', percent: '--' };
  }
  const est = await navigator.storage.estimate();
  const used = est.usage ?? 0;
  const quota = est.quota ?? 1;
  const usedMB = (used / 1024 / 1024).toFixed(1);
  const percent = ((used / quota) * 100).toFixed(1);
  return { used: `${usedMB}MB`, percent: `${percent}%` };
}
