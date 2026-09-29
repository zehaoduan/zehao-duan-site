/**
 * keepDates: dates inside Chinese running text never break across lines
 * (docs/design.md, Typography).
 *
 * A browser may break a line between any two Chinese characters and between
 * a digit and a Chinese character, so '2021年6月' could end one line with
 * '2021年' and start the next with '6月'. The content modules hold plain text
 * and no markup for dates; this helper wraps each date it finds in a span
 * that does not break. Nothing is added to or taken from the text.
 *
 * It walks rich text (strings, arrays, fragments, elements such as ExtLink)
 * and returns the same tree with the dates wrapped. English text has no match
 * and comes back unchanged.
 *
 * No hooks and no browser APIs: safe in Server Components.
 */

import { cloneElement, Fragment, isValidElement, type ReactNode } from 'react';

import type { RichText } from '@/content/types';

/** 2021年, 2021年6月, 2021年6月17日 */
const chineseDate = /\d{4}年(?:\d{1,2}月(?:\d{1,2}日)?)?/g;

function wrapDates(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(chineseDate)) {
    const start = match.index;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(
      <span key={start} data-slot="date" className="whitespace-nowrap">
        {match[0]}
      </span>,
    );
    last = start + match[0].length;
  }
  if (parts.length === 0) return text;
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function keepDates(node: RichText): ReactNode {
  if (typeof node === 'string') return wrapDates(node);
  if (Array.isArray(node)) {
    return node.map((child, index) => <Fragment key={index}>{keepDates(child)}</Fragment>);
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    const { children } = node.props;
    if (children === undefined || children === null) return node;
    return cloneElement(node, undefined, keepDates(children));
  }
  return node;
}
