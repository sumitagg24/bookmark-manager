import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  AlertCircle,
  Download,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';
import type { BookmarkNode } from '../types/bookmark';

export const AdvancedFeaturesPanel = () => {
  const mergeResult = useBookmarkStore((s) => s.mergeResult);
  const checkLinkHealth = useBookmarkStore((s) => s.checkLinkHealth);
  const linkCheckInProgress = useBookmarkStore((s) => s.linkCheckInProgress);
  const linkCheckProgress = useBookmarkStore((s) => s.linkCheckProgress);
  const getOrphanedBookmarks = useBookmarkStore((s) => s.getOrphanedBookmarks);
  const suggestFolderForBookmark = useBookmarkStore((s) => s.suggestFolderForBookmark);
  const moveOrphanedBookmarks = useBookmarkStore((s) => s.moveOrphanedBookmarks);
  const sortBookmarks = useBookmarkStore((s) => s.sortBookmarks);
  const exportBrokenLinksOnly = useBookmarkStore((s) => s.exportBrokenLinksOnly);
  const removeMergeNode = useBookmarkStore((s) => s.removeMergeNode);

  const [activeTab, setActiveTab] = useState<'health' | 'broken' | 'orphaned' | 'organize'>('health');
  const [selectedBrokenIds, setSelectedBrokenIds] = useState<Set<string>>(new Set());
  const [discardedBrokenIds, setDiscardedBrokenIds] = useState<Set<string>>(new Set());

  if (!mergeResult) return null;

  // Get all broken links
  const brokenLinks: BookmarkNode[] = [];
  function collectBrokenLinks(node: BookmarkNode) {
    if (node.type === 'bookmark' && node.linkStatus === 'broken') {
      brokenLinks.push(node);
    }
    node.children?.forEach(collectBrokenLinks);
  }
  collectBrokenLinks(mergeResult.root);

  const brokenCount = brokenLinks.length;
  const visibleBrokenLinks = brokenLinks.filter(b => !discardedBrokenIds.has(b.id));

  const orphanedBookmarks = getOrphanedBookmarks();

  const handleLinkCheck = useCallback(async () => {
    await checkLinkHealth();
  }, [checkLinkHealth]);

  const handleMoveOrphaned = useCallback(() => {
    const suggestions = new Map<string, string>();
    let movedCount = 0;
    
    for (const bookmark of orphanedBookmarks) {
      const suggested = suggestFolderForBookmark(bookmark.id);
      if (suggested) {
        suggestions.set(bookmark.id, suggested);
        movedCount++;
      }
    }
    
    if (suggestions.size > 0) {
      moveOrphanedBookmarks(suggestions);
      alert(`Moved ${movedCount} bookmarks to suggested folders!`);
    } else {
      alert('No matching folders found for any orphaned bookmarks.');
    }
  }, [orphanedBookmarks, suggestFolderForBookmark, moveOrphanedBookmarks]);

  const toggleBrokenSelection = (id: string) => {
    const newSelected = new Set(selectedBrokenIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedBrokenIds(newSelected);
  };

  const selectAllBroken = () => {
    if (selectedBrokenIds.size === visibleBrokenLinks.length) {
      setSelectedBrokenIds(new Set());
    } else {
      setSelectedBrokenIds(new Set(visibleBrokenLinks.map(b => b.id)));
    }
  };

  const removeSelectedBroken = () => {
    selectedBrokenIds.forEach(id => {
      removeMergeNode(id);
    });
    setSelectedBrokenIds(new Set());
  };

  const toggleBrokenDiscard = (id: string) => {
    const newDiscarded = new Set(discardedBrokenIds);
    if (newDiscarded.has(id)) {
      newDiscarded.delete(id);
    } else {
      newDiscarded.add(id);
    }
    setDiscardedBrokenIds(newDiscarded);
  };

  const discardAllBroken = () => {
    if (discardedBrokenIds.size === brokenLinks.length) {
      setDiscardedBrokenIds(new Set());
    } else {
      setDiscardedBrokenIds(new Set(brokenLinks.map(b => b.id)));
    }
  };

  return (
    <div className="premium-card space-y-5 p-6 md:p-8">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Advanced Tools</h3>
        <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Link health checks, organization, and cleanup tools.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 overflow-x-auto">
        {(['health', 'broken', 'orphaned', 'organize'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-premium-orange text-premium-orange'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'health' && 'Link Health'}
            {tab === 'broken' && `Broken (${brokenCount})`}
            {tab === 'orphaned' && `Orphaned (${orphanedBookmarks.length})`}
            {tab === 'organize' && 'Organize'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'health' && (
          <motion.div
            key="health"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
              <p className="text-[13px] text-slate-600 dark:text-slate-400">
                Check all bookmarks for broken links. This may take a moment.
              </p>
            </div>

            {linkCheckInProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-600 dark:text-slate-400">Checking links...</span>
                  <span className="font-semibold text-premium-orange">{Math.round(linkCheckProgress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden dark:bg-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-premium-orange to-premium-orange/60"
                    initial={{ width: 0 }}
                    animate={{ width: `${linkCheckProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {brokenCount > 0 && !linkCheckInProgress && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 dark:text-red-200">{brokenCount} broken links found</p>
                    <p className="mt-1 text-[12px] text-red-800 dark:text-red-300">
                      These bookmarks returned 404 or timeout errors.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={exportBrokenLinksOnly}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-[12px] font-medium text-white hover:bg-red-700 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Export
                      </button>
                      <button
                        onClick={() => setActiveTab('broken')}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-[12px] font-medium text-white hover:bg-red-700 transition-colors"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        View & Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLinkCheck}
              disabled={linkCheckInProgress}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="h-4 w-4" />
              {linkCheckInProgress ? 'Checking...' : 'Check Link Health'}
            </button>
          </motion.div>
        )}

        {activeTab === 'broken' && (
          <motion.div
            key="broken"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
              <p className="text-[13px] text-slate-600 dark:text-slate-400">
                {brokenCount} broken links found. Select which ones to remove or discard.
              </p>
            </div>

            {brokenCount > 0 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedBrokenIds.size === visibleBrokenLinks.length && visibleBrokenLinks.length > 0}
                      onChange={selectAllBroken}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      Select All for Removal ({selectedBrokenIds.size}/{visibleBrokenLinks.length})
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={discardedBrokenIds.size === brokenLinks.length && brokenLinks.length > 0}
                      onChange={discardAllBroken}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      Discard All ({discardedBrokenIds.size}/{brokenLinks.length})
                    </label>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {brokenLinks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 transition-opacity ${
                        discardedBrokenIds.has(bookmark.id)
                          ? 'border-slate-200 bg-slate-50 opacity-50 dark:border-white/10 dark:bg-white/[0.02]'
                          : 'border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20'
                      }`}
                    >
                      <div className="flex gap-2 mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedBrokenIds.has(bookmark.id)}
                          onChange={() => toggleBrokenSelection(bookmark.id)}
                          disabled={discardedBrokenIds.has(bookmark.id)}
                          className="w-4 h-4 rounded cursor-pointer disabled:opacity-50"
                        />
                        <input
                          type="checkbox"
                          checked={discardedBrokenIds.has(bookmark.id)}
                          onChange={() => toggleBrokenDiscard(bookmark.id)}
                          className="w-4 h-4 rounded cursor-pointer"
                          title="Discard (hide from removal list)"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-white truncate">{bookmark.title}</p>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate mt-1">{bookmark.url}</p>
                        <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">
                          Status: {bookmark.statusCode ? `${bookmark.statusCode}` : 'Timeout'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      brokenLinks.forEach(b => removeMergeNode(b.id));
                      setSelectedBrokenIds(new Set());
                      setDiscardedBrokenIds(new Set());
                    }}
                    className="btn-primary flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove All
                  </button>
                  <button
                    onClick={() => setDiscardedBrokenIds(new Set(brokenLinks.map(b => b.id)))}
                    className="btn-secondary flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Discard All
                  </button>
                </div>

                <button
                  onClick={removeSelectedBroken}
                  disabled={selectedBrokenIds.size === 0}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Selected ({selectedBrokenIds.size})
                </button>
              </>
            )}

            {brokenCount === 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <p className="text-[13px] font-medium text-emerald-900 dark:text-emerald-200">
                  ✅ No broken links found! All bookmarks are working.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'orphaned' && (
          <motion.div
            key="orphaned"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
              <p className="text-[13px] text-slate-600 dark:text-slate-400">
                {orphanedBookmarks.length} bookmarks at root level. Suggest folders based on domain matching.
              </p>
            </div>

            {orphanedBookmarks.length > 0 && (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {orphanedBookmarks.map((bookmark) => {
                    const suggested = suggestFolderForBookmark(bookmark.id);
                    return (
                      <div
                        key={bookmark.id}
                        className="rounded-lg border border-slate-200 bg-white p-3 text-[12px] dark:border-white/10 dark:bg-white/[0.02]"
                      >
                        <p className="font-medium text-slate-900 dark:text-white truncate">{bookmark.title}</p>
                        {suggested ? (
                          <p className="mt-1 text-slate-500 dark:text-slate-400">
                            Suggested folder: <span className="text-premium-orange font-semibold">Found match</span>
                          </p>
                        ) : (
                          <p className="mt-1 text-slate-400 dark:text-slate-500">No matching folder found</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleMoveOrphaned}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Move to Suggested Folders
                </button>
              </>
            )}

            {orphanedBookmarks.length === 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <p className="text-[13px] font-medium text-emerald-900 dark:text-emerald-200">
                  ✅ No orphaned bookmarks! All bookmarks are organized in folders.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'organize' && (
          <motion.div
            key="organize"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
              <p className="text-[13px] text-slate-600 dark:text-slate-400">
                Sort bookmarks by domain, date, or alphabetically. Applies to entire tree.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['domain', 'date', 'alphabetical'] as const).map((sortBy) => (
                <button
                  key={sortBy}
                  onClick={() => {
                    sortBookmarks(null, sortBy);
                    alert(`Sorted all bookmarks by ${sortBy}!`);
                  }}
                  className="btn-secondary py-2 text-[12px] font-medium"
                >
                  {sortBy === 'domain' && 'By Domain'}
                  {sortBy === 'date' && 'By Date'}
                  {sortBy === 'alphabetical' && 'A-Z'}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
