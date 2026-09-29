/**
 * English: the list of blog posts and the frame around a post.
 *
 * The posts themselves are Markdown files in src/content/blog/.
 */

import type { BlogContent } from '@/content/types';

import { name } from './common';

const description = 'Posts by Zehao Duan.';

export const blog: BlogContent = {
  meta: {
    title: 'Blog — Zehao Duan',
    description,
    ogDescription: description,
    author: name,
    siteName: name,
  },

  head: {
    kicker: name,
    title: 'Blog',
    lede: 'Posts, newest first.',
    breadcrumbLabel: 'Breadcrumb',
  },

  empty: 'No posts yet.',
  updated: {
    label: 'Updated',
    separator: ' ',
  },
  draft: 'Draft',
  feedLink: 'RSS feed',
  backLink: 'All posts',
  postNav: {
    label: 'Posts before and after',
    previous: 'Previous post',
    next: 'Next post',
  },
};
