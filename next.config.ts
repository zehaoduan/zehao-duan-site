import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR lets two dev servers run side by side, each with its own
  // build folder (for example NEXT_DIST_DIR=.next-home npm run dev -- --port 3101).
  // Production builds never set it: OpenNext expects '.next'.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // Every page URL ends with a slash, as on the old static site.
  trailingSlash: true,
  poweredByHeader: false,
  // The portrait is a plain <img>; this only makes sure that no /_next/image
  // request can ever be produced.
  images: { unoptimized: true },
  // cacheComponents stays off: prerendered HTML cannot carry a per-request
  // CSP nonce.
  experimental: {
    globalNotFound: true,
    // No Turbopack cache on disk. The project folder may lie in a folder that
    // a file-sync service keeps in step (iCloud Drive and the like); such a
    // service makes copies of the cache files ("00000001 2.sst"), after which
    // the build stops with "Failed to open database". The site builds in a
    // few seconds without the cache.
    turbopackFileSystemCacheForDev: false,
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
