import type { BookmarkNode, ParsedFile } from '../types/bookmark';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function parseDate(dateStr: string | null): number | undefined {
  if (!dateStr) return undefined;
  const timestamp = parseInt(dateStr, 10);
  return isNaN(timestamp) ? undefined : timestamp;
}

function parseNode(dtElement: Element, sourceFile: string, parentFolder: string): BookmarkNode | null {
  // Look for H3 or A as direct children
  let h3: Element | null = null;
  let a: Element | null = null;
  
  for (let i = 0; i < dtElement.children.length; i++) {
    const child = dtElement.children[i];
    if (child.tagName === 'H3') {
      h3 = child;
      break;
    } else if (child.tagName === 'A') {
      a = child;
      break;
    }
  }
  
  if (h3) {
    // It's a folder
    const folderName = h3.textContent || 'Untitled Folder';
    const node: BookmarkNode = {
      id: generateId(),
      type: 'folder',
      title: folderName,
      addDate: parseDate(h3.getAttribute('add_date')),
      lastModified: parseDate(h3.getAttribute('last_modified')),
      sourceFile,
      originalFolder: parentFolder,
      children: [],
    };
    
    // Find the associated DL - it should be the next DL sibling
    let sibling = dtElement.nextElementSibling;
    while (sibling) {
      if (sibling.tagName === 'DL') {
        // Found the DL for this folder
        for (let i = 0; i < sibling.children.length; i++) {
          const child = sibling.children[i];
          if (child.tagName === 'DT') {
            const childNode = parseNode(child, sourceFile, `${parentFolder}/${folderName}`);
            if (childNode) node.children!.push(childNode);
          }
        }
        break;
      }
      sibling = sibling.nextElementSibling;
    }
    
    return node;
  } else if (a) {
    // It's a bookmark
    return {
      id: generateId(),
      type: 'bookmark',
      title: a.textContent || 'Untitled',
      url: a.getAttribute('href') || '',
      addDate: parseDate(a.getAttribute('add_date')),
      icon: a.getAttribute('icon') || undefined,
      sourceFile,
      originalFolder: parentFolder,
    };
  }
  
  return null;
}

export function parseNetscapeHTML(content: string, filename: string): ParsedFile {
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  const root: BookmarkNode = {
    id: generateId(),
    type: 'root',
    title: 'Root',
    sourceFile: filename,
    children: [],
  };
  
  // Find all DL elements and process the first one (root)
  const allDLs = doc.querySelectorAll('dl');
  if (allDLs.length > 0) {
    const rootDL = allDLs[0];
    for (let i = 0; i < rootDL.children.length; i++) {
      const child = rootDL.children[i];
      if (child.tagName === 'DT') {
        const node = parseNode(child, filename, 'Root');
        if (node) root.children!.push(node);
      }
    }
  }
  
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
    format: 'netscape',
    root,
    stats: {
      totalBookmarks,
      totalFolders,
      maxDepth,
    },
  };
}