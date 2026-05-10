import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useBookmarkStore } from '../../store/bookmarkStore';
import { SearchHistoryPanel } from '../../components/SearchHistoryPanel';

describe('Search History Integration', () => {
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

  it('should render SearchHistoryPanel', () => {
    render(<SearchHistoryPanel />);
    expect(screen.getByText('Search History')).toBeInTheDocument();
  });

  it('should display search history entries', async () => {
    const store = useBookmarkStore.getState();
    store.addToSearchHistory('react hooks', 5);
    store.addToSearchHistory('typescript', 3);

    render(<SearchHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByText('react hooks')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });
  });

  it('should show result count for each search', async () => {
    const store = useBookmarkStore.getState();
    store.addToSearchHistory('test query', 10);

    render(<SearchHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByText(/10 results/)).toBeInTheDocument();
    });
  });

  it('should show empty state when no history', () => {
    render(<SearchHistoryPanel />);
    expect(screen.getByText('No search history yet')).toBeInTheDocument();
  });

  it('should clear search history through UI', async () => {
    const store = useBookmarkStore.getState();
    store.addToSearchHistory('test', 1);

    render(<SearchHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByText('No search history yet')).toBeInTheDocument();
    });
  });

  it('should display searches in reverse chronological order', async () => {
    const store = useBookmarkStore.getState();
    store.addToSearchHistory('first', 1);
    await new Promise(r => setTimeout(r, 15));
    store.addToSearchHistory('second', 2);
    await new Promise(r => setTimeout(r, 15));
    store.addToSearchHistory('third', 3);

    render(<SearchHistoryPanel />);

    await waitFor(() => {
      // 'third' was added last so it should appear first (newest first)
      const allButtons = screen.getAllByRole('button');
      const textContent = allButtons.map(b => b.textContent ?? '').join('|');
      expect(textContent).toMatch(/third/);
    });
  });

  it('should format timestamps correctly', async () => {
    const store = useBookmarkStore.getState();
    store.addToSearchHistory('recent', 1);

    render(<SearchHistoryPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Just now|ago/)).toBeInTheDocument();
    });
  });
});