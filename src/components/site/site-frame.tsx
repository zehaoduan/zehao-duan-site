/**
 * SiteFrame: what every page wraps its content in.
 *
 *   export default async function Page({ params }: PageProps<'/[lang]'>) {
 *     const { lang } = await params;
 *     if (!isLocale(lang)) notFound();
 *     await connection();
 *     const dictionary = await getDictionary(lang);
 *     return (
 *       <SiteFrame locale={lang} route="home" dictionary={dictionary}>
 *         ...page content...
 *       </SiteFrame>
 *     );
 *   }
 *
 * It renders, in this order: the skip link, the header (wordmark, page links,
 * language links for this route, theme switch), <main id="content"> with the
 * children, and the footer (name, last-updated date). The document shell
 * (<html>, <body>, theme and tooltip providers) comes from the root layout.
 *
 * Props
 *   locale      language of the page, from the [lang] segment, checked with isLocale
 *   route       'home' | 'keys' | 'blog' (RouteKey from '@/i18n/paths'): marks
 *               the current page link and aims the language links at the same page
 *   slug        on a blog post, its slug: the language links lead to the post
 *   dictionary  the dictionary of the language, from getDictionary(locale)
 *   children    the content of <main>; bands and containers are up to the page
 *   mainClassName  extra classes for <main>
 *
 * Server Component.
 */

import type { ReactNode } from 'react';

import { LastUpdated } from '@/components/site/last-updated';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader, type PageLink } from '@/components/site/site-header';
import { contentId, SkipLink } from '@/components/site/skip-link';
import type { Dictionary } from '@/content/types';
import type { Locale } from '@/i18n/config';
import type { RouteKey } from '@/i18n/paths';
import { cn } from '@/lib/utils';

export interface SiteFrameProps {
  locale: Locale;
  route: RouteKey;
  slug?: string;
  dictionary: Dictionary;
  children: ReactNode;
  mainClassName?: string;
}

/** The page links of the header: home, blog, then the public-key page under its title. */
function pageLinks(dictionary: Dictionary): { links: PageLink[]; label: string } {
  const { nav } = dictionary.common;
  const links: PageLink[] = [
    { route: 'home', label: nav.home },
    { route: 'blog', label: nav.blog },
    { route: 'keys', label: dictionary.keys.head.title },
  ];
  return { links, label: nav.label };
}

export function SiteFrame({
  locale,
  route,
  slug,
  dictionary,
  children,
  mainClassName,
}: SiteFrameProps) {
  const { common } = dictionary;
  const nav = pageLinks(dictionary);
  return (
    <>
      <SkipLink>{common.skipLink}</SkipLink>
      <SiteHeader
        locale={locale}
        route={route}
        slug={slug}
        name={common.footer.name}
        pageLinks={nav.links}
        pageNavLabel={nav.label}
        languageNavLabel={common.languageNavLabel}
        themeLabels={common.theme}
      />
      <main id={contentId} tabIndex={-1} className={cn('flex-1 outline-none', mainClassName)}>
        {children}
      </main>
      <SiteFooter name={common.footer.name}>
        <LastUpdated locale={locale} labels={common.lastUpdated} as="span" />
      </SiteFooter>
    </>
  );
}
