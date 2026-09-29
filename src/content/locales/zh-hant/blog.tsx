/**
 * Traditional Chinese (Hong Kong): the list of blog posts and the frame around a post.
 *
 * The posts themselves are Markdown files in src/content/blog/.
 */

import type { BlogContent } from '@/content/types';

import { name } from './common';

const description = '段澤浩的網誌文章。';

export const blog: BlogContent = {
  meta: {
    title: '網誌 — 段澤浩',
    description,
    ogDescription: description,
    author: name,
    siteName: name,
  },

  head: {
    kicker: name,
    title: '網誌',
    lede: '文章按時間排列，最新的在前。',
    breadcrumbLabel: '瀏覽路徑',
  },

  empty: '暫無文章。',
  updated: {
    label: '更新',
    separator: '：',
  },
  draft: '草稿',
  feedLink: 'RSS 訂閱',
  backLink: '全部文章',
  postNav: {
    label: '上一篇和下一篇',
    previous: '上一篇',
    next: '下一篇',
  },
};
