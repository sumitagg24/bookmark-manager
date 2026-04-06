export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.protocol = 'https:';
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, '');
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch (e) {
    return url.toLowerCase().trim();
  }
}