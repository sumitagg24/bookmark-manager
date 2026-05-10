import { useState, useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A8E6CF',
];

export function TagsPanel() {
  const { tags, addTag, removeTag } = useBookmarkStore();
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const tagList = useMemo(() => Array.from(tags.values()), [tags]);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      addTag(newTagName.trim(), selectedColor);
      setNewTagName('');
      setSelectedColor(COLORS[0]);
    }
  };

  return (
    <div id="section-tags" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Tags</h2>
        <p className="text-slate-600 dark:text-slate-400">Organize bookmarks with custom tags</p>
      </div>

      {/* Add New Tag */}
      <div className="premium-card p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Create New Tag</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="Tag name..."
            className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-premium-orange"
          />
          <button
            onClick={handleAddTag}
            className="btn-outline-premium"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {/* Color Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-lg transition-transform ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tags List */}
      <div className="premium-card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">All Tags ({tagList.length})</h3>
        {tagList.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No tags yet. Create one to get started.</p>
        ) : (
          <div className="space-y-2">
            {tagList.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{tag.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tag.count} bookmarks</p>
                  </div>
                </div>
                <button
                  onClick={() => removeTag(tag.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Delete tag"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
