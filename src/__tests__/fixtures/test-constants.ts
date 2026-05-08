/**
 * Test constants and configuration
 * Shared constants used across test suites
 */

export const TEST_TIMEOUTS = {
  SHORT: 1000,
  MEDIUM: 5000,
  LONG: 10000,
  E2E: 30000,
} as const;

export const TEST_VIEWPORT_SIZES = {
  MOBILE: { width: 375, height: 667 },
  TABLET: { width: 768, height: 1024 },
  DESKTOP: { width: 1920, height: 1080 },
} as const;

export const TEST_URLS = {
  VALID: [
    'https://example.com',
    'https://www.google.com',
    'https://github.com/user/repo',
  ],
  INVALID: [
    'not-a-url',
    'htp://broken.com',
    '',
  ],
  DUPLICATE: 'https://duplicate.com',
} as const;

export const TEST_FILE_NAMES = {
  CHROME_JSON: 'test-bookmarks.json',
  NETSCAPE_HTML: 'test-bookmarks.html',
  EXPORT_HTML: 'exported-bookmarks.html',
  EXPORT_CSV: 'exported-bookmarks.csv',
  EXPORT_MD: 'exported-bookmarks.md',
} as const;

export const TEST_SELECTORS = {
  FILE_INPUT: 'input[type="file"]',
  UPLOAD_BUTTON: 'button:has-text("Upload")',
  CLEAR_BUTTON: 'button:has-text("Clear")',
  EXPORT_BUTTON: 'button:has-text("Export")',
  SEARCH_INPUT: 'input[type="search"]',
  BOOKMARK_TREE: '.bookmark-tree',
  BOOKMARK_ITEM: '.bookmark-item',
  FOLDER_ITEM: '.folder-item',
} as const;

export const TEST_ARIA_LABELS = {
  UPLOAD: 'Upload bookmark file',
  CLEAR: 'Clear all files',
  EXPORT: 'Export bookmarks',
  SEARCH: 'Search bookmarks',
  THEME_TOGGLE: 'Toggle theme',
} as const;

export const PERFORMANCE_THRESHOLDS = {
  PARSE_TIME_MS: 500,
  MERGE_TIME_MS: 2000,
  SEARCH_TIME_MS: 100,
  EXPORT_TIME_MS: 1000,
} as const;

export const ACCESSIBILITY_STANDARDS = {
  WCAG_LEVEL: 'AA',
  MIN_CONTRAST_RATIO: 4.5,
  MIN_CONTRAST_RATIO_LARGE: 3,
} as const;
