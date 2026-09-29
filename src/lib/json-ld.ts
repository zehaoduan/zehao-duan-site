/**
 * Builders for the JSON-LD data of the pages. They reproduce the graphs of
 * the old static pages field for field, from site.ts and the dictionaries.
 *
 *   homeJsonLd(locale, dictionary)  @graph: WebPage, WebSite, ImageObject, Person
 *   keysJsonLd(locale, dictionary)  a single WebPage node
 *   blogJsonLd(locale, dictionary)  a single WebPage node
 *   postJsonLd(locale, post)        a single BlogPosting node
 *
 * Render the result with <JsonLd data={...} /> from '@/components/site/json-ld'.
 */

import { site } from '@/content/site';
import type { Dictionary, PageMeta, PostSummary } from '@/content/types';
import { defaultLocale, localeMeta, type Locale } from '@/i18n/config';
import { absoluteUrl, pagePath, postPath, type RouteKey } from '@/i18n/paths';

export type JsonLdData = Record<string, unknown>;

const context = 'https://schema.org';

const data = site.structuredData;

/** The English home page: the node ids of site, person and photo hang on it. */
const siteUrl = absoluteUrl(pagePath(defaultLocale, 'home'));

const websiteRef = { '@id': `${siteUrl}${data.ids.website}` };
const personRef = { '@id': `${siteUrl}${data.ids.person}` };
const photoRef = { '@id': `${siteUrl}${data.ids.photo}` };

function webPage(locale: Locale, route: RouteKey, meta: PageMeta): JsonLdData {
  const url = absoluteUrl(pagePath(locale, route));
  return {
    '@type': 'WebPage',
    '@id': `${url}${data.ids.webpage}`,
    url,
    name: meta.title,
    description: meta.description,
    inLanguage: localeMeta[locale].htmlLang,
    dateModified: site.lastUpdated,
    isPartOf: websiteRef,
    about: personRef,
  };
}

export function homeJsonLd(locale: Locale, dictionary: Dictionary): JsonLdData {
  const { home } = dictionary;
  const photoUrl = absoluteUrl(site.photo.src);
  const { person } = data;
  return {
    '@context': context,
    '@graph': [
      {
        ...webPage(locale, 'home', home.meta),
        primaryImageOfPage: photoRef,
      },
      {
        '@type': 'WebSite',
        ...websiteRef,
        url: siteUrl,
        name: data.website.name,
        alternateName: data.website.alternateName,
        inLanguage: data.website.inLanguage,
        publisher: personRef,
      },
      {
        '@type': 'ImageObject',
        ...photoRef,
        url: photoUrl,
        contentUrl: photoUrl,
        width: site.photo.width,
        height: site.photo.height,
        caption: data.photo.caption,
      },
      {
        '@type': 'Person',
        ...personRef,
        name: person.name,
        alternateName: person.alternateName,
        url: siteUrl,
        image: photoRef,
        gender: person.gender,
        birthDate: person.birthDate,
        birthPlace: person.birthPlace,
        email: person.email,
        telephone: person.telephone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: home.contact.postalAddress.streetAddress,
          addressLocality: home.contact.postalAddress.addressLocality,
          addressRegion: home.contact.postalAddress.addressRegion,
          addressCountry: data.addressCountry,
        },
        jobTitle: person.jobTitle,
        affiliation: person.affiliation,
        alumniOf: person.alumniOf,
        knowsAbout: person.knowsAbout,
        sameAs: person.sameAs,
      },
    ],
  };
}

export function keysJsonLd(locale: Locale, dictionary: Dictionary): JsonLdData {
  return {
    '@context': context,
    ...webPage(locale, 'keys', dictionary.keys.meta),
  };
}

export function blogJsonLd(locale: Locale, dictionary: Dictionary): JsonLdData {
  return {
    '@context': context,
    ...webPage(locale, 'blog', dictionary.blog.meta),
  };
}

export function postJsonLd(locale: Locale, post: PostSummary): JsonLdData {
  const url = absoluteUrl(postPath(locale, post.slug));
  const { cover } = post;
  return {
    '@context': context,
    '@type': 'BlogPosting',
    '@id': `${url}${data.ids.webpage}`,
    url,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.description,
    inLanguage: localeMeta[locale].htmlLang,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    ...(cover
      ? {
          image: {
            '@type': 'ImageObject',
            url: absoluteUrl(cover.src),
            width: cover.width,
            height: cover.height,
          },
        }
      : {}),
    author: personRef,
    publisher: personRef,
    isPartOf: websiteRef,
  };
}
