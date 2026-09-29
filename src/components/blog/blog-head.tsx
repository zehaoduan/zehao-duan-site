/**
 * BlogHead: the head band of the list of posts and of a post. Breadcrumb,
 * title, then what the page puts under the title (lede, dateline).
 *
 *   list of posts   name > Blog            title: the title of the blog
 *   a post          name > Blog (a link)   title: the title of the post
 *
 * Props
 *   locale           language of the page; aims the crumbs
 *   titleId          id of the <h1>
 *   name             the owner's name, the first crumb (dictionary.blog.head.kicker)
 *   blogTitle        the crumb of the blog (dictionary.blog.head.title)
 *   title            the page heading
 *   post             true on a post: the crumb of the blog is a link
 *   breadcrumbLabel  accessible name of the breadcrumb
 *   children         what follows the heading
 *
 * Server Component.
 */

import type { ReactNode } from 'react';

import { Band } from '@/components/site';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { Locale } from '@/i18n/config';
import { pagePath } from '@/i18n/paths';
import { cn } from '@/lib/utils';

export interface BlogHeadProps {
  locale: Locale;
  titleId: string;
  name: string;
  blogTitle: string;
  title: string;
  post?: boolean;
  breadcrumbLabel: string;
  children?: ReactNode;
}

/** 44 px high, so that it can be touched; the text stays where the design has it. */
const crumbLink = 'inline-flex min-h-11 items-center duration-[120ms]';

export function BlogHead({
  locale,
  titleId,
  name,
  blogTitle,
  title,
  post = false,
  breadcrumbLabel,
  children,
}: BlogHeadProps) {
  return (
    <Band as="header" containerClassName="pt-4 pb-9 sm:pt-6 sm:pb-12">
      <Breadcrumb aria-label={breadcrumbLabel}>
        <BreadcrumbList className="gap-x-1.5 gap-y-0 text-sm leading-[1.4] sm:gap-x-1.5">
          <BreadcrumbItem>
            <BreadcrumbLink href={pagePath(locale, 'home')} className={crumbLink}>
              {name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {post ? (
              <BreadcrumbLink href={pagePath(locale, 'blog')} className={crumbLink}>
                {blogTitle}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{blogTitle}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1
        id={titleId}
        className={cn(
          'mt-1 max-w-[44rem] text-[2rem] leading-[1.15] text-balance sm:text-[2.5rem] lang-zh:leading-[1.3]',
          'font-(--site-weight-display) tracking-(--site-tracking-display)',
        )}
      >
        {title}
      </h1>

      {children}
    </Band>
  );
}

/** The paragraph under the heading. */
export const ledeClass =
  'mt-4 max-w-[44rem] text-[1.0625rem] leading-[1.65] text-pretty text-foreground lang-zh:leading-[1.85]';
