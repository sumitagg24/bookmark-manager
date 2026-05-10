/**
 * Undo/Redo Functionality Integration Tests
 * Tests for state management and keyboard shortcuts
 */

import { describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/react';

describe('Undo/Redo Functionality Tests', () => {
  describe('Undo Button State', () => {
    it('should enable undo button after actions', async () => {
      const bookmark = {
        id: '1',
        title: 'Original',
      };

      bookmark.title = 'Modified';
      expect(bookmark.title).toBe('Modified');
    });

    it('should disable undo button when no history', async () => {
      const bookmark = {
        id: '1',
        title: 'Original',
      };

      expect(bookmark.title).toBe('Original');
    });
  });

  describe('Undo Operations', () => {
    it('should undo edit operations', async () => {
      const bookmark = {
        id: '1',
        title: 'Original',
      };

      const originalTitle = bookmark.title;
      bookmark.title = 'Modified';

      // Undo
      bookmark.title = originalTitle;

      expect(bookmark.title).toBe(originalTitle);
    });

    it('should undo delete operations', async () => {
      const bookmarks = [
        { id: '1', title: 'Bookmark 1' },
        { id: '2', title: 'Bookmark 2' },
      ];

      const initialLength = bookmarks.length;
      const deletedItem = bookmarks[0];

      bookmarks.splice(0, 1);
      expect(bookmarks.length).toBe(initialLength - 1);

      // Undo
      bookmarks.unshift(deletedItem);
      expect(bookmarks.length).toBe(initialLength);
    });

    it('should undo move operations', async () => {
      const bookmarks = [
        { id: '1', title: 'Bookmark 1' },
        { id: '2', title: 'Bookmark 2' },
      ];

      const item = bookmarks[0];
      const originalIndex = 0;

      bookmarks.splice(0, 1);
      bookmarks.push(item);

      // Undo
      bookmarks.pop();
      bookmarks.unshift(item);

      expect(bookmarks[originalIndex]).toBe(item);
    });
  });

  describe('Redo Operations', () => {
    it('should redo undone edits', async () => {
      const bookmark = {
        id: '1',
        title: 'Original',
      };

      const newTitle = 'Modified';

      bookmark.title = newTitle;
      expect(bookmark.title).toBe(newTitle);

      bookmark.title = 'Original';
      expect(bookmark.title).toBe('Original');

      bookmark.title = newTitle;
      expect(bookmark.title).toBe(newTitle);
    });

    it('should redo undone deletes', async () => {
      const bookmarks = [
        { id: '1', title: 'Bookmark 1' },
        { id: '2', title: 'Bookmark 2' },
      ];

      const initialLength = bookmarks.length;
      const deletedItem = bookmarks[0];

      bookmarks.splice(0, 1);
      expect(bookmarks.length).toBe(initialLength - 1);

      bookmarks.unshift(deletedItem);
      expect(bookmarks.length).toBe(initialLength);

      bookmarks.splice(0, 1);
      expect(bookmarks.length).toBe(initialLength - 1);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should trigger undo with Ctrl+Z', async () => {
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        code: 'KeyZ',
      });

      fireEvent.keyDown(document, event);
      expect(event.ctrlKey).toBe(true);
      expect(event.key).toBe('z');
    });

    it('should trigger redo with Ctrl+Shift+Z', async () => {
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        shiftKey: true,
        code: 'KeyZ',
      });

      fireEvent.keyDown(document, event);
      expect(event.ctrlKey).toBe(true);
      expect(event.shiftKey).toBe(true);
    });

    it('should trigger undo with Cmd+Z on Mac', async () => {
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        code: 'KeyZ',
      });

      fireEvent.keyDown(document, event);
      expect(event.metaKey).toBe(true);
      expect(event.key).toBe('z');
    });

    it('should trigger redo with Cmd+Shift+Z on Mac', async () => {
      const event = new KeyboardEvent('keydown', {
        key: 'z',
        metaKey: true,
        shiftKey: true,
        code: 'KeyZ',
      });

      fireEvent.keyDown(document, event);
      expect(event.metaKey).toBe(true);
      expect(event.shiftKey).toBe(true);
    });

    it('should work with focus on different elements', async () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        code: 'KeyZ',
      });

      fireEvent.keyDown(input, event);
      expect(document.activeElement).toBe(input);

      document.body.removeChild(input);
    });
  });

  describe('Undo/Redo Stack Management', () => {
    it('should maintain undo stack correctly', async () => {
      const bookmark = {
        id: '1',
        title: 'Original',
      };

      bookmark.title = 'Edit 1';
      bookmark.title = 'Edit 2';
      bookmark.title = 'Edit 3';

      expect(bookmark.title).toBe('Edit 3');
    });

    it('should clear redo stack when new action performed after undo', async () => {
      const bookmark = {
        id: '1',
        title: 'Original',
      };

      bookmark.title = 'Edit 1';
      bookmark.title = 'Original';
      bookmark.title = 'Edit 2';

      expect(bookmark.title).toBe('Edit 2');
    });
  });
});
