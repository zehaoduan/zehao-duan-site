/**
 * LanguageSwitch: three plain links, English / 繁體 / 简体, styled as a
 * segmented control at every width. Each link leads to the same page in the
 * other language and carries lang, hreflang and, on the current language,
 * aria-current="page".
 *
 * They are ordinary <a> elements on purpose: a full document load gives a
 * fresh <html lang> and a fresh CSP nonce, and the switch works without
 * JavaScript.
 *
 * Props
 *   locale  language of the page
 *   route   'home', 'keys' or 'blog': which page the links lead to
 *   slug    slug of a blog post: the links then lead to that post
 *   label   accessible name of the navigation (dictionary.common.languageNavLabel)
 *   className  extra classes
 */

import { localeMeta, switchOrder, type Locale } from '@/i18n/config';
import { routePath, type RouteKey } from '@/i18n/paths';
import { cn } from '@/lib/utils';

export interface LanguageSwitchProps {
  locale: Locale;
  route: RouteKey;
  slug?: string;
  label: string;
  className?: string;
}

/** The look of the segmented controls in the header (track and item). */
export const segmentTrack = 'flex h-8 items-center rounded-lg bg-muted p-[3px]';

export const segmentItem = cn(
  'inline-flex h-full items-center justify-center rounded-md border border-transparent',
  'text-[0.8125rem] leading-none font-medium whitespace-nowrap text-muted-foreground',
  'transition-colors duration-[120ms] hover:text-foreground',
);

export const segmentItemActive = cn(
  'bg-card text-foreground shadow-sm',
  'dark:border-input dark:bg-input/45',
);

export function LanguageSwitch({ locale, route, slug, label, className }: LanguageSwitchProps) {
  return (
    <nav data-slot="language-switch" aria-label={label} className={cn(segmentTrack, className)}>
      {switchOrder.map((target) => {
        const meta = localeMeta[target];
        const current = target === locale;
        return (
          <a
            key={target}
            href={routePath(target, route, slug)}
            lang={meta.htmlLang}
            hrefLang={meta.hreflang}
            aria-current={current ? 'page' : undefined}
            className={cn(segmentItem, 'px-2 sm:px-2.5', current && segmentItemActive)}
          >
            {meta.switchLabel}
          </a>
        );
      })}
    </nav>
  );
}
