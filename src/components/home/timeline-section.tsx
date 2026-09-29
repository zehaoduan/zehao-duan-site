/**
 * TimelineSection: Education, Experience, Awards.
 *
 * A section that starts with the SectionHeading, followed by an ordered list
 * with one entry per item. Each entry has three parts:
 *
 *   date      muted, regular weight, never wraps
 *   marker    a hollow ring, or a filled dot for an entry that is still
 *             running; a hairline joins the markers of one list
 *   entry     title, first detail line in the foreground colour, further
 *             lines muted
 *
 *   from 640 px    date | marker | entry
 *   below 640 px   marker | date above the entry
 *
 * The markers are decoration (aria-hidden); the date says the same in words.
 *
 * Props
 *   id        id of the heading: target of in-page links, names the section
 *   section   a TimelineSection of the dictionary ({ title, entries })
 *   ongoing   ids of the entries that are still running (filled dot)
 *   className extra classes for the section
 *
 * Server Component; holds no copy.
 */

import { SectionHeading } from '@/components/site';
import type { TimelineSection as TimelineContent } from '@/content/types';
import { cn } from '@/lib/utils';

import { keepDates } from './keep-dates';

export interface TimelineSectionProps<Id extends string> {
  id: string;
  section: TimelineContent<Id>;
  ongoing?: readonly Id[];
  className?: string;
}

export function TimelineSection<Id extends string>({
  id,
  section,
  ongoing = [],
  className,
}: TimelineSectionProps<Id>) {
  return (
    <section data-slot="timeline-section" aria-labelledby={id} className={className}>
      <SectionHeading id={id}>{section.title}</SectionHeading>

      <ol data-slot="timeline" className="mt-5">
        {section.entries.map((entry) => {
          const isOngoing = ongoing.includes(entry.id);
          return (
            <li
              key={entry.id}
              data-entry={entry.id}
              data-ongoing={isOngoing ? '' : undefined}
              className={cn(
                'group/entry grid grid-cols-[0.5625rem_minmax(0,1fr)] gap-x-3.5 pb-6 last:pb-0',
                'sm:grid-cols-[9rem_0.5625rem_minmax(0,1fr)] sm:items-baseline sm:gap-x-5 sm:pb-7',
                'sm:lang-zh:grid-cols-[10rem_0.5625rem_minmax(0,1fr)]',
              )}
            >
              <p
                data-slot="timeline-date"
                className={cn(
                  'col-start-2 row-start-1 text-[0.8125rem] leading-normal font-normal',
                  'whitespace-nowrap text-muted-foreground',
                  'sm:col-start-1',
                )}
              >
                {entry.when}
              </p>

              <span
                aria-hidden="true"
                data-slot="timeline-marker"
                className={cn(
                  'relative col-start-1 row-span-2 row-start-1 self-stretch',
                  'sm:col-start-2 sm:row-span-1',
                )}
              >
                {/* the marker: aligned with the date on phones, with the title from 640 px */}
                <span
                  className={cn(
                    'absolute top-[0.328rem] left-0 size-[0.5625rem] rounded-full',
                    'border-[1.5px] border-primary',
                    isOngoing ? 'bg-primary' : 'bg-background',
                    'sm:top-[0.4rem] sm:lang-zh:top-[0.52rem]',
                  )}
                />
                {/* the hairline to the next marker */}
                <span
                  className={cn(
                    'absolute top-[1.14rem] -bottom-[1.58rem] left-1/2 w-px -translate-x-1/2 bg-input',
                    'group-last/entry:hidden',
                    'sm:top-[1.21rem] sm:-bottom-[1.9rem]',
                    'sm:lang-zh:top-[1.33rem] sm:lang-zh:-bottom-[2.02rem]',
                  )}
                />
              </span>

              <div
                data-slot="timeline-entry"
                className="col-start-2 row-start-2 mt-0.5 min-w-0 sm:col-start-3 sm:row-start-1 sm:mt-0"
              >
                <p
                  className={cn(
                    'text-[0.9375rem] leading-[1.45] font-(--site-weight-title) tracking-[-0.006em] text-pretty',
                    'lang-zh:text-base lang-zh:leading-[1.6] lang-zh:tracking-[0.01em]',
                  )}
                >
                  {entry.title}
                </p>
                {entry.lines.map((line, index) => (
                  <p
                    key={index}
                    className={cn(
                      'text-sm leading-[1.6] text-pretty',
                      'lang-zh:text-[0.9375rem] lang-zh:leading-[1.75]',
                      index === 0 ? 'mt-1 text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {keepDates(line)}
                  </p>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
