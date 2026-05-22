'use client';
import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_ID = 'G-2756QCH7SC';

export default function GoogleAnalytics() {
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('nkc_cookie_consent');
        if (!raw) return;
        const parsed = JSON.parse(raw) as { analytics?: boolean };
        if (!parsed.analytics) return;
      } catch {
        return;
      }
      if (document.getElementById('ga4-script')) return;

      window.dataLayer = window.dataLayer || [];
      window.gtag = function (...args: unknown[]) { window.dataLayer.push(args); };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, { anonymize_ip: true });

      const script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
    };

    load();
    window.addEventListener('nkc:consent', load);
    return () => window.removeEventListener('nkc:consent', load);
  }, []);

  return null;
}
