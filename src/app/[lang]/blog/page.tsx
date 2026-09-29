/**
 * The list of blog posts: '/blog/', '/zh-hant/blog/', '/zh-hans/blog/'.
 *
 * The route file holds the wiring (metadata, structured data, frame); the
 * body of the page is BlogPage from '@/components/blog'.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { BlogPage } from '@/components/blog';
import { PageData, SiteFrame } from '@/components/site';
import { getPosts } from '@/content/blog';
import { getDictionary } from '@/content/get-dictionary';
import { isLocale } from '@/i18n/config';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: PageProps<'/[lang]/blog'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return buildMetadata(lang, 'blog', await getDictionary(lang));
}

export default async function BlogListPage({ params }: PageProps<'/[lang]/blog'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  // Rendered on every request, never at build time.
  await connection();
  const [dictionary, posts] = await Promise.all([getDictionary(lang), getPosts(lang)]);

  return (
    <SiteFrame locale={lang} route="blog" dictionary={dictionary}>
      <PageData locale={lang} route="blog" dictionary={dictionary} />
      <BlogPage locale={lang} dictionary={dictionary} posts={posts} />
    </SiteFrame>
  );
}
