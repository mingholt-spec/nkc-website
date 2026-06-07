import type { PageBlockHtml } from '@/lib/types';
import { safeStr } from '@/lib/utils';

/**
 * Scope global CSS selectors (*, body, html, :root) to the block's wrapper div.
 * This prevents HTML blocks from resetting margins/padding on the entire page,
 * which would break Tailwind v4 utilities (they live in CSS layers and lose to
 * unlayered CSS regardless of specificity).
 */
function scopeGlobalSelectors(css: string, scope: string): string {
  return css
    .replace(/(?<![.:#\w-])\*\s*(?=[,{])/g, `.${scope} *`)
    .replace(/\bbody\s*(?=[,{])/g, `.${scope}`)
    .replace(/\bhtml\s*(?=[,{])/g, `.${scope}`)
    .replace(/\b:root\s*(?=[,{])/g, `.${scope}`);
}

function stripExternalImports(css: string): string {
  // Remove @import rules that load external resources (Google Fonts etc.)
  // — these cause render-blocking network requests bypassing next/font self-hosting
  return css.replace(/@import\s+url\s*\(\s*['"]?https?:\/\/[^)'"]+['"]?\s*\)\s*;?/gi, '');
}

function scopeStyleTags(html: string, scope: string): string {
  return html.replace(
    /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
    (_, attrs: string, css: string) =>
      `<style${attrs}>${scopeGlobalSelectors(stripExternalImports(css), scope)}</style>`
  );
}

/** Inject a dark-mode override block for AI-generated CSS variables. */
function injectDarkOverrides(html: string, scope: string): string {
  // Find any class names matching the ai-*-wrapper pattern used by AI blocks
  const matches = [...html.matchAll(/\.(ai-[\w-]+)\s*\{/g)].map(m => m[1]);
  const classes = [...new Set(matches)];
  if (classes.length === 0) return html;

  // Build selectors with specificity 0-3-0, beating the block's own 0-1-0 rule
  const selectors = classes.map(c => `.dark .${scope} .${c}`).join(',\n');
  const darkStyle = `<style>
${selectors} {
  --ai-bg: #18181b !important;
  --ai-text-primary: #fafafa !important;
  --ai-text-secondary: #71717a !important;
  --ai-border: rgba(255,255,255,0.08) !important;
  --ai-card-bg: #27272a !important;
  --ai-card-border: rgba(255,255,255,0.08) !important;
  --ai-input-bg: #27272a !important;
  --ai-badge-bg: rgba(229,4,1,0.2) !important;
}
</style>`;
  return html + darkStyle;
}

function addImageHints(html: string): string {
  return html.replace(/<img\b([^>]*?)(\s*\/?>)/gi, (_, attrs: string, tail: string) => {
    let a = attrs;
    if (!/\bdecoding\s*=/.test(a)) a += ' decoding="async"';
    // alt="" is required for accessibility — empty string marks image as decorative
    if (!/\balt\s*=/.test(a)) a += ' alt=""';
    // Reserve 16:9 space if no explicit dimensions — prevents CLS when image loads
    if (!/\bwidth\s*=/.test(a) && !/\bheight\s*=/.test(a)) a += ' width="1200" height="675"';
    return `<img${a}${tail}`;
  });
}

/** Add aria-label to <a> tags that contain only icons/images and no visible text. */
function fixUnnamedLinks(html: string): string {
  return html.replace(/<a\b([^>]*?)>([\s\S]*?)<\/a>/gi, (match, attrs: string, content: string) => {
    if (/\baria-label\s*=/i.test(attrs) || /\btitle\s*=/i.test(attrs)) return match;
    const text = content.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
    if (text.length > 0) return match;
    // No visible text — try img alt (non-empty) as label
    const altMatch = content.match(/\balt\s*=\s*["']([^"']+)["']/i);
    if (altMatch?.[1]?.trim()) return `<a${attrs} aria-label="${altMatch[1].trim()}">${content}</a>`;
    // Fall back to last path segment from href
    const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']*)["']/i);
    const path = (hrefMatch?.[1] ?? '').replace(/[#?].*/, '').split('/').filter(Boolean).pop() ?? '';
    const label = path ? decodeURIComponent(path).replace(/[-_]/g, ' ') : 'Länk';
    return `<a${attrs} aria-label="${label}">${content}</a>`;
  });
}

/** Inject light-mode contrast overrides for AI-generated CSS variables. */
function injectLightOverrides(html: string, scope: string): string {
  // Blocks that already define --ai-text-secondary have their own color scheme
  // (e.g. coloured/dark backgrounds) — don't override their intentional values.
  if (html.includes('--ai-text-secondary')) return html;
  const matches = [...html.matchAll(/\.(ai-[\w-]+)\s*\{/g)].map(m => m[1]);
  const classes = [...new Set(matches)];
  if (classes.length === 0) return html;
  const selectors = classes.map(c => `:not(.dark) .${scope} .${c}`).join(',\n');
  const lightStyle = `<style>
${selectors} {
  --ai-text-secondary: #52525b !important;
}
</style>`;
  return html + lightStyle;
}

interface Props { block: PageBlockHtml }

export default function HtmlBlock({ block }: Props) {
  const html = safeStr(block.code);
  if (!html) return null;
  const scope = `hb-${block.id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const processed = fixUnnamedLinks(addImageHints(injectLightOverrides(injectDarkOverrides(scopeStyleTags(html, scope), scope), scope)));
  return (
    <div className={scope} dangerouslySetInnerHTML={{ __html: processed }} />
  );
}
