/**
 * Simplified Chinese: the not-found page.
 *
 * The old 404.html speaks three languages at once; this is its Simplified
 * Chinese part. The status code and the status line of its footer are the
 * same in every language and live in site.notFound.
 */

import type { NotFoundContent } from '@/content/types';

export const notFound: NotFoundContent = {
  meta: {
    title: '404 — 页面未找到',
    description: '此页面不存在。',
  },
  title: '页面未找到',
  body: <>抱歉，您访问的页面可能已被删除、更名或暂时无法访问。</>,
  returnLink: '返回首页',
};
