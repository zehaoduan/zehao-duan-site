'use client';

/**
 * ThemeSwitch: light, dark or system.
 *
 * From 768 px three icon buttons (a shadcn ToggleGroup) with Tooltips; below
 * 768 px one icon button (a shadcn Button) that cycles light, dark, system.
 *
 * It is rendered only after hydration, so that no dead control is shown
 * when scripts are blocked. Before that an empty box of the same size keeps
 * the header from moving; where scripting is off the box is not shown.
 *
 * Props
 *   labels     dictionary.common.theme ({ label, light, dark, system });
 *              plain strings, because this is a Client Component
 *   separated  whether a hairline stands before the switch from 768 px, to
 *              part it from the language links (default true)
 *   className  extra classes for the wrapper
 */

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useId, useSyncExternalStore } from 'react';

import { segmentItem, segmentItemActive, segmentTrack } from '@/components/site/language-switch';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { CommonContent } from '@/content/types';
import { cn } from '@/lib/utils';

type ThemeName = 'light' | 'dark' | 'system';

const themes: readonly { name: ThemeName; Icon: LucideIcon }[] = [
  { name: 'light', Icon: Sun },
  { name: 'dark', Icon: Moon },
  { name: 'system', Icon: Monitor },
];

function isThemeName(value: unknown): value is ThemeName {
  return value === 'light' || value === 'dark' || value === 'system';
}

const subscribe = () => () => {};

/** False in the server HTML and during hydration, true from then on. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export interface ThemeSwitchProps {
  labels: CommonContent['theme'];
  separated?: boolean;
  className?: string;
}

export function ThemeSwitch({ labels, separated = true, className }: ThemeSwitchProps) {
  const hydrated = useHydrated();
  const { theme, setTheme } = useTheme();
  const statusId = useId();

  const wrapper = cn('flex items-center noscript:hidden', className);

  if (!hydrated) {
    return (
      <div data-slot="theme-switch" data-hydrated="false" aria-hidden="true" className={wrapper}>
        <span
          className={cn('block h-8 w-8 md:w-[5.625rem]', separated && 'md:ml-[0.8125rem]')}
        />
      </div>
    );
  }

  const current: ThemeName = isThemeName(theme) ? theme : 'system';
  const currentIndex = themes.findIndex((item) => item.name === current);
  const next = themes[(currentIndex + 1) % themes.length].name;
  const CurrentIcon = themes[currentIndex].Icon;

  return (
    <div data-slot="theme-switch" data-hydrated="true" className={wrapper}>
      {separated ? (
        <span aria-hidden="true" className="mx-1.5 hidden h-5 w-px bg-border md:block" />
      ) : null}

      <ToggleGroup
        aria-label={labels.label}
        value={[current]}
        onValueChange={(value) => {
          const chosen = value[0];
          if (isThemeName(chosen)) setTheme(chosen);
        }}
        spacing={0}
        className={cn(segmentTrack, 'hidden w-auto gap-0 md:flex')}
      >
        {themes.map(({ name, Icon }) => (
          <Tooltip key={name}>
            <TooltipTrigger
              render={
                <ToggleGroupItem
                  value={name}
                  aria-label={labels[name]}
                  className={cn(
                    segmentItem,
                    'h-full w-7 min-w-0 rounded-md! px-0 hover:bg-transparent',
                    'aria-pressed:bg-transparent',
                    name === current && segmentItemActive,
                    name === current && 'aria-pressed:bg-card dark:aria-pressed:bg-input/45',
                  )}
                />
              }
            >
              <Icon aria-hidden="true" className="size-[0.9375rem]" />
            </TooltipTrigger>
            <TooltipContent side="bottom">{labels[name]}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={labels.label}
        aria-describedby={statusId}
        onClick={() => setTheme(next)}
        className="text-muted-foreground md:hidden"
      >
        <CurrentIcon aria-hidden="true" />
      </Button>
      <span id={statusId} className="sr-only md:hidden">
        {labels[current]}
      </span>
    </div>
  );
}
