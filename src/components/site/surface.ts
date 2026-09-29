/**
 * surface: the look of every card on the site. Put it on the shadcn Card:
 *
 *   <Card className={cn(surface, '...')}>
 *
 * 1 px border in --border and the smallest shadow, in place of the ring of
 * the shadcn default; no padding and no gap, the parts bring their own.
 *
 * A plain string of utilities (not a CSS utility of its own), so that
 * tailwind-merge can take out the classes of the Card that it replaces.
 * Server and Client Components can both import it.
 */
export const surface = 'gap-0 border border-border py-0 shadow-xs ring-0';
