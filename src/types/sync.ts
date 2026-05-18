import type { NovelMeta, Chapter, CharacterCard, Outline, Note } from './novel';
import type { TracingProject } from './index';

export interface SyncData {
  version: number;
  syncedAt: number;
  novels: NovelMeta[];
  chapters: Chapter[];
  characters: CharacterCard[];
  outlines: Outline[];
  notes: Note[];
  mapProjects: TracingProject[];
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
