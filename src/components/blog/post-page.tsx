/**
 * PostPage: a blog post. The route file renders it inside SiteFrame.
 *
 *   head band   breadcrumb, title, dateline, description
 *   cover       the cover picture, if the post has one
 *   text        the post, at the measure of the design (41rem)
 *   back link   to the list of posts
 *
 * The text is HTML that scripts/generate-blog.mjs rendered from the Markdown
 * file of the post at build time. It comes from the owner's own files, not
 * from visitors, and carries no scripts and no style attributes. Its look is
 * in globals.css, under [data-slot="post-body"].
 *
 * Props
 *   locale      language of the page
 *   dictionary  the dictionary of the language
 *   post        the post, from getPost(locale, slug)
 *
 * Server Component; holds no copy.
 */

import { ArrowLeft } from 'lucide-react';

import { PageContainer } from '@/components/site';
import { buttonVariants } from '@/components/ui/button';
import type { Dictionary, Post } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { pagePath } from '@/i18n/paths';
import { cn } from '@/lib/utils';

import { BlogHead, ledeClass } from './blog-head';
import { PostDates } from './post-dates';

export interface PostPageProps {
  locale: Locale;
  dictionary: Dictionary;
  post: Post;
}

const titleId = 'post-title';

/** As in the generator: the pictures are as wide as the text column, or the window. */
const coverSizes = '(min-width: 44rem) 41rem, 100vw';

export function PostPage({ locale, dictionary, post }: PostPageProps) {
  const { blog } = dictionary;
  const { cover } = post;

  return (
    <article aria-labelledby={titleId}>
      <BlogHead
        locale={locale}
        titleId={titleId}
        name={blog.head.kicker}
        blogTitle={blog.head.title}
        title={post.title}
        post
        breadcrumbLabel={blog.head.breadcrumbLabel}
      >
        <PostDates locale={locale} post={post} labels={blog} className="mt-3" />
        <p className={ledeClass}>{post.description}</p>
      </BlogHead>

      <PageContainer className="pt-8 pb-16 sm:pt-10 lg:pt-12 lg:pb-24">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- next/image renders a style attribute (CSP)
          <img
            data-slot="post-cover"
            src={cover.src}
            srcSet={cover.srcSet}
            sizes={cover.srcSet ? coverSizes : undefined}
            alt={post.coverAlt ?? ''}
            width={cover.width}
            height={cover.height}
            fetchPriority="high"
            decoding="async"
            className={cn(
              'mb-8 h-auto w-full max-w-[41rem] rounded-lg bg-muted sm:mb-10',
              'ring-1 ring-foreground/12 dark:brightness-[0.92]',
            )}
          />
        ) : null}

        <div data-slot="post-body" dangerouslySetInnerHTML={{ __html: post.html }} />

        <p data-part="back-link" className="mt-12 print:hidden">
          <a
            data-slot="button"
            href={pagePath(locale, 'blog')}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'bg-card shadow-xs transition-colors duration-[120ms] touch:h-11',
            )}
          >
            <ArrowLeft aria-hidden="true" />
            {blog.backLink}
          </a>
        </p>
      </PageContainer>
    </article>
  );
}
