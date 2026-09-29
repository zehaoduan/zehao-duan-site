/**
 * Loads the dictionary of one language, on the server, when a request needs
 * it. Each language is a separate module behind a dynamic import, so a request
 * for one language never loads the text of the other two.
 *
 * Server only: dictionaries hold JSX and never travel to the browser as a
 * whole. Hand Client Components the few strings they need as props.
 */

import 'server-only';

import type { Locale } from '@/i18n/config';

import type { Dictionary } from './types';

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./locales/en').then((module) => module.dictionary),
  'zh-hant': () => import('./locales/zh-hant').then((module) => module.dictionary),
  'zh-hans': () => import('./locales/zh-hans').then((module) => module.dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
