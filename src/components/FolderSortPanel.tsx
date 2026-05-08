import { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';
import type { BookmarkNode } from '../types/bookmark';
import { findNodeById } from '../core/treeEdit';

export function FolderSortPanel() {
  const { mergeResult, sortBookmarks } = useBookmarkStore();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'domain' | 'date' | 'alphabetical'>('alphabetical');

  const folders = useMemo(() => {
    if (!mergeResult) return [];
    const folderList: BookmarkNode[] = [];

    function collectFolders(node: BookmarkNode) {
      if (node.type === 'folder') {
        folderList.push(node);
      }
      node.children?.forEach(collectFolders);
    }

    collectFolders(mergeResult.root);
    return folderList;
  }, [mergeResult]);

  const selectedFolder = useMemo(() => {
    if (!selectedFolderId || !mergeResult) return null;
    return findNodeById(mergeResult.root, selectedFolderId);
  }, [selectedFolderId, mergeResult]);

  const bookmarkCount = useMemo(() => {
    if (!selectedFolder) return 0;
    let count = 0;
    function countBookmarks(node: BookmarkNode) {
      if (node.type === 'bookmark') count++;
      node.children?.forEach(countBookmarks);
    }
    countBookmarks(selectedFolder);
    return count;
  }, [selectedFolder]);

  const handleSort = () => {
    if (selectedFolderId) {
      sortBookmarks(selectedFolderId, sortBy);
    }
  };

  if (!mergeResult) {
    return (
      <div id="section-folder-sort" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sort Folder</h2>
          <p className="text-slate-600 dark:text-slate-400">Sort bookmarks within a specific folder</p>
        </div>
        <div className="premium-card p-12 text-center">
          <p className="text-slate-500 dark:text-slate-400">Import bookmarks to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div id="section-folder-sort" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sort Folder</h2>
        <p className="text-slate-600 dark:text-slate-400">Sort bookmarks within a specific folder</p>
      </div>

      <div className="premium-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select Folder
          </label>
          <div className="relative">
            <select
              value={selectedFolderId || ''}
              onChange={(e) => setSelectedFolderId(e.target.value || null)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-premium-orange"
            >
              <option value="">-- Select a folder --</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.title}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {selectedFolder && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-white">{selectedFolder.title}</span>
              <br />
              {bookmarkCount} bookmark{bookmarkCount !== 1 ? 's' : ''} in this folder
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Sort By
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['alphabetical', 'domain', 'date'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  sortBy === option
                    ? 'bg-premium-orange text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSort}
          disabled={!selectedFolderId}
          className="w-full btn-outline-premium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ArrowUpDown className="h-4 w-4" />
          Sort Folder
        </button>
      </div>

      <div className="premium-card p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 This will sort only the bookmarks inside the selected folder, not the entire tree. Subfolders will also be sorted recursively.
        </p>
      </div>
    </div>
  );
}
