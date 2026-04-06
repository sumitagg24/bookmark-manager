import type { BookmarkNode, ParsedFile } from '../types/bookmark';


function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function convertChromeNode(node: any, sourceFile: string, parentFolder: string): BookmarkNode | null {
  if (node.type === 'folder') {
    const folderNode: BookmarkNode = {
      id: generateId(),
      type: 'folder',
      title: node.name || 'Untitled Folder',
      addDate: node.date_added ? parseInt(node.date_added) : undefined,
      lastModified: node.date_modified ? parseInt(node.date_modified) : undefined,
      sourceFile,
      originalFolder: parentFolder,
      children: [],
    };
    
    if (node.children) {
      node.children.forEach((child: any) => {
        const converted = convertChromeNode(child, sourceFile, `${parentFolder}/${folderNode.title}`);
        if (converted) folderNode.children!.push(converted);
      });
    }
    
    return folderNode;
  } else if (node.type === 'url' || node.url) {
    return {
      id: generateId(),
      type: 'bookmark',
      title: node.name || 'Untitled',
      url: node.url,
      addDate: node.date_added ? parseInt(node.date_added) : undefined,
      sourceFile,
      originalFolder: parentFolder,
    };
  }
  
  return null;
}

export function parseChromeJSON(content: string, filename: string): ParsedFile {
  const data = JSON.parse(content);
  const root: BookmarkNode = {
    id: generateId(),
    type: 'root',
    title: 'Root',
    sourceFile: filename,
    children: [],
  };
  
  // Chrome has roots: bookmark_bar, other, synced
  const roots = data.roots || {};
  ['bookmark_bar', 'other', 'synced'].forEach(key => {
    if (roots[key]) {
      const node = convertChromeNode(roots[key], filename, 'Root');
      if (node) root.children!.push(node);
    }
  });
  
  // Calculate stats
  let totalBookmarks = 0;
  let totalFolders = 0;
  let maxDepth = 0;
  
  function traverse(node: BookmarkNode, depth: number) {
    if (node.type === 'bookmark') totalBookmarks++;
    if (node.type === 'folder') totalFolders++;
    maxDepth = Math.max(maxDepth, depth);
    node.children?.forEach(child => traverse(child, depth + 1));
  }
  
  root.children?.forEach(child => traverse(child, 1));
  
  return {
    id: generateId(),
    filename,
    format: 'chrome-json',
    root,
    stats: {
      totalBookmarks,
      totalFolders,
      maxDepth,
    },
  };
}

export function detectFormat(content: string): 'netscape' | 'chrome-json' | 'unknown' {
  const trimmed = content.trim();
  if (trimmed.startsWith('<!DOCTYPE NETSCAPE-Bookmark-file-1>') || 
      trimmed.includes('<DL><p>') || 
      trimmed.includes('<TITLE>Bookmarks</TITLE>')) {
    return 'netscape';
  }
  try {
    const json = JSON.parse(trimmed);
    if (json.roots || json.bookmark_bar || json.bookmarks) {
      return 'chrome-json';
    }
  } catch (e) {
    // Not JSON
  }
  return 'unknown';
}