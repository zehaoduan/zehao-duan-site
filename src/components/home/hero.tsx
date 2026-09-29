/**
 * Hero: the band at the top of the home page.
 *
 * In reading order: portrait, field label, name (the page heading) with the
 * name in the other script on its baseline, role sentence, last-updated
 * dateline directly under the role sentence.
 *
 *   below 640 px   portrait (96 px) beside the name block; the name in the
 *                  other script under the name; role and dateline below,
 *                  across the full width
 *   from 640 px    portrait (136 px) on the left, everything else beside it
 *   from 1024 px   portrait 152 px, name 2.875rem
 *
 * Props
 *   locale       language of the page (formats the date)
 *   hero         dictionary.home.hero
 *   lastUpdated  dictionary.common.lastUpdated ({ label, separator })
 *
 * Server Component. The portrait is a plain <picture>: next/image renders a
 * style attribute, which the Content-Security-Policy forbids. Its files are
 * made by scripts/generate-photo.mjs.
 */

import { Band, LastUpdated } from '@/components/site';
import { site } from '@/content/site';
import type { CommonContent, HomeContent } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/** id of the page heading; the hero section is labelled by it. */
export const heroHeadingId = 'hero-heading';

export interface HeroProps {
  locale: Locale;
  hero: HomeContent['hero'];
  lastUpdated: CommonContent['lastUpdated'];
}

export function Hero({ locale, hero, lastUpdated }: HeroProps) {
  const { alternateName } = hero;
  // The other script is Chinese on the English page and Latin on the Chinese pages.
  const alternateIsChinese = alternateName.lang?.toLowerCase().startsWith('zh') ?? false;

  return (
    <Band
      as="section"
      aria-labelledby={heroHeadingId}
      containerClassName={cn(
        'grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-[1.125rem] gap-y-5 py-8',
        'sm:gap-x-9 sm:gap-y-0 sm:py-12',
        'lg:gap-x-11 lg:py-14',
      )}
    >
      <picture className="contents">
        {site.photo.sources.map((source) => (
          <source key={source.type} type={source.type} srcSet={source.srcSet} sizes={site.photo.sizes} />
        ))}
        <img
          data-slot="portrait"
          src={site.photo.src}
          alt={hero.portraitAlt}
          width={site.photo.width}
          height={site.photo.height}
          fetchPriority="high"
          decoding="async"
          className={cn(
            'aspect-[3/4] h-auto w-24 rounded-xl bg-muted object-cover',
            'ring-1 ring-foreground/12 dark:brightness-[0.92]',
            'sm:row-span-2 sm:w-[8.5rem] lg:w-[9.5rem]',
          )}
        />
      </picture>

      <div data-slot="hero-identity" className="min-w-0 sm:self-end">
        <p
          className={cn(
            'text-[0.8125rem] leading-[1.4] font-[550] tracking-[0.005em] text-primary',
            'lang-zh:text-sm lang-zh:font-normal lang-zh:tracking-[0.08em]',
          )}
        >
          {hero.kicker}
        </p>
        <div className="mt-1.5 flex flex-col gap-y-1.5 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-3 sm:gap-y-1">
          <h1
            id={heroHeadingId}
            className={cn(
              'text-[2rem] leading-[1.1] font-(--site-weight-display) tracking-(--site-tracking-display)',
              'lang-zh:leading-[1.2] sm:text-[2.5rem] lg:text-[2.875rem]',
            )}
          >
            {hero.name}
          </h1>
          <p
            data-slot="alternate-name"
            lang={alternateName.lang}
            className={cn(
              'text-lg leading-[1.3] font-normal text-muted-foreground',
              'sm:text-[1.375rem] lg:text-2xl',
              alternateIsChinese ? 'tracking-[0.02em]' : 'tracking-[-0.005em]',
            )}
          >
            {alternateName.text}
          </p>
        </div>
      </div>

      <div data-slot="hero-summary" className="col-span-full min-w-0 sm:col-span-1 sm:col-start-2 sm:mt-4 sm:self-start">
        <p className="max-w-[39rem] text-base leading-[1.6] text-pretty text-foreground sm:text-[1.0625rem] lang-zh:leading-[1.8]">
          {hero.role}
        </p>
        <LastUpdated
          locale={locale}
          labels={lastUpdated}
          className="mt-2.5 text-[0.8125rem] leading-normal text-muted-foreground"
        />
      </div>
    </Band>
  );
}
