export function getRootUrl(url: string): string {
  try { return new URL(url).origin + '/'; }
  catch { return url; }
}

export function hasPath(url: string): boolean {
  try { const p = new URL(url); return p.pathname !== '/' && p.pathname !== ''; }
  catch { return false; }
}

export function getDefaultTitle(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const parts = hostname.split('.');
    const name = parts.length > 2 ? parts[parts.length - 2] : parts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return '';
  }
}
