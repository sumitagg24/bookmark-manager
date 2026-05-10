import type { BookmarkNode, SimilarBookmarkGroup } from '../types/bookmark';

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeTitle(str1);
  const s2 = normalizeTitle(str2);
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1: string, s2: string): number {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export function detectSimilarBookmarks(bookmarks: BookmarkNode[]): SimilarBookmarkGroup[] {
  const groups: SimilarBookmarkGroup[] = [];
  const processed = new Set<string>();
  
  for (let i = 0; i < bookmarks.length; i++) {
    const bookmark1 = bookmarks[i];
    if (processed.has(bookmark1.id) || !bookmark1.url) continue;
    
    const domain1 = extractDomain(bookmark1.url);
    if (!domain1) continue;
    
    const similar: BookmarkNode[] = [];
    
    for (let j = i + 1; j < bookmarks.length; j++) {
      const bookmark2 = bookmarks[j];
      if (processed.has(bookmark2.id) || !bookmark2.url) continue;
      
      const domain2 = extractDomain(bookmark2.url);
      if (!domain2) continue;
      
      // Check if domains are the same or very similar
      const domainSimilarity = calculateStringSimilarity(domain1, domain2);
      const titleSimilarity = calculateStringSimilarity(bookmark1.title, bookmark2.title);
      
      // If domains match and titles are similar (>60%), they're likely the same
      if (domainSimilarity > 0.85 && titleSimilarity > 0.6) {
        // But URLs are different
        if (bookmark1.url !== bookmark2.url) {
          similar.push(bookmark2);
          processed.add(bookmark2.id);
        }
      }
    }
    
    if (similar.length > 0) {
      processed.add(bookmark1.id);
      groups.push({
        canonical: bookmark1,
        similar,
        reason: `Same domain (${domain1}) with similar titles`,
      });
    }
  }
  
  return groups;
}

export function collectAllBookmarks(node: BookmarkNode): BookmarkNode[] {
  const bookmarks: BookmarkNode[] = [];
  
  function traverse(n: BookmarkNode) {
    if (n.type === 'bookmark') {
      bookmarks.push(n);
    }
    n.children?.forEach(traverse);
  }
  
  traverse(node);
  return bookmarks;
}
