/**
 * The feed of the blog (RSS 2.0), one per language: '/blog/feed.xml',
 * '/zh-hant/blog/feed.xml', '/zh-hans/blog/feed.xml'.
 *
 * An entry carries the title, the address, the date and the description of
 * a post, not its text. Drafts are left out.
 */

import { getPosts } from '@/content/blog';
import { getDictionary } from '@/content/get-dictionary';
import { isLocale, localeMeta } from '@/i18n/config';
import { absoluteUrl, feedPath, pagePath, postPath } from '@/i18n/paths';

export const dynamic = 'force-dynamic';

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** An ISO calendar date as RSS wants it: 'Tue, 29 Sep 2026 00:00:00 GMT'. */
function rssDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toUTCString();
}

async function feed(lang: string): Promise<Response> {
  if (!isLocale(lang)) return new Response('Not Found', { status: 404 });
  const [dictionary, all] = await Promise.all([getDictionary(lang), getPosts(lang)]);
  const posts = all.filter((post) => !post.draft);
  const { meta } = dictionary.blog;
  const newest = posts.reduce<string | undefined>((latest, post) => {
    const changed = post.updated ?? post.date;
    return latest === undefined || changed > latest ? changed : latest;
  }, undefined);

  const items = posts.map((post) => {
    const url = escapeXml(absoluteUrl(postPath(lang, post.slug)));
    return [
      '    <item>',
      `      <title>${escapeXml(post.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rssDate(post.date)}</pubDate>`,
      `      <description>${escapeXml(post.description)}</description>`,
      '    </item>',
    ].join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(meta.title)}</title>`,
    `    <link>${escapeXml(absoluteUrl(pagePath(lang, 'blog')))}</link>`,
    `    <description>${escapeXml(meta.description)}</description>`,
    `    <language>${localeMeta[lang].htmlLang}</language>`,
    `    <atom:link href="${escapeXml(absoluteUrl(feedPath(lang)))}" rel="self" type="application/rss+xml"/>`,
    ...(newest ? [`    <lastBuildDate>${rssDate(newest)}</lastBuildDate>`] : []),
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function GET(_request: Request, context: RouteContext<'/[lang]/blog/feed.xml'>) {
  const { lang } = await context.params;
  return feed(lang);
}

export async function HEAD(_request: Request, context: RouteContext<'/[lang]/blog/feed.xml'>) {
  const { lang } = await context.params;
  return feed(lang);
}
