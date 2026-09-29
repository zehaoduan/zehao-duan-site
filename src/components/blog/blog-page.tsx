/**
 * BlogPage: the list of posts, newest first, in the language of the
 * dictionary. The route file renders it inside SiteFrame.
 *
 *   head band   breadcrumb, title, lede, link to the feed
 *   list        one entry per post: dateline, title (the link), description,
 *               and a row of small previews of its pictures
 *
 * The row of previews shows at most four pictures below 640 px and six from
 * there. It is a second link to the post, for the pointer only: the title is
 * the link that keyboards and screen readers meet.
 *
 * Props
 *   locale      language of the page
 *   dictionary  the dictionary of the language
 *   posts       the posts of the language, from getPosts(locale)
 *
 * Server Component; holds no copy.
 */

import { Rss } from 'lucide-react';

import { PageContainer } from '@/components/site';
import type { Dictionary, PostSummary } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { feedPath, postPath } from '@/i18n/paths';
import { cn } from '@/lib/utils';

import { BlogHead, ledeClass } from './blog-head';
import { PostDates } from './post-dates';

export interface BlogPageProps {
  locale: Locale;
  dictionary: Dictionary;
  posts: readonly PostSummary[];
}

const titleId = 'blog-title';

/** Previews in a row from 640 px; below, the first four are shown. */
const previewCount = 6;

export function BlogPage({ locale, dictionary, posts }: BlogPageProps) {
  const { blog } = dictionary;

  return (
    <>
      <BlogHead
        locale={locale}
        titleId={titleId}
        name={blog.head.kicker}
        blogTitle={blog.head.title}
        title={blog.head.title}
        breadcrumbLabel={blog.head.breadcrumbLabel}
      >
        <p className={ledeClass}>{blog.head.lede}</p>
        <p className="mt-3 text-sm leading-normal">
          <a
            href={feedPath(locale)}
            type="application/rss+xml"
            className="text-link relative inline-flex items-center gap-1.5 touch:min-h-11"
          >
            <Rss aria-hidden="true" className="size-3.5" />
            {blog.feedLink}
          </a>
        </p>
      </BlogHead>

      <PageContainer className="pt-4 pb-16 sm:pt-6 lg:pt-8 lg:pb-24">
        {posts.length === 0 ? (
          <p className="pt-6 text-muted-foreground">{blog.empty}</p>
        ) : (
          <ul role="list" aria-labelledby={titleId} className="max-w-[41rem]">
            {posts.map((post) => (
              <li key={post.slug} className="border-border py-6 not-first:border-t sm:py-7">
                <article>
                  <PostDates locale={locale} post={post} labels={blog} />
                  <h2
                    className={cn(
                      'mt-1 text-xl leading-[1.3] text-balance lang-zh:leading-[1.45]',
                      'font-(--site-weight-heading) tracking-(--site-tracking-tight)',
                    )}
                  >
                    <a
                      href={postPath(locale, post.slug)}
                      className="transition-colors duration-[120ms] hover:text-primary"
                    >
                      {post.title}
                    </a>
                  </h2>
                  <p className="mt-1.5 text-[0.9375rem] leading-[1.6] text-pretty text-muted-foreground lang-zh:leading-[1.8]">
                    {post.description}
                  </p>
                  {post.previews ? (
                    <a
                      data-slot="post-previews"
                      href={postPath(locale, post.slug)}
                      tabIndex={-1}
                      aria-hidden="true"
                      className="group mt-3.5 grid grid-cols-4 gap-2 sm:grid-cols-6 print:hidden"
                    >
                      {post.previews.slice(0, previewCount).map((preview) => (
                        // eslint-disable-next-line @next/next/no-img-element -- next/image renders a style attribute (CSP)
                        <img
                          key={preview.src}
                          src={preview.src}
                          alt=""
                          width={preview.width}
                          height={preview.height}
                          loading="lazy"
                          decoding="async"
                          className={cn(
                            'aspect-square h-auto w-full rounded-md bg-muted object-cover',
                            'ring-1 ring-foreground/12 dark:brightness-[0.92]',
                            'transition-opacity duration-[120ms] group-hover:opacity-90',
                            'max-sm:nth-[n+5]:hidden',
                          )}
                        />
                      ))}
                    </a>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </PageContainer>
    </>
  );
}
