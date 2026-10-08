'use client';
import { useEffect, useRef } from 'react';
import createDOMPurify from 'dompurify';
import type { BlogBanner } from '@/lib/types';

export function BlogSidebar({ banners }: { banners: BlogBanner[] }) {
  const activeBanners = banners.filter(b => b.isActive && b.position === 'sidebar');
  if (activeBanners.length === 0) return null;

  return (
    <aside className="w-full lg:w-[300px] shrink-0 space-y-6">
      {activeBanners.map(banner => (
        <BannerItem key={banner.id} banner={banner} />
      ))}
    </aside>
  );
}

/** Inline-banners som visas mellan inlägg i blogglistan. */
export function InlineBanner({ banner }: { banner: BlogBanner }) {
  if (!banner.isActive || banner.position !== 'inline') return null;
  return <BannerItem banner={banner} />;
}

function BannerItem({ banner }: { banner: BlogBanner }) {
  if (banner.htmlCode) {
    return <HtmlBanner banner={banner} />;
  }

  if (banner.imageUrl) {
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={banner.imageUrl} alt={banner.title || 'Banner'} className="w-full rounded-xl" loading="lazy" />
    );

    if (banner.linkUrl) {
      return (
        <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block hover:opacity-90 transition-opacity">
          {img}
        </a>
      );
    }

    return <div>{img}</div>;
  }

  return null;
}

/**
 * Renderar HTML-banner (AdSense, affiliate etc.) säkert.
 * Samma mönster som bjj-premium/components/public/BlogSidebar.tsx: DOMPurify
 * för innehåll utan script, en sandboxed iframe för innehåll med script.
 */
function HtmlBanner({ banner }: { banner: BlogBanner }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !banner.htmlCode) return;

    const hasScript = /<script\b/i.test(banner.htmlCode);

    if (hasScript) {
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.scrolling = 'no';
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');

      container.innerHTML = '';
      container.appendChild(iframe);

      const doc = iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`<!DOCTYPE html><html><head><style>body{margin:0;overflow:hidden;}</style></head><body>${banner.htmlCode}</body></html>`);
        doc.close();

        const resize = () => {
          if (doc.body) iframe.style.height = `${doc.body.scrollHeight}px`;
        };
        iframe.addEventListener('load', resize);
        setTimeout(resize, 1000);
        setTimeout(resize, 3000);
      }
    } else {
      // dompurify's package "exports" map has no browser-UMD condition, so
      // Next.js/Turbopack resolves the ESM factory build (not the
      // auto-initialized browser bundle Vite apps get) — the import must be
      // explicitly invoked with `window` here, or .sanitize is undefined.
      // Confirmed broken/fixed by hand against a local dev build before
      // wiring this in (same discipline as imageLoader.ts's %2F fix).
      const clean = createDOMPurify(window).sanitize(banner.htmlCode, {
        ADD_TAGS: ['ins'],
        ADD_ATTR: ['data-ad-client', 'data-ad-slot', 'data-ad-format', 'data-full-width-responsive'],
      });
      container.innerHTML = clean;
    }

    return () => {
      container.innerHTML = '';
    };
  }, [banner.htmlCode]);

  return <div ref={containerRef} className="w-full overflow-hidden rounded-xl" />;
}
