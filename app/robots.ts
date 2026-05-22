import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/register',
          '/invite/',
          '/kiosk',
          '/app/',
          '/login',
          '/dashboard',
          '/admin',
          '/profil',
          '/ekonomi',
          '/familj',
          '/gdpr',
          '/payment',
        ],
      },
    ],
    sitemap: 'https://nkc.nu/sitemap.xml',
  };
}
