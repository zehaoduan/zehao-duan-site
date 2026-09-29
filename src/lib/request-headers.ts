/**
 * Names of the request headers that src/proxy.ts sets for the renderer.
 * The proxy overwrites both on every request, so a client cannot inject them.
 */

/** The per-request Content-Security-Policy nonce. */
export const NONCE_HEADER = 'x-nonce';

/** The locale the URL belongs to ('en' for URLs without a language prefix). */
export const LOCALE_HEADER = 'x-locale';
