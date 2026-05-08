import { describe, it, expect, beforeEach } from 'vitest';
import { useBookmarkStore } from '../../store/bookmarkStore';

describe('Store Debug Test', () => {
  beforeEach(() => {
    // Reset to clean state
    useBookmarkStore.setState({
      tags: new Map(),
      searchHistory: [],
      backups: [],
      selectedIds: new Set(),
      mergeResult: null,
      shortcuts: new Map(),
    });
  });

  it('should verify store state is accessible', () => {
    const state = useBookmarkStore.getState();
    expect(state).toBeDefined();
    expect(state.tags).toBeInstanceOf(Map);
  });

  it('should add a tag and verify it exists', () => {
    const store = useBookmarkStore.getState();
    const tagId = store.addTag('Test Tag', '#FF6B6B');
    
    // Get fresh state
    const newState = useBookmarkStore.getState();
    const tag = newState.tags.get(tagId);
    
    expect(tag).toBeDefined();
    expect(tag?.name).toBe('Test Tag');
    expect(tag?.color).toBe('#FF6B6B');
  });

  it('should add to search history', () => {
    const store = useBookmarkStore.getState();
    store.addToSearchHistory('test query', 5);
    
    const newState = useBookmarkStore.getState();
    expect(newState.searchHistory.length).toBe(1);
    expect(newState.searchHistory[0].query).toBe('test query');
  });

  it('should create backup', () => {
    // First set a mergeResult
    useBookmarkStore.setState({
      mergeResult: {
        root: {
          id: 'root',
          type: 'root' as const,
          title: 'Root',
          sourceFile: 'test',
          children: [],
        },
        duplicates: [],
        similarBookmarks: [],
        stats: {
          totalInputBookmarks: 0,
          uniqueBookmarks: 0,
          removedDuplicates: 0,
          mergedFolders: 0,
          similarBookmarksFound: 0,
        },
        sourceFiles: ['test'],
      },
    });

    const store = useBookmarkStore.getState();
    store.createBackup();
    
    const newState = useBookmarkStore.getState();
    expect(newState.backups.length).toBe(1);
  });
});