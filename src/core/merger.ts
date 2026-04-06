import type { BookmarkNode, DuplicateGroup, MergeResult, ParsedFile } from '../types/bookmark';
import { normalizeUrl } from './normalizer';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function cloneNode(node: BookmarkNode, newSource?: string): BookmarkNode {
  return {
    ...node,
    id: generateId(),
    sourceFile: newSource || node.sourceFile,
    children: node.children?.map(c => cloneNode(c, newSource)),
  };
}

function findFolderByName(parent: BookmarkNode, name: string): BookmarkNode | undefined {
  return parent.children?.find(c => c.type === 'folder' && c.title === name);
}

function mergeFolders(target: BookmarkNode, source: BookmarkNode): void {
  if (!target.children) target.children = [];
  
  source.children?.forEach(sourceChild => {
    if (sourceChild.type === 'folder') {
      const existingFolder = findFolderByName(target, sourceChild.title);
      if (existingFolder && existingFolder.type === 'folder') {
        mergeFolders(existingFolder, sourceChild);
      } else {
        target.children!.push(cloneNode(sourceChild));
      }
    } else {
      target.children!.push(cloneNode(sourceChild));
    }
  });
}

export function deduplicateAndMerge(files: ParsedFile[]): MergeResult {
  const duplicates: DuplicateGroup[] = [];
  let removedCount = 0;
  let mergedFolderCount = 0;
  let totalInput = 0;
  
  const root: BookmarkNode = {
    id: generateId(),
    type: 'root',
    title: 'Merged Bookmarks',
    sourceFile: 'merged',
    children: [],
  };
  
  const allBookmarks: { node: BookmarkNode; parent: BookmarkNode; normalized: string }[] = [];
  
  function collectBookmarks(node: BookmarkNode, parent: BookmarkNode) {
    if (node.type === 'bookmark' && node.url) {
      totalInput++;
      const normalized = normalizeUrl(node.url);
      allBookmarks.push({ node, parent, normalized });
    }
    node.children?.forEach(child => {
      if (child.type === 'folder') {
        collectBookmarks(child, child);
      } else if (child.type === 'bookmark') {
        collectBookmarks(child, node);
      }
    });
  }
  
  files.forEach(file => {
    file.root.children?.forEach(topLevelNode => {
      if (topLevelNode.type === 'folder') {
        const existingFolder = findFolderByName(root, topLevelNode.title);
        if (existingFolder && existingFolder.type === 'folder') {
          mergeFolders(existingFolder, topLevelNode);
          mergedFolderCount++;
        } else {
          root.children!.push(cloneNode(topLevelNode, file.filename));
        }
        collectBookmarks(topLevelNode, topLevelNode);
      } else if (topLevelNode.type === 'bookmark') {
        root.children!.push(cloneNode(topLevelNode, file.filename));
        collectBookmarks(topLevelNode, root);
      }
    });
  });
  
  const processedUrls = new Set<string>();
  
  allBookmarks.forEach(({ node, parent, normalized }) => {
    if (processedUrls.has(normalized)) {
      const group = duplicates.find(d => d.normalizedUrl === normalized);
      if (group) {
        group.duplicates.push(node);
      }
      removedCount++;
      if (parent.children) {
        parent.children = parent.children.filter(c => c.id !== node.id);
      }
    } else {
      processedUrls.add(normalized);
      duplicates.push({
        canonical: node,
        duplicates: [],
        normalizedUrl: normalized,
      });
    }
  });
  
  function removeEmptyFolders(node: BookmarkNode): boolean {
    if (!node.children) return node.type === 'bookmark';
    node.children = node.children.filter(child => {
      if (child.type === 'folder') {
        return removeEmptyFolders(child);
      }
      return true;
    });
    return node.children.length > 0 || node.type === 'bookmark';
  }
  
  root.children = root.children?.filter(child => {
    if (child.type === 'folder') {
      return removeEmptyFolders(child);
    }
    return true;
  });
  
  let uniqueCount = 0;
  function countBookmarks(node: BookmarkNode) {
    if (node.type === 'bookmark') uniqueCount++;
    node.children?.forEach(countBookmarks);
  }
  countBookmarks(root);
  
  return {
    root,
    duplicates,
    stats: {
      totalInputBookmarks: totalInput,
      uniqueBookmarks: uniqueCount,
      removedDuplicates: removedCount,
      mergedFolders: mergedFolderCount,
    },
    sourceFiles: files.map(f => f.filename),
  };
}