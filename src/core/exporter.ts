import type { BookmarkNode, ExportFormat } from '../types/bookmark';

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generateBookmarkHTML(node: BookmarkNode, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  
  if (node.type === 'folder') {
    const header = `${indent}<DT><H3 ADD_DATE="${node.addDate || ''}" LAST_MODIFIED="${node.lastModified || ''}">${escapeHtml(node.title)}</H3>\n`;
    const listStart = `${indent}<DL><p>\n`;
    const children = node.children?.map(c => generateBookmarkHTML(c, depth + 1)).join('') || '';
    const listEnd = `${indent}</DL><p>\n`;
    return header + listStart + children + listEnd;
  } else if (node.type === 'bookmark') {
    const iconAttr = node.icon ? ` ICON="${node.icon}"` : '';
    return `${indent}<DT><A HREF="${escapeHtml(node.url || '')}" ADD_DATE="${node.addDate || ''}"${iconAttr}>${escapeHtml(node.title)}</A>\n`;
  }
  
  return '';
}

export function generateNetscapeExport(root: BookmarkNode): string {
  const header = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;
  
  const body = root.children?.map(c => generateBookmarkHTML(c, 1)).join('') || '';
  const footer = `</DL><p>`;
  
  return header + body + footer;
}

function collectBookmarksInOrder(
  node: BookmarkNode,
  folderPath: string[],
  out: { title: string; url: string; folderPath: string }[]
): void {
  if (node.type === 'bookmark' && node.url) {
    out.push({
      title: node.title,
      url: node.url,
      folderPath: folderPath.join(' / '),
    });
  }
  node.children?.forEach((child) => {
    if (child.type === 'folder') {
      collectBookmarksInOrder(child, [...folderPath, child.title], out);
    } else {
      collectBookmarksInOrder(child, folderPath, out);
    }
  });
}

export function generatePlainUrlList(root: BookmarkNode): string {
  const flat: { title: string; url: string; folderPath: string }[] = [];
  collectBookmarksInOrder(root, [], flat);
  return flat.map((r) => r.url).join('\n');
}

function csvEscapeField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCsvExport(root: BookmarkNode): string {
  const flat: { title: string; url: string; folderPath: string }[] = [];
  collectBookmarksInOrder(root, [], flat);
  const header = 'title,url,folder_path';
  const lines = flat.map(
    (r) =>
      `${csvEscapeField(r.title)},${csvEscapeField(r.url)},${csvEscapeField(r.folderPath)}`
  );
  return [header, ...lines].join('\n');
}

export function buildExportContent(root: BookmarkNode, format: ExportFormat): string {
  if (format === 'html') return generateNetscapeExport(root);
  if (format === 'urls') return generatePlainUrlList(root);
  return generateCsvExport(root);
}

function escapeMarkdownLinkText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\]/g, '\\]').replace(/\[/g, '\\[');
}

/** Flat list: `- [title](url)` lines, grouped by folder as `## Folder` headings. */
export function generateMarkdownExport(root: BookmarkNode): string {
  const flat: { title: string; url: string; folderPath: string }[] = [];
  collectBookmarksInOrder(root, [], flat);

  const lines: string[] = ['# Bookmarks', ''];
  let lastPath = '';
  for (const row of flat) {
    if (row.folderPath !== lastPath) {
      lastPath = row.folderPath;
      if (row.folderPath) {
        lines.push(`## ${row.folderPath.replace(/\s*\/\s*/g, ' / ')}`, '');
      }
    }
    const t = escapeMarkdownLinkText(row.title);
    lines.push(`- [${t}](${row.url})`);
  }
  return lines.join('\n');
}

const FORMAT_MIME: Record<ExportFormat, string> = {
  html: 'text/html;charset=utf-8',
  urls: 'text/plain;charset=utf-8',
  csv: 'text/csv;charset=utf-8',
};

const FORMAT_EXT: Record<ExportFormat, string> = {
  html: '.html',
  urls: '.txt',
  csv: '.csv',
};

export function downloadExport(content: string, basename: string, format: ExportFormat) {
  const ext = FORMAT_EXT[format];
  const name =
    basename.toLowerCase().endsWith(ext) ? basename : `${basename.replace(/\.(html|htm|txt|csv)$/i, '')}${ext}`;
  const blob = new Blob([content], { type: FORMAT_MIME[format] });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** @deprecated Use downloadExport with format */
export function downloadFile(content: string, filename: string) {
  downloadExport(content, filename, 'html');
}