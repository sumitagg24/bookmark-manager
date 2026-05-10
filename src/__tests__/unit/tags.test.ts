import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBookmarkStore } from '../../store/bookmarkStore';

describe('Tags System', () => {
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
              tags: [],
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

  it('should add a new tag', () => {
    const store = useBookmarkStore.getState();
    const tagId = store.addTag('Important', '#FF6B6B');

    expect(tagId).toBeDefined();
    
    const state = useBookmarkStore.getState();
    expect(state.tags.has(tagId)).toBe(true);
    const tag = state.tags.get(tagId);
    expect(tag?.name).toBe('Important');
    expect(tag?.color).toBe('#FF6B6B');
    expect(tag?.count).toBe(0);
  });

  it('should add tag to bookmark', () => {
    const store = useBookmarkStore.getState();
    const tagId = store.addTag('Work', '#4ECDC4');
    store.addTagToBookmark('bookmark-1', tagId);

    const state = useBookmarkStore.getState();
    const tag = state.tags.get(tagId);
    expect(tag?.count).toBe(1);

    const bookmark = state.mergeResult?.root.children?.[0];
    expect(bookmark?.tags).toContain(tagId);
  });

  it('should remove tag from bookmark', () => {
    const store = useBookmarkStore.getState();
    const tagId = store.addTag('Work', '#4ECDC4');
    store.addTagToBookmark('bookmark-1', tagId);
    store.removeTagFromBookmark('bookmark-1', tagId);

    const state = useBookmarkStore.getState();
    const tag = state.tags.get(tagId);
    expect(tag?.count).toBe(0);

    const bookmark = state.mergeResult?.root.children?.[0];
    expect(bookmark?.tags).not.toContain(tagId);
  });

  it('should not add duplicate tags to bookmark', () => {
    const store = useBookmarkStore.getState();
    const tagId = store.addTag('Work', '#4ECDC4');
    store.addTagToBookmark('bookmark-1', tagId);
    store.addTagToBookmark('bookmark-1', tagId);

    const state = useBookmarkStore.getState();
    const bookmark = state.mergeResult?.root.children?.[0];
    const tagCount = bookmark?.tags?.filter((t) => t === tagId).length;
    expect(tagCount).toBe(1);
  });

  it('should remove tag and clean up all bookmarks', () => {
    const store = useBookmarkStore.getState();
    const tagId = store.addTag('Work', '#4ECDC4');
    store.addTagToBookmark('bookmark-1', tagId);
    store.removeTag(tagId);

    const state = useBookmarkStore.getState();
    expect(state.tags.has(tagId)).toBe(false);
    const bookmark = state.mergeResult?.root.children?.[0];
    expect(bookmark?.tags).not.toContain(tagId);
  });

  it('should track tag count correctly', () => {
    const store = useBookmarkStore.getState();
    const tagId = store.addTag('Important', '#FF6B6B');

    let state = useBookmarkStore.getState();
    expect(state.tags.get(tagId)?.count).toBe(0);

    store.addTagToBookmark('bookmark-1', tagId);
    state = useBookmarkStore.getState();
    expect(state.tags.get(tagId)?.count).toBe(1);

    store.removeTagFromBookmark('bookmark-1', tagId);
    state = useBookmarkStore.getState();
    expect(state.tags.get(tagId)?.count).toBe(0);
  });
});