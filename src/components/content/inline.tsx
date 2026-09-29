/**
 * Inline helpers for rich text in the content modules (src/content).
 *
 * They carry meaning only: which text is a link, which is code, which must be
 * left alone by translation tools. They have no styling of their own; each one
 * sets a data-slot attribute as the hook for styles.
 *
 * No hooks and no browser APIs, so they render on the server and may also be
 * used inside Client Components.
 */

import { Fragment, type ComponentPropsWithoutRef } from 'react';

type ExtLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & { href: string };

/** A link to another site. */
export function ExtLink({ href, children, ...props }: ExtLinkProps) {
  return (
    <a data-slot="ext-link" href={href} {...props}>
      {children}
    </a>
  );
}

/** Inline code: a command, a path or a word a program prints. Never translated. */
export function Code({ children, ...props }: ComponentPropsWithoutRef<'code'>) {
  return (
    <code data-slot="inline-code" translate="no" {...props}>
      {children}
    </code>
  );
}

/** Latin text that translation tools must keep as it is: file names, addresses. */
export function NoTranslate({ children, ...props }: ComponentPropsWithoutRef<'span'>) {
  return (
    <span data-slot="no-translate" translate="no" lang="en" {...props}>
      {children}
    </span>
  );
}

/**
 * A long unspaced string (an address, a fingerprint) that may break between
 * its parts and nowhere else: the parts in order with a <wbr> between
 * neighbours. The text content is the parts joined with nothing in between.
 */
export function Breakable({ parts }: { parts: readonly string[] }) {
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 ? <wbr /> : null}
          {part}
        </Fragment>
      ))}
    </>
  );
}

/** An ISO calendar date shown as it is (2031-09-16), marked up as a date. */
export function IsoDate({ value }: { value: string }) {
  return (
    <time data-slot="iso-date" dateTime={value}>
      {value}
    </time>
  );
}
