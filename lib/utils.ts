/** Safely convert any Firestore value to a string — prevents [object Object] rendering */
export function safeStr(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return fallback; // Objects (Timestamps, nested objects) → fallback
}

/**
 * Normalizes link targets in editor-generated HTML:
 * - Internal links (/path, #anchor) → removes target="_blank"
 * - External links (https://…) → ensures target="_blank" rel="noopener noreferrer"
 *
 * RichTextEditor used to apply target="_blank" to ALL links globally. This corrects
 * that for existing Firestore content without requiring a data migration.
 */
export function normalizeLinks(html: string): string {
  if (!html.includes('<a')) return html;
  return html.replace(/<a\b([^>]*)>/gi, (_match, attrs: string) => {
    const hrefMatch = /href\s*=\s*["']([^"']*)["']/i.exec(attrs);
    if (!hrefMatch) return `<a${attrs}>`;
    const href = hrefMatch[1];
    const isInternal = href.startsWith('/') || href.startsWith('#') || !href.includes('://');
    // Strip any existing target/rel so we can set them correctly
    const cleaned = attrs
      .replace(/\s+target\s*=\s*["'][^"']*["']/gi, '')
      .replace(/\s+rel\s*=\s*["'][^"']*["']/gi, '');
    if (isInternal) {
      return `<a${cleaned}>`;
    }
    return `<a${cleaned} target="_blank" rel="noopener noreferrer">`;
  });
}
