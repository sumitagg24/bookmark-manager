import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AppState, ParsedFile } from '../types/bookmark';
import { parseNetscapeHTML } from '../parsers/netscape';
import { parseChromeJSON, detectFormat } from '../parsers/chrome-json';
import { deduplicateAndMerge } from '../core/merger';
import { buildExportContent, downloadExport, generateMarkdownExport } from '../core/exporter';
import type { ExportFormat } from '../types/bookmark';
import {
  findNodeById,
  findParentSlot,
  countBookmarksInTree,
  generateMergeNodeId,
} from '../core/treeEdit';
import {
  loadSessionSnapshot,
  saveSessionSnapshot,
  clearSessionSnapshot,
} from '../core/sessionPersistence';

export const useBookmarkStore = create<AppState>()(
  immer((set, get) => ({
    files: [],
    mergeResult: null,
    isProcessing: false,
    error: null,
    sessionRestoredUi: false,

    addFiles: async (files: File[]) => {
      set((state) => {
        state.isProcessing = true;
        state.error = null;
      });

      try {
        const parsedFiles: ParsedFile[] = [];

        for (const file of files) {
          const content = await file.text();
          const format = detectFormat(content);

          let parsed: ParsedFile;
          if (format === 'netscape') {
            parsed = parseNetscapeHTML(content, file.name);
          } else if (format === 'chrome-json') {
            parsed = parseChromeJSON(content, file.name);
          } else {
            throw new Error(`Unknown format for file: ${file.name}`);
          }

          parsedFiles.push(parsed);
        }

        set((state) => {
          state.files.push(...parsedFiles);
          state.isProcessing = false;
          state.sessionRestoredUi = false;
        });

        if (parsedFiles.length > 0) {
          get().processMerge();
        }
      } catch (err) {
        set((state) => {
          state.error = err instanceof Error ? err.message : 'Unknown error';
          state.isProcessing = false;
        });
      }
    },

    removeFile: (id: string) => {
      set((state) => {
        state.files = state.files.filter((f) => f.id !== id);
        if (state.files.length === 0) {
          state.mergeResult = null;
        }
      });
      if (get().files.length > 0) {
        get().processMerge();
      }
    },

    clearAll: () => {
      clearSessionSnapshot();
      set((state) => {
        state.files = [];
        state.mergeResult = null;
        state.error = null;
        state.sessionRestoredUi = false;
      });
    },

    processMerge: () => {
      const { files } = get();
      if (files.length === 0) return;

      const result = deduplicateAndMerge(files);
      set((state) => {
        state.mergeResult = result;
      });
    },

    exportBookmarks: (filename: string, format: ExportFormat = 'html') => {
      const { mergeResult } = get();
      if (!mergeResult) return;

      const content = buildExportContent(mergeResult.root, format);
      downloadExport(content, filename, format);
    },

    updateMergeNode: (id: string, patch) => {
      set((state) => {
        const root = state.mergeResult?.root;
        if (!root) return;
        const node = findNodeById(root, id);
        if (!node || node.type === 'root') return;
        if (patch.title !== undefined) {
          const t = patch.title.trim();
          node.title = t.length > 0 ? t : 'Untitled';
        }
        if (node.type === 'bookmark' && patch.url !== undefined) {
          node.url = patch.url.trim();
        }
        state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
      });
    },

    removeMergeNode: (id: string) => {
      set((state) => {
        const root = state.mergeResult?.root;
        if (!root || root.id === id) return;
        const slot = findParentSlot(root, id);
        if (!slot) return;
        slot.parent.children!.splice(slot.index, 1);
        state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
      });
    },

    dismissSessionNotice: () => {
      set((state) => {
        state.sessionRestoredUi = false;
      });
    },

    addMergeFolderAtRoot: () => {
      set((state) => {
        // If no mergeResult exists, create a default one
        if (!state.mergeResult) {
          state.mergeResult = {
            root: {
              id: 'root',
              type: 'root' as const,
              title: 'Merged Bookmarks',
              sourceFile: 'merged',
              children: []
            },
            duplicates: [],
            stats: {
              totalInputBookmarks: 0,
              uniqueBookmarks: 0,
              removedDuplicates: 0,
              mergedFolders: 0
            },
            sourceFiles: []
          };
        }
        
        const root = state.mergeResult.root;
        if (!root.children) root.children = [];
        root.children.push({
          id: generateMergeNodeId(),
          type: 'folder',
          title: 'New folder',
          sourceFile: 'manual',
          children: [],
        });
      });
    },

    addMergeBookmarkAtRoot: () => {
      set((state) => {
        // If no mergeResult exists, create a default one
        if (!state.mergeResult) {
          state.mergeResult = {
            root: {
              id: 'root',
              type: 'root' as const,
              title: 'Merged Bookmarks',
              sourceFile: 'merged',
              children: []
            },
            duplicates: [],
            stats: {
              totalInputBookmarks: 0,
              uniqueBookmarks: 0,
              removedDuplicates: 0,
              mergedFolders: 0
            },
            sourceFiles: []
          };
        }
        
        const root = state.mergeResult.root;
        if (!root.children) root.children = [];
        root.children.push({
          id: generateMergeNodeId(),
          type: 'bookmark',
          title: 'New bookmark',
          url: 'https://',
          sourceFile: 'manual',
        });
      });
    },

    addMergeFolderToFolder: (parentId: string) => {
      set((state) => {
        const root = state.mergeResult?.root;
        if (!root) return;
        const parent = findNodeById(root, parentId);
        if (!parent || parent.type !== 'folder') return;
        if (!parent.children) parent.children = [];
        parent.children.push({
          id: generateMergeNodeId(),
          type: 'folder',
          title: 'New folder',
          sourceFile: 'manual',
          children: [],
        });
        state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
      });
    },

    addMergeBookmarkToFolder: (parentId: string) => {
      set((state) => {
        const root = state.mergeResult?.root;
        if (!root) return;
        const parent = findNodeById(root, parentId);
        if (!parent || parent.type !== 'folder') return;
        if (!parent.children) parent.children = [];
        parent.children.push({
          id: generateMergeNodeId(),
          type: 'bookmark',
          title: 'New bookmark',
          url: 'https://',
          sourceFile: 'manual',
        });
        state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
      });
    },

    copyMarkdownToClipboard: async () => {
      const { mergeResult } = get();
      if (!mergeResult) return false;
      const md = generateMarkdownExport(mergeResult.root);
      try {
        await navigator.clipboard.writeText(md);
        return true;
      } catch {
        return false;
      }
    },
  }))
);

if (typeof window !== 'undefined') {
  const snap = loadSessionSnapshot();
  if (snap?.files?.length) {
    useBookmarkStore.setState({
      files: snap.files,
      mergeResult: snap.mergeResult,
      sessionRestoredUi: true,
      error: null,
      isProcessing: false,
    });
    if (!snap.mergeResult) {
      useBookmarkStore.getState().processMerge();
    }
  }

  useBookmarkStore.subscribe((state) => {
    saveSessionSnapshot(state.files, state.mergeResult);
  });
}
