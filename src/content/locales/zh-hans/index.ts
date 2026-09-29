/**
 * Simplified Chinese dictionary.
 */

import type { Dictionary } from '@/content/types';

import { blog } from './blog';
import { common } from './common';
import { home } from './home';
import { keys } from './keys';
import { notFound } from './not-found';

export const dictionary: Dictionary = { common, home, keys, blog, notFound };
