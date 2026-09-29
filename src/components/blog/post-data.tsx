/**
 * PostData: the machine-readable data of a blog post that is rendered with
 * the page: its Open Graph tags (React moves <meta> elements into <head>)
 * and its JSON-LD data. What PageData is for the other pages.
 *
 * Render it once, as the first child of SiteFrame.
 *
 * Props
 *   locale      language of the page
 *   post        the post
 *   dictionary  the dictionary of the language
 */

import { JsonLd } from '@/components/site';
import type { Dictionary, PostSummary } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { postJsonLd } from '@/lib/json-ld';
import { postOpenGraphTags } from '@/lib/metadata';

export interface PostDataProps {
  locale: Locale;
  post: PostSummary;
  dictionary: Dictionary;
}

export function PostData({ locale, post, dictionary }: PostDataProps) {
  return (
    <>
      {postOpenGraphTags(locale, post, dictionary).map((tag, index) => (
        <meta key={index} property={tag.property} content={tag.content} />
      ))}
      <JsonLd data={postJsonLd(locale, post)} />
    </>
  );
}
