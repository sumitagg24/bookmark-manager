import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBookmarkStore } from '../../store/bookmarkStore';

describe('Backup/Restore System', () => {
  beforeEach(() => {
    useBookmarkStore.setState({
      tags: new Map(),
      searchHistory: [],
      backups: [],
      selectedIds: new Set(),
      mergeResult: {
        root: {
          id: 'root',
          type: 'root',
          title: 'Root',
          sourceFile: 'test',
          children: [
            {
              id: 'bookmark-1',
              type: 'bookmark',
              title: 'Test Bookmark',
              url: 'https://example.com',
              sourceFile: 'test',
            },
          ],
        },
        duplicates: [],
        similarBookmarks: [],
        stats: {
          totalInputBookmarks: 1,
          uniqueBookmarks: 1,
          removedDuplicates: 0,
          mergedFolders: 0,
          similarBookmarksFound: 0,
        },
        sourceFiles: ['test'],
      },
    });
  });

  afterEach(() => {
    useBookmarkStore.setState({
      tags: new Map(),
      searchHistory: [],
      backups: [],
      selectedIds: new Set(),
      mergeResult: null,
    });
  });

  it('should create a backup', () => {
    const store = useBookmarkStore.getState();
    store.createBackup();

    const state = useBookmarkStore.getState();
    expect(state.backups.length).toBe(1);
    expect(state.backups[0].data.stats.uniqueBookmarks).toBe(1);
  });

  it('should store backup with timestamp and size', () => {
    const store = useBookmarkStore.getState();
    const before = Date.now();
    store.createBackup();
    const after = Date.now();

    const state = useBookmarkStore.getState();
    const backup = state.backups[0];
    expect(backup.timestamp).toBeGreaterThanOrEqual(before);
    expect(backup.timestamp).toBeLessThanOrEqual(after);
    expect(backup.size).toBeGreaterThan(0);
  });

  it('should limit backups to 10', () => {
    const store = useBookmarkStore.getState();
    for (let i = 0; i < 15; i++) {
      store.createBackup();
    }

    const state = useBookmarkStore.getState();
    expect(state.backups.length).toBe(10);
  });

  it('should restore from backup', () => {
    const store = useBookmarkStore.getState();
    store.createBackup();

    // Modify the current state
    store.removeMergeNode('bookmark-1');
    let state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.length).toBe(0);

    // Restore from backup
    const backupId = state.backups[0].id;
    store.restoreBackup(backupId);
    state = useBookmarkStore.getState();

    expect(state.mergeResult?.root.children?.length).toBe(1);
    expect(state.mergeResult?.root.children?.[0].title).toBe('Test Bookmark');
  });

  it('should delete backup', async () => {
    const store = useBookmarkStore.getState();
    store.createBackup();
    await new Promise(r => setTimeout(r, 10));
    store.createBackup();

    let state = useBookmarkStore.getState();
    expect(state.backups.length).toBe(2);

    const backupId = state.backups[0].id;
    store.deleteBackup(backupId);
    state = useBookmarkStore.getState();

    expect(state.backups.length).toBe(1);
    expect(state.backups[0].id).not.toBe(backupId);
  });

  it('should handle restore of non-existent backup gracefully', () => {
    const store = useBookmarkStore.getState();
    store.createBackup();

    expect(() => {
      store.restoreBackup('non-existent');
    }).not.toThrow();

    // State should remain unchanged
    const state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.length).toBe(1);
  });

  it('should preserve backup data integrity', () => {
    const store = useBookmarkStore.getState();
    const originalTitle = store.mergeResult?.root.children?.[0].title;
    store.createBackup();

    // Modify current state
    store.updateMergeNode('bookmark-1', { title: 'Modified Title' });

    // Restore and verify original data
    let state = useBookmarkStore.getState();
    const backupId = state.backups[0].id;
    store.restoreBackup(backupId);
    state = useBookmarkStore.getState();

    expect(state.mergeResult?.root.children?.[0].title).toBe(originalTitle);
  });
});