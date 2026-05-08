/**
 * Mock data helpers for generating test bookmark data
 * Provides utilities for creating realistic test scenarios
 */
import { BookmarkNode } from '@/types/bookmark';

/**
 * Create a mock bookmark node
 */
export function createMockBookmark(
  overrides?: Partial<BookmarkNode>
): BookmarkNode {
  return {
    id: `bookmark-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Bookmark',
    url: 'https://example.com',
    dateAdded: Date.now(),
    type: 'bookmark',
    ...overrides,
  };
}

/**
 * Create a mock folder node
 */
export function createMockFolder(
  overrides?: Partial<BookmarkNode>
): BookmarkNode {
  return {
    id: `folder-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Folder',
    type: 'folder',
    dateAdded: Date.now(),
    children: [],
    ...overrides,
  };
}

/**
 * Create a bookmark tree with specified structure
 */
export function createMockBookmarkTree(options: {
  bookmarkCount?: number;
  folderCount?: number;
  depth?: number;
}): BookmarkNode {
  const { bookmarkCount = 5, folderCount = 2, depth = 1 } = options;
  
  const root = createMockFolder({ title: 'Root', id: 'root' });
  root.children = [];
  
  // Add folders
  for (let i = 0; i < folderCount; i++) {
    const folder = createMockFolder({ title: `Folder ${i + 1}` });
    folder.children = [];
    
    // Add bookmarks to folder
    const bookmarksPerFolder = Math.ceil(bookmarkCount / folderCount);
    for (let j = 0; j < bookmarksPerFolder; j++) {
      folder.children.push(
        createMockBookmark({
          title: `Bookmark ${i}-${j}`,
          url: `https://example${i}.com/page${j}`,
        })
      );
    }
    
    root.children.push(folder);
  }
  
  return root;
}

/**
 * Create bookmarks with duplicate URLs
 */
export function createMockDuplicates(count: number): BookmarkNode[] {
  const url = 'https://duplicate.com';
  return Array.from({ length: count }, (_, i) =>
    createMockBookmark({
      title: `Duplicate ${i + 1}`,
      url,
    })
  );
}

/**
 * Create bookmarks with similar titles
 */
export function createMockSimilarBookmarks(count: number): BookmarkNode[] {
  const baseTitle = 'JavaScript Tutorial';
  return Array.from({ length: count }, (_, i) =>
    createMockBookmark({
      title: `${baseTitle} - Part ${i + 1}`,
      url: `https://example.com/tutorial${i}`,
    })
  );
}

/**
 * Create Chrome JSON format bookmark file content
 */
export function createMockChromeJSON(tree: BookmarkNode): string {
  return JSON.stringify({
    checksum: 'mock-checksum',
    roots: {
      bookmark_bar: tree,
      other: { id: 'other', title: 'Other Bookmarks', type: 'folder', children: [] },
      synced: { id: 'synced', title: 'Mobile Bookmarks', type: 'folder', children: [] },
    },
    version: 1,
  }, null, 2);
}

/**
 * Create Netscape HTML format bookmark file content
 */
export function createMockNetscapeHTML(tree: BookmarkNode): string {
  function nodeToHTML(node: BookmarkNode, indent = 0): string {
    const spaces = '    '.repeat(indent);
    
    if (node.type === 'folder') {
      const children = node.children || [];
      const childrenHTML = children.map(child => nodeToHTML(child, indent + 1)).join('\n');
      return `${spaces}<DT><H3>${node.title}</H3>\n${spaces}<DL><p>\n${childrenHTML}\n${spaces}</DL><p>`;
    } else {
      return `${spaces}<DT><A HREF="${node.url}" ADD_DATE="${Math.floor((node.dateAdded || 0) / 1000)}">${node.title}</A>`;
    }
  }
  
  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${nodeToHTML(tree, 1)}
</DL><p>`;
}

/**
 * Create a large bookmark tree for performance testing
 */
export function createLargeBookmarkTree(size: number): BookmarkNode {
  const root = createMockFolder({ title: 'Root', id: 'root' });
  root.children = [];
  
  const foldersCount = Math.ceil(size / 50);
  const bookmarksPerFolder = Math.ceil(size / foldersCount);
  
  for (let i = 0; i < foldersCount; i++) {
    const folder = createMockFolder({ title: `Folder ${i + 1}` });
    folder.children = [];
    
    for (let j = 0; j < bookmarksPerFolder && (i * bookmarksPerFolder + j) < size; j++) {
      folder.children.push(
        createMockBookmark({
          title: `Bookmark ${i * bookmarksPerFolder + j + 1}`,
          url: `https://example.com/page${i * bookmarksPerFolder + j}`,
        })
      );
    }
    
    root.children.push(folder);
  }
  
  return root;
}
