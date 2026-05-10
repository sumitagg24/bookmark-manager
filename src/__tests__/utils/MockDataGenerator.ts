/**
 * MockDataGenerator - Comprehensive mock data generator for bookmark testing
 * 
 * Generates realistic bookmark files in both Chrome JSON and Netscape HTML formats
 * with configurable options for testing various scenarios.
 * 
 * Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 7.7
 */

import { faker } from '@faker-js/faker';
import { BookmarkNode } from '@/types/bookmark';

export interface GenerateOptions {
  bookmarkCount: number;
  folderCount: number;
  maxDepth: number;
  includeDuplicates?: boolean;
  duplicateRate?: number; // 0-1, percentage of bookmarks that are duplicates
  includeBrokenLinks?: boolean;
  brokenLinkRate?: number; // 0-1, percentage of bookmarks with broken links
  seed?: number; // For reproducible tests
}

export interface TreeOptions {
  size: 'small' | 'medium' | 'large' | 'xlarge';
  structure: 'flat' | 'nested' | 'mixed';
  duplicateRate?: number; // 0-1
  brokenLinkRate?: number; // 0-1
  seed?: number;
}

export interface MockBookmarkFile {
  format: 'chrome-json' | 'netscape-html';
  content: string;
  metadata: {
    bookmarkCount: number;
    folderCount: number;
    duplicateCount: number;
    brokenLinkCount: number;
    seed: number;
  };
}

/**
 * MockDataGenerator class for creating realistic bookmark test data
 */
export class MockDataGenerator {
  private seed: number;
  private duplicateUrls: string[] = [];
  private brokenUrls: string[] = [];

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
    faker.seed(this.seed);
  }

  /**
   * Generate a Chrome JSON bookmark file
   * Requirements: 19.1, 19.3
   */
  generateChromeJSON(options: GenerateOptions): string {
    // Set seed for reproducibility
    if (options.seed !== undefined) {
      this.seed = options.seed;
      faker.seed(this.seed);
    }

    const tree = this.generateBookmarkTree(options);

    const chromeFormat = {
      checksum: faker.string.alphanumeric(32),
      roots: {
        bookmark_bar: tree,
        other: {
          id: 'other',
          title: 'Other Bookmarks',
          type: 'folder' as const,
          children: [],
          sourceFile: 'generated',
        },
        synced: {
          id: 'synced',
          title: 'Mobile Bookmarks',
          type: 'folder' as const,
          children: [],
          sourceFile: 'generated',
        },
      },
      version: 1,
    };

    return JSON.stringify(chromeFormat, null, 2);
  }

  /**
   * Generate a Netscape HTML bookmark file
   * Requirements: 19.2, 19.3
   */
  generateNetscapeHTML(options: GenerateOptions): string {
    // Set seed for reproducibility
    if (options.seed !== undefined) {
      this.seed = options.seed;
      faker.seed(this.seed);
    }

    const tree = this.generateBookmarkTree(options);
    
    const header = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>`;

    const body = this.nodeToHTML(tree, 1);
    const footer = `</DL><p>`;

    return `${header}\n${body}\n${footer}`;
  }

  /**
   * Generate a bookmark tree with specified options
   * Requirements: 19.3, 7.7
   */
  generateBookmarkTree(options: GenerateOptions): BookmarkNode {
    // Reset tracking arrays
    this.duplicateUrls = [];
    this.brokenUrls = [];

    // Set seed for reproducibility
    if (options.seed !== undefined) {
      this.seed = options.seed;
      faker.seed(this.seed);
    }

    const root: BookmarkNode = {
      id: 'root',
      type: 'folder',
      title: 'Bookmarks Bar',
      children: [],
      sourceFile: 'generated',
    };

    // Calculate how many duplicates and broken links to create
    const duplicateCount = options.includeDuplicates
      ? Math.floor(options.bookmarkCount * (options.duplicateRate ?? 0.2))
      : 0;
    
    const brokenLinkCount = options.includeBrokenLinks
      ? Math.floor(options.bookmarkCount * (options.brokenLinkRate ?? 0.1))
      : 0;

    // Generate duplicate URLs
    for (let i = 0; i < duplicateCount; i++) {
      this.duplicateUrls.push(faker.internet.url());
    }

    // Generate broken link URLs
    for (let i = 0; i < brokenLinkCount; i++) {
      this.brokenUrls.push(`https://broken-${faker.string.alphanumeric(8)}.invalid`);
    }

    // Generate folder structure
    const folders = this.generateFolderStructure(
      options.folderCount,
      options.maxDepth
    );

    // Distribute bookmarks across folders
    const bookmarksPerFolder = Math.ceil(options.bookmarkCount / folders.length);
    let bookmarksCreated = 0;

    for (const folder of folders) {
      const bookmarksForThisFolder = Math.min(
        bookmarksPerFolder,
        options.bookmarkCount - bookmarksCreated
      );

      for (let i = 0; i < bookmarksForThisFolder; i++) {
        folder.children!.push(this.generateBookmark());
        bookmarksCreated++;
      }
    }

    root.children = folders;
    return root;
  }

  /**
   * Generate bookmarks with duplicates for testing deduplication
   * Requirements: 19.4
   */
  generateWithDuplicates(count: number): BookmarkNode {
    return this.generateBookmarkTree({
      bookmarkCount: count,
      folderCount: Math.ceil(count / 10),
      maxDepth: 2,
      includeDuplicates: true,
      duplicateRate: 0.3, // 30% duplicates
      seed: this.seed,
    });
  }

  /**
   * Generate bookmarks with similar titles/URLs for testing similarity detection
   * Requirements: 19.5
   */
  generateWithSimilar(count: number): BookmarkNode {
    const root: BookmarkNode = {
      id: 'root',
      type: 'folder',
      title: 'Bookmarks Bar',
      children: [],
      sourceFile: 'generated',
    };

    const folder: BookmarkNode = {
      id: faker.string.uuid(),
      type: 'folder',
      title: 'Similar Bookmarks',
      children: [],
      sourceFile: 'generated',
    };

    // Create groups of similar bookmarks
    const groupCount = Math.ceil(count / 3);
    
    for (let i = 0; i < groupCount; i++) {
      const baseTitle = faker.company.name();
      const baseDomain = faker.internet.domainName();

      // Create 3 similar bookmarks per group
      for (let j = 0; j < 3 && folder.children!.length < count; j++) {
        folder.children!.push({
          id: faker.string.uuid(),
          type: 'bookmark',
          title: `${baseTitle} - ${['Home', 'About', 'Contact'][j]}`,
          url: `https://${baseDomain}/${['', 'about', 'contact'][j]}`,
          addDate: faker.date.past({ years: 1 }).getTime(),
          sourceFile: 'generated',
        });
      }
    }

    root.children = [folder];
    return root;
  }

  /**
   * Generate bookmarks with broken links for testing link health checks
   * Requirements: 19.6
   */
  generateWithBrokenLinks(count: number): BookmarkNode {
    return this.generateBookmarkTree({
      bookmarkCount: count,
      folderCount: Math.ceil(count / 10),
      maxDepth: 2,
      includeBrokenLinks: true,
      brokenLinkRate: 0.25, // 25% broken links
      seed: this.seed,
    });
  }

  /**
   * Generate deep hierarchy for testing nested folder structures
   * Requirements: 19.7
   */
  generateDeepHierarchy(depth: number): BookmarkNode {
    const root: BookmarkNode = {
      id: 'root',
      type: 'folder',
      title: 'Bookmarks Bar',
      children: [],
      sourceFile: 'generated',
    };

    // Add some bookmarks at root level
    for (let j = 0; j < 3; j++) {
      root.children!.push(this.generateBookmark());
    }

    let currentFolder = root;

    // Create nested folders
    for (let i = 0; i < depth; i++) {
      const newFolder: BookmarkNode = {
        id: faker.string.uuid(),
        type: 'folder',
        title: `Level ${i + 1} - ${faker.commerce.department()}`,
        children: [],
        sourceFile: 'generated',
      };

      // Add some bookmarks at each level
      for (let j = 0; j < 3; j++) {
        newFolder.children!.push(this.generateBookmark());
      }

      currentFolder.children!.push(newFolder);
      currentFolder = newFolder;
    }

    return root;
  }

  /**
   * Generate bookmark tree based on TreeOptions
   * Requirements: 19.3
   */
  generateFromTreeOptions(options: TreeOptions): BookmarkNode {
    const sizeMap = {
      small: 50,
      medium: 200,
      large: 1000,
      xlarge: 5000,
    };

    const bookmarkCount = sizeMap[options.size];
    const folderCount = Math.ceil(bookmarkCount / 20);

    let maxDepth: number;
    switch (options.structure) {
      case 'flat':
        maxDepth = 1;
        break;
      case 'nested':
        maxDepth = 5;
        break;
      case 'mixed':
        maxDepth = 3;
        break;
    }

    return this.generateBookmarkTree({
      bookmarkCount,
      folderCount,
      maxDepth,
      includeDuplicates: (options.duplicateRate ?? 0) > 0,
      duplicateRate: options.duplicateRate,
      includeBrokenLinks: (options.brokenLinkRate ?? 0) > 0,
      brokenLinkRate: options.brokenLinkRate,
      seed: options.seed ?? this.seed,
    });
  }

  /**
   * Generate a complete mock bookmark file with metadata
   * Requirements: 19.1, 19.2, 19.3
   */
  generateMockFile(
    format: 'chrome-json' | 'netscape-html',
    options: GenerateOptions
  ): MockBookmarkFile {
    const content =
      format === 'chrome-json'
        ? this.generateChromeJSON(options)
        : this.generateNetscapeHTML(options);

    const tree = this.generateBookmarkTree(options);
    const metadata = this.calculateMetadata(tree, options);

    return {
      format,
      content,
      metadata: {
        ...metadata,
        seed: options.seed ?? this.seed,
      },
    };
  }

  // Private helper methods

  private generateBookmark(): BookmarkNode {
    let url: string;

    // Decide if this should be a duplicate
    if (this.duplicateUrls.length > 0 && Math.random() < 0.3) {
      url = faker.helpers.arrayElement(this.duplicateUrls);
    }
    // Decide if this should be a broken link
    else if (this.brokenUrls.length > 0 && Math.random() < 0.2) {
      url = faker.helpers.arrayElement(this.brokenUrls);
    }
    // Generate a normal URL
    else {
      url = faker.internet.url();
    }

    return {
      id: faker.string.uuid(),
      type: 'bookmark',
      title: faker.company.catchPhrase(),
      url,
      addDate: faker.date.past({ years: 1 }).getTime(), // Use faker for date generation
      sourceFile: 'generated',
    };
  }

  private generateFolderStructure(
    folderCount: number,
    maxDepth: number
  ): BookmarkNode[] {
    const folders: BookmarkNode[] = [];
    const rootFolders: BookmarkNode[] = [];

    // Create root-level folders
    const rootFolderCount = Math.min(folderCount, Math.ceil(folderCount / maxDepth));
    
    for (let i = 0; i < rootFolderCount; i++) {
      const folder: BookmarkNode = {
        id: faker.string.uuid(),
        type: 'folder',
        title: faker.commerce.department(),
        children: [],
        sourceFile: 'generated',
      };
      rootFolders.push(folder);
      folders.push(folder);
    }

    // Create nested folders
    let remainingFolders = folderCount - rootFolderCount;
    let currentDepth = 1;

    while (remainingFolders > 0 && currentDepth < maxDepth) {
      const foldersAtThisDepth = Math.min(
        remainingFolders,
        Math.ceil(remainingFolders / (maxDepth - currentDepth))
      );

      for (let i = 0; i < foldersAtThisDepth; i++) {
        const parentFolder = faker.helpers.arrayElement(folders);
        const newFolder: BookmarkNode = {
          id: faker.string.uuid(),
          type: 'folder',
          title: faker.commerce.department(),
          children: [],
          sourceFile: 'generated',
        };
        parentFolder.children!.push(newFolder);
        folders.push(newFolder);
        remainingFolders--;
      }

      currentDepth++;
    }

    return rootFolders;
  }

  private nodeToHTML(node: BookmarkNode, indent: number): string {
    const spaces = '    '.repeat(indent);

    if (node.type === 'folder') {
      const children = node.children || [];
      const childrenHTML = children
        .map((child) => this.nodeToHTML(child, indent + 1))
        .join('\n');
      
      const addDate = node.addDate || faker.date.past({ years: 1 }).getTime();
      const lastModified = node.lastModified || faker.date.past({ years: 1 }).getTime();
      
      return `${spaces}<DT><H3 ADD_DATE="${Math.floor(addDate / 1000)}" LAST_MODIFIED="${Math.floor(lastModified / 1000)}">${node.title}</H3>\n${spaces}<DL><p>\n${childrenHTML}\n${spaces}</DL><p>`;
    } else {
      const addDate = node.addDate || faker.date.past({ years: 1 }).getTime();
      return `${spaces}<DT><A HREF="${node.url}" ADD_DATE="${Math.floor(addDate / 1000)}">${node.title}</A>`;
    }
  }

  private calculateMetadata(
    tree: BookmarkNode,
    options: GenerateOptions
  ): Omit<MockBookmarkFile['metadata'], 'seed'> {
    let bookmarkCount = 0;
    let folderCount = 0;
    let duplicateCount = 0;
    let brokenLinkCount = 0;

    const traverse = (node: BookmarkNode) => {
      if (node.type === 'folder') {
        folderCount++;
        (node.children || []).forEach(traverse);
      } else if (node.type === 'bookmark') {
        bookmarkCount++;
        
        if (node.url && this.duplicateUrls.includes(node.url)) {
          duplicateCount++;
        }
        
        if (node.url && this.brokenUrls.includes(node.url)) {
          brokenLinkCount++;
        }
      }
    };

    traverse(tree);

    return {
      bookmarkCount,
      folderCount,
      duplicateCount,
      brokenLinkCount,
    };
  }
}

// Export convenience functions for backward compatibility
export function createMockDataGenerator(seed?: number): MockDataGenerator {
  return new MockDataGenerator(seed);
}
