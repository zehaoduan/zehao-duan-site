/**
 * The key card: one shadcn Card per key, read as one object.
 *
 *   <KeyCard>
 *     <KeyFacts>
 *       <KeyFact label="Fingerprint" labelId="pgp-fpr-label" action={<CopyButton ... />}>
 *         <Fingerprint ... />
 *       </KeyFact>
 *       <KeyFact label="Type">...</KeyFact>
 *     </KeyFacts>
 *     <KeyFile file={keyFacts.pgp.file} nameId="pgp-file" action={<CopyButton ... />}>
 *       <KeyTextScroll ... />
 *     </KeyFile>
 *     <KeyDownload file={keyFacts.pgp.file}>{keys.pgp.download}</KeyDownload>
 *   </KeyCard>
 *
 *   KeyCard      the Card
 *   KeyFacts     the definition list at the top
 *   KeyFact      one row: label and value; with `action` (the Copy button)
 *                the button stands at the end of the row, and below the value
 *                on narrow screens
 *   KeyFile      the strip with the file name and its Copy button, then the
 *                key text
 *   KeyDownload  the footer with the Download button, an <a download>
 *
 * Layout of the card
 *   below 1024 px and from 1200 px   facts, key file and footer one under
 *                                    the other
 *   1024 to 1199 px                  the card takes the full width: facts on
 *                                    the left, key file on the right, the
 *                                    footer under both (the steps follow
 *                                    under the card at these widths)
 *
 * The components hold no copy; labels and values are props and children.
 * Server Components.
 */

import { Download, FileKey } from 'lucide-react';
import type { ReactNode } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { KeyFile as KeyFileFacts } from '@/content/types';
import { cn } from '@/lib/utils';

import { mono, surface } from './styles';

/** The side padding of every part of the card. */
const inset = 'px-[1.125rem]';

/** At least 44 px of height on phones and on touch screens. */
export const touchHeight = 'touch:h-11';

export interface KeyCardProps {
  children: ReactNode;
  className?: string;
}

export function KeyCard({ children, className }: KeyCardProps) {
  return (
    <Card
      data-part="key-card"
      className={cn(
        surface,
        // 1024 to 1199 px: facts | key file, wide enough for the lines of either key
        'lg:max-xl:grid lg:max-xl:grid-cols-[minmax(21rem,1fr)_minmax(0,40rem)]',
        className,
      )}
    >
      {children}
    </Card>
  );
}

export interface KeyFactsProps {
  children: ReactNode;
}

export function KeyFacts({ children }: KeyFactsProps) {
  return (
    <CardContent className="px-0">
      <dl data-part="key-facts" className="divide-y divide-border">
        {children}
      </dl>
    </CardContent>
  );
}

export interface KeyFactProps {
  label: string;
  /** id of the <dt>, for the accessible name of the Copy button. */
  labelId?: string;
  /** The value. */
  children: ReactNode;
  /** The Copy button of the value. */
  action?: ReactNode;
}

const factLabel =
  'text-[0.8125rem] leading-normal font-(--site-weight-label) text-muted-foreground';

/** The classes of a fact value. Exported for values that another element renders (EmailOff as="dd"). */
export const factValue = 'text-sm leading-[1.55] [overflow-wrap:anywhere]';

/** Value and Copy button: side by side from 640 px, the button below the value on narrow screens. */
const factValueWithAction = cn(
  'flex flex-col items-start gap-x-3 gap-y-2 text-sm leading-[1.55]',
  'sm:flex-row sm:flex-wrap sm:items-center sm:justify-between',
);

/** Label above value; from 640 px label beside value, except in the narrow pane of 1024 to 1199 px. */
const factRow = cn(
  inset,
  'grid grid-cols-1 gap-y-0.5 py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-x-4',
  'lg:max-xl:grid-cols-1',
);

export function KeyFact({ label, labelId, children, action }: KeyFactProps) {
  return (
    <div
      data-part="key-fact"
      className={cn(
        factRow,
        action ? 'sm:items-center lg:max-xl:items-stretch' : 'sm:items-baseline',
      )}
    >
      <dt id={labelId} className={factLabel}>
        {label}
      </dt>
      {action ? (
        <dd className={factValueWithAction}>
          <span className="min-w-0 sm:flex-[1_1_12rem]">{children}</span>
          {action}
        </dd>
      ) : (
        <dd className={factValue}>{children}</dd>
      )}
    </div>
  );
}

export interface KeyFactRowProps {
  label: string;
  /** The <dd> itself, for values that must be written as HTML (the user ID). */
  value: ReactNode;
}

/** A row whose <dd> the caller renders (with the classes of `factValue`). */
export function KeyFactRow({ label, value }: KeyFactRowProps) {
  return (
    <div data-part="key-fact" className={cn(factRow, 'sm:items-baseline')}>
      <dt className={factLabel}>{label}</dt>
      {value}
    </div>
  );
}

export interface KeyFileProps {
  file: KeyFileFacts;
  /** id of the element with the file name, for the accessible name of the Copy button. */
  nameId: string;
  /** The Copy button of the key text. */
  action?: ReactNode;
  /** The key text. */
  children: ReactNode;
}

const strip = 'border-border bg-muted/60';

export function KeyFile({ file, nameId, action, children }: KeyFileProps) {
  return (
    <CardContent
      data-part="key-file"
      className="border-t border-border px-0 lg:max-xl:border-t-0 lg:max-xl:border-l"
    >
      <div
        data-part="key-file-head"
        className={cn(
          strip,
          'flex min-h-11 items-center justify-between gap-3 border-b py-2 pr-2.5 pl-[1.125rem]',
        )}
      >
        <span
          id={nameId}
          translate="no"
          lang="en"
          className={cn(
            mono,
            'inline-flex items-center gap-2 text-[0.8125rem] leading-normal font-medium text-muted-foreground',
          )}
        >
          <FileKey aria-hidden="true" className="size-3.5 shrink-0" />
          {file.fileName}
        </span>
        {action}
      </div>
      {children}
    </CardContent>
  );
}

export interface KeyDownloadProps {
  file: KeyFileFacts;
  /** The label, file name included (dictionary.keys.pgp.download). */
  children: ReactNode;
}

export function KeyDownload({ file, children }: KeyDownloadProps) {
  return (
    <CardFooter
      data-part="key-download"
      className={cn(strip, inset, 'rounded-none py-2.5 lg:max-xl:col-span-2 print:hidden')}
    >
      <a
        data-slot="button"
        href={file.path}
        download
        className={cn(
          buttonVariants({ variant: 'default' }),
          touchHeight,
          'transition-colors duration-[120ms]',
          'hover:bg-[color-mix(in_oklch,var(--primary)_85%,var(--foreground))]',
        )}
      >
        <Download aria-hidden="true" />
        <span>{children}</span>
      </a>
    </CardFooter>
  );
}
