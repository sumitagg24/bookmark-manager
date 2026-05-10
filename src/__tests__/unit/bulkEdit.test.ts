import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBookmarkStore } from '../../store/bookmarkStore';

describe('Bulk Edit Operations', () => {
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
              title: 'Bookmark 1',
              url: 'https://example1.com',
              sourceFile: 'test',
              notes: 'Old note 1',
              tags: [],
            },
            {
              id: 'bookmark-2',
              type: 'bookmark',
              title: 'Bookmark 2',
              url: 'https://example2.com',
              sourceFile: 'test',
              notes: 'Old note 2',
              tags: [],
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

  it('should bulk edit titles', () => {
    const store = useBookmarkStore.getState();
    store.bulkEditBookmarks(['bookmark-1', 'bookmark-2'], { title: 'New Title' });

    const state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.[0].title).toBe('New Title');
    expect(state.mergeResult?.root.children?.[1].title).toBe('New Title');
  });

  it('should bulk edit notes', () => {
    const store = useBookmarkStore.getState();
    store.bulkEditBookmarks(['bookmark-1', 'bookmark-2'], { notes: 'New note' });

    const state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.[0].notes).toBe('New note');
    expect(state.mergeResult?.root.children?.[1].notes).toBe('New note');
  });

  it('should bulk toggle favorites', () => {
    const store = useBookmarkStore.getState();
    store.bulkEditBookmarks(['bookmark-1', 'bookmark-2'], { isFavorite: true });

    const state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.[0].isFavorite).toBe(true);
    expect(state.mergeResult?.root.children?.[1].isFavorite).toBe(true);
  });

  it('should bulk add tags', () => {
    const store = useBookmarkStore.getState();
    const tagId = store.addTag('Work', '#4ECDC4');
    store.bulkEditBookmarks(['bookmark-1', 'bookmark-2'], { tags: [tagId] });

    const state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.[0].tags).toContain(tagId);
    expect(state.mergeResult?.root.children?.[1].tags).toContain(tagId);
  });

  it('should handle partial bulk edit', () => {
    const store = useBookmarkStore.getState();
    store.bulkEditBookmarks(['bookmark-1'], { title: 'Updated' });

    const state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.[0].title).toBe('Updated');
    expect(state.mergeResult?.root.children?.[1].title).toBe('Bookmark 2');
  });

  it('should handle bulk edit with non-existent IDs gracefully', () => {
    const store = useBookmarkStore.getState();
    expect(() => {
      store.bulkEditBookmarks(['bookmark-1', 'non-existent'], { title: 'Updated' });
    }).not.toThrow();

    const state = useBookmarkStore.getState();
    expect(state.mergeResult?.root.children?.[0].title).toBe('Updated');
  });

  it('should bulk edit multiple properties at once', () => {
    const store = useBookmarkStore.getState();
    store.bulkEditBookmarks(['bookmark-1', 'bookmark-2'], {
      title: 'New Title',
      notes: 'New note',
      isFavorite: true,
    });

    const state = useBookmarkStore.getState();
    const bookmark1 = state.mergeResult?.root.children?.[0];
    expect(bookmark1?.title).toBe('New Title');
    expect(bookmark1?.notes).toBe('New note');
    expect(bookmark1?.isFavorite).toBe(true);
  });
});