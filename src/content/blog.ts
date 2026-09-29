/**
 * The blog posts, as the pages read them.
 *
 *   getPosts(locale)        the posts of a language, newest first, without text
 *   getPost(locale, slug)   one post with its text, or undefined
 *
 * The posts are Markdown files in src/content/blog/<slug>/. At build time
 * scripts/generate-blog.mjs turns them into the modules of blog-generated/,
 * which this module loads. The Worker has no file system, so nothing is read
 * from disk when a request comes in.
 *
 * Pages use these two functions only. If the posts move elsewhere (a
 * database, for example), this module is the one to change.
 *
 * Server only.
 */

import 'server-only';

import type { Locale } from '@/i18n/config';

import { summaryLoaders, textLoaders } from './blog-generated/loaders';
import type { Post, PostSummary } from './types';

export async function getPosts(locale: Locale): Promise<readonly PostSummary[]> {
  return summaryLoaders[locale]();
}

export async function getPost(locale: Locale, slug: string): Promise<Post | undefined> {
  const texts = textLoaders[locale];
  // hasOwn: a slug from a URL must not find 'constructor' and the like
  if (!Object.hasOwn(texts, slug)) return undefined;
  const summary = (await getPosts(locale)).find((post) => post.slug === slug);
  if (summary === undefined) return undefined;
  return { ...summary, html: await texts[slug]() };
}
