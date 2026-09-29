/**
 * The header of the site: sticky, translucent card colour with backdrop blur
 * and a bottom hairline. The bar is 56 px high.
 *
 *   SiteHeader     the header of the pages: wordmark, page links, language
 *                  links, theme switch. SiteFrame renders it; pages do not
 *                  use it directly.
 *   HeaderBar      the bare bar, for headers with other content (404 page).
 *
 * The page links are shown at every width. From 768 px they stand in the bar,
 * beside the wordmark. Below 768 px the bar has no room for them, so they
 * stand in a second row of 44 px under the bar, which is part of the sticky
 * header. The two lists are the same links; only one is displayed at a time.
 *
 * All links are plain <a> elements (document navigations).
 */

import type { ReactNode } from 'react';

import { LanguageSwitch } from '@/components/site/language-switch';
import { PageContainer } from '@/components/site/page-container';
import { ThemeSwitch } from '@/components/site/theme-switch';
import type { CommonContent } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { pagePath, type RouteKey } from '@/i18n/paths';
import { cn } from '@/lib/utils';

export interface HeaderBarProps {
  /** Left side: wordmark and page links. */
  children: ReactNode;
  /** Right side: language links and theme switch. */
  tools: ReactNode;
  /** What stands under the bar, inside the sticky header: the row of page links on phones. */
  below?: ReactNode;
}

export function HeaderBar({ children, tools, below }: HeaderBarProps) {
  return (
    <header
      data-slot="site-header"
      className="sticky top-0 z-40 border-b border-border bg-card/82 backdrop-blur-md backdrop-saturate-150"
    >
      <PageContainer className="flex h-14 items-center gap-4 md:gap-7">
        {children}
        <div className="ml-auto flex items-center gap-1.5">{tools}</div>
      </PageContainer>
      {below}
    </header>
  );
}

/** Type of the wordmark: the owner's name. */
export const wordmark = cn(
  'text-[0.9375rem] font-semibold tracking-[-0.011em] whitespace-nowrap',
  'lang-zh:text-base lang-zh:tracking-[0.02em]',
);

export interface PageLink {
  route: RouteKey;
  label: string;
}

export interface SiteHeaderProps {
  locale: Locale;
  /** The page being shown: marks the current page link, aims the language links. */
  route: RouteKey;
  /** Slug of the blog post being shown, if the page is one. */
  slug?: string;
  /** The owner's name in the language of the page. */
  name: string;
  /** Page links in display order. */
  pageLinks: readonly PageLink[];
  /** Accessible name of the page navigation, if the dictionary has one. */
  pageNavLabel?: string;
  languageNavLabel: string;
  themeLabels: CommonContent['theme'];
}

const pageLink = cn(
  'relative inline-flex items-center text-sm font-medium whitespace-nowrap',
  'text-muted-foreground transition-colors duration-[120ms] hover:text-foreground',
  'data-current:text-foreground',
  'data-current:after:absolute data-current:after:inset-x-0',
  'data-current:after:-bottom-px data-current:after:h-0.5',
  'data-current:after:bg-primary',
);

interface PageNavProps {
  locale: Locale;
  route: RouteKey;
  /** True on a page below the page of `route` (a blog post). */
  below: boolean;
  links: readonly PageLink[];
  label?: string;
  /** 'bar': in the bar, from 768 px. 'row': under the bar, below 768 px. */
  placement: 'bar' | 'row';
}

function PageLinks({ locale, route, below, links }: Omit<PageNavProps, 'label' | 'placement'>) {
  return links.map((link) => {
    const current = link.route === route;
    return (
      <a
        key={link.route}
        href={pagePath(locale, link.route)}
        // A blog post is not the page the Blog link leads to, but lies below it.
        aria-current={current ? (below ? 'true' : 'page') : undefined}
        data-current={current ? '' : undefined}
        className={pageLink}
      >
        {link.label}
      </a>
    );
  });
}

function PageNav({ label, placement, ...links }: PageNavProps) {
  if (placement === 'bar') {
    return (
      <nav
        data-slot="page-nav"
        aria-label={label}
        className="hidden items-stretch gap-6 self-stretch md:flex"
      >
        <PageLinks {...links} />
      </nav>
    );
  }
  return (
    <nav data-slot="page-nav-row" aria-label={label} className="border-t border-border md:hidden">
      <PageContainer className="flex h-11 items-stretch gap-6">
        <PageLinks {...links} />
      </PageContainer>
    </nav>
  );
}

export function SiteHeader({
  locale,
  route,
  slug,
  name,
  pageLinks,
  pageNavLabel,
  languageNavLabel,
  themeLabels,
}: SiteHeaderProps) {
  const nav = {
    locale,
    route,
    below: slug !== undefined,
    links: pageLinks,
    label: pageNavLabel,
  };
  const hasLinks = pageLinks.length > 0;
  return (
    <HeaderBar
      tools={
        <>
          <LanguageSwitch locale={locale} route={route} slug={slug} label={languageNavLabel} />
          <ThemeSwitch labels={themeLabels} />
        </>
      }
      below={hasLinks ? <PageNav {...nav} placement="row" /> : null}
    >
      <a data-slot="wordmark" href={pagePath(locale, 'home')} className={wordmark}>
        {name}
      </a>
      {hasLinks ? <PageNav {...nav} placement="bar" /> : null}
    </HeaderBar>
  );
}
