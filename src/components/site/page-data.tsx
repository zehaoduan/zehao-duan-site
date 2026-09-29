/**
 * PageData: the machine-readable data of a page that is rendered with the
 * page instead of through generateMetadata.
 *
 *   - the JSON-LD data of the route (homeJsonLd / keysJsonLd / blogJsonLd);
 *   - on the public-key pages and the list of posts, the Open Graph tags (see openGraphTags in
 *     '@/lib/metadata' for the reason). React moves <meta> elements into
 *     <head>.
 *
 * Render it once per page, as the first child of SiteFrame. A blog post
 * renders PostData from '@/components/blog' in its place.
 *
 * Props
 *   locale      language of the page
 *   route       'home' | 'keys' | 'blog'
 *   dictionary  the dictionary of the language
 */

import { JsonLd } from '@/components/site/json-ld';
import type { Dictionary } from '@/content/types';
import type { Locale } from '@/i18n/config';
import type { RouteKey } from '@/i18n/paths';
import { blogJsonLd, homeJsonLd, keysJsonLd, type JsonLdData } from '@/lib/json-ld';
import { openGraphTags } from '@/lib/metadata';

export interface PageDataProps {
  locale: Locale;
  route: RouteKey;
  dictionary: Dictionary;
}

const jsonLd: Record<RouteKey, (locale: Locale, dictionary: Dictionary) => JsonLdData> = {
  home: homeJsonLd,
  keys: keysJsonLd,
  blog: blogJsonLd,
};

export function PageData({ locale, route, dictionary }: PageDataProps) {
  const data = jsonLd[route](locale, dictionary);
  return (
    <>
      {openGraphTags(locale, route, dictionary).map((tag, index) => (
        <meta key={index} property={tag.property} content={tag.content} />
      ))}
      <JsonLd data={data} />
    </>
  );
}
