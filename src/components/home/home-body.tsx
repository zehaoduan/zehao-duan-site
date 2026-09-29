/**
 * HomeBody: the body of the home page, inside SiteFrame.
 *
 *   1. Hero band.
 *   2. Body. From 1024 px two columns: the contact column on the left
 *      (20rem, 22.5rem from 1200 px) and the reading column on the right.
 *      Below 1024 px one column: contact first, then the sections.
 *      The order in the document is the order on the screen at every width.
 *   3. Reading column: Biography, Education, Experience, Awards, Research
 *      interest, at the measure of the design (41rem).
 *
 * The contact column is sticky only when the window is high enough to show
 * all of it below the header. The height it needs depends on the number of
 * rows, so the page with the WeChat row has a higher threshold; see `sticky`.
 *
 * Props
 *   locale      language of the page
 *   dictionary  the dictionary of the language
 *
 * Server Component; holds no copy.
 */

import { CopyStatusProvider, PageContainer } from '@/components/site';
import type { Dictionary, EducationId } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

import { ContactCard } from './contact-card';
import { Hero } from './hero';
import { ProseSection } from './prose-section';
import { TimelineSection } from './timeline-section';

/** ids of the section headings: targets of in-page links. */
export const sectionIds = {
  biography: 'biography',
  education: 'education',
  experience: 'experience',
  awards: 'awards',
  research: 'research',
} as const;

/** The entries that are still running; they carry the filled marker. */
const ongoingEducation: readonly EducationId[] = ['phd'];

/*
 * Sticky contact column. It sticks 5rem below the top of the window (the
 * header is 3.5rem high) when the window is high enough for the whole card:
 * 5rem + card + at least 1.25rem.
 *
 * Measured heights of the card from 1024 px: 678 px in English and 685 px in
 * Traditional Chinese (nine rows), 750 px in Simplified Chinese (ten rows).
 * Measure again when a row is added or the text of a row changes.
 */
const sticky = {
  nineRows: cn(
    '[@media(min-width:64rem)_and_(min-height:49.25rem)]:sticky',
    '[@media(min-width:64rem)_and_(min-height:49.25rem)]:top-20',
  ),
  tenRows: cn(
    '[@media(min-width:64rem)_and_(min-height:53.25rem)]:sticky',
    '[@media(min-width:64rem)_and_(min-height:53.25rem)]:top-20',
  ),
};

/** Distance between two sections of the reading column. */
const sectionGap = 'mt-12 sm:mt-14';

export interface HomeBodyProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function HomeBody({ locale, dictionary }: HomeBodyProps) {
  const { home, common } = dictionary;
  const hasWeChatRow = home.contact.labels.wechat !== undefined;

  return (
    <CopyStatusProvider>
      <Hero locale={locale} hero={home.hero} lastUpdated={common.lastUpdated} />

      <PageContainer
        data-slot="home-body"
        className={cn(
          'grid grid-cols-1 gap-y-10 pt-6 pb-16',
          'sm:gap-y-12 sm:pt-8 sm:pb-20',
          'lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-x-12 lg:pt-14 lg:pb-24',
          'xl:grid-cols-[22.5rem_minmax(0,1fr)] xl:gap-x-[4.5rem]',
        )}
      >
        <aside
          data-slot="contact"
          data-print="static"
          aria-label={home.contact.label}
          className={cn(
            'min-w-0 lg:self-start',
            hasWeChatRow ? sticky.tenRows : sticky.nineRows,
          )}
        >
          <ContactCard locale={locale} contact={home.contact} copyLabels={common.copy} />
        </aside>

        <div data-slot="reading" className="w-full max-w-[41rem] min-w-0 lg:justify-self-end">
          <ProseSection id={sectionIds.biography} section={home.biography} />
          <TimelineSection
            id={sectionIds.education}
            section={home.education}
            ongoing={ongoingEducation}
            className={sectionGap}
          />
          <TimelineSection
            id={sectionIds.experience}
            section={home.experience}
            className={sectionGap}
          />
          <TimelineSection id={sectionIds.awards} section={home.awards} className={sectionGap} />
          <ProseSection id={sectionIds.research} section={home.research} className={sectionGap} />
        </div>
      </PageContainer>
    </CopyStatusProvider>
  );
}
