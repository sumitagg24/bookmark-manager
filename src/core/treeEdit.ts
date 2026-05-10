import type { BookmarkNode } from '../types/bookmark';

export function generateMergeNodeId(): string {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function findNodeById(root: BookmarkNode, id: string): BookmarkNode | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

export function findParentSlot(
  root: BookmarkNode,
  id: string
): { parent: BookmarkNode; index: number } | null {
  if (!root.children) return null;
  for (let i = 0; i < root.children.length; i++) {
    const child = root.children[i];
    if (child.id === id) return { parent: root, index: i };
    if (child.type === 'folder') {
      const nested = findParentSlot(child, id);
      if (nested) return nested;
    }
  }
  return null;
}

export function countBookmarksInTree(root: BookmarkNode): number {
  let n = 0;
  function walk(node: BookmarkNode) {
    if (node.type === 'bookmark') n++;
    node.children?.forEach(walk);
  }
  walk(root);
  return n;
}

export function moveNode(root: BookmarkNode, nodeId: string, newParentId: string): boolean {
  const nodeToMove = findNodeById(root, nodeId);
  if (!nodeToMove || nodeId === newParentId) return false;

  // Cannot move root or into itself or its own descendants
  if (nodeToMove.type === 'root') return false;
  
  const newParent = findNodeById(root, newParentId);
  if (!newParent || newParent.type !== 'folder') return false;

  // Check if nodeToMove is an ancestor of newParent (would create cycle)
  let current: BookmarkNode | null = newParent;
  while (current) {
    if (current.id === nodeId) return false;
    const parentSlot = findParentSlot(root, current.id);
    current = parentSlot?.parent || null;
  }

  // Remove from old parent
  const oldParentSlot = findParentSlot(root, nodeId);
  if (!oldParentSlot) return false;

  const { parent: oldParent, index: oldIndex } = oldParentSlot;
  oldParent.children?.splice(oldIndex, 1);
  
  // Ensure children array exists on new parent
  if (!newParent.children) newParent.children = [];
  
  // Add to new parent at the end
  newParent.children.push(nodeToMove);
  
  return true;
}
