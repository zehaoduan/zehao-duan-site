/**
 * Simplified Chinese: the home page.
 *
 * Each paragraph stays on one line, so that no space is gained or lost where
 * a line would otherwise end.
 */

import { ExtLink } from '@/components/content/inline';
import type { HomeContent } from '@/content/types';

import { name } from './common';

const title = '段泽浩 — 电气工程';

const portraitAlt = '段泽浩的照片';

const lehmann = 'https://www.unsw.edu.au/staff/torsten-lehmann';

const zhu = 'https://yuezhu.site/';

export const home: HomeContent = {
  meta: {
    title,
    description: '段泽浩，香港城市大学电气工程学系博士研究生，研究方向为电力系统稳定性。',
    ogDescription: '香港城市大学电气工程学系博士研究生。研究方向为电力系统稳定性。',
    twitterDescription: '香港城市大学电气工程学系博士研究生，研究方向为电力系统稳定性。',
    author: name,
    siteName: name,
    imageAlt: portraitAlt,
    profile: {
      firstName: '泽浩',
      lastName: '段',
    },
  },

  hero: {
    kicker: '电气工程',
    name,
    // The old page puts no lang attribute on the name in Latin script.
    alternateName: {
      text: 'Zehao Duan',
    },
    role: '香港城市大学电气工程学系博士研究生。研究方向为电力系统稳定性。',
    portraitAlt,
  },

  contact: {
    label: '联系方式',
    labels: {
      email: '电子邮箱',
      mobile: '手机',
      address: '地址',
      keys: '公钥',
      wechat: '微信',
    },
    address: '香港九龙深水埗区香港城市大学李达三叶耀珍学术楼5026',
    postalAddress: {
      streetAddress: '香港城市大学李达三叶耀珍学术楼5026',
      addressLocality: '深水埗',
      addressRegion: '九龙',
    },
    keysLinkText: 'PGP 与 SSH 公钥',
  },

  biography: {
    title: '简介',
    paragraphs: [
      <>段泽浩，1997年10月出生于中国山西省临汾市。曾就读于澳大利亚南澳大利亚州阿德莱德圣约翰文法学校（St John’s Grammar School）。2021年6月获澳大利亚新南威尔士大学（UNSW）电气工程荣誉学士学位（一等荣誉）。本科毕业论文由<ExtLink href={lehmann}>Torsten Lehmann 教授</ExtLink>指导。本科期间，他还曾担任电气工程本科课程的助教，涉及一至四年级的多门课程。2020年获新南威尔士大学工程学院院长奖，以表彰其在工程学士课程第一、二或三年级的优异成绩。</>,
      <>2021年6月，他获得竞争激烈的澳大利亚政府研究培训计划奖学金（Australian Government Research Training Program Scholarship，RTP），拟在新南威尔士大学攻读博士学位，导师为 Lehmann 教授。后因签证问题，未能如期入读新南威尔士大学博士项目。</>,
      <>2024年7月获香港科技大学集成电路设计工程理学硕士学位。在课程的前半程，他的成绩在同届同学中排名第一。2024年11月至2026年5月任职于中国机械总院集团山西机电研究院有限责任公司（太原，山西），从事永磁同步电机驱动器（电力电子）相关工作。</>,
      <>自2026年9月起在香港城市大学电气工程学系攻读哲学博士学位，并获香港城市大学顶尖大学奖学金计划资助，导师为<ExtLink href={zhu}>朱越教授</ExtLink>。研究方向为电力系统稳定性。</>,
    ],
  },

  education: {
    title: '教育',
    entries: [
      {
        id: 'phd',
        when: '2026年9月至今',
        title: '哲学博士，电气工程',
        lines: [
          '香港城市大学电气工程学系',
          <>导师：<ExtLink href={zhu}>朱越教授</ExtLink></>,
        ],
      },
      {
        id: 'msc',
        when: '2024年7月',
        title: '理学硕士，集成电路设计工程',
        lines: [
          '香港科技大学',
          '课程前半程成绩排名同届第一',
        ],
      },
      {
        id: 'beng',
        when: '2021年6月',
        title: '工程学士，电气工程，一等荣誉',
        lines: [
          '新南威尔士大学，悉尼',
          '工程学士课程第一、二或三年级最佳成绩（2020年工程学院院长奖）',
          <>毕业论文导师：<ExtLink href={lehmann}>Torsten Lehmann 教授</ExtLink></>,
        ],
      },
      {
        id: 'secondary-school',
        when: '中学',
        title: 'St John’s Grammar School',
        lines: ['澳大利亚南澳大利亚州阿德莱德'],
      },
    ],
  },

  experience: {
    title: '经历',
    entries: [
      {
        id: 'motor-drives',
        when: '2024年11月 – 2026年5月',
        title: '永磁同步电机驱动器（电力电子）',
        lines: [
          '中国机械总院集团山西机电研究院有限责任公司，太原，山西',
        ],
      },
      {
        id: 'teaching-assistant',
        when: '本科期间',
        title: '助教',
        lines: [
          '新南威尔士大学电气工程本科课程，涵盖一至四年级多门课程',
        ],
      },
    ],
  },

  awards: {
    title: '奖励',
    entries: [
      {
        id: 'studentship',
        when: '2026年5月',
        title: '顶尖大学奖学金计划',
        lines: ['香港城市大学'],
      },
      {
        id: 'rtp-scholarship',
        when: '2021年6月',
        title: '澳大利亚政府研究培训计划奖学金（RTP）',
        lines: ['资助于新南威尔士大学攻读博士学位；因签证问题未入读'],
      },
      {
        id: 'deans-award',
        when: '2020',
        title: '工程学院院长奖',
        lines: ['新南威尔士大学工程学士课程第一、二或三年级最佳成绩'],
      },
    ],
  },

  research: {
    title: '研究方向',
    paragraphs: ['电力系统稳定性。'],
  },
};
