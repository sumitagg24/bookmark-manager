import { parseChromeJSON, detectFormat } from '../chrome-json';

describe('Chrome JSON Parser', () => {
  it('should parse Chrome bookmark JSON', () => {
    const json = JSON.stringify({
      roots: {
        bookmark_bar: {
          type: 'folder',
          name: 'Bookmarks Bar',
          children: [
            {
              type: 'url',
              name: 'Example',
              url: 'https://example.com',
              date_added: '1234567890'
            },
            {
              type: 'url',
              name: 'Google',
              url: 'https://google.com',
              date_added: '1234567891'
            }
          ]
        }
      }
    });

    const result = parseChromeJSON(json, 'bookmarks.json');
    
    expect(result.stats.totalBookmarks).toBe(2);
    expect(result.stats.totalFolders).toBe(1);
    expect(result.root.children).toHaveLength(1);
  });

  it('should parse nested folders', () => {
    const json = JSON.stringify({
      roots: {
        bookmark_bar: {
          type: 'folder',
          name: 'Bookmarks Bar',
          children: [
            {
              type: 'folder',
              name: 'Work',
              children: [
                {
                  type: 'url',
                  name: 'GitHub',
                  url: 'https://github.com'
                }
              ]
            }
          ]
        }
      }
    });

    const result = parseChromeJSON(json, 'bookmarks.json');
    
    expect(result.stats.totalBookmarks).toBe(1);
    expect(result.stats.totalFolders).toBe(2);
  });

  it('should handle multiple root categories', () => {
    const json = JSON.stringify({
      roots: {
        bookmark_bar: {
          type: 'folder',
          name: 'Bookmarks Bar',
          children: [
            {
              type: 'url',
              name: 'Example',
              url: 'https://example.com'
            }
          ]
        },
        other: {
          type: 'folder',
          name: 'Other Bookmarks',
          children: [
            {
              type: 'url',
              name: 'Google',
              url: 'https://google.com'
            }
          ]
        }
      }
    });

    const result = parseChromeJSON(json, 'bookmarks.json');
    
    expect(result.stats.totalBookmarks).toBe(2);
    expect(result.root.children).toHaveLength(2);
  });

  it('should detect Netscape format', () => {
    const netscapeHtml = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<HTML><BODY><DL><p>';
    expect(detectFormat(netscapeHtml)).toBe('netscape');
  });

  it('should detect Chrome JSON format', () => {
    const chromeJson = JSON.stringify({ roots: { bookmark_bar: {} } });
    expect(detectFormat(chromeJson)).toBe('chrome-json');
  });

  it('should return unknown for unrecognized format', () => {
    expect(detectFormat('random text')).toBe('unknown');
  });

  it('should handle bookmarks with dates', () => {
    const json = JSON.stringify({
      roots: {
        bookmark_bar: {
          type: 'folder',
          name: 'Bookmarks Bar',
          date_added: '1234567890',
          date_modified: '1234567900',
          children: [
            {
              type: 'url',
              name: 'Example',
              url: 'https://example.com',
              date_added: '1234567890'
            }
          ]
        }
      }
    });

    const result = parseChromeJSON(json, 'bookmarks.json');
    
    expect(result.root.children?.[0]?.addDate).toBe(1234567890);
    expect(result.root.children?.[0]?.lastModified).toBe(1234567900);
  });
});
