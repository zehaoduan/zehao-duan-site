/**
 * Traditional Chinese (Hong Kong): the not-found page.
 *
 * The old 404.html speaks three languages at once; this is its Traditional
 * Chinese part. The status code and the status line of its footer are the
 * same in every language and live in site.notFound.
 */

import type { NotFoundContent } from '@/content/types';

export const notFound: NotFoundContent = {
  meta: {
    title: '404 — 找不到網頁',
    description: '此頁面不存在。',
  },
  title: '找不到網頁',
  body: <>抱歉，您所尋找的頁面可能已被移除、名稱已變更或暫時無法使用。</>,
  returnLink: '返回主頁',
};
