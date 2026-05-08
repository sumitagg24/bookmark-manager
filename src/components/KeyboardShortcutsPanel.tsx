import { useMemo } from 'react';
import { useBookmarkStore } from '../store/bookmarkStore';

export function KeyboardShortcutsPanel() {
  const { shortcuts } = useBookmarkStore();

  const shortcutsList = useMemo(() => {
    const list = Array.from(shortcuts.values());
    return list.sort((a, b) => a.description.localeCompare(b.description));
  }, [shortcuts]);

const categories = {
     'Navigation': ['undo', 'redo', 'search'],
     'Bookmarks': ['favorite', 'note', 'tag', 'bulk'],
   };

  return (
    <div id="section-shortcuts" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Keyboard Shortcuts</h2>
        <p className="text-slate-600 dark:text-slate-400">Master these shortcuts to work faster</p>
      </div>

      <div className="grid gap-6">
        {Object.entries(categories).map(([category, ids]) => {
          const categoryShortcuts = shortcutsList.filter((s) => ids.includes(s.id));
          return (
            <div key={category} className="premium-card p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{category}</h3>
              <div className="space-y-3">
                {categoryShortcuts.map((shortcut) => (
                  <div key={shortcut.id} className="flex items-center justify-between">
                    <p className="text-slate-700 dark:text-slate-300">{shortcut.description}</p>
                    <kbd className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
