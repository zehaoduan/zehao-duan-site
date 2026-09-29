/**
 * EmailOff: an element whose text is wrapped in the comment pair
 *
 *   <!--email_off--> ... <!--/email_off-->
 *
 * which tells Cloudflare's email obfuscation to leave the text alone. The
 * text of a public key or a user ID must reach the reader unchanged, and the
 * script that obfuscation injects would be blocked by the CSP anyway.
 *
 * JSX cannot express HTML comments, so the content is written as HTML: the
 * text is escaped here and placed between the two comments, inside the
 * element. textContent of the element is exactly `text`.
 *
 * Props
 *   as     the element to render: 'pre', 'dd', 'span', 'code', 'div', 'p'
 *          (default 'span')
 *   text   the plain text; never HTML
 *   ...    any other attribute of the element (className, id, role,
 *          aria-label, tabIndex, translate, lang). No children, no style.
 *
 * Server and client safe (no hooks).
 */

import type { HTMLAttributes } from 'react';

type EmailOffTag = 'pre' | 'dd' | 'span' | 'code' | 'div' | 'p';

export interface EmailOffProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'dangerouslySetInnerHTML' | 'style'> {
  as?: EmailOffTag;
  text: string;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function EmailOff({ as: Tag = 'span', text, ...props }: EmailOffProps) {
  return (
    <Tag
      data-slot="email-off"
      {...props}
      dangerouslySetInnerHTML={{
        __html: `<!--email_off-->${escapeHtml(text)}<!--/email_off-->`,
      }}
    />
  );
}
