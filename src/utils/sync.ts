import db from '../dexie/db';
import { useMapStore } from '../store/useMapStore';
import { syncApi } from '../api/sync';
import type { SyncData } from '../types/sync';

export async function collectSyncData(): Promise<SyncData> {
  const [novels, chapters, characters, outlines, notes] = await Promise.all([
    db.novels.toArray(),
    db.chapters.toArray(),
    db.characters.toArray(),
    db.outlines.toArray(),
    db.notes.toArray(),
  ]);

  const { projects } = useMapStore.getState();
  // Filter out soft-deleted projects
  const mapProjects = projects.filter((p) => !p.deletedAt);

  return {
    version: 1,
    syncedAt: Date.now(),
    novels,
    chapters,
    characters,
    outlines,
    notes,
    mapProjects,
  };
}

export async function uploadSync(): Promise<Date> {
  const data = await collectSyncData();
  await syncApi.upload(data);
  return new Date();
}

export async function downloadSync(): Promise<{ syncedAt: Date; data: SyncData } | null> {
  try {
    const result = await syncApi.download();
    if (!result) return null;
    return {
      syncedAt: new Date(result.syncedAt),
      data: result.data,
    };
  } catch {
    return null;
  }
}

export async function restoreFromSync(data: SyncData): Promise<void> {
  await db.transaction(
    'rw',
    [db.novels, db.chapters, db.characters, db.outlines, db.notes],
    async () => {
      // Clear all existing data
      await db.novels.clear();
      await db.chapters.clear();
      await db.characters.clear();
      await db.outlines.clear();
      await db.notes.clear();

      // Bulk insert synced data
      if (data.novels.length) await db.novels.bulkAdd(data.novels);
      if (data.chapters.length) await db.chapters.bulkAdd(data.chapters);
      if (data.characters.length) await db.characters.bulkAdd(data.characters);
      if (data.outlines.length) await db.outlines.bulkAdd(data.outlines);
      if (data.notes.length) await db.notes.bulkAdd(data.notes);
    }
  );

  // Restore map projects to Zustand store
  if (data.mapProjects.length) {
    useMapStore.setState((s) => ({
      projects: data.mapProjects.map((p) => ({
        ...p,
        elements: p.elements || [],
      })),
    }));
  }
}
