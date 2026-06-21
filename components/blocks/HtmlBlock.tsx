'use client';

import { useState, useEffect, useRef } from 'react';
import type { PageBlockHtml } from '@/lib/types';
import { safeStr } from '@/lib/utils';

// Injected into the iframe to report its scroll height so the parent can resize it.
// Timed snapshots only — no ResizeObserver — to prevent a 100vh feedback loop:
// resizing the iframe changes the iframe viewport, which changes 100vh element
// heights, which changes scrollHeight, triggering another resize ad infinitum.
const RESIZE_SCRIPT = `<script>(function(){function r(){var h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight);window.parent.postMessage({type:'html-block-height',h:h},'*')}window.addEventListener('load',function(){setTimeout(r,200);setTimeout(r,1000);setTimeout(r,3000)})})()</script>`;

interface Props { block: PageBlockHtml }

export default function HtmlBlock({ block }: Props) {
  const html = safeStr(block.code);
  const [height, setHeight] = useState(600);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.type === 'html-block-height' && typeof e.data.h === 'number') {
        setHeight(prev => {
          const next = Math.max(200, Math.min(e.data.h as number, 15000));
          return Math.abs(next - prev) < 10 ? prev : next;
        });
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
