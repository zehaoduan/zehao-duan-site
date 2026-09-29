/**
 * Command: a shell command in a block, exactly as a reader should type it.
 *
 * textContent of the block equals `command`. Inside, the markup only says
 * where a line may break when the block is narrow:
 *
 *   - the words listed in `noBreak` (options such as --with-fingerprint,
 *     hyphenated program names) stay in one piece; options are set in
 *     medium weight, so that they stand out from the arguments;
 *   - an address breaks only after a slash: host and path segments stay in
 *     one piece;
 *   - any other long word (the 40-character fingerprint) is broken only if
 *     it does not fit on a line of its own.
 *
 * Props
 *   command    the command, from '@/content/keys/facts'
 *   noBreak    words of the command that must not be broken, in order of
 *              appearance
 *   className  extra classes for the block
 *
 * Server Component.
 */

import { Fragment, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { mono } from './styles';

export interface CommandProps {
  command: string;
  noBreak: readonly string[];
  className?: string;
}

type Word =
  | { kind: 'plain'; text: string }
  | { kind: 'piece'; text: string; option: boolean }
  | { kind: 'address'; scheme: string; segments: readonly string[] };

const addressPattern = /^([a-z][a-z0-9+.-]*:\/\/)(.+)$/i;

/** The words of a command, each with what is known about it. Joined with single spaces they give the command. */
export function commandWords(command: string, noBreak: readonly string[]): Word[] {
  let next = 0;
  return command.split(' ').map((text): Word => {
    const found = addressPattern.exec(text);
    if (found) return { kind: 'address', scheme: found[1], segments: found[2].split('/') };
    if (next < noBreak.length && text === noBreak[next]) {
      next += 1;
      return { kind: 'piece', text, option: text.startsWith('-') };
    }
    return { kind: 'plain', text };
  });
}

const piece = 'whitespace-nowrap';

function word(item: Word): ReactNode {
  if (item.kind === 'plain') return item.text;
  if (item.kind === 'piece') {
    return (
      <span
        data-part={item.option ? 'command-option' : 'command-word'}
        className={cn(piece, item.option && 'font-medium')}
      >
        {item.text}
      </span>
    );
  }
  // 'https://' host '/' <wbr> segment '/' <wbr> segment
  return (
    <>
      {item.scheme}
      {item.segments.map((segment, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <>
              /
              <wbr />
            </>
          ) : null}
          {segment ? <span className={piece}>{segment}</span> : null}
        </Fragment>
      ))}
    </>
  );
}

export function Command({ command, noBreak, className }: CommandProps) {
  const words = commandWords(command, noBreak);
  return (
    <pre
      data-part="command"
      translate="no"
      lang="en"
      className={cn(
        mono,
        'rounded-lg border border-border bg-muted px-3 py-[0.5625rem]',
        'text-[0.78125rem] leading-[1.6] text-foreground',
        'whitespace-pre-wrap [overflow-wrap:anywhere]',
        className,
      )}
    >
      <code>
        {words.map((item, index) => (
          <Fragment key={index}>
            {index > 0 ? ' ' : null}
            {word(item)}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}
