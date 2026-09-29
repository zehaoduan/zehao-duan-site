/**
 * The blog posts, as the pages read them.
 *
 *   getPosts(locale)        the posts of a language, newest first, without text
 *   getPost(locale, slug)   one post with its text and the links to the posts
 *                           before and after it, or undefined
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
  const posts = await getPosts(locale);
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return undefined;
  // the list is newest first: the post before this one in time stands after it
  const previous = posts[index + 1];
  const next = posts[index - 1];
  return {
    ...posts[index],
    html: await texts[slug](),
    ...(previous ? { previous: { slug: previous.slug, title: previous.title } } : {}),
    ...(next ? { next: { slug: next.slug, title: next.title } } : {}),
  };
}
