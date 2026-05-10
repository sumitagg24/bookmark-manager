import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useBookmarkStore } from '../../store/bookmarkStore';
import { BackupRestorePanel } from '../../components/BackupRestorePanel';

describe('Backup/Restore Integration', () => {
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

  it('should render BackupRestorePanel', () => {
    render(<BackupRestorePanel />);
    expect(screen.getByText('Backup & Restore')).toBeInTheDocument();
    expect(screen.getByText('Create Backup')).toBeInTheDocument();
  });

  it('should create backup through UI', async () => {
    render(<BackupRestorePanel />);
    const createButton = screen.getByText('Create Backup Now');

    await act(async () => {
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Backup History \(1\)/)).toBeInTheDocument();
    });
  });

  it('should display backup history', async () => {
    await act(async () => {
      useBookmarkStore.getState().createBackup();
    });

    render(<BackupRestorePanel />);

    await waitFor(() => {
      // The text "1 bookmarks" may be split — use a flexible matcher
      expect(screen.getByText(/Backup History \(1\)/)).toBeInTheDocument();
    });
  });

  it('should show empty state when no backups', () => {
    render(<BackupRestorePanel />);
    expect(screen.getByText('No backups yet')).toBeInTheDocument();
  });

  it('should delete backup through UI', async () => {
    await act(async () => {
      useBookmarkStore.getState().createBackup();
    });

    render(<BackupRestorePanel />);

    await waitFor(() => {
      expect(screen.getByText(/Backup History \(1\)/)).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTitle('Delete backup');
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('No backups yet')).toBeInTheDocument();
    });
  });

  it('should restore backup with confirmation', async () => {
    await act(async () => {
      useBookmarkStore.getState().createBackup();
      useBookmarkStore.getState().removeMergeNode('bookmark-1');
    });

    expect(useBookmarkStore.getState().mergeResult?.root.children?.length).toBe(0);

    render(<BackupRestorePanel />);

    await waitFor(() => {
      const restoreButtons = screen.getAllByTitle('Restore backup');
      expect(restoreButtons.length).toBeGreaterThan(0);
    });

    const restoreButtons = screen.getAllByTitle('Restore backup');
    await act(async () => {
      fireEvent.click(restoreButtons[0]);
    });

    await waitFor(() => {
      expect(useBookmarkStore.getState().mergeResult?.root.children?.length).toBe(1);
    });
  });

  it('should display backup size', async () => {
    await act(async () => {
      useBookmarkStore.getState().createBackup();
    });

    render(<BackupRestorePanel />);

    await waitFor(() => {
      const sizeText = screen.getByText(/\d+(\.\d+)?\s*(B|KB|MB)/);
      expect(sizeText).toBeInTheDocument();
    });
  });
});
