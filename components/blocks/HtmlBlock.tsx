'use client';

import { useState, useEffect, useRef } from 'react';
import type { PageBlockHtml } from '@/lib/types';
import { safeStr } from '@/lib/utils';

// Injected into the iframe to report its scroll height so the parent can resize it.
const RESIZE_SCRIPT = `<script>(function(){function r(){window.parent.postMessage({type:'html-block-height',h:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)},'*')}window.addEventListener('load',function(){r();setTimeout(r,600);setTimeout(r,1500)});if(window.ResizeObserver){new ResizeObserver(r).observe(document.body)}})()</script>`;

interface Props { block: PageBlockHtml }

export default function HtmlBlock({ block }: Props) {
  const html = safeStr(block.code);
  const [height, setHeight] = useState(600);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      // Only accept messages from this specific iframe, not other blocks on the page.
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.type === 'html-block-height' && typeof e.data.h === 'number') {
        setHeight(Math.max(200, e.data.h));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  if (!html) return null;

  const srcDoc = html.includes('</body>')
    ? html.replace('</body>', RESIZE_SCRIPT + '</body>')
    : html + RESIZE_SCRIPT;

  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      <iframe
        ref={iframeRef}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        style={{ width: '100%', height, border: 'none', display: 'block' }}
        title="Innehållsblock"
      />
    </div>
  );
}
