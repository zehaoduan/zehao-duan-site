/**
 * Root layout. It lives under the dynamic segment, so that <html lang> comes
 * from the URL. It renders the document shell only; header, main and footer
 * belong to SiteFrame, which each page renders with its own route.
 *
 * No generateStaticParams: every route is rendered per request.
 */

import '../globals.css';

import { notFound } from 'next/navigation';

import { SiteDocument } from '@/components/site/site-document';
import { isLocale } from '@/i18n/config';

export { viewport } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <SiteDocument locale={lang}>{children}</SiteDocument>;
}
