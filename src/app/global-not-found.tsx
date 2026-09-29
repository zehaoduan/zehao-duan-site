/**
 * The not-found page, for every URL that matches no route. It does not go
 * through the root layout, so it brings the stylesheet and the document
 * shell itself.
 *
 * It is quiet and speaks three languages at once, built from the notFound
 * content of the three dictionaries: a header with the three names (each
 * linking to its home page), a small status code in the accent colour, one
 * card with the three languages, and the footer. <html lang> follows the
 * language prefix of the URL (the x-locale header that src/proxy.ts sets).
 */

import './globals.css';

import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Fragment } from 'react';

import { PageContainer } from '@/components/site/page-container';
import { SiteDocument } from '@/components/site/site-document';
import { SiteFooter } from '@/components/site/site-footer';
import { HeaderBar, wordmark } from '@/components/site/site-header';
import { contentId, SkipLink } from '@/components/site/skip-link';
import { surface } from '@/components/site/surface';
import { ThemeSwitch } from '@/components/site/theme-switch';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getDictionary } from '@/content/get-dictionary';
import { site } from '@/content/site';
import type { Dictionary } from '@/content/types';
import { defaultLocale, isLocale, localeMeta, switchOrder, type Locale } from '@/i18n/config';
import { pagePath } from '@/i18n/paths';
import { buildNotFoundMetadata } from '@/lib/metadata';
import { LOCALE_HEADER } from '@/lib/request-headers';
import { cn } from '@/lib/utils';

export { viewport } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

async function getDictionaries(): Promise<Record<Locale, Dictionary>> {
  const [en, zhHant, zhHans] = await Promise.all([
    getDictionary('en'),
    getDictionary('zh-hant'),
    getDictionary('zh-hans'),
  ]);
  return { en, 'zh-hant': zhHant, 'zh-hans': zhHans };
}

export async function generateMetadata(): Promise<Metadata> {
  return buildNotFoundMetadata(await getDictionaries());
}

function Names({ dictionaries, linked }: { dictionaries: Record<Locale, Dictionary>; linked: boolean }) {
  return (
    <>
      {switchOrder.map((locale, index) => {
        const meta = localeMeta[locale];
        const name = dictionaries[locale].common.footer.name;
        return (
          <Fragment key={locale}>
            {index > 0 ? (
              <span aria-hidden="true" className="font-normal text-muted-foreground">
                {' · '}
              </span>
            ) : null}
            {linked ? (
              <a
                href={pagePath(locale, 'home')}
                lang={meta.htmlLang}
                hrefLang={meta.hreflang}
                className="transition-colors duration-[120ms] hover:text-primary"
              >
                {name}
              </a>
            ) : (
              <span lang={meta.htmlLang}>{name}</span>
            )}
          </Fragment>
        );
      })}
    </>
  );
}

export default async function GlobalNotFound() {
  const fromProxy = (await headers()).get(LOCALE_HEADER);
  const locale: Locale = isLocale(fromProxy) ? fromProxy : defaultLocale;
  const dictionaries = await getDictionaries();
  const { common } = dictionaries[locale];

  return (
    <SiteDocument locale={locale}>
      <SkipLink>{common.skipLink}</SkipLink>
      <HeaderBar tools={<ThemeSwitch labels={common.theme} separated={false} />}>
        <p className={cn(wordmark, 'flex flex-wrap gap-x-1 leading-[1.3] whitespace-normal')}>
          <Names dictionaries={dictionaries} linked />
        </p>
      </HeaderBar>

      <main
        id={contentId}
        tabIndex={-1}
        className="grid flex-[1_0_auto] content-center pt-12 pb-16 outline-none"
      >
        <PageContainer>
          <h1 className="font-mono text-sm leading-[1.4] font-medium text-primary">
            {site.notFound.code}
          </h1>
          <Card className={cn(surface, 'mt-4 grid grid-cols-1 text-base min-[52rem]:grid-cols-3')}>
            {switchOrder.map((target) => {
              const meta = localeMeta[target];
              const content = dictionaries[target].notFound;
              return (
                <section
                  key={target}
                  lang={meta.htmlLang}
                  className={cn(
                    'flex flex-col items-start px-6 pt-[1.375rem] pb-6',
                    'border-border not-first:border-t',
                    'min-[52rem]:not-first:border-t-0 min-[52rem]:not-first:border-l',
                  )}
                >
                  <h2 className="text-xl leading-[1.3] font-(--site-weight-heading) tracking-(--site-tracking-tight)">
                    {content.title}
                  </h2>
                  <p className="mt-2 mb-[1.125rem] flex-[1_0_auto] text-[0.9375rem] leading-[1.6] text-muted-foreground lang-zh:leading-[1.8]">
                    {content.body}
                  </p>
                  <a
                    href={pagePath(target, 'home')}
                    hrefLang={meta.hreflang}
                    className={cn(buttonVariants({ variant: 'outline' }), 'bg-card shadow-xs')}
                  >
                    <ArrowLeft aria-hidden="true" />
                    {content.returnLink}
                  </a>
                </section>
              );
            })}
          </Card>
        </PageContainer>
      </main>

      <SiteFooter name={<Names dictionaries={dictionaries} linked={false} />}>
        <span lang="en">{site.notFound.status}</span>
      </SiteFooter>
    </SiteDocument>
  );
}
