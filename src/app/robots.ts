/** /robots.txt. The old file holds the Sitemap line only; so does this one. */

import type { MetadataRoute } from 'next';

import { absoluteUrl } from '@/i18n/paths';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
