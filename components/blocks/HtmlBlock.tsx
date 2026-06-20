import type { PageBlockHtml } from '@/lib/types';
import { safeStr } from '@/lib/utils';

/** Scope a single CSS selector to the block's parent class. */
function scopeSelector(sel: string, scope: string): string {
  const trimmed = sel.trim();
  // .dark prefix must remain on an ancestor outside the block
  if (trimmed.startsWith('.dark ')) {
    return `.dark .${scope} ${trimmed.slice(6)}`;
  }
  return `.${scope} ${trimmed}`;
}

/**
 * Scope ALL CSS selectors in a stylesheet to a parent class so styles
 * don't leak to other page elements or other blocks on the same page.
 * Also strips dangerous properties and external @import rules.
 */
function scopeAllCss(css: string, scope: string): string {
  if (css.length > 50000) {
    css = css.slice(0, 50000);
  }
  // Strip CSS comments
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // Strip external @import rules (Google Fonts etc.)
  const noImports = stripped.replace(/@import\s+url\s*\(\s*['"]?https?:\/\/[^)'"]+['"]?\s*\)\s*;?/gi, '');
  // Strip dangerous positioning and interaction properties
  const safe = noImports
    .replace(/position\s*:\s*(?:fixed|sticky)\s*;?/gi, '')
    .replace(/pointer-events\s*:[^;]*;?/gi, '');

  let result = '';
  let depth = 0;
  let inAtRule = false;
  let current = '';

  for (let i = 0; i < safe.length; i++) {
    const ch = safe[i];
    if (ch === '{') {
      if (depth === 0) {
        const selector = current.trim();
        if (selector.startsWith('@keyframes') || selector.startsWith('@font-face')) {
          result += current + '{';
          inAtRule = true;
        } else if (selector.startsWith('@')) {
          result += current + '{';
          inAtRule = false;
        } else {
          const scoped = selector.split(',')
            .map(s => scopeSelector(s, scope))
            .join(', ');
          result += scoped + ' {';
        }
        current = '';
      } else {
        if (depth === 1 && !inAtRule) {
          const selector = current.trim();
          if (selector) {
            const scoped = selector.split(',')
              .map(s => scopeSelector(s, scope))
              .join(', ');
            result += scoped + ' {';
          } else {
            result += '{';
          }
          current = '';
        } else {
          result += current + '{';
          current = '';
        }
      }
      depth++;
    } else if (ch === '}') {
      depth = Math.max(0, depth - 1);
      result += current + '}';
      current = '';
      if (depth === 0) inAtRule = false;
    } else {
      current += ch;
    }
  }
  result += current;
  return result;
}

function scopeStyleTags(html: string, scope: string): string {
  return html.replace(
    /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
    (_, attrs: string, css: string) =>
      `<style${attrs}>${scopeAllCss(css, scope)}</style>`
  );
}

/**
 * Sanitize HTML class attributes to prevent Tailwind positioning classes
 * (fixed, sticky, high z-index) from affecting the parent page layout.
 * nkc.nu uses Tailwind v4 globally — AI-generated 'fixed'/'sticky' classes
 * would apply from the site's own stylesheet and break out of the block.
 */
function sanitizeHtmlClasses(html: string): string {
  if (!html.includes('class=')) return html;
  return html.replace(/class="([^"]*)"/gi, (_match, classes: string) => {
    const safe = classes
      .split(/\s+/)
      .filter(Boolean)
      .map(cls => {
        if (cls === 'fixed' || cls === 'sticky') return 'relative';
        if (/^z-\[/.test(cls)) return 'z-0';
        const zMatch = /^z-(\d+)$/.exec(cls);
        if (zMatch && parseInt(zMatch[1], 10) > 10) return 'z-0';
        return cls;
      })
      .filter(Boolean)
      .join(' ');
    return `class="${safe}"`;
  });
}

function addImageHints(html: string): string {
  return html.replace(/<img\b([^>]*?)(\s*\/?>)/gi, (_, attrs: string, tail: string) => {
    let a = attrs;
    if (!/\bdecoding\s*=/.test(a)) a += ' decoding="async"';
    if (!/\balt\s*=/.test(a)) a += ' alt=""';
    if (!/\bwidth\s*=/.test(a) && !/\bheight\s*=/.test(a)) a += ' width="1200" height="675"';
    return `<img${a}${tail}`;
  });
}

function fixUnnamedLinks(html: string): string {
  return html.replace(/<a\b([^>]*?)>([\s\S]*?)<\/a>/gi, (match, attrs: string, content: string) => {
    if (/\baria-label\s*=/i.test(attrs) || /\btitle\s*=/i.test(attrs)) return match;
    const text = content.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
    if (text.length > 0) return match;
    const altMatch = content.match(/\balt\s*=\s*["']([^"']+)["']/i);
    if (altMatch?.[1]?.trim()) return `<a${attrs} aria-label="${altMatch[1].trim()}">${content}</a>`;
    const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']*)["']/i);
    const path = (hrefMatch?.[1] ?? '').replace(/[#?].*/, '').split('/').filter(Boolean).pop() ?? '';
    const label = path ? decodeURIComponent(path).replace(/[-_]/g, ' ') : 'Länk';
    return `<a${attrs} aria-label="${label}">${content}</a>`;
  });
}

/** Inject a dark-mode override block for AI-generated CSS variables. */
function injectDarkOverrides(html: string, scope: string): string {
  const matches = [...html.matchAll(/\.(ai-[\w-]+)\s*\{/g)].map(m => m[1]);
  const classes = [...new Set(matches)];
  if (classes.length === 0) return html;
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

/** Inject light-mode contrast overrides for AI-generated CSS variables. */
function injectLightOverrides(html: string, scope: string): string {
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
  const processed = injectLightOverrides(
    injectDarkOverrides(
      fixUnnamedLinks(
        addImageHints(
          sanitizeHtmlClasses(
            scopeStyleTags(html, scope)
          )
        )
      ),
      scope
    ),
    scope
  );
  return (
    <div
      className={scope}
      // position:relative + z-index:0 creates a stacking context so children
      // with high z-index can't stack above nkc.nu's own navbar/elements
      style={{ position: 'relative', zIndex: 0 }}
      dangerouslySetInnerHTML={{ __html: processed }}
    />
  );
}
