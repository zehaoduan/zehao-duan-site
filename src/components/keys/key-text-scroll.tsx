'use client';

/**
 * KeyTextScroll: the text of a key file whose lines are kept (the PGP
 * block). On narrow screens it scrolls sideways; a shadow at the edge is the
 * hint that more text lies behind it.
 *
 * In the server HTML, and wherever scripts do not run, it is a <pre> that
 * scrolls by itself: a focusable region with its accessible name. After
 * hydration the same <pre> sits in a shadcn ScrollArea, which adds a
 * scrollbar that can be seen; the region and its name move to the
 * ScrollArea, whose viewport takes the focus while there is something to
 * scroll.
 *
 * The ScrollArea is not in the server HTML because Base UI gives it style
 * attributes, which the Content-Security-Policy does not allow there. Styles
 * set by scripts after hydration are allowed. CSPProvider keeps Base UI from
 * adding a <style> element without a nonce; the classes below hide the native
 * scrollbar instead.
 *
 * In both forms the text stands between the email_off comment pair, and
 * textContent of the <pre> equals the file, final newline included.
 *
 * Props
 *   id     id of the <pre>
 *   text   the key text, from '@/content/keys/facts' (PGP_ARMOR)
 *   label  accessible name of the region (dictionary.keys.pgp.keyAriaLabel)
 */

import { CSPProvider } from '@base-ui/react/csp-provider';

import { EmailOff } from '@/components/site/email-off';
import { useHydrated } from '@/components/site/use-hydrated';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { edgeShadowBackground, focusInside, keyText, keyTextLines } from './styles';

export interface KeyTextScrollProps {
  id: string;
  text: string;
  label: string;
}

/** The viewport of the ScrollArea: no native scrollbar, focus outline inside the card. */
const viewport = cn(
  '*:data-[slot=scroll-area-viewport]:[scrollbar-width:none]',
  '[&>[data-slot=scroll-area-viewport]::-webkit-scrollbar]:hidden',
  '[&>[data-slot=scroll-area-viewport]:focus-visible]:-outline-offset-2!',
);

/** The same edge shadows as in the server HTML, switched by the state of the ScrollArea. */
const edgeShadows = cn(
  'before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-4',
  'before:bg-linear-to-r before:from-foreground/20 before:to-transparent before:opacity-0',
  'dark:before:from-black/55 data-overflow-x-start:before:opacity-100',
  'after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-4',
  'after:bg-linear-to-l after:from-foreground/20 after:to-transparent after:opacity-0',
  'dark:after:from-black/55 data-overflow-x-end:after:opacity-100',
);

/** The scrollbar: 8 px high, as far from the edges as the text, the thumb a little darker than the track. */
const scrollbar = cn(
  'z-20 data-horizontal:h-2 data-horizontal:px-[1.125rem]',
  '*:data-[slot=scroll-area-thumb]:bg-input',
);

export function KeyTextScroll({ id, text, label }: KeyTextScrollProps) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return (
      <EmailOff
        as="pre"
        id={id}
        data-part="key-text"
        text={text}
        role="region"
        aria-label={label}
        tabIndex={0}
        translate="no"
        lang="en"
        className={cn(keyText, keyTextLines, 'overflow-x-auto', edgeShadowBackground, focusInside)}
      />
    );
  }

  return (
    <CSPProvider disableStyleElements>
      <ScrollArea role="region" aria-label={label} className={cn('bg-card', viewport, edgeShadows)}>
        <EmailOff
          as="pre"
          id={id}
          data-part="key-text"
          text={text}
          translate="no"
          lang="en"
          className={cn(keyText, keyTextLines, 'w-max min-w-full')}
        />
        <ScrollBar orientation="horizontal" className={scrollbar} />
      </ScrollArea>
    </CSPProvider>
  );
}
