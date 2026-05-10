import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateNetscapeExport, generateCsvExport, generatePlainUrlList, generateMarkdownExport } from '../../core/exporter';
import type { BookmarkNode } from '../../types/bookmark';

describe('Export Functionality', () => {
  const mockMergeResult = {
    root: {
      id: 'root',
      type: 'folder' as const,
      title: 'Root',
      children: [
        {
          id: 'folder1',
          type: 'folder' as const,
          title: 'Tech',
          children: [
            {
              id: 'bm1',
              type: 'bookmark' as const,
              title: 'React Docs',
              url: 'https://react.dev',
              addDate: '1234567890',
            },
            {
              id: 'bm2',
              type: 'bookmark' as const,
              title: 'TypeScript Handbook',
              url: 'https://www.typescriptlang.org/docs/',
              addDate: '1234567891',
            },
          ],
        },
        {
          id: 'folder2',
          type: 'folder' as const,
          title: 'News',
          children: [
            {
              id: 'bm3',
              type: 'bookmark' as const,
              title: 'HackerNews',
              url: 'https://news.ycombinator.com',
              addDate: '1234567892',
            },
          ],
        },
      ],
    } as BookmarkNode,
    stats: {
      uniqueBookmarks: 3,
      duplicatesRemoved: 0,
      foldersMerged: 0,
    },
  };

  describe('Export Format Validation', () => {
    it('should generate valid Netscape HTML export', () => {
      const html = generateNetscapeExport(mockMergeResult.root);

      expect(html).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
      expect(html).toContain('<H1>Bookmarks</H1>');
      expect(html).toContain('React Docs');
      expect(html).toContain('https://react.dev');
      expect(html).toContain('Tech');
      expect(html).toContain('News');
    });

    it('should generate valid CSV export', () => {
      const csv = generateCsvExport(mockMergeResult.root);

      expect(csv).toContain('title,url,folder_path');
      expect(csv).toContain('React Docs,https://react.dev,Tech');
      expect(csv).toContain('TypeScript Handbook,https://www.typescriptlang.org/docs/,Tech');
      expect(csv).toContain('HackerNews,https://news.ycombinator.com,News');
    });

    it('should generate valid plain URL list export', () => {
      const urls = generatePlainUrlList(mockMergeResult.root);
      const urlList = urls.split('\n');

      expect(urlList).toContain('https://react.dev');
      expect(urlList).toContain('https://www.typescriptlang.org/docs/');
      expect(urlList).toContain('https://news.ycombinator.com');
      expect(urlList.length).toBe(3);
    });

    it('should generate valid Markdown export', () => {
      const markdown = generateMarkdownExport(mockMergeResult.root);

      expect(markdown).toContain('# Bookmarks');
      expect(markdown).toContain('## Tech');
      expect(markdown).toContain('## News');
      expect(markdown).toContain('[React Docs](https://react.dev)');
      expect(markdown).toContain('[TypeScript Handbook](https://www.typescriptlang.org/docs/)');
      expect(markdown).toContain('[HackerNews](https://news.ycombinator.com)');
    });

    it('should escape HTML special characters in HTML export', () => {
      const nodeWithSpecialChars: BookmarkNode = {
        id: 'root',
        type: 'folder',
        title: 'Root',
        children: [
          {
            id: 'bm1',
            type: 'bookmark',
            title: 'Test & Demo <Script>',
            url: 'https://example.com?a=1&b=2',
            addDate: '1234567890',
          },
        ],
      };

      const html = generateNetscapeExport(nodeWithSpecialChars);
      expect(html).toContain('Test &amp; Demo &lt;Script&gt;');
      expect(html).toContain('https://example.com?a=1&amp;b=2');
    });

    it('should escape CSV fields with special characters', () => {
      const nodeWithSpecialChars: BookmarkNode = {
        id: 'root',
        type: 'folder',
        title: 'Root',
        children: [
          {
            id: 'bm1',
            type: 'bookmark',
            title: 'Test "Quote" Bookmark',
            url: 'https://example.com',
            addDate: '1234567890',
          },
        ],
      };

      const csv = generateCsvExport(nodeWithSpecialChars);
      expect(csv).toContain('"Test ""Quote"" Bookmark"');
    });

    it('should preserve folder hierarchy in exports', () => {
      const html = generateNetscapeExport(mockMergeResult.root);
      const csv = generateCsvExport(mockMergeResult.root);
      const markdown = generateMarkdownExport(mockMergeResult.root);

      // HTML should have folder structure
      expect(html).toContain('<H3');
      expect(html).toContain('Tech');
      expect(html).toContain('News');

      // CSV should have folder paths
      expect(csv).toContain('Tech');
      expect(csv).toContain('News');

      // Markdown should have folder headings
      expect(markdown).toContain('## Tech');
      expect(markdown).toContain('## News');
    });

    it('should preserve bookmark metadata in exports', () => {
      const html = generateNetscapeExport(mockMergeResult.root);
      const csv = generateCsvExport(mockMergeResult.root);

      // HTML should preserve ADD_DATE
      expect(html).toContain('ADD_DATE="1234567890"');

      // CSV should have all columns
      const csvLines = csv.split('\n');
      expect(csvLines[0]).toBe('title,url,folder_path');
      expect(csvLines.length).toBeGreaterThan(1);
    });

    it('should handle empty bookmarks gracefully', () => {
      const emptyNode: BookmarkNode = {
        id: 'root',
        type: 'folder',
        title: 'Root',
        children: [],
      };

      const html = generateNetscapeExport(emptyNode);
      const csv = generateCsvExport(emptyNode);
      const urls = generatePlainUrlList(emptyNode);
      const markdown = generateMarkdownExport(emptyNode);

      expect(html).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
      expect(csv).toContain('title,url,folder_path');
      expect(urls).toBe('');
      expect(markdown).toContain('# Bookmarks');
    });

    it('should handle deeply nested folder structures', () => {
      const deepNode: BookmarkNode = {
        id: 'root',
        type: 'folder',
        title: 'Root',
        children: [
          {
            id: 'f1',
            type: 'folder',
            title: 'Level1',
            children: [
              {
                id: 'f2',
                type: 'folder',
                title: 'Level2',
                children: [
                  {
                    id: 'bm1',
                    type: 'bookmark',
                    title: 'Deep Bookmark',
                    url: 'https://example.com',
                    addDate: '1234567890',
                  },
                ],
              },
            ],
          },
        ],
      };

      const csv = generateCsvExport(deepNode);
      expect(csv).toContain('Level1 / Level2');

      const markdown = generateMarkdownExport(deepNode);
      expect(markdown).toContain('## Level1 / Level2');
    });

    it('should handle bookmarks without URLs', () => {
      const nodeWithoutUrl: BookmarkNode = {
        id: 'root',
        type: 'folder',
        title: 'Root',
        children: [
          {
            id: 'bm1',
            type: 'bookmark',
            title: 'No URL Bookmark',
            url: '',
            addDate: '1234567890',
          },
        ],
      };

      const csv = generateCsvExport(nodeWithoutUrl);
      const urls = generatePlainUrlList(nodeWithoutUrl);

      // Bookmarks without URLs are not included in exports
      expect(csv).toBe('title,url,folder_path');
      expect(urls).toBe('');
    });
  });
});
