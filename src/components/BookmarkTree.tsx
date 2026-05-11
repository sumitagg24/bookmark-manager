import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  type FC,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Folder,
  FolderPlus,
  ExternalLink,
  Globe,
  Search,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
  RotateCcw,
  RotateCw,
  CircleOff,
} from 'lucide-react';
import { useBookmarkStore } from '../store/bookmarkStore';
import { filterBookmarkTree } from '../core/treeFilter';
import { getRootUrl, hasPath, getDefaultTitle } from '../core/urlUtils';
import type { BookmarkNode } from '../types/bookmark';
import { Favicon } from './Favicon';
import { FileLegend, getFileColor } from './FileLegend';
import { SourceComparisonPanel } from './SourceComparisonPanel';

function highlightText(text: string, query: string): { text: string; highlighted: boolean }[] {
  if (!query.trim()) {
    return [{ text, highlighted: false }];
  }
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) => ({
    text: part,
    highlighted: part.toLowerCase() === query.toLowerCase() && i % 2 === 1,
  }));
}

const HighlightSpan: FC<{ text: string; highlighted: boolean }> = ({ text, highlighted }) => {
  if (highlighted) {
    return (
      <mark className="bg-amber-200/60 text-amber-900 dark:bg-amber-500/30 dark:text-amber-100 px-0.5 rounded-sm">
        {text}
      </mark>
    );
  }
  return <>{text}</>;
};

const actionBtn =
  'p-1.5 rounded-xl text-slate-400 hover:text-app-accent hover:bg-app-accent-soft dark:hover:bg-app-accent/15 hover:scale-110 transition-all duration-200 shrink-0';

const checkboxCls =
  'w-4 h-4 rounded border border-slate-300 text-app-accent focus:ring-2 focus:ring-app-accent/20 dark:border-white/20 dark:bg-white/10 cursor-pointer';

type DropPos = 'before' | 'after' | 'inside';

interface TreeNodeProps {
  node: BookmarkNode;
  depth?: number;
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  query?: string;
  draggedNodeId?: string | null;
  onDragStart?: (nodeId: string) => void;
  onDragOver?: (nodeId: string, pos: DropPos) => void;
  onDrop?: (nodeId: string, targetParentId: string, pos?: DropPos) => void;
  onDragEnd?: () => void;
  focusedId?: string | null;
  onFocusChange?: (id: string) => void;
  openFolders?: Set<string>;
  onToggleOpen?: (id: string) => void;
}

function collectFolderSources(node: BookmarkNode): Map<string, number> {
  const sources = new Map<string, number>();
  function walk(n: BookmarkNode) {
    if (n.type === 'bookmark' && n.sourceFile && n.sourceFile !== 'manual') {
      sources.set(n.sourceFile, (sources.get(n.sourceFile) || 0) + 1);
    }
    n.children?.forEach(walk);
  }
  node.children?.forEach(walk);
  return sources;
}

const TreeNode: FC<TreeNodeProps> = ({
  node, depth = 0, selectedIds, onToggleSelection, query = '',
  draggedNodeId, onDragStart, onDragOver, onDrop, onDragEnd,
  focusedId, onFocusChange, openFolders, onToggleOpen
}) => {
  const isOpen = openFolders ? openFolders.has(node.id) : true;
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftUrl, setDraftUrl] = useState('');
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [dropPos, setDropPos] = useState<DropPos | null>(null);
  const sourceMenuRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const isSelected = selectedIds.has(node.id);
  const isFocused = focusedId === node.id;
  const isDragging = draggedNodeId === node.id;

  const updateMergeNode = useBookmarkStore((s) => s.updateMergeNode);
  const removeMergeNode = useBookmarkStore((s) => s.removeMergeNode);
  const addMergeFolderToFolder = useBookmarkStore((s) => s.addMergeFolderToFolder);
  const addMergeBookmarkToFolder = useBookmarkStore((s) => s.addMergeBookmarkToFolder);
  const removeBySourceFile = useBookmarkStore((s) => s.removeBySourceFile);

  const folderSources = useMemo(() => {
    if (node.type !== 'folder') return null;
    return collectFolderSources(node);
  }, [node]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(e.target as Node)) {
        setShowSourceMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick as any);
    return () => document.removeEventListener('mousedown', handleClick as any);
  }, []);

  const startEdit = useCallback(() => {
    setDraftTitle(node.title);
    setDraftUrl(node.type === 'bookmark' ? (node.url ?? '') : '');
    setEditing(true);
  }, [node]);

  const cancelEdit = useCallback(() => setEditing(false), []);

  const saveEdit = useCallback(() => {
    if (node.type === 'bookmark') {
      if (draftUrl.trim()) {
        try { new URL(draftUrl); }
        catch { alert('Invalid URL format.'); return; }
      }
      updateMergeNode(node.id, { title: draftTitle, url: draftUrl });
    } else {
      updateMergeNode(node.id, { title: draftTitle });
    }
    setEditing(false);
  }, [node.id, node.type, draftTitle, draftUrl, updateMergeNode]);

  const onKeyEdit = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
      if (e.key === 'Escape') cancelEdit();
    },
    [saveEdit, cancelEdit]
  );

  const deleteBookmark = useCallback(
    (e: MouseEvent) => { e.stopPropagation(); removeMergeNode(node.id); },
    [node.id, removeMergeNode]
  );

  const handleStripToRoot = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    if (!node.url) return;
    try {
      const rootUrl = new URL(node.url).origin + '/';
      updateMergeNode(node.id, { url: rootUrl, title: getDefaultTitle(node.url) });
    } catch { /* ignore invalid urls */ }
  }, [node.id, node.url, updateMergeNode]);

  const deleteFolder = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      if (window.confirm('Delete this folder and everything inside it? This cannot be undone.')) {
        removeMergeNode(node.id);
      }
    },
    [node.id, removeMergeNode]
  );

  const handleRemoveSourceFromFolder = useCallback(
    (source: string) => {
      if (!window.confirm(`Remove all bookmarks from "${source}" inside this folder?`)) return;
      removeBySourceFile(source, node.id);
      setShowSourceMenu(false);
    },
    [node.id, removeBySourceFile]
  );

  const getDropPosition = useCallback((e: React.DragEvent): DropPos | null => {
    if (!rowRef.current || node.id === draggedNodeId) return null;
    const rect = rowRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height;
    if (node.type === 'folder' && y > h * 0.25 && y < h * 0.75) return 'inside';
    if (y < h * 0.5) return 'before';
    return 'after';
  }, [node.id, draggedNodeId]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.stopPropagation();
    onDragStart?.(node.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id);
  }, [node.id, onDragStart]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.id === draggedNodeId) return;
    const pos = getDropPosition(e);
    if (!pos) return;
    e.dataTransfer.dropEffect = 'move';
    setDropPos(pos);
    onDragOver?.(node.id, pos);
  }, [node.id, draggedNodeId, onDragOver, getDropPosition]);

  const handleDragLeave = useCallback(() => setDropPos(null), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sourceNodeId = e.dataTransfer.getData('text/plain');
    if (!sourceNodeId || sourceNodeId === node.id) return;
    onDrop?.(sourceNodeId, node.id, dropPos || 'inside');
    setDropPos(null);
  }, [node.id, onDrop, dropPos]);

  const handleDragEnd = useCallback(() => onDragEnd?.(), [onDragEnd]);

  const pad = { paddingLeft: `${depth * 20 + 8}px` };
  const inputCls =
    'rounded-xl border border-app-border bg-white px-2.5 py-2 text-[13px] outline-none focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 dark:border-white/10 dark:bg-white/5 dark:text-white';

  if (node.type === 'bookmark') {
    if (editing) {
      return (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-app-border/40 bg-slate-50/80 px-3 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.04]" style={pad}>
          <Favicon url={node.url} title={node.title} size="sm" />
          <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} onKeyDown={onKeyEdit} className={`min-w-[120px] flex-1 ${inputCls}`} placeholder="Title" aria-label="Bookmark title" />
          <input value={draftUrl} onChange={(e) => setDraftUrl(e.target.value)} onKeyDown={onKeyEdit} className={`min-w-[160px] flex-[2] font-mono text-[12px] ${inputCls}`} placeholder="https://..." aria-label="Bookmark URL" />
          <div className="flex shrink-0 gap-1">
            <button type="button" className={actionBtn} onClick={saveEdit} aria-label="Save"><Check className="h-4 w-4 text-emerald-600" /></button>
            <button type="button" className={actionBtn} onClick={cancelEdit} aria-label="Cancel"><X className="h-4 w-4" /></button>
          </div>
        </div>
      );
    }

    const dropIndicator = dropPos === 'before' ? 'border-t-2 border-emerald-400' :
      dropPos === 'after' ? 'border-b-2 border-emerald-400' : '';

    return (
      <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        <div
          ref={rowRef}
          data-node-id={node.id}
          tabIndex={-1}
          onFocus={() => onFocusChange?.(node.id)}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          className={`group flex items-center gap-2 rounded-2xl px-3 py-2 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] outline-none ${
            isFocused ? 'ring-2 ring-app-accent/30 ring-offset-1 dark:ring-offset-gray-900' : ''
          } ${
            isSelected ? 'bg-app-accent-soft/60 border border-app-accent/20 shadow-sm' : isDragging ? 'opacity-50 scale-95' : ''
          } ${dropIndicator}`}
          style={pad}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input type="checkbox" checked={isSelected} onChange={(e) => { e.stopPropagation(); onToggleSelection(node.id); }} className={`${checkboxCls} mr-0.5 opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`} aria-label={`Select ${node.title}`} />
          <Favicon url={node.url} title={node.title} size="sm" />
          {node.url?.trim() ? (
            <a href={node.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-[13px] font-medium text-app-accent hover:text-app-accent-hover hover:underline dark:text-sky-300 dark:hover:text-app-accent" title={node.url} onClick={(e) => e.stopPropagation()}>
              {query.trim() ? (
                <span className="flex flex-wrap items-baseline">
                  {highlightText(node.title, query).map((part, i) => (<HighlightSpan key={i} text={part.text} highlighted={part.highlighted} />))}
                </span>
              ) : node.title}
            </a>
          ) : (
            <span className="min-w-0 flex-1 truncate text-[13px] italic text-slate-400 dark:text-slate-500" title="No URL set">{node.title}</span>
          )}
          {node.linkStatus && (
            <span className={`text-[10px] font-semibold px-2 py-1 rounded ${
              node.linkStatus === 'ok' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
              node.linkStatus === 'broken' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
            }`}>{node.linkStatus}</span>
          )}
          {node.sourceFile && node.sourceFile !== 'manual' && (
            <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ backgroundColor: getFileColor(node.sourceFile) + '20', color: getFileColor(node.sourceFile) }} title={`From: ${node.sourceFile}`}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getFileColor(node.sourceFile) }} />
              {node.sourceFile.split('/').pop()?.replace('.html', '').replace('.json', '') || node.sourceFile}
            </span>
          )}
          {node.url?.trim() && (
            <button type="button" className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`} onClick={(e) => { e.stopPropagation(); window.open(node.url, '_blank', 'noopener,noreferrer'); }} aria-label="Open in new tab" title="Open in new tab">
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
          {node.url && hasPath(node.url) && (
            <button type="button" className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`} onClick={handleStripToRoot} aria-label="Strip to landing page" title={`Landing page: ${getRootUrl(node.url)}`}>
              <Globe className="h-3.5 w-3.5" />
            </button>
          )}
          <button type="button" className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`} onClick={(e) => { e.stopPropagation(); startEdit(); }} aria-label="Edit bookmark">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={`${actionBtn} hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100`} onClick={deleteBookmark} aria-label="Remove bookmark">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    );
  }

  if (node.type === 'folder') {
    const count = node.children?.length ?? 0;
    const hasMultipleSources = folderSources && folderSources.size > 0;

    if (editing) {
      return (
        <div style={pad}>
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-app-border/40 bg-slate-50/80 px-2 py-2 dark:border-white/[0.06] dark:bg-white/[0.04]">
            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
            <input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} onKeyDown={onKeyEdit} className={`min-w-[140px] flex-1 font-semibold ${inputCls}`} placeholder="Folder name" aria-label="Folder name" autoFocus />
            <button type="button" className={actionBtn} onClick={saveEdit} aria-label="Save"><Check className="h-4 w-4 text-emerald-600" /></button>
            <button type="button" className={actionBtn} onClick={cancelEdit} aria-label="Cancel"><X className="h-4 w-4" /></button>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="ml-3 mt-1 overflow-hidden border-l-2 border-slate-100 pl-2 dark:border-white/10">
                {node.children?.map((child) => (
                  <TreeNode key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onToggleSelection={onToggleSelection} query={query} draggedNodeId={draggedNodeId} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} focusedId={focusedId} onFocusChange={onFocusChange} openFolders={openFolders} onToggleOpen={onToggleOpen} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    const dropIndicator = dropPos === 'before' ? 'border-t-2 border-emerald-400' :
      dropPos === 'after' ? 'border-b-2 border-emerald-400' : '';

    return (
      <motion.div initial={{ opacity: 0, y: 2 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        <div
          ref={rowRef}
          data-node-id={node.id}
          tabIndex={-1}
          onFocus={() => onFocusChange?.(node.id)}
          draggable
          onDragStart={handleDragStart}
          className={`group flex items-center gap-2 rounded-2xl px-3 py-2 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-white/[0.04] outline-none ${
            isFocused ? 'ring-2 ring-app-accent/30 ring-offset-1 dark:ring-offset-gray-900' : ''
          } ${
            isSelected ? 'bg-app-accent-soft/60 border border-app-accent/20 shadow-sm' :
            isDragging ? 'opacity-50 scale-95' :
            dropPos === 'inside' ? 'bg-emerald-50/80 border-2 border-emerald-400 shadow-md dark:bg-emerald-900/20' : ''
          } ${dropIndicator}`}
          style={pad}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        >
          <input type="checkbox" checked={isSelected} onChange={(e) => { e.stopPropagation(); onToggleSelection(node.id); }} className={`${checkboxCls} mr-1 opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`} aria-label={`Select ${node.title}`} />
          <button type="button" onClick={() => onToggleOpen?.(node.id)} className="-my-1 -ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-xl py-1 pl-1 text-left" aria-expanded={isOpen}>
            <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </motion.span>
            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="truncate font-semibold text-app-navy dark:text-slate-200">
              {query.trim() ? (
                <span className="flex items-center">{highlightText(node.title, query).map((part, i) => (<HighlightSpan key={i} text={part.text} highlighted={part.highlighted} />))}</span>
              ) : node.title}
            </span>
            <span className="ml-auto shrink-0 text-[11px] font-medium text-slate-400">{count} items</span>
          </button>

          {/* Purge source files from folder */}
          {hasMultipleSources && (
            <div className="relative" ref={sourceMenuRef}>
              <button type="button" className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`} onClick={(e) => { e.stopPropagation(); setShowSourceMenu(!showSourceMenu); }} aria-label="Remove bookmarks by source" title="Remove bookmarks by source file">
                <CircleOff className="h-3.5 w-3.5" />
              </button>
              <AnimatePresence>
                {showSourceMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded-2xl border border-app-border/60 bg-white p-2 shadow-card dark:border-white/[0.08] dark:bg-[#1a1f2e]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="px-2.5 py-1.5 text-[11px] font-medium text-app-muted dark:text-slate-400">Remove by source:</p>
                    {Array.from(folderSources!.entries()).map(([source, bmCount]) => (
                      <button
                        key={source}
                        type="button"
                        onClick={() => handleRemoveSourceFromFolder(source)}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[12px] font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-950/25 dark:hover:text-red-400"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getFileColor(source) }} />
                        <span className="truncate flex-1">{source.split('/').pop()?.replace('.html', '').replace('.json', '') || source}</span>
                        <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] dark:bg-white/[0.08]">{bmCount} bm</span>
                        <Trash2 className="h-3 w-3 shrink-0 text-red-400" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button type="button" className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`} onClick={(e) => { e.stopPropagation(); addMergeBookmarkToFolder(node.id, focusedId ?? undefined); }} aria-label="Add bookmark">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`} onClick={(e) => { e.stopPropagation(); addMergeFolderToFolder(node.id, focusedId ?? undefined); }} aria-label="Add subfolder">
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={`${actionBtn} opacity-100 md:opacity-0 md:group-hover:opacity-100`} onClick={(e) => { e.stopPropagation(); startEdit(); }} aria-label="Rename folder">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={`${actionBtn} hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100`} onClick={deleteFolder} aria-label="Delete folder">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {node.sourceFile && node.sourceFile !== 'manual' && (
            <span className="ml-1 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium" style={{ backgroundColor: getFileColor(node.sourceFile) + '20', color: getFileColor(node.sourceFile) }} title={`From: ${node.sourceFile}`}>
              {node.sourceFile.split('/').pop()?.replace('.html', '').replace('.json', '') || node.sourceFile}
            </span>
          )}
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              {node.children?.map((child) => (
                <TreeNode key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onToggleSelection={onToggleSelection} query={query} draggedNodeId={draggedNodeId} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} focusedId={focusedId} onFocusChange={onFocusChange} openFolders={openFolders} onToggleOpen={onToggleOpen} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Handle root node type by rendering its children as top-level nodes
  if (node.type === 'root') {
    return (
      <>{node.children?.map((child) => (
        <TreeNode key={child.id} node={child} depth={0} selectedIds={selectedIds} onToggleSelection={onToggleSelection} query={query} draggedNodeId={draggedNodeId} onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} focusedId={focusedId} onFocusChange={onFocusChange} openFolders={openFolders} onToggleOpen={onToggleOpen} />
      ))}</>
    );
  }

  return null;
};

export const BookmarkTree: FC = () => {
  const mergeResult = useBookmarkStore((s) => s.mergeResult);
  const addMergeFolderAtRoot = useBookmarkStore((s) => s.addMergeFolderAtRoot);
  const addMergeBookmarkAtRoot = useBookmarkStore((s) => s.addMergeBookmarkAtRoot);
  const moveNode = useBookmarkStore((s) => s.moveNode);
  const moveNodeBefore = useBookmarkStore((s) => s.moveNodeBefore);
  const moveNodeAfter = useBookmarkStore((s) => s.moveNodeAfter);
  const undo = useBookmarkStore((s) => s.undo);
  const redo = useBookmarkStore((s) => s.redo);
  const canUndo = useBookmarkStore((s) => s.canUndo);
  const canRedo = useBookmarkStore((s) => s.canRedo);
  const selectedIds = useBookmarkStore((s) => s.selectedIds);
  const toggleSelection = useBookmarkStore((s) => s.toggleSelection);
  const selectAll = useBookmarkStore((s) => s.selectAll);
  const clearSelection = useBookmarkStore((s) => s.clearSelection);
  const [query, setQuery] = useState('');
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [activeSourceFilters, setActiveSourceFilters] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [toggledClosed, setToggledClosed] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const allFolderIds = useMemo(() => {
    const ids = new Set<string>();
    if (!mergeResult) return ids;
    function collect(n: BookmarkNode) {
      if (n.type === 'folder') ids.add(n.id);
      n.children?.forEach(collect);
    }
    collect(mergeResult.root);
    return ids;
  }, [mergeResult]);

  const openFolders = useMemo(() => {
    const open = new Set(allFolderIds);
    for (const id of toggledClosed) open.delete(id);
    return open;
  }, [allFolderIds, toggledClosed]);

  const handleSourceFilterChange = useCallback((sources: string[]) => {
    setActiveSourceFilters(sources);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
      if (ctrlKey && e.key === 'z' && !e.shiftKey) { e.preventDefault(); if (canUndo()) undo(); }
      else if ((ctrlKey && e.key === 'z' && e.shiftKey) || (ctrlKey && e.key === 'y')) { e.preventDefault(); if (canRedo()) redo(); }
      else if (ctrlKey && e.key === 'f') { e.preventDefault(); const i = document.querySelector('input[placeholder*="Filter"]') as HTMLInputElement; i?.focus(); }
      else if (ctrlKey && e.key === 'a') { e.preventDefault(); if (mergeResult) selectAll(); }
      else if (ctrlKey && e.key === 'd') { e.preventDefault(); clearSelection(); }
    };
    window.addEventListener('keydown', handleKeyDown as unknown as EventListener);
    return () => window.removeEventListener('keydown', handleKeyDown as unknown as EventListener);
  }, [undo, redo, canUndo, canRedo, mergeResult, selectAll, clearSelection]);

  const handleToggleOpen = useCallback((id: string) => {
    setToggledClosed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleTreeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!scrollRef.current) return;
    const items = scrollRef.current.querySelectorAll<HTMLElement>('[data-node-id]');
    if (!items.length) return;
    const currentIndex = focusedId ? Array.from(items).findIndex((el) => el.dataset.nodeId === focusedId) : -1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(currentIndex + 1, items.length - 1);
      const el = items[next];
      el?.focus();
      setFocusedId(el?.dataset.nodeId ?? null);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(currentIndex - 1, 0);
      const el = items[prev];
      el?.focus();
      setFocusedId(el?.dataset.nodeId ?? null);
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      if (focusedId) {
        const el = Array.from(items).find((el) => el.dataset.nodeId === focusedId);
        if (el) {
          const btn = el.querySelector('button[aria-expanded]') as HTMLButtonElement;
          if (btn && btn.getAttribute('aria-expanded') === 'false') btn.click();
        }
      }
    } else if (e.key === 'ArrowLeft') {
      if (focusedId) {
        const el = Array.from(items).find((el) => el.dataset.nodeId === focusedId);
        if (el) {
          const btn = el.querySelector('button[aria-expanded]') as HTMLButtonElement;
          if (btn && btn.getAttribute('aria-expanded') === 'true') btn.click();
        }
      }
    }
  }, [focusedId]);

  const displayRoot = useMemo(() => {
    if (!mergeResult) return null;
    let root = mergeResult.root;
    if (activeSourceFilters.length > 0 && activeSourceFilters.length < mergeResult.sourceFiles.length) {
      function filterBySources(node: BookmarkNode): BookmarkNode | null {
        if (node.type === 'root') {
          const filteredChildren = node.children?.map(child => filterBySources(child)).filter((c): c is BookmarkNode => c !== null) || [];
          return { ...node, children: filteredChildren };
        }
        const isSourceAllowed = (n: BookmarkNode) => activeSourceFilters.includes(n.sourceFile);
        if (node.type === 'folder' && node.children) {
          const filteredChildren = node.children.map(child => filterBySources(child)).filter((c): c is BookmarkNode => c !== null);
          if (filteredChildren.length > 0) return { ...node, children: filteredChildren };
          return null;
        }
        if (isSourceAllowed(node)) return node;
        return null;
      }
      root = filterBySources(mergeResult.root) || { ...mergeResult.root, children: [] };
    }
    const q = query.trim();
    if (!q) return root;
    return filterBookmarkTree(root, q);
  }, [mergeResult, query, activeSourceFilters]);

  const children = displayRoot?.children ?? [];
  const hasNoMergeResult = !mergeResult;
  const emptySearch = query.trim().length > 0 && children.length === 0;

  const handleDrop = useCallback((sourceId: string, targetParentId: string, pos?: DropPos) => {
    if (pos === 'before') {
      moveNodeBefore(sourceId, targetParentId);
    } else if (pos === 'after') {
      moveNodeAfter(sourceId, targetParentId);
    } else {
      moveNode(sourceId, targetParentId);
    }
    setDraggedNodeId(null);
  }, [moveNode, moveNodeBefore, moveNodeAfter]);

  const handleDragStart = useCallback((nodeId: string) => setDraggedNodeId(nodeId), []);
  const handleDragEnd = useCallback(() => setDraggedNodeId(null), []);
  const handleDragOver = useCallback((_nodeId: string, _pos: DropPos) => { /* tracked per-node */ }, []);

  return (
    <div className="app-card flex max-h-[min(85vh,900px)] min-h-[500px] flex-col p-4 md:p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-app-border/50 pb-4 dark:border-white/[0.06]">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Folder className="h-4 w-4 text-app-accent" strokeWidth={1.75} />
              <h3 className="text-base font-bold text-app-navy dark:text-white">Preview</h3>
              {mergeResult?.stats && (
                <span className="app-badge text-[10px]">{mergeResult.stats.uniqueBookmarks} items</span>
              )}
            </div>
            <p className="text-[11px] text-app-muted dark:text-slate-400">
              Drag to reorder · Up/Down to navigate · Ctrl+Z to undo
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter bookmarks…" className="app-input py-1.5 pl-8 pr-3 text-[12px] w-36 lg:w-44" aria-label="Filter bookmarks" />
            </div>
            <button type="button" onClick={() => undo()} disabled={!canUndo()} className="app-btn-secondary p-1.5 hover:scale-105" title="Undo (Ctrl+Z)">
              <RotateCcw className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => redo()} disabled={!canRedo()} className="app-btn-secondary p-1.5 hover:scale-105" title="Redo (Ctrl+Shift+Z)">
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>
        <FileLegend />
      </div>

      {/* Source Filter */}
      {mergeResult && mergeResult.sourceFiles.length > 1 && (
        <SourceComparisonPanel onSourceFilterChange={handleSourceFilterChange} activeFilters={activeSourceFilters} />
      )}

      {/* Action Buttons */}
      <div className="flex gap-1.5 py-3">
        <button type="button" onClick={() => addMergeFolderAtRoot(focusedId ?? undefined)} className="app-btn-secondary flex items-center gap-1.5 py-1.5 px-2.5 text-[12px] hover:scale-105">
          <FolderPlus className="h-3.5 w-3.5 text-app-accent" />
          <span>New Folder</span>
        </button>
        <button type="button" onClick={() => addMergeBookmarkAtRoot(focusedId ?? undefined)} className="app-btn-primary flex items-center gap-1.5 py-1.5 px-2.5 text-[12px] hover:scale-105">
          <Plus className="h-3.5 w-3.5" />
          <span>New Bookmark</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} tabIndex={0} onKeyDown={handleTreeKeyDown} className="min-h-0 flex-1 overflow-y-auto pr-1.5 custom-scrollbar pb-1 outline-none">
        {hasNoMergeResult ? (
          <div className="app-empty-state py-12">
            <Folder className="h-14 w-14 text-slate-300 dark:text-slate-600" strokeWidth={1} />
            <p className="mt-4 text-base font-medium text-slate-600 dark:text-slate-400">No bookmarks yet</p>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-500 max-w-sm">Add a folder or bookmark to get started.</p>
          </div>
        ) : emptySearch ? (
          <div className="app-empty-state py-12">
            <Search className="h-14 w-14 text-slate-300 dark:text-slate-600" strokeWidth={1} />
            <p className="mt-4 text-base font-medium text-slate-600 dark:text-slate-400">No matches found</p>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-500">Try a different search term.</p>
          </div>
        ) : children.length > 0 ? (
          children.map((child) => (
            <TreeNode key={child.id} node={child} depth={0} selectedIds={selectedIds} onToggleSelection={toggleSelection} query={query} draggedNodeId={draggedNodeId} onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} onDragEnd={handleDragEnd} focusedId={focusedId} onFocusChange={setFocusedId} openFolders={openFolders} onToggleOpen={handleToggleOpen} />
          ))
        ) : (
          <div className="app-empty-state py-12">
            <Folder className="h-14 w-14 text-slate-300 dark:text-slate-600" strokeWidth={1} />
            <p className="mt-4 text-base font-medium text-slate-600 dark:text-slate-400">No bookmarks to display</p>
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-500">
              {activeSourceFilters.length > 0 && activeSourceFilters.length < (mergeResult?.sourceFiles.length || 0)
                ? 'No bookmarks match the selected source filters.'
                : 'Import files above to see your merged bookmarks here.'}
            </p>
          </div>
        )}
</div>
    </div>
  );
};
