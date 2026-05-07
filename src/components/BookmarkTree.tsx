import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  type FC,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   ChevronRight,
   Folder,
   FolderPlus,
   Link2,
   ExternalLink,
   Search,
   Pencil,
   Trash2,
   Check,
   X,
   Plus,
   RotateCcw,
   RotateCw,
 } from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';
import { filterBookmarkTree } from '../core/treeFilter';
import type { BookmarkNode } from '../types/bookmark';

const actionBtn =
   'p-2 rounded-xl text-slate-400 hover:text-premium-orange hover:bg-premium-orange/10 dark:hover:bg-premium-orange/15 transition-colors shrink-0';

const checkboxCls =
   'w-4 h-4 rounded border border-slate-300 text-premium-orange focus:ring-2 focus:ring-premium-orange/20 dark:border-white/20 dark:bg-white/10 cursor-pointer';

interface TreeNodeProps {
   node: BookmarkNode;
   depth?: number;
   selectedIds: Set<string>;
   onToggleSelection: (id: string) => void;
}

const TreeNode: FC<TreeNodeProps> = ({ node, depth = 0, selectedIds, onToggleSelection }) => {
   const [isOpen, setIsOpen] = useState(true);
   const [editing, setEditing] = useState(false);
   const [draftTitle, setDraftTitle] = useState('');
   const [draftUrl, setDraftUrl] = useState('');
   const [showNotes, setShowNotes] = useState(false);
   const isSelected = selectedIds.has(node.id);

   const updateMergeNode = useBookmarkStore((s) => s.updateMergeNode);
   const removeMergeNode = useBookmarkStore((s) => s.removeMergeNode);
   const addMergeFolderToFolder = useBookmarkStore((s) => s.addMergeFolderToFolder);
   const addMergeBookmarkToFolder = useBookmarkStore((s) => s.addMergeBookmarkToFolder);
   const toggleSelection = useBookmarkStore((s) => s.toggleSelection);

  const startEdit = useCallback(() => {
    setDraftTitle(node.title);
    setDraftUrl(node.type === 'bookmark' ? (node.url ?? '') : '');
    setEditing(true);
  }, [node]);

  const cancelEdit = useCallback(() => {
    setEditing(false);
  }, []);

  const saveEdit = useCallback(() => {
    if (node.type === 'bookmark') {
      // Validate URL if provided
      if (draftUrl.trim()) {
        try {
          new URL(draftUrl);
        } catch {
          alert('Invalid URL format. Please enter a valid URL.');
          return;
        }
      }
      updateMergeNode(node.id, { title: draftTitle, url: draftUrl });
    } else {
      updateMergeNode(node.id, { title: draftTitle });
    }
    setEditing(false);
  }, [node.id, node.type, draftTitle, draftUrl, updateMergeNode]);

  const onKeyEdit = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      }
      if (e.key === 'Escape') cancelEdit();
    },
    [saveEdit, cancelEdit]
  );

  const deleteBookmark = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      removeMergeNode(node.id);
    },
    [node.id, removeMergeNode]
  );

  const deleteFolder = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      if (
        window.confirm(
          'Delete this folder and everything inside it? This cannot be undone.'
        )
      ) {
        removeMergeNode(node.id);
      }
    },
    [node.id, removeMergeNode]
  );

  const pad = { paddingLeft: `${depth * 20 + 8}px` };

  const inputCls =
    'rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-[13px] outline-none focus:border-premium-orange focus:ring-2 focus:ring-premium-orange/20 dark:border-white/10 dark:bg-white/5 dark:text-white';

  if (node.type === 'bookmark') {
    if (editing) {
      return (
        <div
          className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/90 px-2 py-2 dark:border-white/[0.06] dark:bg-white/[0.04]"
          style={pad}
        >
          <Link2 className="h-4 w-4 shrink-0 text-premium-orange" />
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={onKeyEdit}
            className={`min-w-[120px] flex-1 ${inputCls}`}
            placeholder="Title"
            aria-label="Bookmark title"
          />
          <input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={onKeyEdit}
            className={`min-w-[160px] flex-[2] font-mono text-[12px] ${inputCls}`}
            placeholder="https://…"
            aria-label="Bookmark URL"
          />
          <div className="flex shrink-0 gap-1">
            <button type="button" className={actionBtn} onClick={saveEdit} aria-label="Save">
              <Check className="h-4 w-4 text-emerald-600" />
            </button>
            <button type="button" className={actionBtn} onClick={cancelEdit} aria-label="Cancel">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

return (
      <div
        className="group flex items-center gap-1 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]"
        style={pad}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            toggleSelection(node.id);
          }}
          className={`${checkboxCls} mr-1 opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`}
          aria-label={`Select ${node.title}`}
        />
        <Link2 className="h-4 w-4 shrink-0 text-premium-orange" />
        {node.url?.trim() ? (
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-[13px] font-medium text-premium-navy hover:text-premium-orange hover:underline dark:text-sky-300 dark:hover:text-premium-orange"
            title={node.url}
            onClick={(e) => e.stopPropagation()}
          >
            {node.title}
          </a>
        ) : (
          <span
            className="min-w-0 flex-1 truncate text-[13px] italic text-slate-400 dark:text-slate-500"
            title="No URL set"
          >
            {node.title}
          </span>
        )}
        {node.linkStatus && (
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded ${
              node.linkStatus === 'ok'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : node.linkStatus === 'broken'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            }`}
          >
            {node.linkStatus}
          </span>
        )}
        <ExternalLink className="h-3 w-3 shrink-0 text-slate-300 opacity-100 md:opacity-0 md:group-hover:opacity-100" />
        <button
          type="button"
          className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`}
          onClick={(e) => {
            e.stopPropagation();
            setShowNotes(!showNotes);
          }}
          aria-label="Toggle notes"
          title={node.notes || 'Add notes'}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`}
          onClick={(e) => {
            e.stopPropagation();
            startEdit();
          }}
          aria-label="Edit bookmark"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className={`${actionBtn} hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100`}
          onClick={deleteBookmark}
          aria-label="Remove bookmark"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  if (node.type === 'folder') {
    const count = node.children?.length ?? 0;

    if (editing) {
      return (
        <div style={pad}>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/90 px-2 py-2 dark:border-white/[0.06] dark:bg-white/[0.04]">
            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onKeyDown={onKeyEdit}
              className={`min-w-[140px] flex-1 font-semibold ${inputCls}`}
              placeholder="Folder name"
              aria-label="Folder name"
              autoFocus
            />
            <button type="button" className={actionBtn} onClick={saveEdit} aria-label="Save">
              <Check className="h-4 w-4 text-emerald-600" />
            </button>
            <button type="button" className={actionBtn} onClick={cancelEdit} aria-label="Cancel">
              <X className="h-4 w-4" />
            </button>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-3 mt-1 overflow-hidden border-l-2 border-slate-100 pl-2 dark:border-white/10"
              >
                {node.children?.map((child) => (
                  <TreeNode key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onToggleSelection={onToggleSelection} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div>
        <div
          className="group flex items-center gap-1 rounded-xl px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04]"
          style={pad}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelection(node.id);
            }}
            className={`${checkboxCls} mr-1 opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`}
            aria-label={`Select ${node.title}`}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="-my-1 -ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-xl py-1 pl-1 text-left"
            aria-expanded={isOpen}
          >
            <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </motion.span>
            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
              {node.title}
            </span>
            <span className="ml-auto shrink-0 text-[11px] font-medium text-slate-400">
              {count} items
            </span>
          </button>
          <button
            type="button"
            className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`}
            onClick={(e) => {
              e.stopPropagation();
              addMergeBookmarkToFolder(node.id);
            }}
            aria-label="Add bookmark to folder"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`}
            onClick={(e) => {
              e.stopPropagation();
              addMergeFolderToFolder(node.id);
            }}
            aria-label="Add subfolder"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`}
            onClick={(e) => {
              e.stopPropagation();
              startEdit();
            }}
            aria-label="Rename folder"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className={`${actionBtn} hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100`}
            onClick={deleteFolder}
            aria-label="Delete folder"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

<AnimatePresence>
           {isOpen && (
             <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.2 }}
               className="overflow-hidden"
             >
               {node.children?.map((child) => (
                 <TreeNode key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onToggleSelection={onToggleSelection} />
               ))}
             </motion.div>
           )}
         </AnimatePresence>
      </div>
    );
  }

  return null;
};

export const BookmarkTree: FC = () => {
   const mergeResult = useBookmarkStore((s) => s.mergeResult);
   const addMergeFolderAtRoot = useBookmarkStore((s) => s.addMergeFolderAtRoot);
   const addMergeBookmarkAtRoot = useBookmarkStore((s) => s.addMergeBookmarkAtRoot);
   const undo = useBookmarkStore((s) => s.undo);
   const redo = useBookmarkStore((s) => s.redo);
   const canUndo = useBookmarkStore((s) => s.canUndo);
   const canRedo = useBookmarkStore((s) => s.canRedo);
   const selectedIds = useBookmarkStore((s) => s.selectedIds);
   const toggleSelection = useBookmarkStore((s) => s.toggleSelection);
   const selectAll = useBookmarkStore((s) => s.selectAll);
   const clearSelection = useBookmarkStore((s) => s.clearSelection);
   const [query, setQuery] = useState('');

   // Keyboard shortcuts
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
       const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

       if (ctrlKey && e.key === 'z' && !e.shiftKey) {
         e.preventDefault();
         if (canUndo()) undo();
       } else if ((ctrlKey && e.key === 'z' && e.shiftKey) || (ctrlKey && e.key === 'y')) {
         e.preventDefault();
         if (canRedo()) redo();
       } else if (ctrlKey && e.key === 'f') {
         e.preventDefault();
         const searchInput = document.querySelector('input[placeholder*="Filter"]') as HTMLInputElement;
         searchInput?.focus();
       } else if (ctrlKey && e.key === 'a') {
         e.preventDefault();
         if (mergeResult) selectAll();
       } else if (ctrlKey && e.key === 'd') {
         e.preventDefault();
         clearSelection();
       }
     };

window.addEventListener('keydown', handleKeyDown as unknown as EventListener);
      return () => window.removeEventListener('keydown', handleKeyDown as unknown as EventListener);
   }, [undo, redo, canUndo, canRedo, mergeResult, selectAll, clearSelection]);

   const displayRoot = useMemo(() => {
     if (!mergeResult) return null;
     const q = query.trim();
     if (!q) return mergeResult.root;
     return filterBookmarkTree(mergeResult.root, q);
   }, [mergeResult, query]);

   const children = displayRoot?.children ?? [];
   const hasNoMergeResult = !mergeResult;
   const emptySearch = query.trim().length > 0 && children.length === 0;

   return (
     <div className="premium-card flex max-h-[min(70vh,720px)] flex-col gap-5 p-6 md:p-8">
       <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
         <div className="min-w-0 flex-1">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Preview</h3>
           <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
             Edit or remove folders and links at the top level before export.
           </p>
         </div>
         <div className="relative w-full lg:max-w-xs">
           <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
           <input
             type="search"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Filter by title or URL…"
             className="premium-input py-3 pl-11 pr-4 text-[13px]"
             aria-label="Filter bookmarks"
           />
         </div>
         <div className="flex gap-2">
           <button
             type="button"
             onClick={() => undo()}
             disabled={!canUndo()}
             className="btn-secondary flex items-center gap-2 py-2 px-3 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
             title="Undo (Ctrl+Z)"
           >
             <RotateCcw className="h-4 w-4" />
           </button>
           <button
             type="button"
             onClick={() => redo()}
             disabled={!canRedo()}
             className="btn-secondary flex items-center gap-2 py-2 px-3 text-[13px] disabled:opacity-50 disabled:cursor-not-allowed"
             title="Redo (Ctrl+Shift+Z)"
           >
             <RotateCw className="h-4 w-4" />
           </button>
           <button
             type="button"
             onClick={() => addMergeFolderAtRoot()}
             className="btn-secondary flex items-center gap-2 py-2 px-3 text-[13px]"
           >
             <FolderPlus className="h-4 w-4 text-premium-orange" />
             Folder
           </button>
           <button
             type="button"
             onClick={() => addMergeBookmarkAtRoot()}
             className="btn-secondary flex items-center gap-2 py-2 px-3 text-[13px]"
           >
             <Plus className="h-4 w-4 text-premium-orange" />
             Bookmark
           </button>
         </div>
       </div>
       <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
         {hasNoMergeResult ? (
           <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
             <Folder className="h-16 w-16 text-slate-300 mb-4" strokeWidth={1} />
             <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">No bookmarks yet</p>
             <p className="text-[14px] text-slate-500 dark:text-slate-500 max-w-sm">
               Add a folder or bookmark to get started. Use the buttons above to create new items.
             </p>
           </div>
         ) : emptySearch ? (
           <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
             <Search className="h-16 w-16 text-slate-300 mb-4" strokeWidth={1} />
             <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">No matches found</p>
             <p className="text-[14px] text-slate-500 dark:text-slate-500 max-w-sm">
               Try a different search term or clear the filter.
             </p>
           </div>
         ) : children.length > 0 ? (
           children.map((child) => <TreeNode key={child.id} node={child} depth={0} selectedIds={selectedIds} onToggleSelection={toggleSelection} />)
         ) : (
           <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
             <Folder className="h-16 w-16 text-slate-300 mb-4" strokeWidth={1} />
             <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">No bookmarks yet</p>
             <p className="text-[14px] text-slate-500 dark:text-slate-500 max-w-sm">
               Import files above to see your merged bookmarks here.
             </p>
           </div>
         )}
       </div>
     </div>
   );
};
