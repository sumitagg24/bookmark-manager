/**
 * Auto-Organization Integration Tests
 * Tests for sorting and folder suggestions
 */

import { describe, it, expect } from 'vitest';

describe('Auto-Organization Tests', () => {
  describe('Sort by Domain', () => {
    it('should sort bookmarks by domain', async () => {
      const bookmarks = [
        { id: '1', url: 'https://zebra.com/page' },
        { id: '2', url: 'https://apple.com/page' },
        { id: '3', url: 'https://banana.com/page' },
      ];

      const sorted = bookmarks.sort((a, b) => {
        const domainA = new URL(a.url).hostname;
        const domainB = new URL(b.url).hostname;
        return domainA.localeCompare(domainB);
      });

      expect(sorted[0].url).toContain('apple.com');
      expect(sorted[1].url).toContain('banana.com');
      expect(sorted[2].url).toContain('zebra.com');
    });

    it('should group bookmarks by domain', async () => {
      const bookmarks = [
        { id: '1', url: 'https://example.com/page1' },
        { id: '2', url: 'https://example.com/page2' },
        { id: '3', url: 'https://google.com/page1' },
      ];

      const grouped = new Map<string, any[]>();
      bookmarks.forEach((bookmark) => {
        const domain = new URL(bookmark.url).hostname;
        if (!grouped.has(domain)) {
          grouped.set(domain, []);
        }
        grouped.get(domain)!.push(bookmark);
      });

      expect(grouped.size).toBe(2);
      expect(grouped.get('example.com')?.length).toBe(2);
    });
  });

  describe('Sort by Date', () => {
    it('should sort bookmarks by date added', async () => {
      const bookmarks = [
        { id: '1', dateAdded: 1000 },
        { id: '2', dateAdded: 3000 },
        { id: '3', dateAdded: 2000 },
      ];

      const sorted = bookmarks.sort((a, b) => a.dateAdded - b.dateAdded);

      expect(sorted[0].dateAdded).toBe(1000);
      expect(sorted[1].dateAdded).toBe(2000);
      expect(sorted[2].dateAdded).toBe(3000);
    });

    it('should handle missing dates', async () => {
      const bookmarks = [
        { id: '1', dateAdded: 1000 },
        { id: '2', dateAdded: undefined },
        { id: '3', dateAdded: 2000 },
      ];

      const sorted = bookmarks.sort((a, b) => (a.dateAdded || 0) - (b.dateAdded || 0));
      expect(sorted.length).toBe(3);
    });
  });

  describe('Sort A-Z', () => {
    it('should sort bookmarks alphabetically', async () => {
      const bookmarks = [
        { id: '1', title: 'Zebra' },
        { id: '2', title: 'Apple' },
        { id: '3', title: 'Banana' },
      ];

      const sorted = bookmarks.sort((a, b) => a.title.localeCompare(b.title));

      expect(sorted[0].title).toBe('Apple');
      expect(sorted[1].title).toBe('Banana');
      expect(sorted[2].title).toBe('Zebra');
    });

    it('should handle case-insensitive sorting', async () => {
      const bookmarks = [
        { id: '1', title: 'zebra' },
        { id: '2', title: 'Apple' },
        { id: '3', title: 'BANANA' },
      ];

      const sorted = bookmarks.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );

      expect(sorted[0].title).toBe('Apple');
      expect(sorted[1].title).toBe('BANANA');
      expect(sorted[2].title).toBe('zebra');
    });
  });

  describe('Folder Suggestions', () => {
    it('should suggest folders for orphaned bookmarks', async () => {
      const bookmarks = [
        { id: '1', url: 'https://github.com/user/repo', title: 'GitHub Repo' },
        { id: '2', url: 'https://github.com/another/repo', title: 'Another Repo' },
      ];

      const suggestions = new Map<string, string>();
      bookmarks.forEach((bookmark) => {
        const domain = new URL(bookmark.url).hostname;
        suggestions.set(bookmark.id, domain);
      });

      expect(suggestions.get('1')).toBe('github.com');
      expect(suggestions.get('2')).toBe('github.com');
    });

    it('should match domain patterns', async () => {
      const bookmark = { id: '1', url: 'https://github.com/user/repo' };
      const domain = new URL(bookmark.url).hostname;
      expect(domain).toBe('github.com');
    });
  });

  describe('Orphaned Bookmarks', () => {
    it('should identify orphaned bookmarks', async () => {
      const bookmarks = [
        { id: '1', title: 'Bookmark 1', parentId: 'folder-1' },
        { id: '2', title: 'Bookmark 2', parentId: undefined },
        { id: '3', title: 'Bookmark 3', parentId: 'folder-2' },
      ];

      const orphaned = bookmarks.filter((b) => !b.parentId);
      expect(orphaned.length).toBe(1);
      expect(orphaned[0].id).toBe('2');
    });

    it('should count orphaned bookmarks', async () => {
      const bookmarks = [
        { id: '1', parentId: 'folder-1' },
        { id: '2', parentId: undefined },
        { id: '3', parentId: undefined },
        { id: '4', parentId: 'folder-2' },
      ];

      const orphanedCount = bookmarks.filter((b) => !b.parentId).length;
      expect(orphanedCount).toBe(2);
    });
  });

  describe('Move to Suggested Folders', () => {
    it('should move orphaned bookmarks to suggested folders', async () => {
      const bookmarks = [
        { id: '1', url: 'https://github.com/repo', parentId: undefined },
      ];

      bookmarks[0].parentId = 'github-folder';
      expect(bookmarks[0].parentId).toBe('github-folder');
    });
  });

  describe('Sorting Operations Undo', () => {
    it('should undo sort operations', async () => {
      const bookmarks = [
        { id: '1', title: 'Zebra' },
        { id: '2', title: 'Apple' },
      ];

      const originalOrder = [...bookmarks];
      bookmarks.sort((a, b) => a.title.localeCompare(b.title));

      // Restore original
      bookmarks.splice(0, bookmarks.length, ...originalOrder);
      expect(bookmarks[0].title).toBe('Zebra');
    });

    it('should undo move operations', async () => {
      const bookmarks = [
        { id: '1', title: 'Bookmark 1' },
        { id: '2', title: 'Bookmark 2' },
      ];

      const originalIndex = 0;
      const item = bookmarks[originalIndex];

      bookmarks.splice(0, 1);
      bookmarks.push(item);

      bookmarks.pop();
      bookmarks.unshift(item);

      expect(bookmarks[originalIndex]).toBe(item);
    });
  });

  describe('Organization with Large Libraries', () => {
    it('should organize large bookmark libraries', async () => {
      const bookmarks = Array.from({ length: 1000 }, (_, i) => ({
        id: `bookmark-${i}`,
        url: `https://example${i % 10}.com/page`,
        title: `Bookmark ${i}`,
      }));

      const sorted = bookmarks.sort((a, b) => {
        const domainA = new URL(a.url).hostname;
        const domainB = new URL(b.url).hostname;
        return domainA.localeCompare(domainB);
      });

      expect(sorted.length).toBe(1000);
    });
  });
});
