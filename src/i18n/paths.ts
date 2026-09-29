/**
 * Site paths. Every page URL of the site ends with a slash, as on the old
 * static site ('/', '/public-key/', '/zh-hans/', '/zh-hans/public-key/').
 *
 * A blog post has the address of the blog followed by its slug, which is the
 * same in every language ('/blog/my-post/', '/zh-hans/blog/my-post/').
 */

import { site } from '@/content/site';
import { localeMeta, type Locale } from '@/i18n/config';

export type RouteKey = 'home' | 'keys' | 'blog';

/** Order of the routes in the sitemap. The order of the header is in SiteFrame. */
export const routeKeys: readonly RouteKey[] = ['home', 'keys', 'blog'];

/** Path of each route below the language prefix, with its trailing slash. */
const routeSegment: Record<RouteKey, string> = {
  home: '',
  keys: 'public-key/',
  blog: 'blog/',
};

/** Site path of a page in a language, for example pagePath('zh-hans', 'keys') gives '/zh-hans/public-key/'. */
export function pagePath(locale: Locale, route: RouteKey): string {
  return `${localeMeta[locale].pathPrefix}/${routeSegment[route]}`;
}

/** Site path of a blog post in a language: postPath('zh-hans', 'my-post') gives '/zh-hans/blog/my-post/'. */
export function postPath(locale: Locale, slug: string): string {
  return `${pagePath(locale, 'blog')}${slug}/`;
}

/** Site path of the feed of the blog in a language: '/blog/feed.xml', '/zh-hans/blog/feed.xml'. */
export function feedPath(locale: Locale): string {
  return `${pagePath(locale, 'blog')}feed.xml`;
}

/**
 * Site path of a page, or of a blog post when a slug is given. For links
 * that lead to 'the same page' in another language.
 */
export function routePath(locale: Locale, route: RouteKey, slug?: string): string {
  return route === 'blog' && slug !== undefined ? postPath(locale, slug) : pagePath(locale, route);
}

/** Absolute URL of a site path ('/favicon.svg' gives 'https://zehao-duan.com/favicon.svg'). */
export function absoluteUrl(path: string): string {
  return `${site.origin}${path.startsWith('/') ? path : `/${path}`}`;
}
