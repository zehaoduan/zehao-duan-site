/**
 * English: strings shared by every page.
 */

import type { CommonContent } from '@/content/types';

/** The owner's name as written in English. */
export const name = 'Zehao Duan';

export const common: CommonContent = {
  skipLink: 'Skip to content',
  lastUpdated: {
    label: 'Last updated',
    separator: ' ',
  },
  languageNavLabel: 'Language',
  nav: {
    label: 'Site',
    home: 'Home',
    blog: 'Blog',
  },
  footer: {
    name,
  },
  backToHome: 'Back to home page',
  copy: {
    copy: 'Copy',
    copied: 'Copied',
    failed: 'Copy by hand',
  },
  theme: {
    label: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  },
};
