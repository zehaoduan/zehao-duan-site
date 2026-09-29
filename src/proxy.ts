/**
 * The proxy (the Next.js 16 name for middleware). It runs before every
 * request that reaches the Worker and does four things:
 *
 *  1. URL scheme. English pages have no prefix: '/' and '/public-key/' are
 *     rewritten internally to '/en/' and '/en/public-key/'. The internal
 *     prefix itself is not part of the scheme, so '/en/...' answers 404.
 *     The same goes for a file route with a slash appended
 *     ('/public-key/pgp.asc/'), and for the address of a blog post that
 *     does not exist ('/blog/no-such-post/').
 *  2. A fresh nonce and the Content-Security-Policy built from it.
 *  3. Security headers on the response.
 *  4. The x-locale and x-nonce request headers for the renderer.
 *
 * No language negotiation: the language comes from the URL only.
 *
 * Files served by the assets layer (/_next/static/*, /favicon.svg,
 * /media/*) never reach the Worker; their headers are in
 * public/_headers.
 */

import { NextResponse, type NextRequest } from 'next/server';

import { postFacts } from '@/content/blog-generated/facts';
import { defaultLocale, isLocale } from '@/i18n/config';
import { LOCALE_HEADER, NONCE_HEADER } from '@/lib/request-headers';

/**
 * The routes that are files. They have one address for all languages and no
 * trailing slash. Any other URL is a page URL or does not exist.
 */
const fileRoutes: ReadonlySet<string> = new Set([
  '/public-key/pgp.asc',
  '/public-key/ssh.pub',
  '/sitemap.xml',
  '/robots.txt',
]);

/**
 * The files in public/. In production the assets layer serves them before
 * the Worker runs; under `next dev` they pass through here and must not be
 * rewritten below the language prefix.
 */
const publicFiles: ReadonlySet<string> = new Set(['/favicon.svg']);

/**
 * The pictures of the blog posts and the portrait, written to public/media/
 * by scripts/generate-blog.mjs and scripts/generate-photo.mjs. One address for all languages, like the files
 * above.
 */
const mediaPrefix = '/media/';

/**
 * The feed of the blog is a file with one address per language
 * ('/blog/feed.xml', '/zh-hans/blog/feed.xml'). It goes the way of a page
 * (the English one is rewritten below the internal prefix), but has no form
 * with a slash appended.
 */
const feedWithSlash = /^(?:\/[^/]+)?\/blog\/feed\.xml\/$/;

/**
 * The blog posts that exist. The page of a post that does not exist must
 * not be rendered: notFound() inside a page cannot show the not-found page
 * of the site, which stands outside the layout. So the proxy sends such an
 * address to the not-found page itself.
 */
const postSlugs: ReadonlySet<string> = new Set(postFacts.map((post) => post.slug));
const blogSegment = 'blog';
const feedFile = 'feed.xml';

/** A path that matches no route, so the global not-found page answers. */
const NOT_FOUND_PATH = '/not-found/not-found/';

/**
 * The policy. script-src and style-src are nonce-based: server-rendered HTML
 * must not contain style attributes or inline scripts without the nonce.
 * Styles that scripts set through the CSSOM after hydration (tooltip
 * position, color-scheme on <html>) are not affected by style-src.
 *
 * Development only: React and Turbopack need eval and inline styles.
 */
function contentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] ?? '';
  const isFileRoute =
    fileRoutes.has(pathname) || publicFiles.has(pathname) || pathname.startsWith(mediaPrefix);
  // trailingSlash would also serve a file route with a slash appended.
  const isFileRouteWithSlash =
    (pathname.endsWith('/') && fileRoutes.has(pathname.slice(0, -1))) ||
    feedWithSlash.test(pathname);

  const nonce = btoa(crypto.randomUUID());
  const csp = contentSecurityPolicy(nonce);

  const urlLocale = isLocale(firstSegment) ? firstSegment : defaultLocale;

  // '/blog/<slug>/' and '/zh-hans/blog/<slug>/' with a slug that no post has
  const [section, slug, ...deeper] = isLocale(firstSegment) ? segments.slice(1) : segments;
  const isMissingPost =
    section === blogSegment &&
    slug !== undefined &&
    deeper.length === 0 &&
    slug !== feedFile &&
    !postSlugs.has(slug);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(NONCE_HEADER, nonce);
  requestHeaders.set('content-security-policy', csp);
  requestHeaders.set(LOCALE_HEADER, urlLocale);

  let response: NextResponse;
  if (firstSegment === defaultLocale || isFileRouteWithSlash || isMissingPost) {
    const url = request.nextUrl.clone();
    url.pathname = NOT_FOUND_PATH;
    response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  } else if (urlLocale !== defaultLocale || isFileRoute) {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    // An English page, or a URL that does not exist: below the internal
    // prefix the first segment can never be mistaken for a language.
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // For browsers that do not know frame-ancestors.
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  // The site uses none of these.
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  );
  return response;
}

export const config = {
  // Everything except the build output. Prefetch requests are not excluded:
  // they need the rewrite as much as any other request.
  matcher: ['/((?!_next/static|_next/image).*)'],
};
