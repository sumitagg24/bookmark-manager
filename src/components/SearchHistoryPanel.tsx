import { useMemo } from 'react';
import { Clock, Trash2, RotateCcw } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';

export function SearchHistoryPanel() {
  const { searchHistory, clearSearchHistory } = useBookmarkStore();

  const sortedHistory = useMemo(
    () => [...searchHistory].sort((a, b) => b.timestamp - a.timestamp),
    [searchHistory]
  );

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div id="section-search-history" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Search History</h2>
        <p className="text-slate-600 dark:text-slate-400">Quick access to your recent searches</p>
      </div>

      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Recent Searches</h3>
          {searchHistory.length > 0 && (
            <button
              onClick={clearSearchHistory}
              className="text-sm px-3 py-1 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {sortedHistory.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No search history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedHistory.map((entry) => (
              <button
                key={entry.id}
                onClick={() => {
                  // This would trigger a search - implementation depends on your search UI
                  console.log('Search for:', entry.query);
                }}
                className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{entry.query}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {entry.resultCount} result{entry.resultCount !== 1 ? 's' : ''} • {formatTime(entry.timestamp)}
                    </p>
                  </div>
                  <RotateCcw className="h-4 w-4 text-slate-400 group-hover:text-premium-orange transition-colors ml-2 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
