/**
 * Simplified Chinese: strings shared by every page.
 */

import type { CommonContent } from '@/content/types';

/** The owner's name as written in Simplified Chinese. */
export const name = '段泽浩';

export const common: CommonContent = {
  skipLink: '跳到正文',
  lastUpdated: {
    label: '最近更新',
    separator: '：',
  },
  languageNavLabel: '语言',
  nav: {
    label: '网站',
    home: '首页',
    blog: '博客',
  },
  footer: {
    name,
  },
  backToHome: '返回首页',
  copy: {
    copy: '复制',
    copied: '已复制',
    failed: '请手动复制',
  },
  theme: {
    label: '主题',
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
  },
};
