/**
 * SkipLink: the first focusable element of every page. Hidden until it
 * takes focus. SiteFrame renders it; the target is <main id="content">.
 */

export const contentId = 'content';

export function SkipLink({ children }: { children: string }) {
  return (
    <a
      data-slot="skip-link"
      href={`#${contentId}`}
      className="absolute -top-16 left-4 z-[60] rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground focus:top-3"
    >
      {children}
    </a>
  );
}
