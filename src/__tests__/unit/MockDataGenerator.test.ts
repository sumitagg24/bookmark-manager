/**
 * Unit tests for MockDataGenerator
 * 
 * Tests that the mock data generator creates valid bookmark files
 * and supports all required scenarios.
 * 
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MockDataGenerator } from '../utils/MockDataGenerator';
import { BookmarkNode } from '@/types/bookmark';

describe('MockDataGenerator', () => {
  let generator: MockDataGenerator;

  beforeEach(() => {
    generator = new MockDataGenerator(12345); // Fixed seed for reproducibility
  });

  describe('generateChromeJSON', () => {
    it('should generate valid Chrome JSON format', () => {
      // Requirement: 19.1
      const json = generator.generateChromeJSON({
        bookmarkCount: 10,
        folderCount: 2,
        maxDepth: 2,
      });

      expect(json).toBeTruthy();
      
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('checksum');
      expect(parsed).toHaveProperty('roots');
      expect(parsed).toHaveProperty('version');
      expect(parsed.roots).toHaveProperty('bookmark_bar');
      expect(parsed.roots).toHaveProperty('other');
      expect(parsed.roots).toHaveProperty('synced');
    });

    it('should create bookmarks with correct structure', () => {
      // Requirement: 19.1
      const json = generator.generateChromeJSON({
        bookmarkCount: 5,
        folderCount: 1,
        maxDepth: 1,
      });

      const parsed = JSON.parse(json);
      const bookmarkBar = parsed.roots.bookmark_bar;
      
      expect(bookmarkBar.type).toBe('folder');
      expect(bookmarkBar.children).toBeInstanceOf(Array);
      expect(bookmarkBar.children.length).toBeGreaterThan(0);
    });

    it('should generate specified number of bookmarks', () => {
      // Requirement: 19.3
      const json = generator.generateChromeJSON({
        bookmarkCount: 20,
        folderCount: 2,
        maxDepth: 1,
      });

      const parsed = JSON.parse(json);
      const bookmarkBar = parsed.roots.bookmark_bar;
      
      // Count all bookmarks in the tree
      const countBookmarks = (node: BookmarkNode): number => {
        if (node.type === 'bookmark') return 1;
        if (node.type === 'folder' && node.children) {
          return node.children.reduce((sum, child) => sum + countBookmarks(child), 0);
        }
        return 0;
      };

      const totalBookmarks = countBookmarks(bookmarkBar);
      expect(totalBookmarks).toBe(20);
    });
  });

  describe('generateNetscapeHTML', () => {
    it('should generate valid Netscape HTML format', () => {
      // Requirement: 19.2
      const html = generator.generateNetscapeHTML({
        bookmarkCount: 10,
        folderCount: 2,
        maxDepth: 2,
      });

      expect(html).toBeTruthy();
      expect(html).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
      expect(html).toContain('<TITLE>Bookmarks</TITLE>');
      expect(html).toContain('<H1>Bookmarks</H1>');
      expect(html).toContain('<DL><p>');
      expect(html).toContain('</DL><p>');
    });

    it('should include bookmark elements with URLs', () => {
      // Requirement: 19.2
      const html = generator.generateNetscapeHTML({
        bookmarkCount: 5,
        folderCount: 1,
        maxDepth: 1,
      });

      expect(html).toContain('<DT><A HREF=');
      expect(html).toContain('ADD_DATE=');
      
      // Should have at least one URL
      const urlMatches = html.match(/HREF="https?:\/\//g);
      expect(urlMatches).toBeTruthy();
      expect(urlMatches!.length).toBeGreaterThan(0);
    });

    it('should include folder elements', () => {
      // Requirement: 19.2
      const html = generator.generateNetscapeHTML({
        bookmarkCount: 10,
        folderCount: 3,
        maxDepth: 2,
      });

      expect(html).toContain('<DT><H3');
      expect(html).toContain('</H3>');
    });
  });

  describe('generateWithDuplicates', () => {
    it('should create bookmarks with duplicate URLs', () => {
      // Requirement: 19.4
      const tree = generator.generateWithDuplicates(30);

      const urls: string[] = [];
      const collectUrls = (node: BookmarkNode) => {
        if (node.type === 'bookmark' && node.url) {
          urls.push(node.url);
        }
        if (node.children) {
          node.children.forEach(collectUrls);
        }
      };

      collectUrls(tree);

      // Check for duplicates
      const uniqueUrls = new Set(urls);
      expect(urls.length).toBeGreaterThan(uniqueUrls.size);
      
      // Should have at least some duplicates (30% of 30 = ~9)
      const duplicateCount = urls.length - uniqueUrls.size;
      expect(duplicateCount).toBeGreaterThan(0);
    });
  });

  describe('generateWithSimilar', () => {
    it('should create bookmarks with similar titles', () => {
      // Requirement: 19.5
      const tree = generator.generateWithSimilar(15);

      const titles: string[] = [];
      const collectTitles = (node: BookmarkNode) => {
        if (node.type === 'bookmark') {
          titles.push(node.title);
        }
        if (node.children) {
          node.children.forEach(collectTitles);
        }
      };

      collectTitles(tree);

      expect(titles.length).toBeGreaterThan(0);
      
      // Check that some titles share common base text
      // Similar bookmarks should have titles like "Company - Home", "Company - About"
      const baseTitles = titles.map(t => t.split(' - ')[0]);
      const uniqueBaseTitles = new Set(baseTitles);
      
      // Should have fewer unique base titles than total titles (indicating similarity)
      expect(uniqueBaseTitles.size).toBeLessThan(titles.length);
    });

    it('should create bookmarks with similar domains', () => {
      // Requirement: 19.5
      const tree = generator.generateWithSimilar(12);

      const domains: string[] = [];
      const collectDomains = (node: BookmarkNode) => {
        if (node.type === 'bookmark' && node.url) {
          try {
            const url = new URL(node.url);
            domains.push(url.hostname);
          } catch {
            // Skip invalid URLs
          }
        }
        if (node.children) {
          node.children.forEach(collectDomains);
        }
      };

      collectDomains(tree);

      const uniqueDomains = new Set(domains);
      
      // Should have fewer unique domains than total bookmarks (indicating similarity)
      expect(uniqueDomains.size).toBeLessThan(domains.length);
    });
  });

  describe('generateWithBrokenLinks', () => {
    it('should create bookmarks with broken link URLs', () => {
      // Requirement: 19.6
      const tree = generator.generateWithBrokenLinks(40);

      const urls: string[] = [];
      const collectUrls = (node: BookmarkNode) => {
        if (node.type === 'bookmark' && node.url) {
          urls.push(node.url);
        }
        if (node.children) {
          node.children.forEach(collectUrls);
        }
      };

      collectUrls(tree);

      // Check for broken link patterns (should have .invalid domain or broken- prefix)
      const brokenLinks = urls.filter(
        url => url.includes('.invalid') || url.includes('broken-')
      );

      expect(brokenLinks.length).toBeGreaterThan(0);
      
      // Should have at least some broken links (25% of 40 = ~10, allow variance)
      expect(brokenLinks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generateDeepHierarchy', () => {
    it('should create nested folder structure with specified depth', () => {
      // Requirement: 19.7
      const depth = 5;
      const tree = generator.generateDeepHierarchy(depth);

      // Traverse to find maximum depth
      const findMaxDepth = (node: BookmarkNode, currentDepth: number): number => {
        if (!node.children || node.children.length === 0) {
          return currentDepth;
        }
        
        const childDepths = node.children.map(child => 
          findMaxDepth(child, currentDepth + 1)
        );
        
        return Math.max(...childDepths);
      };

      const maxDepth = findMaxDepth(tree, 0);
      expect(maxDepth).toBeGreaterThanOrEqual(depth);
    });

    it('should include bookmarks at each level', () => {
      // Requirement: 19.7
      const tree = generator.generateDeepHierarchy(3);

      // Check that each folder has some bookmarks
      const checkFoldersHaveBookmarks = (node: BookmarkNode): boolean => {
        if (node.type === 'folder' && node.children) {
          const hasBookmarks = node.children.some(child => child.type === 'bookmark');
          const childFoldersValid = node.children
            .filter(child => child.type === 'folder')
            .every(checkFoldersHaveBookmarks);
          
          return hasBookmarks && childFoldersValid;
        }
        return true;
      };

      expect(checkFoldersHaveBookmarks(tree)).toBe(true);
    });
  });

  describe('seed reproducibility', () => {
    it('should produce identical results with same seed', () => {
      // Requirement: 19.3
      const seed = 99999;
      const gen1 = new MockDataGenerator(seed);
      const gen2 = new MockDataGenerator(seed);

      const json1 = gen1.generateChromeJSON({
        bookmarkCount: 10,
        folderCount: 2,
        maxDepth: 2,
        seed, // Pass seed in options to ensure it's used
      });

      const json2 = gen2.generateChromeJSON({
        bookmarkCount: 10,
        folderCount: 2,
        maxDepth: 2,
        seed, // Pass seed in options to ensure it's used
      });

      // Parse and compare structures (timestamps may vary by milliseconds)
      const parsed1 = JSON.parse(json1);
      const parsed2 = JSON.parse(json2);

      // Compare checksums
      expect(parsed1.checksum).toBe(parsed2.checksum);
      
      // Compare bookmark bar structure
      const bar1 = parsed1.roots.bookmark_bar;
      const bar2 = parsed2.roots.bookmark_bar;
      
      expect(bar1.id).toBe(bar2.id);
      expect(bar1.title).toBe(bar2.title);
      expect(bar1.children.length).toBe(bar2.children.length);
      
      // Compare first folder
      const folder1 = bar1.children[0];
      const folder2 = bar2.children[0];
      
      expect(folder1.id).toBe(folder2.id);
      expect(folder1.title).toBe(folder2.title);
      expect(folder1.children.length).toBe(folder2.children.length);
      
      // Compare first bookmark
      const bookmark1 = folder1.children.find((c: any) => c.type === 'bookmark');
      const bookmark2 = folder2.children.find((c: any) => c.type === 'bookmark');
      
      expect(bookmark1.id).toBe(bookmark2.id);
      expect(bookmark1.title).toBe(bookmark2.title);
      expect(bookmark1.url).toBe(bookmark2.url);
    });

    it('should produce different results with different seeds', () => {
      // Requirement: 19.3
      const gen1 = new MockDataGenerator(11111);
      const gen2 = new MockDataGenerator(22222);

      const json1 = gen1.generateChromeJSON({
        bookmarkCount: 10,
        folderCount: 2,
        maxDepth: 2,
      });

      const json2 = gen2.generateChromeJSON({
        bookmarkCount: 10,
        folderCount: 2,
        maxDepth: 2,
      });

      expect(json1).not.toBe(json2);
    });
  });

  describe('generateFromTreeOptions', () => {
    it('should generate small tree', () => {
      // Requirement: 19.3
      const tree = generator.generateFromTreeOptions({
        size: 'small',
        structure: 'flat',
      });

      const countBookmarks = (node: BookmarkNode): number => {
        if (node.type === 'bookmark') return 1;
        if (node.children) {
          return node.children.reduce((sum, child) => sum + countBookmarks(child), 0);
        }
        return 0;
      };

      const total = countBookmarks(tree);
      expect(total).toBe(50);
    });

    it('should generate medium tree', () => {
      // Requirement: 19.3
      const tree = generator.generateFromTreeOptions({
        size: 'medium',
        structure: 'mixed',
      });

      const countBookmarks = (node: BookmarkNode): number => {
        if (node.type === 'bookmark') return 1;
        if (node.children) {
          return node.children.reduce((sum, child) => sum + countBookmarks(child), 0);
        }
        return 0;
      };

      const total = countBookmarks(tree);
      expect(total).toBe(200);
    });

    it('should respect structure option - flat', () => {
      // Requirement: 19.3
      const tree = generator.generateFromTreeOptions({
        size: 'small',
        structure: 'flat',
      });

      // Flat structure should have max depth of 1
      const findMaxDepth = (node: BookmarkNode, currentDepth: number): number => {
        if (!node.children || node.children.length === 0) {
          return currentDepth;
        }
        
        const childDepths = node.children.map(child => 
          findMaxDepth(child, currentDepth + 1)
        );
        
        return Math.max(...childDepths);
      };

      const maxDepth = findMaxDepth(tree, 0);
      expect(maxDepth).toBeLessThanOrEqual(2); // Root + 1 level
    });

    it('should respect structure option - nested', () => {
      // Requirement: 19.3
      const tree = generator.generateFromTreeOptions({
        size: 'medium', // Use medium size to ensure enough folders for nesting
        structure: 'nested',
      });

      // Nested structure should have deeper hierarchy
      const findMaxDepth = (node: BookmarkNode, currentDepth: number): number => {
        if (!node.children || node.children.length === 0) {
          return currentDepth;
        }
        
        const childDepths = node.children.map(child => 
          findMaxDepth(child, currentDepth + 1)
        );
        
        return Math.max(...childDepths);
      };

      const maxDepth = findMaxDepth(tree, 0);
      expect(maxDepth).toBeGreaterThan(2);
    });
  });

  describe('generateMockFile', () => {
    it('should generate mock file with metadata for Chrome JSON', () => {
      // Requirement: 19.1, 19.3
      const mockFile = generator.generateMockFile('chrome-json', {
        bookmarkCount: 15,
        folderCount: 3,
        maxDepth: 2,
        seed: 54321,
      });

      expect(mockFile.format).toBe('chrome-json');
      expect(mockFile.content).toBeTruthy();
      expect(mockFile.metadata).toBeDefined();
      expect(mockFile.metadata.bookmarkCount).toBe(15);
      expect(mockFile.metadata.folderCount).toBeGreaterThan(0);
      expect(mockFile.metadata.seed).toBe(54321);
    });

    it('should generate mock file with metadata for Netscape HTML', () => {
      // Requirement: 19.2, 19.3
      const mockFile = generator.generateMockFile('netscape-html', {
        bookmarkCount: 20,
        folderCount: 4,
        maxDepth: 3,
        seed: 67890,
      });

      expect(mockFile.format).toBe('netscape-html');
      expect(mockFile.content).toBeTruthy();
      expect(mockFile.content).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
      expect(mockFile.metadata).toBeDefined();
      expect(mockFile.metadata.bookmarkCount).toBe(20);
      expect(mockFile.metadata.seed).toBe(67890);
    });

    it('should track duplicate count in metadata', () => {
      // Requirement: 19.4
      const mockFile = generator.generateMockFile('chrome-json', {
        bookmarkCount: 30,
        folderCount: 3,
        maxDepth: 2,
        includeDuplicates: true,
        duplicateRate: 0.3,
        seed: 11111,
      });

      expect(mockFile.metadata.duplicateCount).toBeGreaterThan(0);
    });

    it('should track broken link count in metadata', () => {
      // Requirement: 19.6
      const mockFile = generator.generateMockFile('chrome-json', {
        bookmarkCount: 40,
        folderCount: 4,
        maxDepth: 2,
        includeBrokenLinks: true,
        brokenLinkRate: 0.25,
        seed: 22222,
      });

      expect(mockFile.metadata.brokenLinkCount).toBeGreaterThan(0);
    });
  });
});
