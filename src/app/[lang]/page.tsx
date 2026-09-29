/**
 * The home page: '/', '/zh-hant/', '/zh-hans/'.
 *
 * The route file holds the wiring only: metadata, structured data, frame and
 * per-request rendering. The page itself is HomeBody in src/components/home.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { HomeBody } from '@/components/home';
import { PageData, SiteFrame } from '@/components/site';
import { getDictionary } from '@/content/get-dictionary';
import { isLocale } from '@/i18n/config';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({ params }: PageProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return buildMetadata(lang, 'home', await getDictionary(lang));
}

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  // Rendered on every request, never at build time.
  await connection();
  const dictionary = await getDictionary(lang);

  return (
    <SiteFrame locale={lang} route="home" dictionary={dictionary}>
      <PageData locale={lang} route="home" dictionary={dictionary} />
      <HomeBody locale={lang} dictionary={dictionary} />
    </SiteFrame>
  );
}
