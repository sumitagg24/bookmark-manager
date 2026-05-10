import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useBookmarkStore } from '../../store/bookmarkStore';
import { FavoritesPanel } from '../../components/FavoritesPanel';

describe('Favorites Integration', () => {
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
              title: 'Important Link',
              url: 'https://example.com',
              sourceFile: 'test',
              isFavorite: true,
            },
            {
              id: 'bookmark-2',
              type: 'bookmark',
              title: 'Regular Link',
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

  it('should render FavoritesPanel', () => {
    render(<FavoritesPanel />);
    expect(screen.getByText('Favorites')).toBeInTheDocument();
  });

  it('should display only favorite bookmarks', async () => {
    render(<FavoritesPanel />);

    await waitFor(() => {
      expect(screen.getByText('Important Link')).toBeInTheDocument();
      expect(screen.queryByText('Regular Link')).not.toBeInTheDocument();
    });
  });

  it('should show favorite count', async () => {
    render(<FavoritesPanel />);

    await waitFor(() => {
      expect(screen.getByText(/Your starred bookmarks \(1\)/)).toBeInTheDocument();
    });
  });

  it('should remove from favorites through UI', async () => {
    render(<FavoritesPanel />);

    await waitFor(() => {
      expect(screen.getByText('Important Link')).toBeInTheDocument();
    });

    const starButtons = screen.getAllByTitle('Remove from favorites');
    fireEvent.click(starButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Important Link')).not.toBeInTheDocument();
    });
  });

  it('should show empty state when no favorites', async () => {
    const store = useBookmarkStore.getState();
    store.toggleFavorite('bookmark-1');

    render(<FavoritesPanel />);

    await waitFor(() => {
      expect(screen.getByText('No favorites yet')).toBeInTheDocument();
    });
  });

  it('should open external links', async () => {
    render(<FavoritesPanel />);

    await waitFor(() => {
      const links = screen.getAllByTitle('Open link');
      expect(links[0]).toHaveAttribute('href', 'https://example.com');
      expect(links[0]).toHaveAttribute('target', '_blank');
    });
  });
});
