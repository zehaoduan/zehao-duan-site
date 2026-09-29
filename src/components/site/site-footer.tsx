/**
 * The footer of the site: a top hairline, the owner's name on the left and
 * a second item on the right (the last-updated date on the two pages, the
 * status line on the 404 page). SiteFrame renders it; pages do not.
 *
 * Props
 *   name      left item, set in the foreground colour
 *   children  right item
 */

import type { ReactNode } from 'react';

import { PageContainer } from '@/components/site/page-container';

export interface SiteFooterProps {
  name: ReactNode;
  children: ReactNode;
}

export function SiteFooter({ name, children }: SiteFooterProps) {
  return (
    <footer
      data-slot="site-footer"
      className="mt-auto border-t border-border text-[0.8125rem] leading-normal text-muted-foreground"
    >
      <PageContainer className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-5">
        <span className="font-medium text-foreground lang-zh:font-normal">{name}</span>
        {children}
      </PageContainer>
    </footer>
  );
}
