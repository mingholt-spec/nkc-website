import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    // Next.js's built-in /_next/image optimizer is not available on Firebase App
    // Hosting (returns 404 in production) — this is a known, documented Firebase
    // limitation, not a bug in this app. Routed through the "Image Processing"
    // Firebase Extension instead (see lib/imageLoader.ts + the /_fah/image rewrite
    // below). https://firebase.google.com/docs/app-hosting/optimize-image-loading
    loader: 'custom',
    loaderFile: './lib/imageLoader.ts',
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/_fah/image/:path*',
        destination: 'https://europe-west1-bjj-manager-pro.cloudfunctions.net/ext-image-processing-api-handler/:path*',
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
