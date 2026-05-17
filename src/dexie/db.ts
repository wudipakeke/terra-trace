import Dexie, { type EntityTable } from 'dexie';
import type { NovelMeta, Chapter, CharacterCard, Outline, Note } from '../types/novel';
import type { UserProfile } from '../types/auth';

const db = new Dexie('NovelDatabase') as Dexie & {
  novels: EntityTable<NovelMeta, 'id'>;
  chapters: EntityTable<Chapter, 'id'>;
  characters: EntityTable<CharacterCard, 'id'>;
  outlines: EntityTable<Outline, 'id'>;
  notes: EntityTable<Note, 'id'>;
  users: EntityTable<UserProfile, 'id'>;
};

db.version(1).stores({
  novels: 'id, title, createdAt, updatedAt, serverId',
  chapters: 'id, novelId, order, serverId',
  characters: 'id, novelId, name, role',
  outlines: 'id, novelId, type, order',
  notes: 'id, novelId, tags',
});

db.version(2).stores({
  novels: 'id, title, createdAt, updatedAt, serverId',
  chapters: 'id, novelId, order, serverId',
  characters: 'id, novelId, name, role',
  outlines: 'id, novelId, type, order',
  notes: 'id, novelId, tags',
  users: 'id, username, phone, feishuOpenId',
});

export default db;
