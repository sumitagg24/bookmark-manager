import type { BookmarkNode } from '../types/bookmark';

// Advanced Search
export interface SearchOperator {
  type: 'domain' | 'folder' | 'source' | 'text';
  value: string;
}

export function parseSearchQuery(query: string): SearchOperator[] {
  const operators: SearchOperator[] = [];
  const regex = /(\w+):(["\']?)([^"\']*)\2/g;
  let match;

  while ((match = regex.exec(query)) !== null) {
    const [, type, , value] = match;
    if (['domain', 'folder', 'source'].includes(type)) {
      operators.push({ type: type as any, value });
    }
  }

  const remaining = query.replace(regex, '').trim();
  if (remaining) {
    operators.push({ type: 'text', value: remaining });
  }

  return operators;
}

export function matchesSearchOperators(node: BookmarkNode, operators: SearchOperator[]): boolean {
  for (const op of operators) {
    switch (op.type) {
      case 'domain':
        if (node.type === 'bookmark' && node.url) {
          try {
            const url = new URL(node.url);
            if (!url.hostname.includes(op.value)) return false;
          } catch {
            return false;
          }
        } else {
          return false;
        }
        break;
      case 'folder':
        if (node.type !== 'folder' || !node.title.toLowerCase().includes(op.value.toLowerCase())) {
          return false;
        }
        break;
      case 'source':
        if (!node.sourceFile.toLowerCase().includes(op.value.toLowerCase())) {
          return false;
        }
        break;
      case 'text':
        const searchText = op.value.toLowerCase();
        const titleMatch = node.title.toLowerCase().includes(searchText);
        const urlMatch = node.url?.toLowerCase().includes(searchText) ?? false;
        const notesMatch = node.notes?.toLowerCase().includes(searchText) ?? false;
        if (!titleMatch && !urlMatch && !notesMatch) return false;
        break;
    }
  }
  return true;
}

// Link Health Check
export async function checkUrlHealth(url: string, timeout = 5000): Promise<{
  status: 'ok' | 'broken' | 'timeout';
  statusCode?: number;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok || response.status === 200) {
      return { status: 'ok', statusCode: response.status };
    } else if (response.status === 404 || response.status >= 400) {
      return { status: 'broken', statusCode: response.status };
    }
    return { status: 'ok', statusCode: response.status };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { status: 'timeout' };
    }
    return { status: 'broken' };
  }
}

// Auto-Organization
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function sortBookmarksByDomain(nodes: BookmarkNode[]): BookmarkNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type === 'folder' && b.type === 'folder') {
      return a.title.localeCompare(b.title);
    }
    if (a.type === 'folder') return -1;
    if (b.type === 'folder') return 1;

    const domainA = extractDomain(a.url || '');
    const domainB = extractDomain(b.url || '');
    return domainA.localeCompare(domainB);
  });
}

export function sortBookmarksByDate(nodes: BookmarkNode[]): BookmarkNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type === 'folder' && b.type === 'folder') {
      return a.title.localeCompare(b.title);
    }
    if (a.type === 'folder') return -1;
    if (b.type === 'folder') return 1;

    // Sort by date descending (newest first), then by title for items without dates
    const dateA = a.addDate || 0;
    const dateB = b.addDate || 0;
    
    if (dateA === 0 && dateB === 0) {
      return a.title.localeCompare(b.title);
    }
    if (dateA === 0) return 1;
    if (dateB === 0) return -1;
    
    return dateB - dateA;
  });
}

export function sortBookmarksByAlphabetical(nodes: BookmarkNode[]): BookmarkNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type === 'folder' && b.type === 'folder') {
      return a.title.localeCompare(b.title);
    }
    if (a.type === 'folder') return -1;
    if (b.type === 'folder') return 1;
    return a.title.localeCompare(b.title);
  });
}

// Orphaned Bookmarks Report
export function findOrphanedBookmarks(root: BookmarkNode): BookmarkNode[] {
  const orphaned: BookmarkNode[] = [];
  if (root.children) {
    for (const child of root.children) {
      if (child.type === 'bookmark') {
        orphaned.push(child);
      }
    }
  }
  return orphaned;
}

export function suggestFolderForBookmark(
  bookmarkNode: BookmarkNode,
  root: BookmarkNode
): string | null {
  if (bookmarkNode.type !== 'bookmark' || !bookmarkNode.url) return null;

  const domain = extractDomain(bookmarkNode.url);
  if (!domain) return null;

  let bestFolderId: string | null = null;
  let bestScore = 0;

  function walkFolders(node: BookmarkNode) {
    if (node.type === 'folder') {
      let matchCount = 0;
      if (node.children) {
        for (const child of node.children) {
          if (child.type === 'bookmark' && child.url) {
            const childDomain = extractDomain(child.url);
            if (childDomain === domain) {
              matchCount++;
            }
          }
        }
      }

      if (matchCount > bestScore) {
        bestScore = matchCount;
        bestFolderId = node.id;
      }
    }

    if (node.children) {
      for (const child of node.children) {
        walkFolders(child);
      }
    }
  }

  walkFolders(root);
  return bestFolderId;
}
