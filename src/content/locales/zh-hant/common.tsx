/**
 * Traditional Chinese (Hong Kong): strings shared by every page.
 */

import type { CommonContent } from '@/content/types';

/** The owner's name as written in Traditional Chinese. */
export const name = '段澤浩';

export const common: CommonContent = {
  skipLink: '跳到正文',
  lastUpdated: {
    label: '最近更新',
    separator: '：',
  },
  languageNavLabel: '語言',
  nav: {
    label: '網站',
    home: '主頁',
    blog: '網誌',
  },
  footer: {
    name,
  },
  backToHome: '返回主頁',
  copy: {
    copy: '複製',
    copied: '已複製',
    failed: '請手動複製',
  },
  theme: {
    label: '主題',
    light: '淺色',
    dark: '深色',
    system: '跟隨系統',
  },
};
