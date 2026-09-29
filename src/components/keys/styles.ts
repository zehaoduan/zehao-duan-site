/**
 * Class lists that more than one component of the public-key page uses.
 * Plain strings, so Server and Client Components can both import them.
 *
 * Measurements follow the mock-up (mock.css) where docs/design.md does not
 * say otherwise.
 */

import { cn } from '@/lib/utils';

/** A surface of the page: the shared card look. */
export { surface } from '@/components/site/surface';

/** Mono text that is never translated carries lang="en", which needs font-mono said again. */
export const mono = 'font-mono [font-variant-ligatures:none]';

/** The key text: 12.5 px mono on the card colour. */
export const keyText = cn(
  mono,
  'block px-[1.125rem] py-4 text-[0.78125rem] leading-[1.65] text-card-foreground [tab-size:2]',
);

/** The key text that wraps (the SSH line). */
export const keyTextWrap = 'whitespace-pre-wrap [overflow-wrap:anywhere]';

/** The key text that keeps its lines and scrolls sideways where it must (the PGP block). */
export const keyTextLines = 'whitespace-pre';

/** The scroll hint: a shadow at each edge that has more text behind it (globals.css). */
export const edgeShadowBackground = 'scroll-shadow-x';

/**
 * The focus outline of a block that fills the card from edge to edge lies
 * inside the block, because the card clips what lies outside. Important, so
 * that it wins over the global focus rule.
 */
export const focusInside = 'focus-visible:-outline-offset-2!';
