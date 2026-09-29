/**
 * PageHead: the head band of the public-key page. Breadcrumb (name > page),
 * title, the two lede paragraphs, and one row of links to the sections of
 * the page (hidden below 640 px, where it would push the first fingerprint
 * down).
 *
 * Props
 *   locale           language of the page; aims the breadcrumb at its home page
 *   titleId          id of the <h1>
 *   name             the owner's name, the first crumb (dictionary.keys.head.kicker)
 *   title            the page title (dictionary.keys.head.title)
 *   lede             the two paragraphs (dictionary.keys.head.lede)
 *   sections         the in-page links in order: id of the section, its title
 *   breadcrumbLabel  accessible name of the breadcrumb, once the dictionaries
 *                    define one; without it the navigation has no name
 *   sectionsLabel    accessible name of the row of in-page links, once the
 *                    dictionaries define one; without it the row is named by
 *                    the page title
 *
 * Server Component.
 */

import { ArrowDown } from 'lucide-react';

import { Band } from '@/components/site';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { buttonVariants } from '@/components/ui/button';
import type { RichText } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { pagePath } from '@/i18n/paths';
import { cn } from '@/lib/utils';

export interface SectionLink {
  /** id of the section element: the target of the link. */
  id: string;
  title: string;
}

export interface PageHeadProps {
  locale: Locale;
  titleId: string;
  name: string;
  title: string;
  lede: readonly [RichText, RichText];
  sections: readonly SectionLink[];
  breadcrumbLabel?: string;
  sectionsLabel?: string;
}

const heading = cn(
  'mt-1 text-[2rem] leading-[1.1] sm:text-[2.5rem] lang-zh:leading-[1.25]',
  'font-(--site-weight-display) tracking-(--site-tracking-display)',
);

const paragraph = 'max-w-[44rem] leading-[1.65] text-pretty lang-zh:leading-[1.85]';

/** A link to a section: the outline Button, small; on touch screens 44 px high to the finger. */
const sectionLink = cn(
  buttonVariants({ variant: 'outline', size: 'sm' }),
  'relative bg-card shadow-xs transition-colors duration-[120ms]',
  'pointer-coarse:after:absolute pointer-coarse:after:-inset-x-px pointer-coarse:after:-inset-y-[9px]',
);

export function PageHead({
  locale,
  titleId,
  name,
  title,
  lede,
  sections,
  breadcrumbLabel,
  sectionsLabel,
}: PageHeadProps) {
  return (
    <Band as="header" containerClassName="pt-4 pb-9 sm:pt-6 sm:pb-12">
      <Breadcrumb aria-label={breadcrumbLabel}>
        <BreadcrumbList className="gap-x-1.5 gap-y-0 text-sm leading-[1.4] sm:gap-x-1.5">
          <BreadcrumbItem>
            {/* 44 px high, so that it can be touched; the text stays where the design has it */}
            <BreadcrumbLink
              href={pagePath(locale, 'home')}
              className="inline-flex min-h-11 items-center duration-[120ms]"
            >
              {name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 id={titleId} className={heading}>
        {title}
      </h1>

      <p className={cn(paragraph, 'mt-4 text-[1.0625rem] text-foreground')}>{lede[0]}</p>
      <p className={cn(paragraph, 'mt-3 text-base text-muted-foreground')}>{lede[1]}</p>

      <nav
        data-part="section-links"
        aria-label={sectionsLabel}
        aria-labelledby={sectionsLabel ? undefined : titleId}
        className="mt-6 hidden sm:block print:hidden"
      >
        <ul role="list" className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a data-slot="button" href={`#${section.id}`} className={sectionLink}>
                {section.title}
                <ArrowDown aria-hidden="true" className="text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </Band>
  );
}
