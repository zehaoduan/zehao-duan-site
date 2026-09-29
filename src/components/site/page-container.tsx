/**
 * PageContainer: the horizontal frame of the site. At most 72rem wide,
 * centred, with gutters of 16 px (below 640), 24 px (from 640) and 32 px
 * (from 1024). The same measure as the CSS utility `page-container`.
 *
 * Props
 *   as         element to render (default 'div')
 *   className  extra classes (layout of the content)
 *   ...        any other attribute of the element
 */

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type PageContainerProps<T extends ElementType = 'div'> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children' | 'style'>;

export function PageContainer<T extends ElementType = 'div'>({
  as,
  className,
  children,
  ...props
}: PageContainerProps<T>) {
  const Tag: ElementType = as ?? 'div';
  return (
    <Tag data-slot="page-container" className={cn('page-container', className)} {...props}>
      {children}
    </Tag>
  );
}
