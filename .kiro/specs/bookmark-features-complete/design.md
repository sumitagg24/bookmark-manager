# Complete Bookmark Manager Features - Design

## Architecture Overview

### Data Model Extensions

```typescript
// Extended BookmarkNode
interface BookmarkNode {
  // ... existing fields
  tags: string[];           // Tag IDs
  isFavorite: boolean;      // Starred status
  notes: string;            // Notes/description
  preview?: {
    title: string;
    description: string;
    favicon: string;
  };
  lastVisited?: number;     // Timestamp
}

// New Types
interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;            // Number of bookmarks with this tag
}

interface SearchHistoryEntry {
  id: string;
  query: string;
  timestamp: number;
  resultCount: number;
}

interface Backup {
  id: string;
  timestamp: number;
  data: MergeResult;
  size: number;
}

interface Shortcut {
  id: string;
  key: string;              // e.g., "Ctrl+Shift+T"
  action: string;           // e.g., "toggleFavorite"
  description: string;
  customizable: boolean;
}
```

### Store Extensions

Add to Zustand store:
- `tags: Map<string, Tag>` - All tags
- `searchHistory: SearchHistoryEntry[]` - Recent searches
- `backups: Backup[]` - Backup history
- `selectedBookmarkIds: Set<string>` - For bulk operations
- `shortcuts: Map<string, Shortcut>` - Keyboard shortcuts

### New Actions
- `addTag(name, color)` - Create tag
- `removeTag(tagId)` - Delete tag
- `addTagToBookmark(bookmarkId, tagId)` - Tag bookmark
- `removeTagFromBookmark(bookmarkId, tagId)` - Untag
- `addToSearchHistory(query)` - Track search
- `clearSearchHistory()` - Clear history
- `toggleFavorite(bookmarkId)` - Star/unstar
- `bulkEditBookmarks(ids, changes)` - Bulk edit
- `createBackup()` - Create backup
- `restoreBackup(backupId)` - Restore backup
- `updateShortcut(shortcutId, newKey)` - Customize shortcut

## UI Layout

### New Navigation Structure

```
┌─────────────────────────────────────────────────────────┐
│ SIDEBAR (Left)          │ MAIN CONTENT      │ SIDEBAR (Right)
├─────────────────────────┼───────────────────┼─────────────────┐
│ • Import                │ Section Title     │ Quick Stats     │
│ • Favorites ⭐          │ Active Section    │ • Total         │
│ • All Bookmarks         │ Content           │ • Favorites     │
│ • Tags                  │                   │ • Tags          │
│ • Search History        │                   │ • Recent        │
│ • Statistics            │                   │                 │
│ • Backup/Restore        │                   │                 │
│ • Keyboard Shortcuts    │                   │                 │
│ • Settings              │                   │                 │
└─────────────────────────┴───────────────────┴─────────────────┘
```

### Main Content Sections

1. **Import** (existing)
   - File upload
   - Import options

2. **Favorites** (new)
   - Starred bookmarks only
   - Quick access
   - Bulk actions

3. **All Bookmarks** (enhanced)
   - Tree view with tags
   - Bulk selection
   - Advanced search
   - Filter by tag

4. **Tags** (new)
   - Tag management
   - Tag cloud
   - Bookmarks per tag
   - Tag statistics

5. **Search History** (new)
   - Recent searches
   - Quick re-run
   - Clear history

6. **Statistics** (enhanced)
   - Domain statistics
   - Tag statistics
   - Folder statistics
   - Dead links
   - Oldest/newest bookmarks

7. **Backup/Restore** (new)
   - Backup history
   - Create backup
   - Restore backup
   - Auto-backup settings

8. **Keyboard Shortcuts** (new)
   - Shortcuts list
   - Customizable shortcuts
   - Search shortcuts
   - Export shortcuts

9. **Settings** (new)
   - Theme
   - Auto-backup frequency
   - Default export format
   - Privacy settings

## Component Structure

### New Components

```
src/components/
├── FavoritesPanel.tsx          - Starred bookmarks view
├── TagsPanel.tsx               - Tag management
├── TagCloud.tsx                - Visual tag display
├── SearchHistoryPanel.tsx      - Recent searches
├── StatisticsPanel.tsx         - Enhanced stats
├── BackupRestorePanel.tsx      - Backup management
├── KeyboardShortcutsPanel.tsx  - Shortcuts reference
├── SettingsPanel.tsx           - App settings
├── BulkEditPanel.tsx           - Bulk operations UI
├── BookmarkPreview.tsx         - Hover preview
├── TagSelector.tsx             - Tag picker
├── NotesEditor.tsx             - Notes editor
└── DuplicateSelector.tsx       - Choose which duplicate to keep
```

### Enhanced Components

```
BookmarkTree.tsx
├── Add tag UI
├── Add notes UI
├── Star/favorite button
├── Bulk selection checkbox
└── Preview on hover

DashboardNav.tsx
├── New navigation items
├── Favorites indicator
├── Search history quick access
└── Settings access
```

## Feature Implementation Details

### 1. Tags System
- Store tags in separate Map for efficient lookup
- Color-code tags for visual distinction
- Auto-suggest tags based on domain
- Tag count updates on bookmark changes
- Filter tree by selected tags

### 2. Search History
- Store last 20 searches
- Include result count
- Quick re-run from history
- Persist to localStorage
- Clear all option

### 3. Bulk Operations
- Checkbox selection in tree
- Select all / deselect all
- Bulk tag, move, delete, favorite
- Confirmation dialog for destructive ops
- Undo support for bulk operations

### 4. Backup/Restore
- Auto-backup daily (configurable)
- Manual backup button
- Backup history with timestamps
- Restore with confirmation
- Backup size display

### 5. Keyboard Shortcuts
- Ctrl+T: Toggle favorite
- Ctrl+Shift+N: Add note
 - Ctrl+Shift+T: Add tag
 - Ctrl+B: Bulk select
 - Customizable via settings

### 6. Duplicate Handling
- Show duplicates side-by-side
- Radio buttons to choose which to keep
- Preview of each duplicate
- Merge with selected choice
- Undo merge option

### 7. Bookmark Preview
- Hover to show preview
- Fetch page title/description
- Show favicon
- Show domain
- Show last visited date
- Tooltip with rich content

## Performance Optimizations

- Lazy load tag cloud
- Memoize filtered results
- Debounce search
- Virtual scrolling for large lists
- Batch backup operations
- Cache preview data

## Accessibility

- Keyboard navigation for all features
- ARIA labels for new components
- Focus management
- Screen reader support
- High contrast mode
- Reduced motion support
