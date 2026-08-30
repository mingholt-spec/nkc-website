'use client';

import { useState, useEffect } from 'react';
import type { Campaign } from '@/lib/types';
import EventPageClient from './EventPageClient';

interface Props { campaign: Campaign }

// Samma tekink som components/blocks/HtmlBlock.tsx — iframen är ett separat
// dokument med sin egen <html>, som aldrig ärver sajtens `.dark`-klass. Utan
// detta kan AI-genererad `.dark`-CSS i en helsides-HTML-kampanj aldrig matcha.
function darkModeScript(isDark: boolean): string {
  return `<script>if(${isDark})document.documentElement.classList.add('dark');</script>`;
}

export default function EventPage({ campaign }: Props) {
  const { mode, htmlContent, pageConfig } = campaign;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
    const observer = new MutationObserver(() => setIsDark(root.classList.contains('dark')));
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  if (mode === 'html' && htmlContent) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <iframe
          srcDoc={darkModeScript(isDark) + htmlContent}
          sandbox="allow-scripts allow-forms allow-same-origin"
          style={{ width: '100%', minHeight: '100vh', border: 'none', display: 'block' }}
          title={pageConfig.title}
        />
      </div>
    );
  }

  return <EventPageClient campaign={campaign} />;
}
