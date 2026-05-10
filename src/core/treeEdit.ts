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

export function moveNodeBefore(root: BookmarkNode, nodeId: string, targetId: string): boolean {
  const nodeToMove = findNodeById(root, nodeId);
  const target = findNodeById(root, targetId);
  if (!nodeToMove || !target || nodeToMove.type === 'root' || nodeId === targetId) return false;

  // Prevent moving into own descendant
  let current: BookmarkNode | null = target;
  while (current) {
    if (current.id === nodeId) return false;
    const parentSlot = findParentSlot(root, current.id);
    current = parentSlot?.parent || null;
  }

  const oldSlot = findParentSlot(root, nodeId);
  const targetSlot = findParentSlot(root, targetId);
  if (!oldSlot || !targetSlot) return false;

  // Remove from old parent
  oldSlot.parent.children?.splice(oldSlot.index, 1);

  // Find target again (indices may have shifted after removal)
  const newTargetSlot = findParentSlot(root, targetId);
  if (!newTargetSlot) return false;

  const insertIndex = newTargetSlot.index;
  if (!newTargetSlot.parent.children) newTargetSlot.parent.children = [];
  newTargetSlot.parent.children.splice(insertIndex, 0, nodeToMove);
  return true;
}

export function moveNodeAfter(root: BookmarkNode, nodeId: string, targetId: string): boolean {
  const nodeToMove = findNodeById(root, nodeId);
  const target = findNodeById(root, targetId);
  if (!nodeToMove || !target || nodeToMove.type === 'root' || nodeId === targetId) return false;

  // Prevent moving into own descendant
  let current: BookmarkNode | null = target;
  while (current) {
    if (current.id === nodeId) return false;
    const parentSlot = findParentSlot(root, current.id);
    current = parentSlot?.parent || null;
  }

  const oldSlot = findParentSlot(root, nodeId);
  const targetSlot = findParentSlot(root, targetId);
  if (!oldSlot || !targetSlot) return false;

  // Remove from old parent
  oldSlot.parent.children?.splice(oldSlot.index, 1);

  // Find target again (indices may have shifted)
  const newTargetSlot = findParentSlot(root, targetId);
  if (!newTargetSlot) return false;

  const insertIndex = newTargetSlot.index + 1;
  if (!newTargetSlot.parent.children) newTargetSlot.parent.children = [];
  newTargetSlot.parent.children.splice(insertIndex, 0, nodeToMove);
  return true;
}

export function removeBySourceFile(
  root: BookmarkNode, 
  sourceFile: string, 
  parentId?: string
): number {
  let removedCount = 0;
  const targetNode = parentId ? findNodeById(root, parentId) ?? root : root;
  
  function removeRecursive(node: BookmarkNode): BookmarkNode | null {
    if (!node.children) return node.type === 'bookmark' ? null : node;
    
    const filteredChildren = node.children
      .map(child => {
        if (child.sourceFile === sourceFile) {
          removedCount++;
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
  
  // Apply removal starting from target node
  if (targetNode.type === 'root' || targetNode.type === 'folder') {
    targetNode.children = targetNode.children
      ?.map(child => {
        if (child.sourceFile === sourceFile) {
          removedCount++;
          return null;
        }
        if (child.type === 'folder') {
          return removeRecursive(child);
        }
        return child;
      })
      .filter((c): c is BookmarkNode => c !== null) || [];
  }
  
  return removedCount;
}
