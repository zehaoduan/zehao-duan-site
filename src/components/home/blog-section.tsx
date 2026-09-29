/**
 * BlogSection: the newest blog posts on the home page, as a grid of small
 * square pictures. One picture per post (its cover, or its first picture),
 * newest first; each is a link to its post.
 *
 * Four pictures in a row below 640 px, six from there; at most twelve posts.
 * Posts without a picture are not shown here; the link at the right end of
 * the heading leads to the list of all posts.
 *
 * No title is visible, so the title of the post is the alt text of its
 * picture (the accessible name of the link) and the tooltip.
 *
 * Props
 *   id        id of the heading: target of in-page links, names the section
 *   locale    language of the page
 *   section   home.blog of the dictionary ({ title, allPosts })
 *   posts     the posts of the language, from getPosts(locale)
 *   className extra classes for the section
 *
 * Renders nothing when no post has a picture. Left out in print.
 *
 * Server Component; holds no copy.
 */

import { ArrowRight } from 'lucide-react';

import { SectionHeading } from '@/components/site';
import type { HomeContent, PostSummary } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { pagePath, postPath } from '@/i18n/paths';
import { cn } from '@/lib/utils';

export interface BlogSectionProps {
  id: string;
  locale: Locale;
  section: HomeContent['blog'];
  posts: readonly PostSummary[];
  className?: string;
}

/** Posts shown at most: two rows from 640 px, three below. */
const postCount = 12;

export function BlogSection({ id, locale, section, posts, className }: BlogSectionProps) {
  const shown = posts
    .flatMap((post) => (post.previews?.[0] ? [{ post, preview: post.previews[0] }] : []))
    .slice(0, postCount);
  if (shown.length === 0) return null;

  return (
    <section
      data-slot="blog-section"
      aria-labelledby={id}
      className={cn('print:hidden', className)}
    >
      <SectionHeading
        id={id}
        action={
          <a
            href={pagePath(locale, 'blog')}
            className="text-link relative inline-flex shrink-0 items-center gap-1 text-sm leading-normal touch:min-h-11"
          >
            {section.allPosts}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </a>
        }
      >
        {section.title}
      </SectionHeading>
      <ul role="list" className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {shown.map(({ post, preview }) => (
          <li key={post.slug} className="min-w-0">
            <a
              href={postPath(locale, post.slug)}
              title={post.title}
              className="block rounded-md transition-opacity duration-[120ms] hover:opacity-90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- next/image renders a style attribute (CSP) */}
              <img
                src={preview.src}
                alt={post.title}
                width={preview.width}
                height={preview.height}
                loading="lazy"
                decoding="async"
                className={cn(
                  'aspect-square h-auto w-full rounded-md bg-muted object-cover',
                  'ring-1 ring-foreground/12 dark:brightness-[0.92]',
                )}
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
