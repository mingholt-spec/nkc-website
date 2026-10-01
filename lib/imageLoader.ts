/**
 * Custom next/image loader routed through our own self-managed
 * `imageProcessingHandler` Cloud Function (bjj-premium/functions/src/index.ts),
 * because Next's own built-in /_next/image optimizer 404s on Firebase App
 * Hosting — a known, documented Firebase limitation, not something wrong in
 * this app. https://firebase.google.com/docs/app-hosting/optimize-image-loading
 *
 * Was previously routed through the invertase/image-processing-api Firebase
 * Extension (deprecated by Google, decommissioned 2027-03-31); migrated
 * 2026-10-01 to a self-managed function that deliberately reproduces the
 * extension's exact request/response shape, including this quirk:
 * Express's own query-string parsing already decodes `operations` once, and
 * the handler calls decodeURIComponent on it again, which also collapses any
 * %2F already inside the source URL (Firebase Storage encodes "folder"
 * separators in object paths as %2F) back into a literal `/`, breaking the
 * fetch. Pre-escaping `%` to `%25` here makes it survive that extra decode
 * pass intact. Confirmed by hand against the deployed function before wiring
 * this in — without the escape it 500s with an "Unable to fetch image" error
 * from the Storage URL missing its %2F.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
  if (process.env.NODE_ENV === 'development') {
    return src;
  }

  const safeSrc = src.replace(/%/g, '%25');
  const operations = [
    { operation: 'input', type: 'url', url: safeSrc },
    { operation: 'resize', width },
    { operation: 'output', format: 'webp', quality: quality || 75 },
  ];

  const encodedOperations = encodeURIComponent(JSON.stringify(operations));
  return `/_fah/image/process?operations=${encodedOperations}`;
}
