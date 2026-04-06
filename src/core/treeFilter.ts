import type { BookmarkNode } from '../types/bookmark';

export function filterBookmarkTree(node: BookmarkNode, query: string): BookmarkNode | null {
  const q = query.trim().toLowerCase();
  if (!q) return node;

  if (node.type === 'bookmark') {
    const hay = `${node.title}\n${node.url ?? ''}`.toLowerCase();
    return hay.includes(q) ? node : null;
  }

  if (node.type === 'folder' || node.type === 'root') {
    const filteredChildren =
      node.children
        ?.map((c) => filterBookmarkTree(c, query))
        .filter((c): c is BookmarkNode => c !== null) ?? [];
    if (filteredChildren.length === 0) return null;
    return {
      ...node,
      children: filteredChildren,
    };
  }

  return null;
}
