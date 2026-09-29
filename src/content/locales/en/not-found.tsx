/**
 * English: the not-found page.
 *
 * The old 404.html speaks three languages at once; this is its English part.
 * The status code and the status line of its footer are the same in every
 * language and live in site.notFound.
 */

import type { NotFoundContent } from '@/content/types';

export const notFound: NotFoundContent = {
  meta: {
    title: '404 — Page Not Found',
    description: 'This page could not be found.',
  },
  title: 'Page Not Found',
  body: <>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</>,
  returnLink: 'Return to Home',
};
