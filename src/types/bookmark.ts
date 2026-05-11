export interface BookmarkNode {
  id: string;
  type: 'bookmark' | 'folder' | 'root';
  title: string;
  url?: string;
  addDate?: number;
  lastModified?: number;
  icon?: string;
  children?: BookmarkNode[];
  sourceFile: string;
  isDuplicate?: boolean;
  originalFolder?: string;
  notes?: string;
  linkStatus?: 'pending' | 'ok' | 'broken' | 'timeout';
  statusCode?: number;
  tags?: string[];
  isFavorite?: boolean;
  preview?: {
    title: string;
    description: string;
    favicon: string;
  };
  lastVisited?: number;
}

export interface HistoryAction {
  type: 'add' | 'delete' | 'edit' | 'move' | 'reorder';
  timestamp: number;
  nodeId?: string;
  parentId?: string;
  oldParentId?: string; // For move actions - the original parent before move
  previousState?: BookmarkNode;
  newState?: BookmarkNode;
  description: string;
}

export interface ParsedFile {
  id: string;
  filename: string;
  format: 'netscape' | 'chrome-json' | 'unknown';
  root: BookmarkNode;
  stats: {
    totalBookmarks: number;
    totalFolders: number;
    maxDepth: number;
  };
}

export interface DuplicateGroup {
   canonical: BookmarkNode;
   duplicates: BookmarkNode[];
   normalizedUrl: string;
   location?: string; // Root folder path where duplicate was found (e.g., "Folder/Subfolder")
}

export interface SimilarBookmarkGroup {
  canonical: BookmarkNode;
  similar: BookmarkNode[];
  reason: string;
  status?: 'pending' | 'accepted' | 'discarded';
  selectedToKeep?: string; // ID of the bookmark to keep
}

export interface MergeResult {
  root: BookmarkNode;
  duplicates: DuplicateGroup[];
  similarBookmarks: SimilarBookmarkGroup[];
  stats: {
    totalInputBookmarks: number;
    uniqueBookmarks: number;
    removedDuplicates: number;
    mergedFolders: number;
    similarBookmarksFound: number;
  };
  sourceFiles: string[];
}

export type ExportFormat = 'html' | 'urls' | 'csv' | 'markdown';

export interface MergeNodePatch {
  title?: string;
  url?: string;
}

// New Types for Extended Features

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: number;
  resultCount: number;
}

export interface Backup {
  id: string;
  timestamp: number;
  data: MergeResult;
  size: number;
}

export interface Shortcut {
  id: string;
  key: string;
  action: string;
  description: string;
  customizable: boolean;
}

export interface AppState {
  files: ParsedFile[];
  mergeResult: MergeResult | null;
  isProcessing: boolean;
  error: string | null;
  /** True once after hydrating saved session from this device */
  sessionRestoredUi: boolean;
  
  // Undo/Redo
  history: HistoryAction[];
  historyIndex: number;
  
  // Selection & Bulk Actions
  selectedIds: Set<string>;
  
  // Link Health Check
  linkCheckInProgress: boolean;
  linkCheckProgress: number;
  
  // Search
  searchQuery: string;
  searchHistory: SearchHistoryEntry[];
  
  // Tags
  tags: Map<string, Tag>;
  
  // Backups
  backups: Backup[];
  
  // Shortcuts
  shortcuts: Map<string, Shortcut>;
  
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  clearAll: () => void;
  processMerge: () => void;
  exportBookmarks: (filename: string, format?: ExportFormat) => void;
  updateMergeNode: (id: string, patch: MergeNodePatch) => void;
  removeMergeNode: (id: string) => void;
  dismissSessionNotice: () => void;
  addMergeFolderAtRoot: (afterId?: string) => void;
  addMergeBookmarkAtRoot: (afterId?: string) => void;
   addMergeFolderToFolder: (parentId: string, afterId?: string) => void;
   addMergeBookmarkToFolder: (parentId: string, afterId?: string) => void;
moveNode: (nodeId: string, newParentId: string) => void;
moveNodeBefore: (nodeId: string, targetId: string) => void;
moveNodeAfter: (nodeId: string, targetId: string) => void;
    copyMarkdownToClipboard: () => Promise<boolean>;
   removeBySourceFile: (sourceFile: string, parentId?: string) => number;
   acceptSimilarBookmarks: (groupIndex: number) => void;
  discardSimilarBookmarks: (groupIndex: number) => void;
  discardBothSimilarBookmarks: (groupIndex: number) => void;
  selectBookmarkToKeep: (groupIndex: number, bookmarkId: string) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Selection & Bulk Actions
  toggleSelection: (id: string) => void;
  selectAll: (parentId?: string) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  moveSelectedToFolder: (targetFolderId: string) => void;
  
  // Link Health Check
  checkLinkHealth: () => Promise<void>;
  getOrphanedBookmarks: () => BookmarkNode[];
  suggestFolderForBookmark: (bookmarkId: string) => string | null;
  moveOrphanedBookmarks: (suggestions: Map<string, string>) => void;
  
  // Auto-Organization
  sortBookmarks: (parentId: string | null, sortBy: 'domain' | 'date' | 'alphabetical') => void;
  
  // Selective Export
  exportFolder: (folderId: string, format: ExportFormat) => void;
  exportBrokenLinksOnly: () => void;
  
  // Tag Management
  addTag: (name: string, color: string) => string;
  removeTag: (tagId: string) => void;
  addTagToBookmark: (bookmarkId: string, tagId: string) => void;
  removeTagFromBookmark: (bookmarkId: string, tagId: string) => void;
  
  // Search History
  addToSearchHistory: (query: string, resultCount: number) => void;
  clearSearchHistory: () => void;
  
  // Favorites
  toggleFavorite: (bookmarkId: string) => void;
  
  // Bulk Operations
  bulkEditBookmarks: (ids: string[], changes: Partial<BookmarkNode>) => void;
  
  // Backup/Restore
  createBackup: () => void;
  restoreBackup: (backupId: string) => void;
  deleteBackup: (backupId: string) => void;
  
  // Shortcuts
  updateShortcut: (shortcutId: string, newKey: string) => void;
}
