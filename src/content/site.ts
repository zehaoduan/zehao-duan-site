/**
 * Language-independent facts about the site and its owner.
 *
 * Everything here reads the same in every language. Text a reader sees in one
 * language only belongs in src/content/locales/<locale>/.
 */

import { localeMeta, type Locale } from '@/i18n/config';

import { photo } from './photo.generated';
import type { Person, ProfileLink, Site } from './types';

const origin = 'https://zehao-duan.com';

const emails = ['zehaoduan2-c@my.cityu.edu.hk', 'zehao.duan@gmail.com'] as const;

const orcid = '0009-0008-2822-9575';

/** Fixed order: ORCID, Google Scholar, CityUHK Scholars, GitHub, LinkedIn. */
const links: readonly ProfileLink[] = [
  {
    id: 'orcid',
    label: 'ORCID',
    href: `https://orcid.org/${orcid}`,
    text: [orcid],
  },
  {
    id: 'google-scholar',
    label: 'Google Scholar',
    href: 'https://scholar.google.com/citations?user=JAdSNEwAAAAJ',
    languageParam: 'hl',
    text: ['scholar.google.com/citations?', 'user=JAdSNEwAAAAJ'],
  },
  {
    id: 'cityuhk-scholars',
    label: 'CityUHK Scholars',
    href: 'https://scholars.cityu.edu.hk/en/persons/zehaoduan2/',
    text: ['scholars.cityu.edu.hk/', 'en/persons/', 'zehaoduan2'],
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/zehaoduan',
    text: ['github.com/zehaoduan'],
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/zehao-duan/',
    text: ['linkedin.com/in/zehao-duan'],
  },
];

const person: Person = {
  emails,
  phone: {
    display: '+852 6762 3354',
    e164: '+85267623354',
  },
  orcid,
  links,
  wechatId: 'duan_zehao',
};

export const site: Site = {
  origin,
  lastUpdated: '2026-09-29',
  photo,
  person,
  contactOrder: [
    'email',
    'mobile',
    'address',
    'orcid',
    'google-scholar',
    'cityuhk-scholars',
    'github',
    'linkedin',
    'keys',
    'wechat',
  ],
  pages: {
    home: {
      robots: 'index, follow, max-image-preview:large',
      ogType: 'profile',
      twitterCard: 'summary',
      image: true,
    },
    keys: {
      robots: 'index, follow',
      ogType: 'website',
    },
    blog: {
      robots: 'index, follow',
      ogType: 'website',
    },
    notFound: {
      robots: 'noindex, follow',
    },
  },
  notFound: {
    code: '404',
    status: '404 Not Found',
  },
  structuredData: {
    ids: {
      webpage: '#webpage',
      website: '#website',
      person: '#person',
      photo: '#photo',
    },
    website: {
      name: 'Zehao Duan',
      alternateName: ['段泽浩', '段澤浩'],
      inLanguage: ['en', 'zh-Hans', 'zh-Hant'],
    },
    photo: {
      caption: 'Zehao Duan / 段泽浩 / 段澤浩',
    },
    person: {
      name: 'Zehao Duan',
      alternateName: ['段泽浩', '段澤浩'],
      gender: 'Male',
      birthDate: '1997-10',
      birthPlace: { '@type': 'Place', name: 'Linfen, Shanxi, China' },
      email: emails.map((address) => `mailto:${address}`),
      telephone: '+852-67623354',
      jobTitle: 'PhD Student',
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: 'City University of Hong Kong',
      },
      alumniOf: [
        { '@type': 'CollegeOrUniversity', name: 'University of New South Wales' },
        { '@type': 'CollegeOrUniversity', name: 'Hong Kong University of Science and Technology' },
      ],
      knowsAbout: 'Power system stability',
      sameAs: links.map((link) => link.href),
    },
    addressCountry: 'HK',
  },
};

/**
 * Address a profile link points to on a page in the given language. Only the
 * Google Scholar link differs between languages (its hl parameter).
 */
export function profileLinkHref(link: ProfileLink, locale: Locale): string {
  if (link.languageParam === undefined) return link.href;
  const url = new URL(link.href);
  url.searchParams.set(link.languageParam, localeMeta[locale].scholarHl);
  return url.toString();
}
