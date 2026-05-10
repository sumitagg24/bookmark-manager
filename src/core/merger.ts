import type { BookmarkNode, DuplicateGroup, MergeResult, ParsedFile } from '../types/bookmark';
import { normalizeUrl } from './normalizer';
import { detectSimilarBookmarks, collectAllBookmarks } from './similarityDetector';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function cloneNode(node: BookmarkNode, newSource?: string): BookmarkNode {
  return {
    ...node,
    id: generateId(),
    sourceFile: newSource || node.sourceFile,
    children: node.children ? node.children.map(c => cloneNode(c, newSource)) : undefined,
  };
}

function findFolderByName(parent: BookmarkNode, name: string): BookmarkNode | undefined {
  return parent.children?.find(c => c.type === 'folder' && c.title === name);
}

function mergeFoldersImmutable(target: BookmarkNode, source: BookmarkNode): BookmarkNode {
  const targetChildren = target.children || [];
  const newChildren = [...targetChildren];
  
  source.children?.forEach(sourceChild => {
    if (sourceChild.type === 'folder') {
      const existingFolderIndex = newChildren.findIndex(
        c => c.type === 'folder' && c.title === sourceChild.title
      );
      if (existingFolderIndex >= 0) {
        newChildren[existingFolderIndex] = mergeFoldersImmutable(
          newChildren[existingFolderIndex],
          sourceChild
        );
      } else {
        newChildren.push(cloneNode(sourceChild));
      }
    } else {
      newChildren.push(cloneNode(sourceChild));
    }
  });
  
  return {
    ...target,
    children: newChildren,
  };
}

export function deduplicateAndMerge(files: ParsedFile[]): MergeResult {
  const duplicates: DuplicateGroup[] = [];
  let removedCount = 0;
  let mergedFolderCount = 0;
  let totalInput = 0;
  
  let root: BookmarkNode = {
    id: generateId(),
    type: 'root',
    title: 'Merged Bookmarks',
    sourceFile: 'merged',
    children: [],
  };
  
  // Merge all files first
  files.forEach(file => {
    file.root.children?.forEach(topLevelNode => {
      if (topLevelNode.type === 'folder') {
        const existingFolder = findFolderByName(root, topLevelNode.title);
        if (existingFolder && existingFolder.type === 'folder') {
          // Merge the folder contents
          const mergedFolder = mergeFoldersImmutable(existingFolder, topLevelNode);
          // Find and replace the folder in root's children
          root = {
            ...root,
            children: root.children?.map(c => c.id === existingFolder.id ? mergedFolder : c) || [],
          };
          mergedFolderCount++;
        } else {
          const cloned = cloneNode(topLevelNode, file.filename);
          root = {
            ...root,
            children: [...(root.children || []), cloned],
          };
        }
      } else if (topLevelNode.type === 'bookmark') {
        const cloned = cloneNode(topLevelNode, file.filename);
        root = {
          ...root,
          children: [...(root.children || []), cloned],
        };
      }
    });
  });
  
// Now collect bookmarks from the merged root (with correct IDs)
   const bookmarksForDedup: { node: BookmarkNode; normalized: string; location?: string }[] = [];
   
   function collectBookmarks(node: BookmarkNode, folderPath: string[] = []) {
     if (node.type === 'bookmark' && node.url) {
       totalInput++;
       const normalized = normalizeUrl(node.url);
       bookmarksForDedup.push({ 
         node, 
         normalized,
         location: folderPath.length > 0 ? folderPath.join(' / ') : undefined
       });
     } else if (node.type === 'folder') {
       const newPath = [...folderPath, node.title];
       node.children?.forEach(child => collectBookmarks(child, newPath));
     } else {
       node.children?.forEach(child => collectBookmarks(child, folderPath));
     }
   }
   
   collectBookmarks(root);
  
  // Deduplicate based on normalized URLs
  const processedUrls = new Set<string>();
  const nodesToRemove = new Set<string>();
  
bookmarksForDedup.forEach(({ node, normalized, location }) => {
     if (processedUrls.has(normalized)) {
       const group = duplicates.find(d => d.normalizedUrl === normalized);
       if (group) {
         group.duplicates.push({ ...node, originalFolder: location });
       }
       removedCount++;
       nodesToRemove.add(node.id);
     } else {
       processedUrls.add(normalized);
       duplicates.push({
         canonical: { ...node, originalFolder: location },
         duplicates: [],
         normalizedUrl: normalized,
         location,
       });
     }
   });
  
  // Remove duplicates immutably
  function removeDuplicatesFromNode(node: BookmarkNode): BookmarkNode {
    if (!node.children) return node;
    
    const filteredChildren = node.children
      .filter(c => !nodesToRemove.has(c.id))
      .map(c => (c.type === 'folder' ? removeDuplicatesFromNode(c) : c));
    
    return {
      ...node,
      children: filteredChildren,
    };
  }
  
  root = removeDuplicatesFromNode(root);
  
  // Remove empty folders immutably
  function removeEmptyFolders(node: BookmarkNode): BookmarkNode | null {
    if (!node.children) return node.type === 'bookmark' ? node : null;
    
    const filteredChildren = node.children
      .map(child => (child.type === 'folder' ? removeEmptyFolders(child) : child))
      .filter((c): c is BookmarkNode => c !== null);
    
    if (filteredChildren.length === 0 && node.type !== 'root') return null;
    
    return {
      ...node,
      children: filteredChildren,
    };
  }
  
  const cleaned = removeEmptyFolders(root);
  if (cleaned) root = cleaned;
  
  let uniqueCount = 0;
  function countBookmarks(node: BookmarkNode) {
    if (node.type === 'bookmark') uniqueCount++;
    node.children?.forEach(countBookmarks);
  }
  countBookmarks(root);
  
  // Detect similar bookmarks
  const allBookmarks = collectAllBookmarks(root);
  const similarBookmarks = detectSimilarBookmarks(allBookmarks);
  
  return {
    root,
    duplicates,
    similarBookmarks,
    stats: {
      totalInputBookmarks: totalInput,
      uniqueBookmarks: uniqueCount,
      removedDuplicates: removedCount,
      mergedFolders: mergedFolderCount,
      similarBookmarksFound: similarBookmarks.reduce((sum, g) => sum + g.similar.length, 0),
    },
    sourceFiles: files.map(f => f.filename),
  };
}
