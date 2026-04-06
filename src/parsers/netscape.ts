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
  const header = dtElement.querySelector('h3');
  const link = dtElement.querySelector('a');
  
  if (header) {
    // It's a folder
    const folderName = header.textContent || 'Untitled Folder';
    const node: BookmarkNode = {
      id: generateId(),
      type: 'folder',
      title: folderName,
      addDate: parseDate(header.getAttribute('add_date')),
      lastModified: parseDate(header.getAttribute('last_modified')),
      sourceFile,
      originalFolder: parentFolder,
      children: [],
    };
    
    // Find the associated DL (contents)
    let nextEl = dtElement.nextElementSibling;
    if (nextEl && nextEl.tagName === 'DL') {
      const children = Array.from(nextEl.children);
      children.forEach(child => {
        if (child.tagName === 'DT') {
          const childNode = parseNode(child, sourceFile, `${parentFolder}/${folderName}`);
          if (childNode) node.children!.push(childNode);
        }
      });
    }
    
    return node;
  } else if (link) {
    // It's a bookmark
    return {
      id: generateId(),
      type: 'bookmark',
      title: link.textContent || 'Untitled',
      url: link.getAttribute('href') || '',
      addDate: parseDate(link.getAttribute('add_date')),
      icon: link.getAttribute('icon') || undefined,
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
  
  // Find the root DL
  const rootDL = doc.querySelector('dl');
  if (rootDL) {
    const children = Array.from(rootDL.children);
    children.forEach(child => {
      if (child.tagName === 'DT') {
        const node = parseNode(child, filename, 'Root');
        if (node) root.children!.push(node);
      }
    });
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