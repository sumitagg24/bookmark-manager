import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBookmarkStore } from '../../store/bookmarkStore';

describe('Favorites System', () => {
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
              title: 'Test Bookmark 1',
              url: 'https://example.com',
              sourceFile: 'test',
              isFavorite: false,
            },
            {
              id: 'bookmark-2',
              type: 'bookmark',
              title: 'Test Bookmark 2',
              url: 'https://example2.com',
              sourceFile: 'test',
              isFavorite: false,
            },
          ],
        },
        duplicates: [],
        similarBookmarks: [],
        stats: {
          totalInputBookmarks: 2,
          uniqueBookmarks: 2,
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

  it('should toggle favorite status', () => {
    const store = useBookmarkStore.getState();
    store.toggleFavorite('bookmark-1');

    let state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.[0].isFavorite).toBe(true);

    store.toggleFavorite('bookmark-1');
    state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.[0].isFavorite).toBe(false);
  });

  it('should star multiple bookmarks independently', () => {
    const store = useBookmarkStore.getState();
    store.toggleFavorite('bookmark-1');
    store.toggleFavorite('bookmark-2');

    const state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.[0].isFavorite).toBe(true);
    expect(state.mergeResult?.root.children?.[1].isFavorite).toBe(true);
  });

  it('should handle toggling non-existent bookmark gracefully', () => {
    const store = useBookmarkStore.getState();
    expect(() => {
      store.toggleFavorite('non-existent');
    }).not.toThrow();
  });

  it('should preserve favorite status through other operations', () => {
    const store = useBookmarkStore.getState();
    store.toggleFavorite('bookmark-1');

    // Simulate other operations
    store.updateMergeNode('bookmark-1', { title: 'Updated Title' });

    const state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.[0].isFavorite).toBe(true);
  });
});