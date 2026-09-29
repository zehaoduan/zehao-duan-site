'use client';

/**
 * CopyRow: a row of the contact block whose value is copied to the clipboard
 * when the row is clicked (the address, the WeChat ID).
 *
 * The server HTML is the plain row, as for a visitor without JavaScript.
 * After hydration the row gets a copy icon at its right end and a button
 * that covers the whole row. The button lies over the content and is not
 * its parent, so the row keeps its markup (<address>, <p>).
 *
 * After a click the icon changes to a tick for about 2.2 s, and the status
 * region of the page (CopyStatusProvider) announces the result. If the
 * browser refuses to copy, the button is taken away for good and the row
 * says 'Copy by hand': the text can then be selected as on any page.
 *
 * Props
 *   text       what is copied, exactly
 *   labels     dictionary.common.copy ({ copy, copied, failed })
 *   labelId    id of the element that names the row ('Address'). The
 *              accessible name of the button is 'Copy' followed by it.
 *   className  classes of the row
 *   children   the content of the row: icon, label, value
 */

import { Check, Copy } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { COPY_FEEDBACK_MS, useCopyStatus } from '@/components/site/copy-status';
import { useHydrated } from '@/components/site/use-hydrated';
import { Item, ItemActions } from '@/components/ui/item';
import type { CommonContent } from '@/content/types';
import { copyText } from '@/lib/copy-text';
import { cn } from '@/lib/utils';

type CopyResult = 'idle' | 'copied' | 'failed';

export interface CopyRowProps {
  text: string;
  labels: CommonContent['copy'];
  labelId: string;
  className?: string;
  children: ReactNode;
}

const iconClass = 'size-3.5';

export function CopyRow({ text, labels, labelId, className, children }: CopyRowProps) {
  const hydrated = useHydrated();
  const announce = useCopyStatus();
  const buttonLabelId = useId();
  const [result, setResult] = useState<CopyResult>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  async function handleClick() {
    const ok = await copyText(text);
    announce(ok ? labels.copied : labels.failed);
    setResult(ok ? 'copied' : 'failed');
    // A failure stays: the row is left to the visitor.
    if (!ok) return;
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => setResult('idle'), COPY_FEEDBACK_MS);
  }

  const active = hydrated && result !== 'failed';
  const Icon = result === 'copied' ? Check : Copy;

  return (
    <Item
      data-copy-result={hydrated ? result : undefined}
      className={cn(className, 'relative', active && 'duration-[120ms] hover:bg-muted')}
    >
      {children}

      <ItemActions className="mt-0.5 self-start noscript:hidden">
        {result === 'failed' ? (
          <span className="text-xs leading-[1.35] text-muted-foreground">{labels.failed}</span>
        ) : hydrated ? (
          <Icon
            aria-hidden="true"
            className={cn(iconClass, result === 'copied' ? 'text-primary' : 'text-muted-foreground')}
          />
        ) : (
          // keeps the width of the value, so that no line breaks anew after hydration
          <span aria-hidden="true" className={cn(iconClass, 'block')} />
        )}
      </ItemActions>

      {active ? (
        <button
          type="button"
          aria-labelledby={`${buttonLabelId} ${labelId}`}
          onClick={handleClick}
          // The card clips what leaves it, so the focus outline is drawn inside the row.
          className="absolute inset-0 cursor-pointer focus-visible:-outline-offset-2!"
        >
          <span id={buttonLabelId} className="sr-only">
            {labels.copy}
          </span>
        </button>
      ) : null}
    </Item>
  );
}
