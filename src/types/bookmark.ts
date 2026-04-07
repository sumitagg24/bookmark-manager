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
}

export interface MergeResult {
  root: BookmarkNode;
  duplicates: DuplicateGroup[];
  stats: {
    totalInputBookmarks: number;
    uniqueBookmarks: number;
    removedDuplicates: number;
    mergedFolders: number;
  };
  sourceFiles: string[];
}

export type ExportFormat = 'html' | 'urls' | 'csv';

export interface MergeNodePatch {
  title?: string;
  url?: string;
}

export interface AppState {
  files: ParsedFile[];
  mergeResult: MergeResult | null;
  isProcessing: boolean;
  error: string | null;
  /** True once after hydrating saved session from this device */
  sessionRestoredUi: boolean;
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (id: string) => void;
  clearAll: () => void;
  processMerge: () => void;
  exportBookmarks: (filename: string, format?: ExportFormat) => void;
  updateMergeNode: (id: string, patch: MergeNodePatch) => void;
  removeMergeNode: (id: string) => void;
  dismissSessionNotice: () => void;
  addMergeFolderAtRoot: () => void;
  addMergeBookmarkAtRoot: () => void;
  addMergeFolderToFolder: (parentId: string) => void;
  addMergeBookmarkToFolder: (parentId: string) => void;
  copyMarkdownToClipboard: () => Promise<boolean>;
}