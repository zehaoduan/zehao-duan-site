/**
 * LastUpdated: the 'Last updated 17 September 2026' line.
 *
 * The date is site.lastUpdated (the only copy), formatted for the language
 * with Intl.DateTimeFormat and localeMeta.dateLocale (formatDate in
 * '@/i18n/config'); label and separator come from the common dictionary.
 * The date sits in a <time> element and never breaks.
 *
 * Props
 *   locale     language of the page
 *   labels     dictionary.common.lastUpdated ({ label, separator })
 *   as         'p' (default) or 'span'
 *   className  extra classes
 */

import { site } from '@/content/site';
import type { CommonContent } from '@/content/types';
import { formatDate, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

export interface LastUpdatedProps {
  locale: Locale;
  labels: CommonContent['lastUpdated'];
  as?: 'p' | 'span';
  className?: string;
}

export function LastUpdated({ locale, labels, as: Tag = 'p', className }: LastUpdatedProps) {
  return (
    <Tag data-slot="last-updated" className={cn(className)}>
      {labels.label}
      {labels.separator}
      <time dateTime={site.lastUpdated} className="whitespace-nowrap">
        {formatDate(locale, site.lastUpdated)}
      </time>
    </Tag>
  );
}
