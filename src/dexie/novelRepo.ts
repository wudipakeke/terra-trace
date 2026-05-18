import db from './db';
import type { NovelMeta, Chapter, CharacterCard, Outline, Note } from '../types/novel';
import { genId } from '../types/novel';

// ---- Novels ----
export async function listNovels(): Promise<NovelMeta[]> {
  const all = await db.novels.orderBy('updatedAt').reverse().toArray();
  return all.filter((n) => n.deletedAt == null);
}

export async function listTrashedNovels(): Promise<NovelMeta[]> {
  const all = await db.novels.orderBy('updatedAt').reverse().toArray();
  return all.filter((n) => n.deletedAt != null);
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
    deletedAt: null,
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

/** Soft delete: move to trash */
export async function deleteNovel(id: string): Promise<void> {
  await db.novels.update(id, { deletedAt: Date.now(), updatedAt: Date.now() });
}

/** Restore from trash */
export async function restoreNovel(id: string): Promise<void> {
  await db.novels.update(id, { deletedAt: null, updatedAt: Date.now() });
}

/** Permanently delete novel and all related data */
export async function permanentDeleteNovel(id: string): Promise<void> {
  await db.transaction('rw', [db.novels, db.chapters, db.characters, db.outlines, db.notes], async () => {
    await db.novels.delete(id);
    await db.chapters.where('novelId').equals(id).delete();
    await db.characters.where('novelId').equals(id).delete();
    await db.outlines.where('novelId').equals(id).delete();
    await db.notes.where('novelId').equals(id).delete();
  });
}

/** Delete trash older than 30 days */
export async function cleanupExpiredTrash(): Promise<number> {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const expired = await db.novels.where('deletedAt').below(cutoff).toArray();
  for (const novel of expired) {
    await permanentDeleteNovel(novel.id);
  }
  return expired.length;
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

export async function createOutline(
  novelId: string,
  title: string,
  content: string,
  type: Outline['type'] = 'plot'
): Promise<Outline> {
  const outlines = await listOutlines(novelId);
  const now = Date.now();
  const outline: Outline = {
    id: genId(),
    novelId,
    title,
    content,
    order: outlines.length + 1,
    type,
    createdAt: now,
    updatedAt: now,
  };
  await db.outlines.add(outline);
  return outline;
}

export async function updateOutline(id: string, updates: Partial<Outline>): Promise<void> {
  await db.outlines.update(id, { ...updates, updatedAt: Date.now() });
}

export async function deleteOutline(id: string): Promise<void> {
  await db.outlines.delete(id);
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
