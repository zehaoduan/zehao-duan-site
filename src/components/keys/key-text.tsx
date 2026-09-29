/**
 * KeyText: the text of a key file, shown character for character.
 *
 * The text sits in a <pre> between the comment pair
 * <!--email_off--> ... <!--/email_off--> (the EmailOff helper), so that
 * Cloudflare's email obfuscation leaves it alone. textContent of the element
 * equals the file, final newline included.
 *
 * This is the form whose lines wrap (the SSH line), so nothing scrolls. The
 * PGP block keeps its lines and scrolls sideways: see KeyTextScroll.
 *
 * Props
 *   id     id of the <pre>
 *   text   the key text, from '@/content/keys/facts' (PGP_ARMOR, SSH_LINE)
 *   label  accessible name. With it the block is a focusable region; the
 *          dictionaries define none for the SSH line, as on the old pages.
 *
 * Server Component.
 */

import { EmailOff } from '@/components/site/email-off';
import { cn } from '@/lib/utils';

import { focusInside, keyText, keyTextWrap } from './styles';

export interface KeyTextProps {
  id: string;
  text: string;
  label?: string;
  className?: string;
}

export function KeyText({ id, text, label, className }: KeyTextProps) {
  const region = label ? ({ role: 'region', 'aria-label': label, tabIndex: 0 } as const) : {};
  return (
    <EmailOff
      as="pre"
      id={id}
      data-part="key-text"
      text={text}
      translate="no"
      lang="en"
      {...region}
      className={cn(keyText, keyTextWrap, label && focusInside, className)}
    />
  );
}
