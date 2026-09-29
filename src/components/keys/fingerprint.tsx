/**
 * Fingerprint: a key fingerprint in mono type that breaks only where the
 * content allows it.
 *
 * Each part stays in one piece (an inline block); a line may break between
 * two parts and nowhere else. textContent of the element is the parts joined
 * with `separator`.
 *
 *   PGP  parts = keyFacts.pgp.fingerprint.halves, separator = ' '
 *        '3820 3A1C 91D7 EED4 CA65' + ' ' + '8D3C F14B A896 331B 9793'
 *   SSH  parts = keyFacts.ssh.fingerprint.parts, separator = '' (the default)
 *        'SHA256:0JAhpUGbGd5G8ceQYFQ7' + 'GsxRzSfjT3ZLuZeCwFm3pFQ'
 *
 * Props
 *   id         id of the <code> element
 *   parts      the pieces, from '@/content/keys/facts'
 *   separator  ' ' or '' (default): what stands between two parts
 *   className  extra classes
 *
 * Server Component.
 */

import { Fragment } from 'react';

import { cn } from '@/lib/utils';

import { mono } from './styles';

export interface FingerprintProps {
  id: string;
  parts: readonly string[];
  separator?: ' ' | '';
  className?: string;
}

export function Fingerprint({ id, parts, separator = '', className }: FingerprintProps) {
  return (
    <code
      id={id}
      data-part="fingerprint"
      translate="no"
      lang="en"
      className={cn(mono, 'text-[0.8125rem] leading-[1.55] font-medium tracking-normal', className)}
    >
      {parts.map((part, index) => (
        <Fragment key={part}>
          {index > 0 ? (separator === '' ? <wbr /> : separator) : null}
          <span className="inline-block">{part}</span>
        </Fragment>
      ))}
    </code>
  );
}
