'use client';

import { useState, useEffect } from 'react';
import SiteFooter from '@/components/layout/SiteFooter';
import type { ClubConfig, WebsiteConfig } from '@/lib/types';

interface Props {
  club: ClubConfig;
  config: WebsiteConfig | null;
}

export default function EventLayoutFooter({ club, config }: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const theme = config?.theme;
  const resolvedColors = isDark
    ? { bg: theme?.darkBackground ?? '#18181b', text: theme?.darkTextColor ?? '#fafafa' }
    : { bg: theme?.backgroundColor ?? '#ffffff', text: theme?.textColor ?? '#3f3f46' };

  return <SiteFooter club={club} config={config} resolvedColors={resolvedColors} />;
}
