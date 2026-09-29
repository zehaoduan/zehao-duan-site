/**
 * SectionHeading: the start of a section. A hairline whose first 32 px are
 * 2 px high in the accent colour (the accent tab), then the heading.
 *
 *   <section aria-labelledby="education">
 *     <SectionHeading id="education">{home.education.title}</SectionHeading>
 *     ...
 *   </section>
 *
 * Props
 *   id         id of the heading element: the target of in-page links and
 *              of aria-labelledby on the section
 *   as         'h2' (default) or 'h3'
 *   children   the heading text, from the dictionary
 *   action     optional content at the right end of the heading line
 *   className  extra classes for the wrapper (the element with the rule)
 *   headingClassName  extra classes for the heading element
 */

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface SectionHeadingProps {
  id: string;
  as?: 'h2' | 'h3';
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  headingClassName?: string;
}

export function SectionHeading({
  id,
  as: Tag = 'h2',
  children,
  action,
  className,
  headingClassName,
}: SectionHeadingProps) {
  return (
    <div
      data-slot="section-heading"
      className={cn('accent-tab flex items-baseline justify-between gap-4 pt-5', className)}
    >
      <Tag
        id={id}
        className={cn(
          'text-xl leading-[1.3] font-(--site-weight-heading) tracking-(--site-tracking-tight)',
          headingClassName,
        )}
      >
        {children}
      </Tag>
      {action}
    </div>
  );
}
