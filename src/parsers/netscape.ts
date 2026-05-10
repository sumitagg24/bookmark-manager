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
      
      // Find the associated DL - it's a child of the DT element
      for (let i = 0; i < dtElement.children.length; i++) {
        const child = dtElement.children[i];
        if (child.tagName === 'DL') {
          // Found the DL for this folder
          for (let j = 0; j < child.children.length; j++) {
            const grandChild = child.children[j];
            if (grandChild.tagName === 'DT') {
              const childNode = parseNode(grandChild, sourceFile, `${parentFolder}/${folderName}`);
              if (childNode) node.children!.push(childNode);
            }
          }
          break;
        }
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
     // Collect all DT elements that are direct children of rootDL 
     // or direct children of a <p> element that is a direct child of rootDL
     const dtElements = [];
     for (let i = 0; i < rootDL.children.length; i++) {
       const child = rootDL.children[i];
       if (child.tagName.toUpperCase() === 'DT') {
         dtElements.push(child);
       } else if (child.tagName.toUpperCase() === 'P') {
         // If it's a <p> element, check its children for DT elements
         for (let j = 0; j < child.children.length; j++) {
           const grandChild = child.children[j];
           if (grandChild.tagName.toUpperCase() === 'DT') {
             dtElements.push(grandChild);
           }
         }
       }
     }
     
     for (const dtElement of dtElements) {
       const node = parseNode(dtElement, filename, 'Root');
       if (node) root.children!.push(node);
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