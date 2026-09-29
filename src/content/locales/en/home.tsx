/**
 * English: the home page.
 *
 * Each paragraph stays on one line, so that no space is gained or lost where
 * a line would otherwise end.
 */

import { ExtLink } from '@/components/content/inline';
import type { HomeContent } from '@/content/types';

import { name } from './common';

const title = 'Zehao Duan — Electrical Engineering';

const portraitAlt = 'Portrait of Zehao Duan';

const lehmann = 'https://www.unsw.edu.au/staff/torsten-lehmann';

const zhu = 'https://yuezhu.site/';

export const home: HomeContent = {
  meta: {
    title,
    description: 'Zehao Duan is a PhD student in Electrical Engineering at City University of Hong Kong researching power system stability.',
    ogDescription: 'PhD student in Electrical Engineering at City University of Hong Kong. Research interest: power system stability.',
    twitterDescription: 'PhD student in Electrical Engineering at City University of Hong Kong researching power system stability.',
    author: name,
    siteName: name,
    imageAlt: portraitAlt,
    profile: {
      firstName: 'Zehao',
      lastName: 'Duan',
    },
  },

  hero: {
    kicker: 'Electrical Engineering',
    name,
    alternateName: {
      text: '段澤浩',
      lang: 'zh-Hant',
    },
    role: 'PhD student, Department of Electrical Engineering, City University of Hong Kong (CityUHK). Research interest: power system stability.',
    portraitAlt,
  },

  contact: {
    label: 'Contact details',
    labels: {
      email: 'Email',
      mobile: 'Mobile',
      address: 'Address',
      keys: 'Keys',
    },
    address: 'Room 5026, Li Dak Sum Yip Yio Chin Academic Building, City University of Hong Kong, Sham Shui Po District, Kowloon, Hong Kong',
    postalAddress: {
      streetAddress: 'Room 5026, Li Dak Sum Yip Yio Chin Academic Building, City University of Hong Kong',
      addressLocality: 'Sham Shui Po',
      addressRegion: 'Kowloon',
    },
    keysLinkText: 'PGP and SSH public keys',
  },

  biography: {
    title: 'Biography',
    paragraphs: [
      <>Zehao Duan was born in October 1997 in Linfen, Shanxi, China. He attended St John’s Grammar School in Adelaide, South Australia, Australia. In June 2021, he received a Bachelor of Engineering in Electrical Engineering with Honours Class 1 from the University of New South Wales (UNSW), Sydney, New South Wales, Australia. His undergraduate thesis was supervised by <ExtLink href={lehmann}>Professor Torsten Lehmann</ExtLink>. During his undergraduate study, he also worked as a teaching assistant for several courses spanning years 1 to 4 of the electrical engineering undergraduate programme. In 2020, he received the Faculty of Engineering Dean’s Award for best performance in year 1, 2 or 3 of the Bachelor of Engineering programme at UNSW.</>,
      <>In June 2021, he was awarded the highly competitive Australian Government Research Training Program (RTP) Scholarship for PhD study at UNSW, with Professor Lehmann as his supervisor. Owing to visa issues, he did not take up the UNSW PhD programme at that time.</>,
      <>In July 2024, he received a Master of Science in IC Design Engineering from the Hong Kong University of Science and Technology (HKUST), Hong Kong. During the first half of the degree, he ranked first in grades among his cohort. From November 2024 to May 2026, he worked at China Academy of Machinery Science and Technology Group Shanxi Electromechanical Research Institute Company Limited in Taiyuan, Shanxi, China, on permanent magnet synchronous motor drives (power electronics).</>,
      <>Since September 2026, he has been pursuing a Doctor of Philosophy in the Department of Electrical Engineering at City University of Hong Kong (CityUHK), Hong Kong, supported by the Top University Studentship Scheme, under the supervision of <ExtLink href={zhu}>Professor Yue Zhu</ExtLink>. His research interest is power system stability.</>,
    ],
  },

  education: {
    title: 'Education',
    entries: [
      {
        id: 'phd',
        when: 'Sep 2026 – present',
        title: 'Doctor of Philosophy',
        lines: [
          'Department of Electrical Engineering, City University of Hong Kong',
          <>Supervisor: <ExtLink href={zhu}>Professor Yue Zhu</ExtLink></>,
        ],
      },
      {
        id: 'msc',
        when: 'Jul 2024',
        title: 'Master of Science, IC Design Engineering',
        lines: [
          'Hong Kong University of Science and Technology',
          'Ranked first in grades among the cohort during the first half of the degree',
        ],
      },
      {
        id: 'beng',
        when: 'Jun 2021',
        title: 'Bachelor of Engineering, Electrical Engineering, Honours Class 1',
        lines: [
          'University of New South Wales, Sydney',
          'Best performance in year 1, 2 or 3 of the programme (Faculty of Engineering Dean’s Award, 2020)',
          <>Thesis supervisor: <ExtLink href={lehmann}>Professor Torsten Lehmann</ExtLink></>,
        ],
      },
      {
        id: 'secondary-school',
        when: 'Secondary education',
        title: 'St John’s Grammar School',
        lines: ['Adelaide, South Australia, Australia'],
      },
    ],
  },

  experience: {
    title: 'Experience',
    entries: [
      {
        id: 'motor-drives',
        when: 'Nov 2024 – May 2026',
        title: 'Permanent magnet synchronous motor drives (power electronics)',
        lines: [
          'China Academy of Machinery Science and Technology Group Shanxi Electromechanical Research Institute Company Limited, Taiyuan, Shanxi, China',
        ],
      },
      {
        id: 'teaching-assistant',
        when: 'Undergraduate years',
        title: 'Teaching assistant',
        lines: [
          'Several courses spanning years 1 to 4 of the electrical engineering undergraduate programme, UNSW',
        ],
      },
    ],
  },

  awards: {
    title: 'Awards',
    entries: [
      {
        id: 'studentship',
        when: 'May 2026',
        title: 'Top University Studentship Scheme',
        lines: ['City University of Hong Kong'],
      },
      {
        id: 'rtp-scholarship',
        when: 'Jun 2021',
        title: 'Australian Government Research Training Program (RTP) Scholarship',
        lines: ['For PhD study at UNSW; not taken up owing to visa issues'],
      },
      {
        id: 'deans-award',
        when: '2020',
        title: 'Faculty of Engineering Dean’s Award',
        lines: ['Best performance in year 1, 2 or 3, Bachelor of Engineering, UNSW'],
      },
    ],
  },

  research: {
    title: 'Research interest',
    paragraphs: ['Power system stability.'],
  },
};
