import { create } from 'zustand';
import type { SaveStatus } from '../types/novel';

interface NovelStore {
  // Current editing context
  currentNovelId: string | null;
  currentChapterId: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;

  // Actions
  setCurrentNovel: (id: string | null) => void;
  setCurrentChapter: (id: string | null) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setLastSavedAt: (date: Date | null) => void;
}

export const useNovelStore = create<NovelStore>()((set) => ({
  currentNovelId: null,
  currentChapterId: null,
  saveStatus: 'saved',
  lastSavedAt: null,

  setCurrentNovel: (id) => set({ currentNovelId: id }),
  setCurrentChapter: (id) => set({ currentChapterId: id }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setLastSavedAt: (date) => set({ lastSavedAt: date }),
}));
