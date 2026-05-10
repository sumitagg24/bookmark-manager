/**
 * Feature Registry - Catalog of all testable features and UI elements
 */

export type FeatureCategory =
  | 'file-upload'
  | 'merge-dedup'
  | 'edit'
  | 'search'
  | 'bulk-actions'
  | 'link-health'
  | 'auto-organize'
  | 'export'
  | 'theme'
  | 'session'
  | 'keyboard'
  | 'drag-drop';

export type TestStatus = 'passing' | 'failing' | 'flaky' | 'untested';

export interface ButtonElement {
  id: string;
  selector: string;
  label: string;
  expectedAction: string;
  conditionalVisibility?: string;
}

export interface Feature {
  id: string;
  name: string;
  category: FeatureCategory;
  description: string;
  buttons: ButtonElement[];
  requirements: string[];
  testStatus: TestStatus;
  lastTested?: Date;
}

export class FeatureRegistry {
  private features: Map<string, Feature> = new Map();

  register(feature: Feature): void {
    this.features.set(feature.id, feature);
  }

  getAll(): Feature[] {
    return Array.from(this.features.values());
  }

  get(id: string): Feature | null {
    return this.features.get(id) || null;
  }

  getByCategory(category: FeatureCategory): Feature[] {
    return Array.from(this.features.values()).filter(
      (f) => f.category === category
    );
  }

  clear(): void {
    this.features.clear();
  }
}

// Global registry instance
export const globalRegistry = new FeatureRegistry();

// Initialize with all features
export function initializeFeatureRegistry(): void {
  globalRegistry.clear();

  // File Upload Features
  globalRegistry.register({
    id: 'file-upload-chrome',
    name: 'Chrome JSON Upload',
    category: 'file-upload',
    description: 'Upload and parse Chrome bookmark JSON files',
    buttons: [
      {
        id: 'upload-button',
        selector: '[data-testid="file-upload-input"]',
        label: 'Upload File',
        expectedAction: 'Opens file picker',
      },
      {
        id: 'clear-files-button',
        selector: '[data-testid="clear-files-button"]',
        label: 'Clear All Files',
        expectedAction: 'Removes all uploaded files',
      },
    ],
    requirements: ['2.1', '2.2', '2.3'],
    testStatus: 'untested',
  });

  globalRegistry.register({
    id: 'file-upload-netscape',
    name: 'Netscape HTML Upload',
    category: 'file-upload',
    description: 'Upload and parse Netscape HTML bookmark files',
    buttons: [
      {
        id: 'upload-button',
        selector: '[data-testid="file-upload-input"]',
        label: 'Upload File',
        expectedAction: 'Opens file picker',
      },
    ],
    requirements: ['2.2', '2.3'],
    testStatus: 'untested',
  });

  // Merge & Dedup Features
  globalRegistry.register({
    id: 'merge-dedup',
    name: 'Merge & Deduplication',
    category: 'merge-dedup',
    description: 'Merge multiple bookmark files and detect duplicates',
    buttons: [
      {
        id: 'merge-button',
        selector: '[data-testid="merge-button"]',
        label: 'Merge Files',
        expectedAction: 'Merges uploaded files',
      },
    ],
    requirements: ['3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7'],
    testStatus: 'untested',
  });

  // Edit Features
  globalRegistry.register({
    id: 'edit-operations',
    name: 'Edit Operations',
    category: 'edit',
    description: 'Edit bookmark titles, URLs, and notes',
    buttons: [
      {
        id: 'edit-button',
        selector: '[data-testid="edit-button"]',
        label: 'Edit',
        expectedAction: 'Opens edit dialog',
      },
      {
        id: 'save-button',
        selector: '[data-testid="save-button"]',
        label: 'Save',
        expectedAction: 'Saves changes',
      },
    ],
    requirements: ['4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7'],
    testStatus: 'untested',
  });

  // Undo/Redo Features
  globalRegistry.register({
    id: 'undo-redo',
    name: 'Undo/Redo',
    category: 'edit',
    description: 'Undo and redo operations',
    buttons: [
      {
        id: 'undo-button',
        selector: '[data-testid="undo-button"]',
        label: 'Undo',
        expectedAction: 'Reverts last action',
        conditionalVisibility: 'Only when undo stack is not empty',
      },
      {
        id: 'redo-button',
        selector: '[data-testid="redo-button"]',
        label: 'Redo',
        expectedAction: 'Reapplies last undone action',
        conditionalVisibility: 'Only when redo stack is not empty',
      },
    ],
    requirements: ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8'],
    testStatus: 'untested',
  });

  // Search Features
  globalRegistry.register({
    id: 'search',
    name: 'Search',
    category: 'search',
    description: 'Search bookmarks with various operators',
    buttons: [
      {
        id: 'search-input',
        selector: '[data-testid="search-input"]',
        label: 'Search',
        expectedAction: 'Filters bookmarks',
      },
    ],
    requirements: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7'],
    testStatus: 'untested',
  });

  // Bulk Actions Features
  globalRegistry.register({
    id: 'bulk-actions',
    name: 'Bulk Actions',
    category: 'bulk-actions',
    description: 'Select and perform actions on multiple bookmarks',
    buttons: [
      {
        id: 'select-all-button',
        selector: '[data-testid="select-all-button"]',
        label: 'Select All',
        expectedAction: 'Selects all bookmarks',
      },
      {
        id: 'delete-selected-button',
        selector: '[data-testid="delete-selected-button"]',
        label: 'Delete Selected',
        expectedAction: 'Deletes selected bookmarks',
        conditionalVisibility: 'Only when bookmarks are selected',
      },
    ],
    requirements: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7'],
    testStatus: 'untested',
  });

  // Link Health Features
  globalRegistry.register({
    id: 'link-health',
    name: 'Link Health Check',
    category: 'link-health',
    description: 'Check for broken links and generate reports',
    buttons: [
      {
        id: 'check-health-button',
        selector: '[data-testid="check-health-button"]',
        label: 'Check Link Health',
        expectedAction: 'Initiates health check',
      },
      {
        id: 'export-broken-links-button',
        selector: '[data-testid="export-broken-links-button"]',
        label: 'Export Broken Links',
        expectedAction: 'Downloads CSV file',
        conditionalVisibility: 'Only when broken links exist',
      },
    ],
    requirements: ['8.1', '8.2', '8.3', '8.4', '8.5', '8.6', '8.7'],
    testStatus: 'untested',
  });

  // Auto-Organization Features
  globalRegistry.register({
    id: 'auto-organize',
    name: 'Auto-Organization',
    category: 'auto-organize',
    description: 'Automatically organize bookmarks by domain, date, or name',
    buttons: [
      {
        id: 'organize-by-domain-button',
        selector: '[data-testid="organize-by-domain-button"]',
        label: 'By Domain',
        expectedAction: 'Sorts bookmarks by domain',
      },
      {
        id: 'organize-by-date-button',
        selector: '[data-testid="organize-by-date-button"]',
        label: 'By Date',
        expectedAction: 'Sorts bookmarks by date',
      },
      {
        id: 'organize-a-z-button',
        selector: '[data-testid="organize-a-z-button"]',
        label: 'A-Z',
        expectedAction: 'Sorts bookmarks alphabetically',
      },
    ],
    requirements: ['9.1', '9.2', '9.3', '9.4', '9.5', '9.6', '9.7'],
    testStatus: 'untested',
  });

  // Export Features
  globalRegistry.register({
    id: 'export',
    name: 'Export',
    category: 'export',
    description: 'Export bookmarks in various formats',
    buttons: [
      {
        id: 'export-html-button',
        selector: '[data-testid="export-html-button"]',
        label: 'Export as HTML',
        expectedAction: 'Downloads HTML file',
      },
      {
        id: 'export-csv-button',
        selector: '[data-testid="export-csv-button"]',
        label: 'Export as CSV',
        expectedAction: 'Downloads CSV file',
      },
      {
        id: 'export-markdown-button',
        selector: '[data-testid="export-markdown-button"]',
        label: 'Export as Markdown',
        expectedAction: 'Downloads Markdown file',
      },
    ],
    requirements: ['10.1', '10.2', '10.3', '10.4', '10.5'],
    testStatus: 'untested',
  });

  // Theme Features
  globalRegistry.register({
    id: 'theme-toggle',
    name: 'Theme Toggle',
    category: 'theme',
    description: 'Switch between light and dark themes',
    buttons: [
      {
        id: 'theme-toggle-button',
        selector: '[data-testid="theme-toggle-button"]',
        label: 'Toggle Theme',
        expectedAction: 'Switches between light and dark mode',
      },
    ],
    requirements: ['12.1', '12.2', '12.3', '12.4', '12.5', '12.6'],
    testStatus: 'untested',
  });

  // Session Persistence Features
  globalRegistry.register({
    id: 'session-persistence',
    name: 'Session Persistence',
    category: 'session',
    description: 'Persist user data across page reloads',
    buttons: [
      {
        id: 'dismiss-restore-notice-button',
        selector: '[data-testid="dismiss-restore-notice-button"]',
        label: 'Dismiss',
        expectedAction: 'Dismisses session restore notice',
        conditionalVisibility: 'Only when session exists',
      },
    ],
    requirements: ['13.1', '13.2', '13.3', '13.4', '13.5', '13.6'],
    testStatus: 'untested',
  });

  // Keyboard Shortcuts Features
  globalRegistry.register({
    id: 'keyboard-shortcuts',
    name: 'Keyboard Shortcuts',
    category: 'keyboard',
    description: 'Keyboard shortcuts for common operations',
    buttons: [],
    requirements: ['14.1', '14.2', '14.3', '14.4', '14.5', '14.6', '14.7'],
    testStatus: 'untested',
  });

  // Drag & Drop Features
  globalRegistry.register({
    id: 'drag-drop',
    name: 'Drag & Drop',
    category: 'drag-drop',
    description: 'Drag and drop bookmarks to reorder or move',
    buttons: [],
    requirements: ['15.1', '15.2', '15.3', '15.4', '15.5', '15.6'],
    testStatus: 'untested',
  });
}
