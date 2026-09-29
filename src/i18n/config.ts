/**
 * Locale configuration: the single place that knows which languages the site
 * speaks and how each one is labelled in URLs, markup and metadata.
 *
 * This module is plain data plus two small pure functions, so it is safe to
 * import from Server Components, Client Components, route handlers and proxy.
 */

export const locales = ['en', 'zh-hant', 'zh-hans'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Order of the language switch: English / 繁體 / 简体. */
export const switchOrder: readonly Locale[] = ['en', 'zh-hant', 'zh-hans'];

/**
 * Order of the hreflang alternates in <head> and in the sitemap, as on the old
 * pages: en, zh-Hans, zh-Hant (x-default, which points at the English page,
 * comes last).
 */
export const alternateOrder: readonly Locale[] = ['en', 'zh-hans', 'zh-hant'];

export type HtmlLang = 'en' | 'zh-Hant' | 'zh-Hans';
export type OgLocale = 'en_GB' | 'zh_HK' | 'zh_CN';
export type PathPrefix = '' | '/zh-hant' | '/zh-hans';
export type ScholarHl = 'en' | 'zh-TW' | 'zh-CN';

export interface LocaleMeta {
  /** Value of the lang attribute on <html>. */
  htmlLang: HtmlLang;
  /** Value of hreflang on alternate links and on the language switch. */
  hreflang: HtmlLang;
  /** Value of og:locale. */
  ogLocale: OgLocale;
  /** Label of this language in the language switch. Never translated. */
  switchLabel: string;
  /** Path prefix of this language, without a trailing slash. English has none. */
  pathPrefix: PathPrefix;
  /** Value of the hl parameter on the Google Scholar profile link. */
  scholarHl: ScholarHl;
  /** BCP 47 tag handed to Intl.DateTimeFormat. */
  dateLocale: string;
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  en: {
    htmlLang: 'en',
    hreflang: 'en',
    ogLocale: 'en_GB',
    switchLabel: 'English',
    pathPrefix: '',
    scholarHl: 'en',
    dateLocale: 'en-GB',
  },
  'zh-hant': {
    htmlLang: 'zh-Hant',
    hreflang: 'zh-Hant',
    ogLocale: 'zh_HK',
    switchLabel: '繁體',
    pathPrefix: '/zh-hant',
    scholarHl: 'zh-TW',
    dateLocale: 'zh-Hant-HK',
  },
  'zh-hans': {
    htmlLang: 'zh-Hans',
    hreflang: 'zh-Hans',
    ogLocale: 'zh_CN',
    switchLabel: '简体',
    pathPrefix: '/zh-hans',
    scholarHl: 'zh-CN',
    dateLocale: 'zh-Hans-CN',
  },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/**
 * Formats an ISO calendar date (YYYY-MM-DD) for display in the given language:
 * '17 September 2026' in English, '2026年9月17日' in both Chinese variants.
 * The date is read and printed in UTC, so the result does not depend on the
 * time zone of the server that renders the page.
 */
export function formatDate(locale: Locale, isoDate: string): string {
  return new Intl.DateTimeFormat(localeMeta[locale].dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
