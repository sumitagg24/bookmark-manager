import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useBookmarkStore } from '../../store/bookmarkStore';

describe('Search History', () => {
  beforeEach(() => {
    useBookmarkStore.setState({
      tags: new Map(),
      searchHistory: [],
      backups: [],
      selectedIds: new Set(),
      mergeResult: null,
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

  it('should add search to history', () => {
    const store = useBookmarkStore.getState();
    store.addToSearchHistory('test query', 5);

    const state = useBookmarkStore.getState();
    expect(state.searchHistory.length).toBe(1);
    expect(state.searchHistory[0].query).toBe('test query');
    expect(state.searchHistory[0].resultCount).toBe(5);
  });

  it('should add searches in reverse chronological order', () => {
    const store = useBookmarkStore.getState();
    store.addToSearchHistory('first', 1);
    store.addToSearchHistory('second', 2);
    store.addToSearchHistory('third', 3);

    const state = useBookmarkStore.getState();
    expect(state.searchHistory[0].query).toBe('third');
    expect(state.searchHistory[1].query).toBe('second');
    expect(state.searchHistory[2].query).toBe('first');
  });

  it('should limit search history to 20 entries', () => {
    const store = useBookmarkStore.getState();
    for (let i = 0; i < 25; i++) {
      store.addToSearchHistory(`query-${i}`, i);
    }

    const state = useBookmarkStore.getState();
    expect(state.searchHistory.length).toBe(20);
    expect(state.searchHistory[0].query).toBe('query-24');
    expect(state.searchHistory[19].query).toBe('query-5');
  });

  it('should clear search history', () => {
    const store = useBookmarkStore.getState();
    store.addToSearchHistory('test', 1);
    store.addToSearchHistory('test2', 2);

    let state = useBookmarkStore.getState();
    expect(state.searchHistory.length).toBe(2);

    store.clearSearchHistory();
    state = useBookmarkStore.getState();
    expect(state.searchHistory.length).toBe(0);
  });

  it('should generate unique IDs for each search', async () => {
    const store = useBookmarkStore.getState();
    store.addToSearchHistory('query1', 1);
    await new Promise(r => setTimeout(r, 10));
    store.addToSearchHistory('query2', 2);

    const state = useBookmarkStore.getState();
    const ids = state.searchHistory.map((s) => s.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('should record timestamp for each search', () => {
    const store = useBookmarkStore.getState();
    const before = Date.now();
    store.addToSearchHistory('test', 1);
    const after = Date.now();

    const state = useBookmarkStore.getState();
    const entry = state.searchHistory[0];
    expect(entry.timestamp).toBeGreaterThanOrEqual(before);
    expect(entry.timestamp).toBeLessThanOrEqual(after);
  });
});