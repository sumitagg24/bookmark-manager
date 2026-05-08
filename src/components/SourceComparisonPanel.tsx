import { type FC, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFileColorsMap } from './FileLegend';
import type { BookmarkNode } from '../types/bookmark';
import { useBookmarkStore } from '../store/bookmarkStore';
import { Filter, ChevronRight, Trash2 } from 'lucide-react';

interface SourceComparisonPanelProps {
  onSourceFilterChange: (sources: string[]) => void;
  activeFilters: string[];
}

export const SourceComparisonPanel: FC<SourceComparisonPanelProps> = ({
  onSourceFilterChange,
  activeFilters,
}) => {
  const { mergeResult, removeBySourceFile } = useBookmarkStore();
  const [showSourceDetails, setShowSourceDetails] = useState(false);
  const [deletingSource, setDeletingSource] = useState<string | null>(null);

  const sourceStats = useMemo(() => {
    if (!mergeResult || mergeResult.sourceFiles.length <= 1) return null;
    const colorsMap = getFileColorsMap(mergeResult.sourceFiles);
    const sourceData = new Map<string, { bookmarks: number; folders: number }>();

    function countBySource(node: BookmarkNode, source: string) {
      if (!sourceData.has(source)) sourceData.set(source, { bookmarks: 0, folders: 0 });
      const data = sourceData.get(source)!;
      if (node.type === 'bookmark') data.bookmarks++;
      if (node.type === 'folder') data.folders++;
      node.children?.forEach(child => countBySource(child, child.sourceFile || source));
    }

    countBySource(mergeResult.root, mergeResult.sourceFiles[0]);
    mergeResult.sourceFiles.forEach(source => {
      if (!sourceData.has(source)) sourceData.set(source, { bookmarks: 0, folders: 0 });
    });

    return { colorsMap, sourceData };
  }, [mergeResult]);

  if (!mergeResult || mergeResult.sourceFiles.length <= 1) return null;

  const toggleSource = (source: string) => {
    const newFilters = activeFilters.includes(source)
      ? activeFilters.filter(s => s !== source)
      : [...activeFilters, source];
    onSourceFilterChange(newFilters);
  };

  const handleDeleteSource = async (source: string) => {
    if (!confirm(`Remove all bookmarks from "${source}"? This cannot be undone.`)) return;
    setDeletingSource(source);
    removeBySourceFile(source);
    setDeletingSource(null);
    onSourceFilterChange(activeFilters.filter(s => s !== source));
  };

  return (
    <div className="border-t border-app-border/50 bg-white/40 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setShowSourceDetails(!showSourceDetails)}
        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.04]"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-app-muted" />
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Filter by source ({activeFilters.length}/{mergeResult.sourceFiles.length} shown)
          </span>
        </div>
        <motion.div animate={{ rotate: showSourceDetails ? 90 : 0 }}>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {showSourceDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-3 pb-3"
          >
            <div className="flex flex-col gap-1.5 pt-1.5">
              {Array.from(mergeResult.sourceFiles).map(source => {
                const colors = sourceStats?.colorsMap.get(source);
                const data = sourceStats?.sourceData.get(source);
                const isActive = activeFilters.includes(source);
                const isDeleting = deletingSource === source;
                return (
                  <div key={source} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleSource(source)}
                      disabled={isDeleting}
                      className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-medium transition-all ${
                        isActive ? 'border shadow-sm' : 'border border-dashed opacity-60 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isActive ? colors?.bg : 'transparent',
                        color: colors?.text,
                        borderColor: colors?.border,
                      }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors?.text }} />
                      <span className="truncate">
                        {source.split('/').pop()?.replace('.html', '').replace('.json', '') || source}
                      </span>
                      {data && (
                        <span className="ml-auto rounded bg-white/50 dark:bg-white/[0.08] px-1.5 py-0.5 text-[10px]">
                          {data.bookmarks + data.folders}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSource(source)}
                      disabled={isDeleting}
                      className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25"
                      title={`Remove all bookmarks from "${source}"`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
