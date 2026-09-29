'use client';

/**
 * CopyStatus: the one status region of the page for the copy controls
 * (CopyButton on the public-key page, CopyRow in the contact block).
 *
 *   <CopyStatusProvider>
 *     ...the page, with copy controls anywhere inside...
 *   </CopyStatusProvider>
 *
 * The provider renders its children and, after them, a visually hidden
 * paragraph with role="status". A CopyButton hands its result ('Copied',
 * 'Copy by hand') to the region, which announces it and empties itself after
 * about 2.2 s. The region is in the server HTML (empty), so it exists before
 * the first announcement.
 *
 * The provider holds no copy: the text comes from the button that announces.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/** How long a result stays on the button and in the status region. */
export const COPY_FEEDBACK_MS = 2200;

type Announce = (message: string) => void;

const CopyStatusContext = createContext<Announce | null>(null);

/** Announces a message in the status region; does nothing outside a provider. */
export function useCopyStatus(): Announce {
  const announce = useContext(CopyStatusContext);
  return useMemo(() => announce ?? (() => {}), [announce]);
}

export interface CopyStatusProviderProps {
  children: ReactNode;
}

export function CopyStatusProvider({ children }: CopyStatusProviderProps) {
  // `turn` gives every announcement a new element, so that the same message
  // twice in a row ('Copied', then 'Copied' from another button) is read twice.
  const [status, setStatus] = useState({ message: '', turn: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = useCallback<Announce>((message) => {
    setStatus((previous) => ({ message, turn: previous.turn + 1 }));
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setStatus((previous) => ({ message: '', turn: previous.turn }));
    }, COPY_FEEDBACK_MS);
  }, []);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <CopyStatusContext.Provider value={announce}>
      {children}
      <p id="copy-status" data-part="copy-status" role="status" aria-live="polite" className="sr-only">
        {status.message ? <span key={status.turn}>{status.message}</span> : null}
      </p>
    </CopyStatusContext.Provider>
  );
}
