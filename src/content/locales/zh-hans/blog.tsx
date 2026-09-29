/**
 * Simplified Chinese: the list of blog posts and the frame around a post.
 *
 * The posts themselves are Markdown files in src/content/blog/.
 */

import type { BlogContent } from '@/content/types';

import { name } from './common';

const description = '段泽浩的博客文章。';

export const blog: BlogContent = {
  meta: {
    title: '博客 — 段泽浩',
    description,
    ogDescription: description,
    author: name,
    siteName: name,
  },

  head: {
    kicker: name,
    title: '博客',
    lede: '文章按时间排列，最新的在前。',
    breadcrumbLabel: '面包屑',
  },

  empty: '暂无文章。',
  updated: {
    label: '更新',
    separator: '：',
  },
  draft: '草稿',
  feedLink: 'RSS 订阅',
  backLink: '全部文章',
  postNav: {
    label: '上一篇和下一篇',
    previous: '上一篇',
    next: '下一篇',
  },
};
