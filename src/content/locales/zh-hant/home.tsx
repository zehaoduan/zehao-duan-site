/**
 * Traditional Chinese (Hong Kong): the home page.
 *
 * Each paragraph stays on one line, so that no space is gained or lost where
 * a line would otherwise end.
 */

import { ExtLink } from '@/components/content/inline';
import type { HomeContent } from '@/content/types';

import { name } from './common';

const title = '段澤浩 — 電機工程';

const portraitAlt = '段澤浩的照片';

const lehmann = 'https://www.unsw.edu.au/staff/torsten-lehmann';

const zhu = 'https://yuezhu.site/';

export const home: HomeContent = {
  meta: {
    title,
    description: '段澤浩，香港城市大學電機工程學系博士研究生，研究方向為電力系統穩定性。',
    ogDescription: '香港城市大學電機工程學系博士研究生。研究方向為電力系統穩定性。',
    twitterDescription: '香港城市大學電機工程學系博士研究生，研究方向為電力系統穩定性。',
    author: name,
    siteName: name,
    imageAlt: portraitAlt,
    profile: {
      firstName: '澤浩',
      lastName: '段',
    },
  },

  hero: {
    kicker: '電機工程',
    name,
    alternateName: {
      text: 'Zehao Duan',
    },
    role: '香港城市大學電機工程學系博士研究生。研究方向為電力系統穩定性。',
    portraitAlt,
  },

  contact: {
    label: '聯絡資料',
    labels: {
      email: '電郵',
      mobile: '手機',
      address: '地址',
      keys: '公鑰',
    },
    address: '香港九龍深水埗區香港城市大學李達三葉耀珍學術樓5026',
    postalAddress: {
      streetAddress: '香港城市大學李達三葉耀珍學術樓5026',
      addressLocality: '深水埗',
      addressRegion: '九龍',
    },
    keysLinkText: 'PGP 與 SSH 公鑰',
  },

  biography: {
    title: '簡介',
    paragraphs: [
      <>段澤浩，1997年10月出生於中國山西省臨汾市。曾就讀於澳洲南澳洲阿德萊德聖約翰文法學校（St John’s Grammar School）。2021年6月獲澳洲新南威爾斯大學（UNSW）電機工程榮譽學士學位（一等榮譽）。本科畢業論文由<ExtLink href={lehmann}>Torsten Lehmann 教授</ExtLink>指導。本科期間，他還曾擔任電機工程本科課程的助教，涉及一至四年級的多門課程。2020年獲新南威爾斯大學工程學院院長獎，以表彰其在工程學士課程第一、二或三年級的優異成績。</>,
      <>2021年6月，他獲得競爭激烈的澳洲政府研究培訓計劃獎學金（Australian Government Research Training Program Scholarship，RTP），擬在新南威爾斯大學攻讀博士學位，導師為 Lehmann 教授。後因簽證問題，未能如期入讀新南威爾斯大學博士課程。</>,
      <>2024年7月獲香港科技大學集成電路設計工程理學碩士學位。在課程的前半程，他的成績在同屆同學中排名第一。2024年11月至2026年5月任職於中國機械總院集團山西機電研究院有限責任公司（太原，山西），從事永磁同步馬達驅動器（電力電子）相關工作。</>,
      <>自2026年9月起在香港城市大學電機工程學系攻讀哲學博士學位，並獲香港城市大學頂尖大學獎學金計劃資助，導師為<ExtLink href={zhu}>朱越教授</ExtLink>。研究方向為電力系統穩定性。</>,
    ],
  },

  blog: {
    title: '網誌',
    allPosts: '全部文章',
  },

  education: {
    title: '教育',
    entries: [
      {
        id: 'phd',
        when: '2026年9月至今',
        title: '哲學博士，電機工程',
        lines: [
          '香港城市大學電機工程學系',
          <>導師：<ExtLink href={zhu}>朱越教授</ExtLink></>,
        ],
      },
      {
        id: 'msc',
        when: '2024年7月',
        title: '理學碩士，集成電路設計工程',
        lines: [
          '香港科技大學',
          '課程前半程成績排名同屆第一',
        ],
      },
      {
        id: 'beng',
        when: '2021年6月',
        title: '工程學士，電機工程，一等榮譽',
        lines: [
          '新南威爾斯大學，悉尼',
          '工程學士課程第一、二或三年級最佳成績（2020年工程學院院長獎）',
          <>畢業論文導師：<ExtLink href={lehmann}>Torsten Lehmann 教授</ExtLink></>,
        ],
      },
      {
        id: 'secondary-school',
        when: '中學',
        title: 'St John’s Grammar School',
        lines: ['澳洲南澳洲阿德萊德'],
      },
    ],
  },

  experience: {
    title: '經歷',
    entries: [
      {
        id: 'motor-drives',
        when: '2024年11月 – 2026年5月',
        title: '永磁同步馬達驅動器（電力電子）',
        lines: [
          '中國機械總院集團山西機電研究院有限責任公司，太原，山西',
        ],
      },
      {
        id: 'teaching-assistant',
        when: '本科期間',
        title: '助教',
        lines: [
          '新南威爾斯大學電機工程本科課程，涵蓋一至四年級多門課程',
        ],
      },
    ],
  },

  awards: {
    title: '獎勵',
    entries: [
      {
        id: 'studentship',
        when: '2026年5月',
        title: '頂尖大學獎學金計劃',
        lines: ['香港城市大學'],
      },
      {
        id: 'rtp-scholarship',
        when: '2021年6月',
        title: '澳洲政府研究培訓計劃獎學金（RTP）',
        lines: ['資助於新南威爾斯大學攻讀博士學位；因簽證問題未入讀'],
      },
      {
        id: 'deans-award',
        when: '2020',
        title: '工程學院院長獎',
        lines: ['新南威爾斯大學工程學士課程第一、二或三年級最佳成績'],
      },
    ],
  },

  research: {
    title: '研究方向',
    paragraphs: ['電力系統穩定性。'],
  },
};
