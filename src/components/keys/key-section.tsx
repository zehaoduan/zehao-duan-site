/**
 * The sections of the public-key page.
 *
 *   KeySection    one key: heading with the accent tab, one sentence on what
 *                 the key is for, then the key card and the usage steps.
 *                 From 1200 px the card (40.5rem) and the steps stand side by
 *                 side; below that the steps follow the card. From 1024 to
 *                 1199 px card and steps take the full width; below 1024 px
 *                 they keep to 44rem.
 *   NotesSection  a heading and what belongs under it (the trust notes).
 *
 * The section element carries `id` (the target of in-page links); its
 * heading carries `${id}-title` and names the section.
 *
 * Props
 *   id         'pgp', 'ssh', 'verify' (keyFacts.anchors)
 *   title      heading text
 *   intro      KeySection: the sentence under the heading
 *   card       KeySection: the key card
 *   steps      KeySection: the usage steps
 *   children   NotesSection: the content
 *   className  extra classes for the section
 *
 * Server Components.
 */

import type { ReactNode } from 'react';

import { SectionHeading } from '@/components/site';
import type { RichText } from '@/content/types';
import { cn } from '@/lib/utils';

export interface KeySectionProps {
  id: string;
  title: string;
  intro: RichText;
  card: ReactNode;
  steps: ReactNode;
  className?: string;
}

const introduction = cn(
  'mt-1.5 max-w-[44rem] text-[0.9375rem] leading-[1.6] text-pretty text-muted-foreground',
  'lang-zh:leading-[1.8]',
);

export function KeySection({ id, title, intro, card, steps, className }: KeySectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={className}>
      <SectionHeading id={titleId}>{title}</SectionHeading>
      <p className={introduction}>{intro}</p>
      <div
        className={cn(
          'mt-6 grid grid-cols-1 items-start gap-8',
          'xl:grid-cols-[minmax(0,40.5rem)_minmax(0,1fr)] xl:gap-x-12',
        )}
      >
        <div className="min-w-0 sm:max-lg:max-w-[44rem]">{card}</div>
        <div className="min-w-0 sm:max-lg:max-w-[44rem]">{steps}</div>
      </div>
    </section>
  );
}

export interface NotesSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export function NotesSection({ id, title, children, className }: NotesSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className={className}>
      <SectionHeading id={titleId}>{title}</SectionHeading>
      <div className="mt-6 sm:max-[52rem]:max-w-[44rem]">{children}</div>
    </section>
  );
}
