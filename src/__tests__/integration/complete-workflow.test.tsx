import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBookmarkStore } from '../../store/bookmarkStore';

// Helper to always get fresh state
const getState = () => useBookmarkStore.getState();

describe('Complete Feature Workflow', () => {
  beforeEach(() => {
    useBookmarkStore.setState({
      tags: new Map(),
      backups: [],
      searchHistory: [],
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
              title: 'React Documentation',
              url: 'https://react.dev',
              sourceFile: 'test',
              tags: [],
              isFavorite: false,
              notes: '',
            },
            {
              id: 'bookmark-2',
              type: 'bookmark',
              title: 'TypeScript Handbook',
              url: 'https://typescriptlang.org',
              sourceFile: 'test',
              tags: [],
              isFavorite: false,
              notes: '',
            },
            {
              id: 'bookmark-3',
              type: 'bookmark',
              title: 'MDN Web Docs',
              url: 'https://mdn.org',
              sourceFile: 'test',
              tags: [],
              isFavorite: false,
              notes: '',
            },
          ],
        },
        duplicates: [],
        similarBookmarks: [],
        stats: {
          totalInputBookmarks: 3,
          uniqueBookmarks: 3,
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

  it('should complete full workflow: tag, favorite, backup, search', async () => {
    const store = getState();

    // Step 1: Create tags
    const devTag = store.addTag('Development', '#4ECDC4');
    const importantTag = store.addTag('Important', '#FF6B6B');

    expect(getState().tags.size).toBe(2);

    // Step 2: Tag bookmarks
    store.addTagToBookmark('bookmark-1', devTag);
    store.addTagToBookmark('bookmark-2', devTag);
    store.addTagToBookmark('bookmark-1', importantTag);

    expect(getState().tags.get(devTag)?.count).toBe(2);
    expect(getState().tags.get(importantTag)?.count).toBe(1);

    // Step 3: Add notes via bulk edit
    store.bulkEditBookmarks(['bookmark-1', 'bookmark-2'], {
      notes: 'Essential learning resources',
    });

    expect(getState().mergeResult?.root.children?.[0].notes).toBe('Essential learning resources');

    // Step 4: Mark favorites
    store.toggleFavorite('bookmark-1');
    store.toggleFavorite('bookmark-2');

    expect(getState().mergeResult?.root.children?.[0].isFavorite).toBe(true);
    expect(getState().mergeResult?.root.children?.[1].isFavorite).toBe(true);

    // Step 5: Create backup
    store.createBackup();
    expect(getState().backups.length).toBe(1);

    // Step 6: Add to search history
    store.addToSearchHistory('development resources', 2);
    await new Promise(r => setTimeout(r, 10));
    store.addToSearchHistory('react', 1);

    expect(getState().searchHistory.length).toBe(2);
    expect(getState().searchHistory[0].query).toBe('react');

    // Step 7: Verify state integrity
    const bookmark1 = getState().mergeResult?.root.children?.[0];
    expect(bookmark1?.tags?.length).toBe(2);
    expect(bookmark1?.isFavorite).toBe(true);
    expect(bookmark1?.notes).toBe('Essential learning resources');

    // Step 8: Modify and restore
    store.removeMergeNode('bookmark-3');
    expect(getState().mergeResult?.root.children?.length).toBe(2);

    const backupId = getState().backups[0].id;
    store.restoreBackup(backupId);
    expect(getState().mergeResult?.root.children?.length).toBe(3);
  });

  it('should handle complex bulk operations with tags', () => {
    const store = getState();

    // Create multiple tags
    const tag1 = store.addTag('Tag1', '#FF6B6B');
    const tag2 = store.addTag('Tag2', '#4ECDC4');
    const tag3 = store.addTag('Tag3', '#45B7D1');

    // Bulk edit with multiple tags
    store.bulkEditBookmarks(['bookmark-1', 'bookmark-2', 'bookmark-3'], {
      tags: [tag1, tag2],
      isFavorite: true,
      notes: 'Bulk updated',
    });

    // Verify all bookmarks have the tags
    const children = getState().mergeResult?.root.children;
    for (let i = 0; i < 3; i++) {
      const bookmark = children?.[i];
      expect(bookmark?.tags?.length).toBe(2);
      expect(bookmark?.isFavorite).toBe(true);
      expect(bookmark?.notes).toBe('Bulk updated');
    }

    // tag3 count should still be 0 (not applied)
    expect(getState().tags.get(tag3)?.count).toBe(0);
  });

  it('should maintain data consistency through multiple operations', async () => {
    const store = getState();

    // Create backup before operations
    store.createBackup();
    const initialBackupCount = getState().backups.length;

    // Perform multiple operations
    const tag = store.addTag('Work', '#4ECDC4');
    store.addTagToBookmark('bookmark-1', tag);
    store.toggleFavorite('bookmark-1');
    store.addToSearchHistory('test', 1);
    store.bulkEditBookmarks(['bookmark-2'], { notes: 'Updated' });

    // Create another backup
    await new Promise(r => setTimeout(r, 10));
    store.createBackup();

    // Verify state
    expect(getState().backups.length).toBe(initialBackupCount + 1);
    expect(getState().tags.size).toBe(1);
    expect(getState().searchHistory.length).toBe(1);

    // Restore first backup (oldest = last in array since newest is first)
    const firstBackupId = getState().backups[getState().backups.length - 1].id;
    store.restoreBackup(firstBackupId);

    // After restore, tag/favorite changes should be undone
    expect(getState().mergeResult?.root.children?.[0].tags?.length ?? 0).toBe(0);
    expect(getState().mergeResult?.root.children?.[0].isFavorite).toBeFalsy();
  });

  it('should handle tag removal and cleanup', async () => {
    // Use fresh isolated state
    useBookmarkStore.setState({
      tags: new Map(),
      mergeResult: {
        root: {
          id: 'root',
          type: 'root',
          title: 'Root',
          sourceFile: 'test',
          children: [
            { id: 'bm-a', type: 'bookmark', title: 'A', url: 'https://a.com', sourceFile: 'test', tags: [] },
            { id: 'bm-b', type: 'bookmark', title: 'B', url: 'https://b.com', sourceFile: 'test', tags: [] },
          ],
        },
        duplicates: [],
        similarBookmarks: [],
        stats: { totalInputBookmarks: 2, uniqueBookmarks: 2, removedDuplicates: 0, mergedFolders: 0, similarBookmarksFound: 0 },
        sourceFiles: ['test'],
      },
    });

    const store = getState();
    const tag1 = store.addTag('Important', '#FF6B6B');
    await new Promise(r => setTimeout(r, 5));
    const tag2 = store.addTag('Later', '#4ECDC4');

    store.addTagToBookmark('bm-a', tag1);
    store.addTagToBookmark('bm-a', tag2);
    store.addTagToBookmark('bm-b', tag1);

    expect(getState().tags.get(tag1)?.count).toBe(2);
    expect(getState().tags.get(tag2)?.count).toBe(1);

    store.removeTag(tag1);

    expect(getState().tags.has(tag1)).toBe(false);
    expect(getState().mergeResult?.root.children?.[0].tags).not.toContain(tag1);
    expect(getState().mergeResult?.root.children?.[1].tags).not.toContain(tag1);
    expect(getState().mergeResult?.root.children?.[0].tags).toContain(tag2);
  });

  it('should maintain search history limit', async () => {
    const store = getState();

    for (let i = 0; i < 25; i++) {
      store.addToSearchHistory(`query-${i}`, i);
      // Small delay every 5 to avoid same-ms IDs
      if (i % 5 === 0) await new Promise(r => setTimeout(r, 5));
    }

    const state = getState();
    expect(state.searchHistory.length).toBe(20);
    expect(state.searchHistory[0].query).toBe('query-24');
  });

  it('should maintain backup limit', async () => {
    const store = getState();

    for (let i = 0; i < 15; i++) {
      store.createBackup();
      await new Promise(r => setTimeout(r, 5));
    }

    expect(getState().backups.length).toBe(10);
  });
});
