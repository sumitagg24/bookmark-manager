import { parseNetscapeHTML } from '../netscape';

describe('Netscape HTML Parser', () => {
  it('should parse simple bookmarks', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<HEAD><TITLE>Bookmarks</TITLE></HEAD>
<BODY>
<DL>
<DT><A HREF="https://example.com" ADD_DATE="1234567890">Example</A>
<DT><A HREF="https://google.com" ADD_DATE="1234567891">Google</A>
</DL>
</BODY>
</HTML>`;

    const result = parseNetscapeHTML(html, 'test.html');
    
    expect(result.stats.totalBookmarks).toBe(2);
    expect(result.stats.totalFolders).toBe(0);
    expect(result.root.children).toHaveLength(2);
    expect(result.root.children?.[0]?.title).toBe('Example');
    expect(result.root.children?.[0]?.url).toBe('https://example.com');
    expect(result.root.children?.[1]?.title).toBe('Google');
  });

  it('should handle empty folders', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<HEAD><TITLE>Bookmarks</TITLE></HEAD>
<BODY>
<DL>
<DT><H3>Empty Folder</H3>
<DL>
</DL>
</DL>
</BODY>
</HTML>`;

    const result = parseNetscapeHTML(html, 'test.html');
    
    expect(result.stats.totalBookmarks).toBe(0);
    expect(result.stats.totalFolders).toBe(1);
    expect(result.root.children?.[0]?.children).toHaveLength(0);
  });

  it('should handle bookmarks with icons', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<HEAD><TITLE>Bookmarks</TITLE></HEAD>
<BODY>
<DL>
<DT><A HREF="https://example.com" ICON="data:image/png;base64,ABC">Example</A>
</DL>
</BODY>
</HTML>`;

    const result = parseNetscapeHTML(html, 'test.html');
    
    expect(result.root.children?.[0]?.icon).toBe('data:image/png;base64,ABC');
  });

  it('should handle bookmarks with dates', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<HEAD><TITLE>Bookmarks</TITLE></HEAD>
<BODY>
<DL>
<DT><A HREF="https://example.com" ADD_DATE="1234567890">Example</A>
</DL>
</BODY>
</HTML>`;

    const result = parseNetscapeHTML(html, 'test.html');
    
    expect(result.root.children?.[0]?.addDate).toBe(1234567890);
  });

  it('should handle folder with dates', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<HTML>
<HEAD><TITLE>Bookmarks</TITLE></HEAD>
<BODY>
<DL>
<DT><H3 ADD_DATE="1234567890" LAST_MODIFIED="1234567900">My Folder</H3>
<DL>
</DL>
</DL>
</BODY>
</HTML>`;

    const result = parseNetscapeHTML(html, 'test.html');
    
    expect(result.root.children?.[0]?.addDate).toBe(1234567890);
    expect(result.root.children?.[0]?.lastModified).toBe(1234567900);
  });
});
