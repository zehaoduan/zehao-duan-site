'use client';

/**
 * CopyButton: copies a text to the clipboard.
 *
 * Rendered only after hydration, so no dead control is shown when scripts
 * are blocked. Before that an empty box of about the same size keeps the
 * layout from moving; where scripting is off the box is not shown.
 *
 * After a click the label changes to the result ('Copied' or 'Copy by hand')
 * for about 2.2 s, and the status region of the page (CopyStatusProvider)
 * announces it. No toast.
 *
 * Props
 *   text       what is copied, exactly (the PGP fingerprint without spaces,
 *              the key text as in the file)
 *   labels     dictionary.common.copy ({ copy, copied, failed }); plain
 *              strings, because this is a Client Component
 *   context    ids of the elements that name what is copied (a <dt> and the
 *              heading of its section, or the file name). The accessible name
 *              of the button is its label followed by the text of those
 *              elements ('Copy Fingerprint PGP key'), so the buttons of a
 *              page can be told apart.
 *   variant    'outline' (default; beside a fingerprint) or 'ghost' (in the
 *              key-file strip)
 *   className  extra classes
 */

import { Check, Copy } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { COPY_FEEDBACK_MS, useCopyStatus } from '@/components/site/copy-status';
import { useHydrated } from '@/components/site/use-hydrated';
import { Button } from '@/components/ui/button';
import type { CommonContent } from '@/content/types';
import { copyText } from '@/lib/copy-text';
import { cn } from '@/lib/utils';

type CopyResult = 'idle' | 'copied' | 'failed';

export interface CopyButtonProps {
  text: string;
  labels: CommonContent['copy'];
  context?: readonly string[];
  variant?: 'outline' | 'ghost';
  className?: string;
}

/**
 * At least 44 px of height to touch, without changing the size that is seen:
 * 28 px of button and 8 px above and below (9 px from the inner edge of the
 * 1 px border).
 */
const touchTarget = cn(
  'relative',
  'touch:after:absolute touch:after:-inset-x-px touch:after:-inset-y-[9px]',
);

/** The border of the outline button after a copy: the accent, mixed into the hairline colour. */
const copiedBorder = cn(
  'border-[color-mix(in_oklch,var(--primary)_45%,var(--border))]',
  'dark:border-[color-mix(in_oklch,var(--primary)_45%,var(--border))]',
);

export function CopyButton({
  text,
  labels,
  context,
  variant = 'outline',
  className,
}: CopyButtonProps) {
  const hydrated = useHydrated();
  const announce = useCopyStatus();
  const labelId = useId();
  const [result, setResult] = useState<CopyResult>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  if (!hydrated) {
    return (
      <span
        data-part="copy-button-placeholder"
        aria-hidden="true"
        className={cn('block h-7 w-[4.25rem] shrink-0 noscript:hidden', className)}
      />
    );
  }

  const label =
    result === 'copied' ? labels.copied : result === 'failed' ? labels.failed : labels.copy;
  const Icon = result === 'copied' ? Check : Copy;

  async function handleClick() {
    if (!text) return;
    const ok = await copyText(text);
    setResult(ok ? 'copied' : 'failed');
    announce(ok ? labels.copied : labels.failed);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => setResult('idle'), COPY_FEEDBACK_MS);
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      data-copy-result={result}
      aria-labelledby={context?.length ? [labelId, ...context].join(' ') : undefined}
      onClick={handleClick}
      className={cn(
        touchTarget,
        'shrink-0 transition-colors duration-[120ms]',
        variant === 'outline' && 'bg-card shadow-xs',
        variant === 'ghost' && 'text-muted-foreground',
        result === 'copied' && 'text-primary hover:text-primary',
        result === 'copied' && variant === 'outline' && copiedBorder,
        className,
      )}
    >
      <Icon aria-hidden="true" />
      <span id={labelId}>{label}</span>
    </Button>
  );
}
