/**
 * A blog post: '/blog/<slug>/', '/zh-hant/blog/<slug>/',
 * '/zh-hans/blog/<slug>/'. A slug that no post has answers 404: src/proxy.ts
 * sends it to the not-found page before this route is reached, and the
 * checks below are the second line.
 *
 * The route file holds the wiring (metadata, structured data, frame); the
 * body of the page is PostPage from '@/components/blog'.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { PostData, PostPage } from '@/components/blog';
import { SiteFrame } from '@/components/site';
import { getPost } from '@/content/blog';
import { getDictionary } from '@/content/get-dictionary';
import { isLocale } from '@/i18n/config';
import { buildPostMetadata } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/blog/[slug]'>): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const post = await getPost(lang, slug);
  if (post === undefined) notFound();
  return buildPostMetadata(lang, post, await getDictionary(lang));
}

export default async function BlogPostPage({ params }: PageProps<'/[lang]/blog/[slug]'>) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  // Rendered on every request, never at build time.
  await connection();
  const post = await getPost(lang, slug);
  if (post === undefined) notFound();
  const dictionary = await getDictionary(lang);

  return (
    <SiteFrame locale={lang} route="blog" slug={post.slug} dictionary={dictionary}>
      <PostData locale={lang} post={post} dictionary={dictionary} />
      <PostPage locale={lang} dictionary={dictionary} post={post} />
    </SiteFrame>
  );
}
