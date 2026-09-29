/**
 * /sitemap.xml: the pages, each with its hreflang alternates, in the order
 * of the old file (routes in order, languages in alternateOrder), then the
 * blog posts, newest first. Drafts are not in production builds, so they are
 * not listed.
 */

import type { MetadataRoute } from 'next';

import { postFacts } from '@/content/blog-generated/facts';
import { site } from '@/content/site';
import { alternateOrder } from '@/i18n/config';
import { absoluteUrl, pagePath, postPath, routeKeys } from '@/i18n/paths';
import { languageAlternates, postAlternates } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = routeKeys.flatMap((route) => {
    const languages = languageAlternates(route);
    return alternateOrder.map((locale) => ({
      url: absoluteUrl(pagePath(locale, route)),
      lastModified: site.lastUpdated,
      alternates: { languages },
    }));
  });
  const posts = postFacts
    .filter((post) => !post.draft)
    .flatMap((post) => {
      const languages = postAlternates(post.slug);
      return alternateOrder.map((locale) => ({
        url: absoluteUrl(postPath(locale, post.slug)),
        lastModified: post.updated ?? post.date,
        alternates: { languages },
      }));
    });
  return [...pages, ...posts];
}
