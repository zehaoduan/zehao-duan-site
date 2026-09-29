'use client';

/**
 * useHydrated: false in the server HTML and during hydration, true from then
 * on. Controls that need JavaScript are rendered only when it returns true,
 * so no dead control is shown when scripts are blocked.
 */

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
