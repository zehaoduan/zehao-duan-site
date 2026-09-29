/**
 * UsageSteps: the numbered steps beside (or under) a key card. Each step is
 * what it does, in words, and the command that does it.
 *
 * Layout
 *   below 640 px      number, text; the command takes the full width, so
 *                     that a 40-character fingerprint stays in one piece
 *   640 to 1023 px    number, then text and command in one column
 *   1024 to 1199 px   rows of text | command under the card
 *   from 1200 px      one column again, beside the card
 *
 * The numbers come from a CSS counter on the list, so the list is an
 * ordinary <ol> and the text may refer to 'step 4'.
 *
 * Props
 *   title         heading of the steps (dictionary.keys.pgp.usageTitle)
 *   steps         keyFacts.pgp.steps or keyFacts.ssh.steps: id, command,
 *                 words that must not break
 *   descriptions  what each step does, by id (dictionary.keys.pgp.steps)
 *   className     extra classes for the wrapper
 *
 * Server Component.
 */

import type { RichText, UsageStep } from '@/content/types';
import { cn } from '@/lib/utils';

import { Command } from './command';

export interface UsageStepsProps<Id extends string> {
  title: string;
  steps: readonly UsageStep<Id>[];
  descriptions: Record<Id, RichText>;
  className?: string;
}

const item = cn(
  'relative pb-[1.375rem] pl-9 [counter-increment:step] last:pb-0',
  // the number
  'before:absolute before:top-0 before:left-0 before:grid before:size-6 before:place-items-center',
  'before:rounded-full before:border before:border-border before:bg-card',
  'before:text-xs before:leading-none before:font-semibold before:text-foreground before:tabular-nums',
  'before:content-[counter(step)]',
  // the line to the next number
  'after:absolute after:top-[1.875rem] after:bottom-1.5 after:left-[calc(0.75rem-0.5px)]',
  'after:w-px after:bg-border last:after:hidden max-sm:after:hidden',
  // 1024 to 1199 px: text | command
  'lg:max-xl:grid lg:max-xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
  'lg:max-xl:items-start lg:max-xl:gap-x-8',
);

const heading = cn(
  'text-[0.9375rem] leading-[1.4] font-semibold tracking-[-0.006em]',
  'lang-zh:tracking-normal',
);

export function UsageSteps<Id extends string>({
  title,
  steps,
  descriptions,
  className,
}: UsageStepsProps<Id>) {
  return (
    <div data-part="usage-steps" className={className}>
      <h3 className={heading}>{title}</h3>
      <ol role="list" className="mt-4 [counter-reset:step]">
        {steps.map((step) => (
          <li key={step.id} data-step={step.id} className={item}>
            <p className="text-[0.9375rem] leading-[1.6] text-pretty lang-zh:leading-[1.8]">
              {descriptions[step.id]}
            </p>
            {/* phones: full width, 12 px; rows: first line level with the first line of the text */}
            <Command
              command={step.command}
              noBreak={step.noBreak}
              className="mt-2 max-sm:-ml-9 max-sm:text-xs lg:max-xl:-mt-2"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
