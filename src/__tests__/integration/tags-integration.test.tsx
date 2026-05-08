import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useBookmarkStore } from '../../store/bookmarkStore';
import { TagsPanel } from '../../components/TagsPanel';

describe('Tags Integration', () => {
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

  it('should render TagsPanel', () => {
    render(<TagsPanel />);
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('Create New Tag')).toBeInTheDocument();
  });

  it('should create tag through UI', async () => {
    render(<TagsPanel />);
    const input = screen.getByPlaceholderText('Tag name...');
    const addButton = screen.getByText('Add');

    fireEvent.change(input, { target: { value: 'Important' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Important')).toBeInTheDocument();
    });
  });

  it('should display tag count', async () => {
    const store = useBookmarkStore.getState();
    const tagId = store.addTag('Work', '#4ECDC4');
    store.addTagToBookmark('bookmark-1', tagId);

    render(<TagsPanel />);

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('1 bookmarks')).toBeInTheDocument();
    });
  });

  it('should delete tag through UI', async () => {
    const store = useBookmarkStore.getState();
    store.addTag('Temporary', '#FF6B6B');

    render(<TagsPanel />);

    await waitFor(() => {
      expect(screen.getByText('Temporary')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete tag');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Temporary')).not.toBeInTheDocument();
    });
  });

  it('should show empty state when no tags', () => {
    render(<TagsPanel />);
    expect(screen.getByText('No tags yet. Create one to get started.')).toBeInTheDocument();
  });

  it('should handle tag creation with Enter key', async () => {
    render(<TagsPanel />);
    const input = screen.getByPlaceholderText('Tag name...');

    fireEvent.change(input, { target: { value: 'Quick Tag' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(screen.getByText('Quick Tag')).toBeInTheDocument();
    });
  });
});
