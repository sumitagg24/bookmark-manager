import { useMemo } from 'react';
import { Download, RotateCcw, Trash2, HardDrive } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';

export function BackupRestorePanel() {
  const { backups, createBackup, restoreBackup, deleteBackup, mergeResult } = useBookmarkStore();

  const sortedBackups = useMemo(
    () => [...backups].sort((a, b) => b.timestamp - a.timestamp),
    [backups]
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRestore = (backupId: string) => {
    if (confirm('Restore this backup? Current changes will be lost.')) {
      restoreBackup(backupId);
    }
  };

  return (
    <div id="section-backup" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Backup & Restore</h2>
        <p className="text-slate-600 dark:text-slate-400">Manage your bookmark backups</p>
      </div>

      {/* Create Backup */}
      <div className="premium-card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Create Backup</h3>
        <button
          onClick={createBackup}
          disabled={!mergeResult}
          className="btn-outline-premium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Create Backup Now
        </button>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Backups are stored locally in your browser
        </p>
      </div>

      {/* Backups List */}
      <div className="premium-card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Backup History ({sortedBackups.length})</h3>
        {sortedBackups.length === 0 ? (
          <div className="text-center py-8">
            <HardDrive className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No backups yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedBackups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(backup.timestamp)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {backup.data.stats.uniqueBookmarks} bookmarks • {formatSize(backup.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <button
                    onClick={() => handleRestore(backup.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Restore backup"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteBackup(backup.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete backup"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="premium-card p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 Backups are stored in your browser's local storage. They persist across sessions but are device-specific.
        </p>
      </div>
    </div>
  );
}
