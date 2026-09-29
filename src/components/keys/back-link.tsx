/**
 * BackLink: the link back to the home page of the language, at the end of
 * the public-key page. An ordinary link with the look of the outline Button.
 *
 * Props
 *   locale     language of the page
 *   children   the link text (dictionary.keys.backLink)
 *   className  extra classes for the paragraph
 *
 * Server Component.
 */

import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

import { buttonVariants } from '@/components/ui/button';
import type { Locale } from '@/i18n/config';
import { pagePath } from '@/i18n/paths';
import { cn } from '@/lib/utils';

import { touchHeight } from './key-card';

export interface BackLinkProps {
  locale: Locale;
  children: ReactNode;
  className?: string;
}

export function BackLink({ locale, children, className }: BackLinkProps) {
  return (
    <p data-part="back-link" className={cn('mt-10 print:hidden', className)}>
      <a
        data-slot="button"
        href={pagePath(locale, 'home')}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          touchHeight,
          'bg-card shadow-xs transition-colors duration-[120ms]',
        )}
      >
        <ArrowLeft aria-hidden="true" />
        {children}
      </a>
    </p>
  );
}
