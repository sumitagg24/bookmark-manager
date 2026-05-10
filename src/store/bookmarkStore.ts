import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import type { AppState, ParsedFile, BookmarkNode, SearchHistoryEntry, Backup } from '../types/bookmark';
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
  moveNodeBefore as moveNodeBeforeUtil,
  moveNodeAfter as moveNodeAfterUtil,
} from '../core/treeEdit';
import {
  loadSessionSnapshot,
  saveSessionSnapshot,
  clearSessionSnapshot,
} from '../core/sessionPersistence';
import {
  checkUrlHealth,
  sortBookmarksByDomain,
  sortBookmarksByDate,
  sortBookmarksByAlphabetical,
  findOrphanedBookmarks,
  suggestFolderForBookmark,
} from '../core/advancedFeatures';

// Enable MapSet support in Immer
enableMapSet();

export const useBookmarkStore = create<AppState>()(
  immer((set, get) => ({
    files: [],
    mergeResult: null,
    isProcessing: false,
    error: null,
    sessionRestoredUi: false,
    history: [],
    historyIndex: -1,
    selectedIds: new Set(),
    linkCheckInProgress: false,
    linkCheckProgress: 0,
    searchQuery: '',
    searchHistory: [],
    tags: new Map(),
    backups: [],
shortcuts: new Map([
       ['ctrl-z', { id: 'undo', key: 'Ctrl+Z', action: 'undo', description: 'Undo', customizable: false }],
       ['ctrl-shift-z', { id: 'redo', key: 'Ctrl+Shift+Z', action: 'redo', description: 'Redo', customizable: false }],
       ['ctrl-f', { id: 'search', key: 'Ctrl+F', action: 'search', description: 'Search', customizable: false }],
       ['ctrl-t', { id: 'favorite', key: 'Ctrl+T', action: 'toggleFavorite', description: 'Toggle Favorite', customizable: true }],
       ['ctrl-shift-n', { id: 'note', key: 'Ctrl+Shift+N', action: 'addNote', description: 'Add Note', customizable: true }],
       ['ctrl-shift-t', { id: 'tag', key: 'Ctrl+Shift+T', action: 'addTag', description: 'Add Tag', customizable: true }],
       ['ctrl-b', { id: 'bulk', key: 'Ctrl+B', action: 'bulkSelect', description: 'Bulk Select', customizable: true }],
     ]),

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
      });
      // Always reprocess merge after file removal
      get().processMerge();
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

      set((state) => {
        state.mergeResult = deduplicateAndMerge(files);
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

        const previousState = JSON.parse(JSON.stringify(node));

        if (patch.title !== undefined) {
          const t = patch.title.trim();
          node.title = t.length > 0 ? t : 'Untitled';
        }
        if (node.type === 'bookmark' && patch.url !== undefined) {
          node.url = patch.url.trim();
        }

        // Add to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          type: 'edit',
          timestamp: Date.now(),
          nodeId: id,
          previousState,
          newState: JSON.parse(JSON.stringify(node)),
          description: `Edited ${node.type}: ${node.title}`,
        });
        state.historyIndex++;

        // Keep only last 20 actions
        if (state.history.length > 20) {
          state.history = state.history.slice(-20);
          state.historyIndex = state.history.length - 1;
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

        const previousState = slot.parent.children![slot.index];
        if (slot.parent.children) {
          slot.parent.children = slot.parent.children.filter((_, i) => i !== slot.index);
        }

        // Add to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          type: 'delete',
          timestamp: Date.now(),
          nodeId: id,
          parentId: slot.parent.id,
          previousState: JSON.parse(JSON.stringify(previousState)),
          description: `Deleted ${previousState.type === 'bookmark' ? 'bookmark' : 'folder'}: ${previousState.title}`,
        });
        state.historyIndex++;

        // Keep only last 20 actions
        if (state.history.length > 20) {
          state.history = state.history.slice(-20);
          state.historyIndex = state.history.length - 1;
        }

        state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
      });
    },

    dismissSessionNotice: () => {
      set((state) => {
        state.sessionRestoredUi = false;
      });
    },

    addMergeFolderAtRoot: (afterId?: string) => {
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
            similarBookmarks: [],
            stats: {
              totalInputBookmarks: 0,
              uniqueBookmarks: 0,
              removedDuplicates: 0,
              mergedFolders: 0,
              similarBookmarksFound: 0
            },
            sourceFiles: []
          };
        }
        
        const root = state.mergeResult.root;
        if (!root.children) root.children = [];
        const newFolder = {
          id: generateMergeNodeId(),
          type: 'folder' as const,
          title: 'New folder',
          sourceFile: 'manual',
          children: [],
        };

        if (afterId) {
          const slot = findParentSlot(root, afterId);
          if (slot && slot.parent === root) {
            slot.parent.children!.splice(slot.index + 1, 0, newFolder);
          } else {
            root.children.push(newFolder);
          }
        } else {
          root.children.push(newFolder);
        }

        // Add to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          type: 'add',
          timestamp: Date.now(),
          nodeId: newFolder.id,
          parentId: root.id,
          newState: JSON.parse(JSON.stringify(newFolder)),
          description: 'Added new folder',
        });
        state.historyIndex++;

        if (state.history.length > 20) {
          state.history = state.history.slice(-20);
          state.historyIndex = state.history.length - 1;
        }
      });
    },

    addMergeBookmarkAtRoot: (afterId?: string) => {
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
            similarBookmarks: [],
            stats: {
              totalInputBookmarks: 0,
              uniqueBookmarks: 0,
              removedDuplicates: 0,
              mergedFolders: 0,
              similarBookmarksFound: 0
            },
            sourceFiles: []
          };
        }
        
        const root = state.mergeResult.root;
        if (!root.children) root.children = [];
        const newBookmark = {
          id: generateMergeNodeId(),
          type: 'bookmark' as const,
          title: 'New bookmark',
          url: 'https://',
          sourceFile: 'manual',
        };

        if (afterId) {
          const slot = findParentSlot(root, afterId);
          if (slot && slot.parent === root) {
            slot.parent.children!.splice(slot.index + 1, 0, newBookmark);
          } else {
            root.children.push(newBookmark);
          }
        } else {
          root.children.push(newBookmark);
        }

        // Add to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          type: 'add',
          timestamp: Date.now(),
          nodeId: newBookmark.id,
          parentId: root.id,
          newState: JSON.parse(JSON.stringify(newBookmark)),
          description: 'Added new bookmark',
        });
        state.historyIndex++;

        if (state.history.length > 20) {
          state.history = state.history.slice(-20);
          state.historyIndex = state.history.length - 1;
        }
      });
    },

    addMergeFolderToFolder: (parentId: string, afterId?: string) => {
      set((state) => {
        const root = state.mergeResult?.root;
        if (!root) return;
        const parent = findNodeById(root, parentId);
        if (!parent || parent.type !== 'folder') return;
        if (!parent.children) parent.children = [];
        const newFolder = {
          id: generateMergeNodeId(),
          type: 'folder' as const,
          title: 'New folder',
          sourceFile: 'manual',
          children: [],
        };

        if (afterId) {
          const slot = findParentSlot(root, afterId);
          if (slot && slot.parent.id === parent.id) {
            slot.parent.children!.splice(slot.index + 1, 0, newFolder);
          } else {
            parent.children.push(newFolder);
          }
        } else {
          parent.children.push(newFolder);
        }

        // Add to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          type: 'add',
          timestamp: Date.now(),
          nodeId: newFolder.id,
          parentId: parent.id,
          newState: JSON.parse(JSON.stringify(newFolder)),
          description: 'Added new folder',
        });
        state.historyIndex++;

        if (state.history.length > 20) {
          state.history = state.history.slice(-20);
          state.historyIndex = state.history.length - 1;
        }

        state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
      });
    },

    addMergeBookmarkToFolder: (parentId: string, afterId?: string) => {
      set((state) => {
        const root = state.mergeResult?.root;
        if (!root) return;
        const parent = findNodeById(root, parentId);
        if (!parent || parent.type !== 'folder') return;
        if (!parent.children) parent.children = [];
        const newBookmark = {
          id: generateMergeNodeId(),
          type: 'bookmark' as const,
          title: 'New bookmark',
          url: 'https://',
          sourceFile: 'manual',
        };

        if (afterId) {
          const slot = findParentSlot(root, afterId);
          if (slot && slot.parent.id === parent.id) {
            slot.parent.children!.splice(slot.index + 1, 0, newBookmark);
          } else {
            parent.children.push(newBookmark);
          }
        } else {
          parent.children.push(newBookmark);
        }

        // Add to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          type: 'add',
          timestamp: Date.now(),
          nodeId: newBookmark.id,
          parentId: parent.id,
          newState: JSON.parse(JSON.stringify(newBookmark)),
          description: 'Added new bookmark',
        });
        state.historyIndex++;

        if (state.history.length > 20) {
          state.history = state.history.slice(-20);
          state.historyIndex = state.history.length - 1;
        }

        state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
      });
    },

     moveNode: (nodeId: string, newParentId: string) => {
       set((state) => {
         const root = state.mergeResult?.root;
         if (!root) return;

         // Validate the move
         const nodeToMove = findNodeById(root, nodeId);
         if (!nodeToMove || nodeToMove.type === 'root') return;

         const newParent = findNodeById(root, newParentId);
         if (!newParent || newParent.type !== 'folder') return;

         // Prevent moving into self or own descendants
         if (nodeId === newParentId) return;
         let current: BookmarkNode | null = newParent;
         while (current) {
           if (current.id === nodeId) return;
           const parentSlot = findParentSlot(root, current.id);
           current = parentSlot?.parent || null;
         }

         // Capture old state for undo
         const oldParentSlot = findParentSlot(root, nodeId);
         if (!oldParentSlot) return;
         const oldParent = oldParentSlot.parent;
         const oldIndex = oldParentSlot.index;

         // Remove from old parent
         oldParent.children?.splice(oldIndex, 1);
         if (oldParent.children?.length === 0) delete oldParent.children;

         // Add to new parent
         if (!newParent.children) newParent.children = [];
         newParent.children.push(nodeToMove);

        // Add to history
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({
          type: 'move',
          timestamp: Date.now(),
          nodeId,
          parentId: newParentId, // new parent
          oldParentId: oldParent.id, // old parent for undo
          description: `Moved "${nodeToMove.title}" to "${newParent.title}"`,
        });
        state.historyIndex++;

         if (state.history.length > 20) {
           state.history = state.history.slice(-20);
           state.historyIndex = state.history.length - 1;
         }

         state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
       });
     },

     moveNodeBefore: (nodeId: string, targetId: string) => {
       set((state) => {
         const root = state.mergeResult?.root;
         if (!root) return;
         const nodeToMove = findNodeById(root, nodeId);
         const target = findNodeById(root, targetId);
         if (!nodeToMove || !target || nodeId === targetId) return;
         const oldSlot = findParentSlot(root, nodeId);
         if (!oldSlot) return;
         const oldParent = oldSlot.parent;
         moveNodeBeforeUtil(root, nodeId, targetId);
         state.history = state.history.slice(0, state.historyIndex + 1);
         state.history.push({
           type: 'move', timestamp: Date.now(), nodeId,
           parentId: oldParent.id, oldParentId: oldParent.id,
           description: `Moved "${nodeToMove.title}" before "${target.title}"`,
         });
         state.historyIndex++;
         if (state.history.length > 20) { state.history = state.history.slice(-20); state.historyIndex = state.history.length - 1; }
         state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
       });
     },

     moveNodeAfter: (nodeId: string, targetId: string) => {
       set((state) => {
         const root = state.mergeResult?.root;
         if (!root) return;
         const nodeToMove = findNodeById(root, nodeId);
         const target = findNodeById(root, targetId);
         if (!nodeToMove || !target || nodeId === targetId) return;
         const oldSlot = findParentSlot(root, nodeId);
         if (!oldSlot) return;
         const oldParent = oldSlot.parent;
         moveNodeAfterUtil(root, nodeId, targetId);
         state.history = state.history.slice(0, state.historyIndex + 1);
         state.history.push({
           type: 'move', timestamp: Date.now(), nodeId,
           parentId: oldParent.id, oldParentId: oldParent.id,
           description: `Moved "${nodeToMove.title}" after "${target.title}"`,
         });
         state.historyIndex++;
         if (state.history.length > 20) { state.history = state.history.slice(-20); state.historyIndex = state.history.length - 1; }
         state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
       });
     },

copyMarkdownToClipboard: async () => {
       const { mergeResult } = get();
       if (!mergeResult) return false;
       const md = generateMarkdownExport(mergeResult.root);
       try {
         if (!navigator.clipboard?.writeText) {
           // Clipboard API not available
           return false;
         }
         await navigator.clipboard.writeText(md);
         return true;
       } catch {
         return false;
       }
     },

     removeBySourceFile: (sourceFile: string, parentId?: string) => {
       let removed = 0;
       set((state) => {
         if (!state.mergeResult) return 0;
         const root = state.mergeResult!.root;
         const targetNode = parentId ? findNodeById(root, parentId) ?? root : root;
         
         function removeRecursive(node: BookmarkNode): BookmarkNode | null {
           if (!node.children) return node.type === 'bookmark' ? null : node;
           
           const filteredChildren = node.children
             .map(child => {
               if (child.sourceFile === sourceFile) {
                 removed++;
                 return null;
               }
               if (child.type === 'folder') {
                 return removeRecursive(child);
               }
               return child;
             })
             .filter((c): c is BookmarkNode => c !== null);
           
           return {
             ...node,
             children: filteredChildren,
           };
         }
         
         if (targetNode.type === 'root' || targetNode.type === 'folder') {
           targetNode.children = targetNode.children
             ?.map(child => {
               if (child.sourceFile === sourceFile) {
                 removed++;
                 return null;
               }
               if (child.type === 'folder') {
                 return removeRecursive(child);
               }
               return child;
             })
             .filter((c): c is BookmarkNode => c !== null) || [];
         }
         
         state.mergeResult!.stats.uniqueBookmarks = countBookmarksInTree(root);
       });
       return removed;
     },

     acceptSimilarBookmarks: (groupIndex: number) => {
      set((state) => {
        if (!state.mergeResult || !state.mergeResult.similarBookmarks[groupIndex]) return;
        const group = state.mergeResult.similarBookmarks[groupIndex];
        group.status = 'accepted';
        
        // Determine which bookmarks to remove
        const selectedToKeep = group.selectedToKeep || group.canonical.id;
        const nodesToRemove = new Set<string>();
        
        // Add canonical to remove list if it's not the selected one
        if (group.canonical.id !== selectedToKeep) {
          nodesToRemove.add(group.canonical.id);
        }
        
        // Add all similar bookmarks except the selected one to remove list
        group.similar.forEach(s => {
          if (s.id !== selectedToKeep) {
            nodesToRemove.add(s.id);
          }
        });
        
        // Remove selected bookmarks from the tree
        const root = state.mergeResult.root;
        
        function removeNodesFromTree(node: BookmarkNode): BookmarkNode {
          if (!node.children) return node;
          return {
            ...node,
            children: node.children
              .filter(c => !nodesToRemove.has(c.id))
              .map(c => (c.type === 'folder' ? removeNodesFromTree(c) : c)),
          };
        }
        
        state.mergeResult.root = removeNodesFromTree(root);
        state.mergeResult.stats.uniqueBookmarks = countBookmarksInTree(state.mergeResult.root);
      });
    },

    discardSimilarBookmarks: (groupIndex: number) => {
      set((state) => {
        if (!state.mergeResult || !state.mergeResult.similarBookmarks[groupIndex]) return;
        const group = state.mergeResult.similarBookmarks[groupIndex];
        group.status = 'discarded';
        // Keep all bookmarks, just mark as discarded
      });
    },

    discardBothSimilarBookmarks: (groupIndex: number) => {
      set((state) => {
        if (!state.mergeResult || !state.mergeResult.similarBookmarks[groupIndex]) return;
        const group = state.mergeResult.similarBookmarks[groupIndex];
        group.status = 'discarded';

        // Remove ALL bookmarks in this group from the tree
        const nodesToRemove = new Set<string>();
        nodesToRemove.add(group.canonical.id);
        group.similar.forEach(s => nodesToRemove.add(s.id));

        function removeAll(node: BookmarkNode): BookmarkNode {
          if (!node.children) return node;
          return {
            ...node,
            children: node.children
              .filter(c => !nodesToRemove.has(c.id))
              .map(c => c.type === 'folder' ? removeAll(c) : c),
          };
        }

        state.mergeResult.root = removeAll(state.mergeResult.root);
        state.mergeResult.stats.uniqueBookmarks = countBookmarksInTree(state.mergeResult.root);
      });
    },

    selectBookmarkToKeep: (groupIndex: number, bookmarkId: string) => {
      set((state) => {
        if (!state.mergeResult || !state.mergeResult.similarBookmarks[groupIndex]) return;
        const group = state.mergeResult.similarBookmarks[groupIndex];
        group.selectedToKeep = bookmarkId;
      });
    },

    // Undo/Redo
    undo: () => {
      set((state) => {
        if (state.historyIndex < 0) return;
        const action = state.history[state.historyIndex];
        state.historyIndex--;

        if (!action || !state.mergeResult) return;
        const root = state.mergeResult.root;

        if (action.type === 'delete' && action.previousState && action.parentId) {
          const parent = findNodeById(root, action.parentId);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(JSON.parse(JSON.stringify(action.previousState)));
          }
        } else if (action.type === 'add' && action.nodeId) {
          const slot = findParentSlot(root, action.nodeId);
          if (slot && slot.parent.children) {
            slot.parent.children.splice(slot.index, 1);
          }
         } else if (action.type === 'edit' && action.previousState && action.nodeId) {
           const slot = findParentSlot(root, action.nodeId);
           if (slot && slot.parent.children) {
             slot.parent.children[slot.index] = JSON.parse(JSON.stringify(action.previousState));
           }
         } else if (action.type === 'move' && action.nodeId && action.oldParentId) {
           // Undo move: move node back to old parent
           const node = findNodeById(root, action.nodeId);
           const oldParent = findNodeById(root, action.oldParentId);
           if (node && oldParent && node.type !== 'root' && oldParent.type === 'folder') {
             // Remove from current parent
             const currentSlot = findParentSlot(root, action.nodeId);
             if (currentSlot && currentSlot.parent.children) {
               currentSlot.parent.children.splice(currentSlot.index, 1);
               if (currentSlot.parent.children.length === 0) delete currentSlot.parent.children;
             }
             // Add to old parent
             if (!oldParent.children) oldParent.children = [];
             oldParent.children.push(node);
           }
         }

        state.mergeResult.stats.uniqueBookmarks = countBookmarksInTree(root);
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex >= state.history.length - 1) return;
        state.historyIndex++;
        const action = state.history[state.historyIndex];

        if (!action || !state.mergeResult) return;
        const root = state.mergeResult.root;

        if (action.type === 'delete' && action.nodeId) {
          const slot = findParentSlot(root, action.nodeId);
          if (slot && slot.parent.children) {
            slot.parent.children.splice(slot.index, 1);
          }
        } else if (action.type === 'add' && action.newState && action.parentId) {
          const parent = findNodeById(root, action.parentId);
          if (parent) {
            if (!parent.children) parent.children = [];
            parent.children.push(JSON.parse(JSON.stringify(action.newState)));
          }
         } else if (action.type === 'edit' && action.newState && action.nodeId) {
           const slot = findParentSlot(root, action.nodeId);
           if (slot && slot.parent.children) {
             slot.parent.children[slot.index] = JSON.parse(JSON.stringify(action.newState));
           }
         } else if (action.type === 'move' && action.nodeId && action.parentId) {
           // Redo move: move node to new parent (the one stored in parentId)
           const node = findNodeById(root, action.nodeId);
           const newParent = findNodeById(root, action.parentId);
           if (node && newParent && node.type !== 'root' && newParent.type === 'folder') {
             // Remove from current parent
             const currentSlot = findParentSlot(root, action.nodeId);
             if (currentSlot && currentSlot.parent.children) {
               currentSlot.parent.children.splice(currentSlot.index, 1);
               if (currentSlot.parent.children.length === 0) delete currentSlot.parent.children;
             }
             // Add to new parent
             if (!newParent.children) newParent.children = [];
             newParent.children.push(node);
           }
         }

        state.mergeResult.stats.uniqueBookmarks = countBookmarksInTree(root);
      });
    },

    canUndo: () => get().historyIndex >= 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // Selection & Bulk Actions
    toggleSelection: (id: string) => {
      set((state) => {
        if (state.selectedIds.has(id)) {
          state.selectedIds.delete(id);
        } else {
          state.selectedIds.add(id);
        }
      });
    },

    selectAll: (parentId?: string) => {
      set((state) => {
        if (!state.mergeResult) return;
        const root = state.mergeResult.root;
        const parent = parentId ? findNodeById(root, parentId) : root;
        if (!parent || !parent.children) return;

        for (const child of parent.children) {
          state.selectedIds.add(child.id);
        }
      });
    },

    clearSelection: () => {
      set((state) => {
        state.selectedIds.clear();
      });
    },

    deleteSelected: () => {
      set((state) => {
        if (!state.mergeResult) return;
        const root = state.mergeResult.root;

        function removeNodes(node: BookmarkNode) {
          if (!node.children) return;
          node.children = node.children.filter((child) => !state.selectedIds.has(child.id));
          node.children.forEach(removeNodes);
        }

        removeNodes(root);
        state.selectedIds.clear();
        state.mergeResult.stats.uniqueBookmarks = countBookmarksInTree(root);
      });
    },

    moveSelectedToFolder: (targetFolderId: string) => {
      set((state) => {
        if (!state.mergeResult) return;
        const root = state.mergeResult.root;
        const target = findNodeById(root, targetFolderId);
        if (!target || target.type !== 'folder') return;

        const nodesToMove: BookmarkNode[] = [];

        function collectNodes(node: BookmarkNode) {
          if (!node.children) return;
          node.children = node.children.filter((child) => {
            if (state.selectedIds.has(child.id)) {
              nodesToMove.push(child);
              return false;
            }
            if (child.type === 'folder') {
              collectNodes(child);
            }
            return true;
          });
        }

        collectNodes(root);
        if (!target.children) target.children = [];
        target.children.push(...nodesToMove);
        state.selectedIds.clear();
      });
    },

    // Link Health Check
    checkLinkHealth: async () => {
      set((state) => {
        state.linkCheckInProgress = true;
        state.linkCheckProgress = 0;
      });

      const { mergeResult } = get();
      if (!mergeResult) {
        set((state) => {
          state.linkCheckInProgress = false;
        });
        return;
      }

      const bookmarks: BookmarkNode[] = [];
      function collectBookmarks(node: BookmarkNode) {
        if (node.type === 'bookmark' && node.url) {
          bookmarks.push(node);
        }
        node.children?.forEach(collectBookmarks);
      }
      collectBookmarks(mergeResult.root);

      const total = bookmarks.length;
      for (let i = 0; i < bookmarks.length; i++) {
        const bookmark = bookmarks[i];
        const result = await checkUrlHealth(bookmark.url!);
        set((state) => {
          if (state.mergeResult) {
            const node = findNodeById(state.mergeResult.root, bookmark.id);
            if (node) {
              node.linkStatus = result.status;
              node.statusCode = result.statusCode;
            }
          }
          state.linkCheckProgress = ((i + 1) / total) * 100;
        });
      }

      set((state) => {
        state.linkCheckInProgress = false;
      });
    },

    getOrphanedBookmarks: () => {
      const { mergeResult } = get();
      if (!mergeResult) return [];
      return findOrphanedBookmarks(mergeResult.root);
    },

    suggestFolderForBookmark: (bookmarkId: string) => {
      const { mergeResult } = get();
      if (!mergeResult) return null;
      const bookmark = findNodeById(mergeResult.root, bookmarkId);
      if (!bookmark) return null;
      return suggestFolderForBookmark(bookmark, mergeResult.root);
    },

    moveOrphanedBookmarks: (suggestions: Map<string, string>) => {
      set((state) => {
        if (!state.mergeResult) return;
        const root = state.mergeResult.root;

        for (const [bookmarkId, targetFolderId] of suggestions) {
          const slot = findParentSlot(root, bookmarkId);
          if (!slot) continue;

          const bookmark = slot.parent.children![slot.index];
          const target = findNodeById(root, targetFolderId);
          if (!target || target.type !== 'folder') continue;

          slot.parent.children!.splice(slot.index, 1);
          if (!target.children) target.children = [];
          target.children.push(bookmark);
        }
      });
    },

    // Auto-Organization
    sortBookmarks: (parentId: string | null, sortBy: 'domain' | 'date' | 'alphabetical') => {
      set((state) => {
        if (!state.mergeResult) return;
        const root = state.mergeResult.root;
        const parent = parentId ? findNodeById(root, parentId) : root;
        if (!parent || !parent.children) return;

        // Recursive helper to sort all nested bookmarks/folders
        function sortRecursive(node: BookmarkNode): void {
          if (!node.children || node.children.length === 0) return;
          
          let sorted: BookmarkNode[];
          switch (sortBy) {
            case 'domain': sorted = sortBookmarksByDomain(node.children); break;
            case 'date': sorted = sortBookmarksByDate(node.children); break;
            case 'alphabetical': sorted = sortBookmarksByAlphabetical(node.children); break;
            default: return;
          }
          node.children = sorted;
          
          // Recursively sort all subfolders
          for (const child of node.children) {
            if (child.type === 'folder') {
              sortRecursive(child);
            }
          }
        }

        // Sort this folder's children
        let sorted: BookmarkNode[];
        switch (sortBy) {
          case 'domain': sorted = sortBookmarksByDomain(parent.children); break;
          case 'date': sorted = sortBookmarksByDate(parent.children); break;
          case 'alphabetical': sorted = sortBookmarksByAlphabetical(parent.children); break;
          default: return;
        }
        parent.children = sorted;

        // Recursively sort all subfolders at any depth
        for (const child of parent.children) {
          if (child.type === 'folder') {
            sortRecursive(child);
          }
        }
      });
    },

    // Selective Export
    exportFolder: (folderId: string, format: ExportFormat) => {
      const { mergeResult } = get();
      if (!mergeResult) return;

      const folder = findNodeById(mergeResult.root, folderId);
      if (!folder) return;

      const content = buildExportContent(folder, format);
      downloadExport(content, `${folder.title}-export`, format);
    },

    exportBrokenLinksOnly: () => {
      const { mergeResult } = get();
      if (!mergeResult) return;

      const brokenBookmarks: BookmarkNode[] = [];
      function collectBroken(node: BookmarkNode) {
        if (node.type === 'bookmark' && node.linkStatus === 'broken') {
          brokenBookmarks.push(node);
        }
        node.children?.forEach(collectBroken);
      }
      collectBroken(mergeResult.root);

      const csv = [
        ['Title', 'URL', 'Status Code'].join(','),
        ...brokenBookmarks.map((b) =>
          [b.title, b.url || '', b.statusCode || ''].map((v) => `"${v}"`).join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'broken-links.csv';
      a.click();
      URL.revokeObjectURL(url);
    },

    // Tag Management
    addTag: (name: string, color: string) => {
      let tagId = '';
      set((state) => {
        tagId = `tag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        state.tags.set(tagId, {
          id: tagId,
          name,
          color,
          count: 0,
        });
      });
      return tagId;
    },

    removeTag: (tagId: string) => {
      set((state) => {
        state.tags.delete(tagId);
        // Remove tag from all bookmarks
        if (state.mergeResult) {
          function removeTagFromNode(node: BookmarkNode) {
            if (node.tags) {
              node.tags = node.tags.filter((t) => t !== tagId);
            }
            node.children?.forEach(removeTagFromNode);
          }
          removeTagFromNode(state.mergeResult.root);
        }
      });
    },

    addTagToBookmark: (bookmarkId: string, tagId: string) => {
      set((state) => {
        if (!state.mergeResult) return;
        const bookmark = findNodeById(state.mergeResult.root, bookmarkId);
        if (!bookmark) return;
        if (!bookmark.tags) bookmark.tags = [];
        if (!bookmark.tags.includes(tagId)) {
          bookmark.tags.push(tagId);
          const tag = state.tags.get(tagId);
          if (tag) tag.count++;
        }
      });
    },

    removeTagFromBookmark: (bookmarkId: string, tagId: string) => {
      set((state) => {
        if (!state.mergeResult) return;
        const bookmark = findNodeById(state.mergeResult.root, bookmarkId);
        if (!bookmark || !bookmark.tags) return;
        const index = bookmark.tags.indexOf(tagId);
        if (index > -1) {
          bookmark.tags.splice(index, 1);
          const tag = state.tags.get(tagId);
          if (tag && tag.count > 0) tag.count--;
        }
      });
    },

    // Search History
    addToSearchHistory: (query: string, resultCount: number) => {
      set((state) => {
        const entry: SearchHistoryEntry = {
          id: `search-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          query,
          timestamp: Date.now(),
          resultCount,
        };
        state.searchHistory.unshift(entry);
        // Keep only last 20
        if (state.searchHistory.length > 20) {
          state.searchHistory = state.searchHistory.slice(0, 20);
        }
      });
    },

    clearSearchHistory: () => {
      set((state) => {
        state.searchHistory = [];
      });
    },

    // Favorites
    toggleFavorite: (bookmarkId: string) => {
      set((state) => {
        if (!state.mergeResult) return;
        const bookmark = findNodeById(state.mergeResult.root, bookmarkId);
        if (!bookmark) return;
        bookmark.isFavorite = !bookmark.isFavorite;
      });
    },

    // Bulk Operations
    bulkEditBookmarks: (ids: string[], changes: Partial<BookmarkNode>) => {
      set((state) => {
        if (!state.mergeResult) return;
        for (const id of ids) {
          const node = findNodeById(state.mergeResult.root, id);
          if (!node) continue;
          if (changes.title !== undefined) node.title = changes.title;
          if (changes.notes !== undefined) node.notes = changes.notes;
          if (changes.tags !== undefined) node.tags = changes.tags;
          if (changes.isFavorite !== undefined) node.isFavorite = changes.isFavorite;
        }
      });
    },

    // Backup/Restore
    createBackup: () => {
      set((state) => {
        const { mergeResult } = get();
        if (!mergeResult) return;
        const backup: Backup = {
          id: `backup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
          data: JSON.parse(JSON.stringify(mergeResult)),
          size: JSON.stringify(mergeResult).length,
        };
        state.backups.unshift(backup);
        // Keep only last 10 backups
        if (state.backups.length > 10) {
          state.backups = state.backups.slice(0, 10);
        }
      });
    },

    restoreBackup: (backupId: string) => {
      set((state) => {
        const backup = state.backups.find((b) => b.id === backupId);
        if (!backup) return;
        state.mergeResult = JSON.parse(JSON.stringify(backup.data));
      });
    },

    deleteBackup: (backupId: string) => {
      set((state) => {
        state.backups = state.backups.filter((b) => b.id !== backupId);
      });
    },

    // Shortcuts
    updateShortcut: (shortcutId: string, newKey: string) => {
      set((state) => {
        for (const [key, shortcut] of state.shortcuts) {
          if (shortcut.id === shortcutId) {
            state.shortcuts.delete(key);
            shortcut.key = newKey;
            state.shortcuts.set(newKey.toLowerCase().replace(/\+/g, '-'), shortcut);
            break;
          }
        }
      });
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
