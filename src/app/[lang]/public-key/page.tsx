/**
 * The public-key page: '/public-key/', '/zh-hant/public-key/',
 * '/zh-hans/public-key/'.
 *
 * The route file holds the wiring (metadata, structured data, frame); the
 * body of the page is KeysPage from '@/components/keys'.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { KeysPage } from '@/components/keys';
import { PageData, SiteFrame } from '@/components/site';
import { getDictionary } from '@/content/get-dictionary';
import { isLocale } from '@/i18n/config';
import { buildMetadata } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/public-key'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return buildMetadata(lang, 'keys', await getDictionary(lang));
}

export default async function PublicKeyPage({ params }: PageProps<'/[lang]/public-key'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  // Rendered on every request, never at build time.
  await connection();
  const dictionary = await getDictionary(lang);

  return (
    <SiteFrame locale={lang} route="keys" dictionary={dictionary}>
      <PageData locale={lang} route="keys" dictionary={dictionary} />
      <KeysPage locale={lang} dictionary={dictionary} />
    </SiteFrame>
  );
}
