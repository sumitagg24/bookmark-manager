export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    // Only normalize to https if it's http or https
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      u.protocol = 'https:';
    }
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, '');
    
    // Remove trailing slash from pathname
    if (u.pathname.length > 1 && u.pathname.endsWith('/')) {
      u.pathname = u.pathname.slice(0, -1);
    }
    
    // Remove common tracking parameters
    const params = new URLSearchParams(u.search);
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'msclkid'];
    trackingParams.forEach(param => params.delete(param));
    
    // Rebuild search string
    const newSearch = params.toString();
    u.search = newSearch ? `?${newSearch}` : '';
    
    // Remove hash
    u.hash = '';
    
    return u.toString();
  } catch {
    return url.toLowerCase().trim();
  }
}
