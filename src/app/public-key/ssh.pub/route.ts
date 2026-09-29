/** /public-key/ssh.pub: the SSH public key as a plain text file. */

import { SSH_LINE } from '@/content/keys/key-text.generated';
import { keyFileResponse } from '@/lib/key-file-response';

export const dynamic = 'force-dynamic';

export function GET() {
  return keyFileResponse(SSH_LINE);
}

export function HEAD() {
  return keyFileResponse(SSH_LINE);
}
