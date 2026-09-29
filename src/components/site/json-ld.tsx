/**
 * JsonLd: structured data as a native script element, as the bundled Next.js
 * guide prescribes ('<' is escaped). A data block is not executed, so it
 * needs no CSP nonce.
 *
 * Props
 *   data  the object from homeJsonLd() or keysJsonLd() in '@/lib/json-ld'
 */

import type { JsonLdData } from '@/lib/json-ld';

export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
