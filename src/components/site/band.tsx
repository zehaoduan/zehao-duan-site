/**
 * Band: the full-width band in the card colour with a bottom hairline, used
 * by the hero of the home page and by the head of the public-key page. The
 * content sits in a PageContainer.
 *
 * Props
 *   as                  element of the band: 'section' (default), 'div' or 'header'
 *   className           extra classes for the band itself
 *   containerClassName  classes for the inner PageContainer (grid, padding)
 *   ...                 any other attribute of the band element
 *                       (aria-labelledby, id)
 */

import type { HTMLAttributes, ReactNode } from 'react';

import { PageContainer } from '@/components/site/page-container';
import { cn } from '@/lib/utils';

export interface BandProps extends Omit<HTMLAttributes<HTMLElement>, 'style'> {
  as?: 'section' | 'div' | 'header';
  containerClassName?: string;
  children: ReactNode;
}

export function Band({
  as: Tag = 'section',
  className,
  containerClassName,
  children,
  ...props
}: BandProps) {
  return (
    <Tag data-slot="band" className={cn('border-b border-border bg-card', className)} {...props}>
      <PageContainer className={containerClassName}>{children}</PageContainer>
    </Tag>
  );
}
