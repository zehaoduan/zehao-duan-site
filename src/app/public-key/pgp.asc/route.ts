/** /public-key/pgp.asc: the PGP public key as a plain text file. */

import { PGP_ARMOR } from '@/content/keys/key-text.generated';
import { keyFileResponse } from '@/lib/key-file-response';

export const dynamic = 'force-dynamic';

export function GET() {
  return keyFileResponse(PGP_ARMOR);
}

export function HEAD() {
  return keyFileResponse(PGP_ARMOR);
}
