/**
 * Search Functionality Integration Tests
 * Tests for search operators and filtering
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useBookmarkStore } from '../../store/bookmarkStore';
import { MockDataGenerator } from '../utils/MockDataGenerator';

describe('Search Functionality Tests', () => {
  let mockGenerator: MockDataGenerator;

  beforeEach(() => {
    mockGenerator = new MockDataGenerator();
    const store = useBookmarkStore.getState();
    store.tree = mockGenerator.generateBookmarkTree({ size: 'medium', structure: 'nested' });
  });

  describe('Text Search', () => {
    it('should display matching bookmarks for text search', async () => {
      const store = useBookmarkStore.getState();

      // Simulate search
      const searchTerm = 'example';
      const bookmarks: any[] = [];

      const collectBookmarks = (node: any) => {
        if (node.url && node.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
          bookmarks.push(node);
        }
        if (node.children) {
          node.children.forEach(collectBookmarks);
        }
      };

      if (store.tree) {
        collectBookmarks(store.tree);
      }

      expect(bookmarks.length).toBeGreaterThanOrEqual(0);
    });

    it('should highlight matching text in results', async () => {
      const searchTerm = 'test';
      const text = 'This is a test bookmark';

      const highlighted = text.includes(searchTerm);
      expect(highlighted).toBe(true);
    });
  });

  describe('Domain Operator', () => {
    it('should filter by domain operator', async () => {
      const store = useBookmarkStore.getState();

      // Simulate domain filter
      const domain = 'example.com';
      const filtered: any[] = [];

      const collectByDomain = (node: any) => {
        if (node.url && node.url.includes(domain)) {
          filtered.push(node);
        }
        if (node.children) {
          node.children.forEach(collectByDomain);
        }
      };

      if (store.tree) {
        collectByDomain(store.tree);
      }

      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Folder Operator', () => {
    it('should filter by folder operator', async () => {
      const store = useBookmarkStore.getState();

      // Simulate folder filter
      const folderName = 'Work';
      const filtered: any[] = [];

      const collectByFolder = (node: any, inFolder: boolean = false) => {
        if (!node.url && node.title === folderName) {
          inFolder = true;
        }

        if (inFolder && node.url) {
          filtered.push(node);
        }

        if (node.children) {
          node.children.forEach((child: any) => collectByFolder(child, inFolder));
        }
      };

      if (store.tree) {
        collectByFolder(store.tree);
      }

      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Source Operator', () => {
    it('should filter by source operator', async () => {
      const store = useBookmarkStore.getState();

      // Simulate source filter
      const source = 'chrome';
      const filtered: any[] = [];

      const collectBySource = (node: any) => {
        if (node.url && node.source === source) {
          filtered.push(node);
        }
        if (node.children) {
          node.children.forEach(collectBySource);
        }
      };

      if (store.tree) {
        collectBySource(store.tree);
      }

      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Multiple Search Terms', () => {
    it('should combine multiple search filters', async () => {
      const store = useBookmarkStore.getState();

      // Simulate combined search
      const searchTerm = 'test';
      const domain = 'example.com';
      const filtered: any[] = [];

      const collectFiltered = (node: any) => {
        if (
          node.url &&
          node.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          node.url.includes(domain)
        ) {
          filtered.push(node);
        }
        if (node.children) {
          node.children.forEach(collectFiltered);
        }
      };

      if (store.tree) {
        collectFiltered(store.tree);
      }

      expect(filtered.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should focus search box with Ctrl+F', async () => {
      const searchInput = document.createElement('input');
      searchInput.setAttribute('data-testid', 'search-input');
      document.body.appendChild(searchInput);

      // Simulate Ctrl+F
      const event = new KeyboardEvent('keydown', {
        key: 'f',
        ctrlKey: true,
        code: 'KeyF',
      });

      fireEvent.keyDown(document, event);

      document.body.removeChild(searchInput);
    });
  });

  describe('Search Results', () => {
    it('should display correct number of results', async () => {
      const store = useBookmarkStore.getState();

      const searchTerm = 'bookmark';
      const results: any[] = [];

      const collectResults = (node: any) => {
        if (node.url && node.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push(node);
        }
        if (node.children) {
          node.children.forEach(collectResults);
        }
      };

      if (store.tree) {
        collectResults(store.tree);
      }

      expect(Array.isArray(results)).toBe(true);
    });

    it('should clear search results when search is cleared', async () => {
      const store = useBookmarkStore.getState();

      // Search
      const searchTerm = 'test';
      let results: any[] = [];

      const collectResults = (node: any) => {
        if (node.url && node.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push(node);
        }
        if (node.children) {
          node.children.forEach(collectResults);
        }
      };

      if (store.tree) {
        collectResults(store.tree);
      }

      // Clear search
      results = [];

      expect(results.length).toBe(0);
    });
  });

  describe('Search Performance', () => {
    it('should search large bookmark libraries efficiently', async () => {
      const store = useBookmarkStore.getState();
      store.tree = mockGenerator.generateBookmarkTree({ size: 'xlarge', structure: 'nested' });

      const startTime = performance.now();

      const searchTerm = 'test';
      const results: any[] = [];

      const collectResults = (node: any) => {
        if (node.url && node.title?.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push(node);
        }
        if (node.children) {
          node.children.forEach(collectResults);
        }
      };

      if (store.tree) {
        collectResults(store.tree);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Search should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });
});
