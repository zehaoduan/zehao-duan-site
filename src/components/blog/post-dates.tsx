/**
 * PostDates: the dateline of a post. The date of publication; after it, if
 * the post changed since, 'Updated' and the date of the change; on a draft,
 * the word that marks it.
 *
 *   29 September 2026 · Updated 3 October 2026 · Draft
 *
 * Props
 *   locale   language of the page (formats the dates)
 *   post     the post
 *   labels   dictionary.blog: `updated` and `draft` are read
 *   as       'p' (default) or 'div'
 *   className  extra classes
 *
 * Server Component; holds no copy.
 */

import type { BlogContent, PostFacts } from '@/content/types';
import { formatDate, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

export interface PostDatesProps {
  locale: Locale;
  post: PostFacts;
  labels: Pick<BlogContent, 'updated' | 'draft'>;
  as?: 'p' | 'div';
  className?: string;
}

function Dot() {
  return <span aria-hidden="true">{' · '}</span>;
}

export function PostDates({ locale, post, labels, as: Tag = 'p', className }: PostDatesProps) {
  return (
    <Tag
      data-slot="post-dates"
      className={cn('text-[0.8125rem] leading-normal text-muted-foreground', className)}
    >
      <time dateTime={post.date} className="whitespace-nowrap">
        {formatDate(locale, post.date)}
      </time>
      {post.updated ? (
        <>
          <Dot />
          <span className="whitespace-nowrap">
            {labels.updated.label}
            {labels.updated.separator}
            <time dateTime={post.updated}>{formatDate(locale, post.updated)}</time>
          </span>
        </>
      ) : null}
      {post.draft ? (
        <>
          <Dot />
          <span className="font-medium text-foreground">{labels.draft}</span>
        </>
      ) : null}
    </Tag>
  );
}
