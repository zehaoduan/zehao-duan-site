/**
 * Builders for the <head> of the pages. They reproduce the head of the old
 * static pages from the dictionaries and site.ts.
 *
 *   buildMetadata(locale, route, dictionary)  for generateMetadata of a page
 *   openGraphTags(locale, route, dictionary)  Open Graph tags that cannot go
 *                                             through the Metadata object
 *   buildPostMetadata(locale, post, dictionary)  the same two for a blog post
 *   postOpenGraphTags(locale, post, dictionary)
 *   postAlternates(slug)                      hreflang map of a blog post
 *   buildNotFoundMetadata(dictionaries)       for the global not-found page
 *   viewport                                  color-scheme and theme-color
 *   languageAlternates(route)                 hreflang map, also for the sitemap
 */

import type { Metadata, Viewport } from 'next';

import { site } from '@/content/site';
import type { Dictionary, HomeMeta, PageMeta, PostSummary } from '@/content/types';
import { alternateOrder, defaultLocale, localeMeta, type Locale } from '@/i18n/config';
import { absoluteUrl, feedPath, pagePath, postPath, type RouteKey } from '@/i18n/paths';

/** Address of the favicon (public/favicon.svg, served by the assets layer). */
export const faviconPath = '/favicon.svg';

/** theme-color of the design: the card colour of the header band. */
export const themeColor = { light: '#ffffff', dark: '#141619' } as const;

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: themeColor.light },
    { media: '(prefers-color-scheme: dark)', color: themeColor.dark },
  ],
};

/** Links that every page carries: the icon and the pointer to the sitemap. */
const icons: Metadata['icons'] = {
  icon: [{ url: faviconPath, type: 'image/svg+xml' }],
  other: [{ rel: 'sitemap', type: 'application/xml', url: '/sitemap.xml' }],
};

/**
 * hreflang alternates of a route as absolute URLs, in the order of the old
 * pages: en, zh-Hans, zh-Hant, then x-default (the English page).
 */
export function languageAlternates(route: RouteKey): Record<string, string> {
  return alternates((locale) => pagePath(locale, route));
}

/** The same for a blog post, which exists in every language under the same slug. */
export function postAlternates(slug: string): Record<string, string> {
  return alternates((locale) => postPath(locale, slug));
}

function alternates(path: (locale: Locale) => string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of alternateOrder) {
    map[localeMeta[locale].hreflang] = absoluteUrl(path(locale));
  }
  map['x-default'] = absoluteUrl(path(defaultLocale));
  return map;
}

/** The pointer to the feed of the blog, on the pages of the blog. */
function feedAlternate(locale: Locale, dictionary: Dictionary) {
  return {
    'application/rss+xml': [{ url: absoluteUrl(feedPath(locale)), title: dictionary.blog.meta.title }],
  };
}

function isHomeMeta(meta: PageMeta | HomeMeta): meta is HomeMeta {
  return 'profile' in meta;
}

/**
 * Whether the Open Graph data of a route goes through the Metadata object.
 *
 * Next.js fills in Twitter card tags from the Open Graph data whenever a
 * page has Open Graph data in its Metadata object, and offers no way to
 * switch that off. The old public-key pages have Open Graph tags and no
 * Twitter card, so for a route without a Twitter card the Open Graph tags
 * are rendered as plain <meta> elements instead (see openGraphTags), which
 * React moves into <head>.
 */
function openGraphInMetadata(route: RouteKey): boolean {
  return site.pages[route].twitterCard !== undefined;
}

export function buildMetadata(locale: Locale, route: RouteKey, dictionary: Dictionary): Metadata {
  const meta: PageMeta | HomeMeta = dictionary[route].meta;
  const settings = site.pages[route];
  const url = absoluteUrl(pagePath(locale, route));
  const imageUrl = absoluteUrl(site.photo.src);
  const home = isHomeMeta(meta) ? meta : undefined;

  const base: Metadata = {
    metadataBase: new URL(site.origin),
    title: meta.title,
    description: meta.description,
    authors: [{ name: meta.author }],
    robots: settings.robots,
    alternates: {
      canonical: url,
      languages: languageAlternates(route),
      ...(route === 'blog' ? { types: feedAlternate(locale, dictionary) } : {}),
    },
    icons,
  };

  if (!openGraphInMetadata(route)) return base;

  const openGraphBase = {
    siteName: meta.siteName,
    locale: localeMeta[locale].ogLocale,
    alternateLocale: alternateOrder
      .filter((other) => other !== locale)
      .map((other) => localeMeta[other].ogLocale),
    url,
    title: meta.title,
    description: meta.ogDescription,
    ...(settings.image && home
      ? {
          images: [
            {
              url: imageUrl,
              alt: home.imageAlt,
              width: site.photo.width,
              height: site.photo.height,
            },
          ],
        }
      : {}),
  };

  return {
    ...base,
    openGraph:
      settings.ogType === 'profile' && home
        ? {
            type: 'profile',
            ...openGraphBase,
            firstName: home.profile.firstName,
            lastName: home.profile.lastName,
          }
        : { type: 'website', ...openGraphBase },
    ...(settings.twitterCard && home
      ? {
          twitter: {
            card: settings.twitterCard,
            title: home.title,
            description: home.twitterDescription,
            ...(settings.image ? { images: [{ url: imageUrl, alt: home.imageAlt }] } : {}),
          },
        }
      : {}),
  };
}

export interface OpenGraphTag {
  property: string;
  content: string;
}

/**
 * The Open Graph tags of a route whose Open Graph data does not go through
 * the Metadata object, in the order of the old pages. Empty for the others.
 */
export function openGraphTags(
  locale: Locale,
  route: RouteKey,
  dictionary: Dictionary,
): OpenGraphTag[] {
  const settings = site.pages[route];
  if (openGraphInMetadata(route) || settings.ogType === undefined) return [];
  const meta: PageMeta = dictionary[route].meta;
  return [
    { property: 'og:type', content: settings.ogType },
    { property: 'og:site_name', content: meta.siteName },
    { property: 'og:locale', content: localeMeta[locale].ogLocale },
    ...alternateOrder
      .filter((other) => other !== locale)
      .map((other) => ({ property: 'og:locale:alternate', content: localeMeta[other].ogLocale })),
    { property: 'og:url', content: absoluteUrl(pagePath(locale, route)) },
    { property: 'og:title', content: meta.title },
    { property: 'og:description', content: meta.ogDescription },
  ];
}

/** A draft is never published, but a preview of it must not be indexed either. */
const draftRobots = 'noindex, nofollow';

/** Title of a post in the head: the title of the post, then the owner's name. */
function postTitle(post: PostSummary, dictionary: Dictionary): string {
  return `${post.title} — ${dictionary.blog.meta.siteName}`;
}

export function buildPostMetadata(
  locale: Locale,
  post: PostSummary,
  dictionary: Dictionary,
): Metadata {
  return {
    metadataBase: new URL(site.origin),
    title: postTitle(post, dictionary),
    description: post.description,
    authors: [{ name: dictionary.blog.meta.author }],
    robots: post.draft ? draftRobots : site.pages.blog.robots,
    alternates: {
      canonical: absoluteUrl(postPath(locale, post.slug)),
      languages: postAlternates(post.slug),
      types: feedAlternate(locale, dictionary),
    },
    icons,
  };
}

/**
 * The Open Graph tags of a blog post, as plain <meta> elements like those of
 * the public-key pages (see openGraphInMetadata).
 */
export function postOpenGraphTags(
  locale: Locale,
  post: PostSummary,
  dictionary: Dictionary,
): OpenGraphTag[] {
  const { cover } = post;
  return [
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: dictionary.blog.meta.siteName },
    { property: 'og:locale', content: localeMeta[locale].ogLocale },
    ...alternateOrder
      .filter((other) => other !== locale)
      .map((other) => ({ property: 'og:locale:alternate', content: localeMeta[other].ogLocale })),
    { property: 'og:url', content: absoluteUrl(postPath(locale, post.slug)) },
    { property: 'og:title', content: post.title },
    { property: 'og:description', content: post.description },
    ...(cover
      ? [
          { property: 'og:image', content: absoluteUrl(cover.src) },
          { property: 'og:image:width', content: String(cover.width) },
          { property: 'og:image:height', content: String(cover.height) },
          ...(post.coverAlt ? [{ property: 'og:image:alt', content: post.coverAlt }] : []),
        ]
      : []),
    { property: 'article:published_time', content: post.date },
    ...(post.updated ? [{ property: 'article:modified_time', content: post.updated }] : []),
  ];
}

/**
 * Head of the not-found page, which speaks three languages at once. As on
 * the old 404.html, the title is the status code followed by the three page
 * titles, and the description is the three descriptions in a row; the order
 * is en, zh-Hans, zh-Hant.
 */
export function buildNotFoundMetadata(dictionaries: Record<Locale, Dictionary>): Metadata {
  const prefix = `${site.notFound.code} — `;
  const metas = alternateOrder.map((locale) => dictionaries[locale].notFound.meta);
  const titles = metas.map((meta) =>
    meta.title.startsWith(prefix) ? meta.title.slice(prefix.length) : meta.title,
  );
  // A sentence in Latin script is followed by a space, a Chinese one is not.
  const description = metas
    .map((meta, index) =>
      index < metas.length - 1 && /[\u0000-\u007f]$/.test(meta.description)
        ? `${meta.description} `
        : meta.description,
    )
    .join('');

  return {
    metadataBase: new URL(site.origin),
    title: `${prefix}${titles.join(' / ')}`,
    description,
    robots: site.pages.notFound.robots,
    icons: { icon: [{ url: faviconPath, type: 'image/svg+xml' }] },
  };
}
