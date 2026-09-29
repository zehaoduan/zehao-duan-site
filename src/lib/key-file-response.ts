/**
 * Response for a raw public key file (/public-key/pgp.asc, /public-key/ssh.pub).
 * The body is the text of the file, byte for byte.
 */
export function keyFileResponse(text: string): Response {
  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
