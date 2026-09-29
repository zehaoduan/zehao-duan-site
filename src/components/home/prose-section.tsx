/**
 * ProseSection: Biography and Research interest.
 *
 * A section that starts with the SectionHeading, followed by its paragraphs
 * at the measure of the design (at most 41rem, never justified).
 *
 * Props
 *   id        id of the heading: target of in-page links, names the section
 *   section   a ProseSection of the dictionary ({ title, paragraphs })
 *   className extra classes for the section
 *
 * Server Component; holds no copy.
 */

import { SectionHeading } from '@/components/site';
import type { ProseSection as ProseContent } from '@/content/types';
import { cn } from '@/lib/utils';

import { keepDates } from './keep-dates';

export interface ProseSectionProps {
  id: string;
  section: ProseContent;
  className?: string;
}

export function ProseSection({ id, section, className }: ProseSectionProps) {
  return (
    <section data-slot="prose-section" aria-labelledby={id} className={className}>
      <SectionHeading id={id}>{section.title}</SectionHeading>
      <div className={cn('prose-measure mt-3.5 space-y-4 text-foreground/88')}>
        {section.paragraphs.map((paragraph, index) => (
          <p key={index}>{keepDates(paragraph)}</p>
        ))}
      </div>
    </section>
  );
}
