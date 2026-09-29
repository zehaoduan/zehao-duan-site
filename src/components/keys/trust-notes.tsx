/**
 * TrustNotes: the six numbered notes in one shadcn Card. One column below
 * 832 px, two columns (2 x 3) from there, with hairlines between the cells.
 *
 * Each note is a list item with the bold opening sentence and the rest of
 * the note, as on the old pages: <li><strong>lead</strong> body</li>. The
 * numbers come from a CSS counter on the list.
 *
 * Props
 *   notes      dictionary.keys.trust.notes
 *   className  extra classes for the Card
 *
 * Server Component.
 */

import { Card } from '@/components/ui/card';
import type { TrustNote } from '@/content/types';
import { cn } from '@/lib/utils';

import { surface } from './styles';

export interface TrustNotesProps {
  notes: readonly TrustNote[];
  className?: string;
}

const cell = cn(
  'grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-3 px-5 pt-[1.125rem] pb-5',
  'text-sm leading-[1.65] text-muted-foreground [counter-increment:note] lang-zh:leading-[1.8]',
  // the number
  'before:grid before:size-6 before:place-items-center before:rounded-md',
  'before:bg-accent before:text-xs before:leading-none before:font-semibold before:text-accent-foreground',
  'before:tabular-nums before:content-[counter(note)]',
  // hairlines: between rows, and between the two columns
  'not-first:border-t not-first:border-border',
  'min-[52rem]:px-6 min-[52rem]:pt-5 min-[52rem]:pb-[1.375rem]',
  'min-[52rem]:not-first:border-t-0 min-[52rem]:nth-[n+3]:border-t',
  'min-[52rem]:odd:border-r min-[52rem]:odd:border-border',
);

/** The bold opening sentence, on a line of its own. */
const lead = cn(
  'mb-1 block text-[0.9375rem] leading-[1.6] font-semibold tracking-[-0.006em]',
  'text-card-foreground lang-zh:tracking-normal',
);

export function TrustNotes({ notes, className }: TrustNotesProps) {
  return (
    <Card data-part="trust-notes" className={cn(surface, 'text-card-foreground', className)}>
      <ol role="list" className="grid grid-cols-1 [counter-reset:note] min-[52rem]:grid-cols-2">
        {notes.map((note) => (
          <li key={note.id} data-note={note.id} className={cell}>
            <div className="text-pretty">
              <strong className={lead}>{note.lead}</strong>{' '}
              {note.body}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
