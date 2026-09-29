/**
 * PostNav: the links at the end of a post to the post published before it
 * and the post published after it. The earlier post stands on the left, the
 * later one on the right; below 640 px they stand one above the other.
 * Renders nothing when the post is the only one.
 *
 * Props
 *   locale   language of the page
 *   post     the post; `previous` and `next` are read
 *   labels   dictionary.blog.postNav
 *
 * Server Component; holds no copy.
 */

import { ArrowLeft, ArrowRight } from 'lucide-react';

import type { BlogContent, Post } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { postPath } from '@/i18n/paths';
import { cn } from '@/lib/utils';

export interface PostNavProps {
  locale: Locale;
  post: Pick<Post, 'previous' | 'next'>;
  labels: BlogContent['postNav'];
}

const linkClass = 'group flex flex-col gap-1 py-1 touch:min-h-11';
const labelClass =
  'inline-flex items-center gap-1.5 text-[0.8125rem] leading-normal text-muted-foreground';
const titleClass = cn(
  'leading-[1.4] font-(--site-weight-title) text-balance wrap-break-word lang-zh:leading-[1.55]',
  'transition-colors duration-[120ms] group-hover:text-primary',
);

export function PostNav({ locale, post, labels }: PostNavProps) {
  const { previous, next } = post;
  if (!previous && !next) return null;

  return (
    <nav
      data-slot="post-nav"
      aria-label={labels.label}
      className={cn(
        'mt-12 grid max-w-[41rem] gap-x-8 gap-y-4 border-t border-border pt-6',
        'sm:grid-cols-2 print:hidden',
      )}
    >
      {previous ? (
        <a href={postPath(locale, previous.slug)} rel="prev" className={linkClass}>
          <span className={labelClass}>
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            {labels.previous}
          </span>
          <span className={titleClass}>{previous.title}</span>
        </a>
      ) : null}
      {next ? (
        <a
          href={postPath(locale, next.slug)}
          rel="next"
          className={cn(linkClass, 'sm:col-start-2 sm:items-end sm:text-end')}
        >
          <span className={labelClass}>
            {labels.next}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </span>
          <span className={titleClass}>{next.title}</span>
        </a>
      ) : null}
    </nav>
  );
}
