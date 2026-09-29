/**
 * ContactCard: the contact block of the home page, one row per item in the
 * order of site.contactOrder:
 *
 *   email, mobile, address, ORCID, Google Scholar, CityUHK Scholars, GitHub,
 *   LinkedIn, Keys, WeChat
 *
 * The WeChat row is shown only where the dictionary defines its label (the
 * Simplified Chinese page), as plain text without a link.
 *
 * Built from the shadcn Card and Item family. Each row: icon, small label,
 * value.
 *
 *   - Profile rows and the Keys row are whole-row links (Item rendered as
 *     <a>) with a persistent affordance: an up-right arrow on outbound rows,
 *     the accent colour and a right arrow on the Keys row. Profile links
 *     keep rel="me".
 *   - E-mail and mobile values are underlined links; on phones and on touch
 *     screens the touch target of each is 44 px high.
 *   - Address and WeChat are text that is copied to the clipboard when the
 *     row is clicked (CopyRow). Without JavaScript they are plain text.
 *   - Nothing is truncated (the line clamps of Item are switched off) and
 *     long addresses break only at their soft break points.
 *
 * From 640 px to 1023 px the rows flow into two balanced columns.
 *
 * Props
 *   locale   language of the page (link targets, Latin labels on Chinese pages)
 *   contact  dictionary.home.contact
 *   copyLabels  dictionary.common.copy, for the rows that copy their value
 *   className  extra classes for the card
 *
 * Server Component; holds no copy. The page must render it inside a
 * CopyStatusProvider, which announces the result of a copy.
 */

import {
  ArrowRight,
  ArrowUpRight,
  KeyRound,
  Landmark,
  Mail,
  MapPin,
  Smartphone,
} from 'lucide-react';
import { Fragment, type ComponentType, type ReactNode, type SVGProps } from 'react';

import { Breakable } from '@/components/content/inline';
import {
  GitHubMark,
  GoogleScholarMark,
  LinkedInMark,
  OrcidMark,
  WeChatMark,
} from '@/components/icons';
import { surface } from '@/components/site/surface';
import { Card } from '@/components/ui/card';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item';
import { profileLinkHref, site } from '@/content/site';
import type { CommonContent, ContactRowId, HomeContent, ProfileLinkId } from '@/content/types';
import type { Locale } from '@/i18n/config';
import { pagePath } from '@/i18n/paths';
import { cn } from '@/lib/utils';

import { CopyRow } from './copy-row';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const profileIcons: Record<ProfileLinkId, Icon> = {
  orcid: OrcidMark,
  'google-scholar': GoogleScholarMark,
  'cityuhk-scholars': Landmark,
  github: GitHubMark,
  linkedin: LinkedInMark,
};

/* Classes -------------------------------------------------------------- */

const rowClass = cn(
  'flex-nowrap items-start gap-3.5 rounded-none border-0 px-4 pt-2.5 pb-[0.6875rem]',
  'text-sm text-card-foreground',
  // below 360 px: a little less air, so that the longest part of an address fits on a line
  'max-[22.5rem]:gap-3 max-[22.5rem]:px-3',
);

/**
 * A row that is a link. The card clips what leaves it, so the focus outline
 * of a row is drawn inside the row.
 */
const linkRowClass = cn(rowClass, 'duration-[120ms] hover:bg-muted focus-visible:-outline-offset-2!');

const mediaClass = 'text-muted-foreground';

const labelClass = cn(
  'line-clamp-none block w-auto text-xs leading-[1.35] font-(--site-weight-label)',
  'text-muted-foreground',
);

/** Chinese pages: labels one step larger; Chinese labels with Chinese spacing. */
const labelChinesePage = 'text-[0.8125rem]';
const labelChineseText = 'tracking-[0.04em]';

const valueClass = cn(
  'line-clamp-none text-sm leading-normal text-card-foreground [overflow-wrap:anywhere]',
  'lang-zh:leading-[1.65]',
);

/** E-mail and mobile: an underlined link. */
const inlineLinkClass = cn(
  'underline decoration-muted-foreground/60 decoration-1 underline-offset-[0.22em]',
  'transition-colors duration-[120ms] hover:text-primary hover:decoration-current',
);

/**
 * The touch target of such a link. On phones (below 640 px) and on touch
 * screens it is 44 px high, while the text stays where it is and the focus
 * outline stays around the text: an invisible box on top of the link takes
 * the touches. It grows away from the neighbouring link, so that two targets
 * never overlap:
 *
 *   up      from the bottom of the text upwards (first of several links)
 *   down    from the top of the text downwards (last of several links)
 *   centre  around the middle of the text (a link on its own)
 */
const touchTarget = {
  up: cn(
    'relative',
    'touch:after:absolute touch:after:inset-x-0 touch:after:bottom-0 touch:after:h-11',
  ),
  down: cn(
    'relative',
    'touch:after:absolute touch:after:inset-x-0 touch:after:top-0 touch:after:h-11',
  ),
  centre: cn(
    'relative',
    'touch:after:absolute touch:after:inset-x-0 touch:after:top-1/2 touch:after:h-11 touch:after:-translate-y-1/2',
  ),
};

/**
 * A link between two others has neighbours on both sides: its target is
 * centred and the link keeps its distance from them.
 */
const touchTargetBetween = cn(
  touchTarget.centre,
  'touch:my-3 touch:inline-block',
);

function touchTargetOf(index: number, count: number): string {
  if (count === 1) return touchTarget.centre;
  if (index === 0) return touchTarget.up;
  if (index === count - 1) return touchTarget.down;
  return touchTargetBetween;
}

const arrowClass = 'size-3.5 text-muted-foreground';

/* Rows ----------------------------------------------------------------- */

interface RowView {
  id: ContactRowId;
  Icon: Icon;
  label: string;
  /** Latin label: carries lang="en" on Chinese pages. */
  labelIsLatin: boolean;
  /** Whole-row link. */
  link?: { href: string; rel?: string; kind: 'outbound' | 'internal' };
  /** The text that a click on the row copies. */
  copy?: string;
  /** The value. For whole-row links it is phrasing content without links. */
  value: ReactNode;
  /** How the value is marked up. */
  valueAs: 'text' | 'links' | 'address';
  /** Addresses, numbers and identifiers are left alone by translation tools. */
  verbatim: boolean;
}

function buildRows(locale: Locale, contact: HomeContent['contact']): RowView[] {
  const { person } = site;
  const { labels } = contact;
  const rows: RowView[] = [];

  for (const id of site.contactOrder) {
    switch (id) {
      case 'email':
        rows.push({
          id,
          Icon: Mail,
          label: labels.email,
          labelIsLatin: false,
          valueAs: 'links',
          verbatim: true,
          value: person.emails.map((address, index) => (
            <Fragment key={address}>
              {index > 0 ? <br /> : null}
              <a
                href={`mailto:${address}`}
                className={cn(inlineLinkClass, touchTargetOf(index, person.emails.length))}
              >
                {address}
              </a>
            </Fragment>
          )),
        });
        break;

      case 'mobile':
        rows.push({
          id,
          Icon: Smartphone,
          label: labels.mobile,
          labelIsLatin: false,
          valueAs: 'links',
          verbatim: true,
          value: (
            <a
              href={`tel:${person.phone.e164}`}
              className={cn(inlineLinkClass, touchTarget.centre, 'whitespace-nowrap')}
            >
              {person.phone.display}
            </a>
          ),
        });
        break;

      case 'address':
        rows.push({
          id,
          Icon: MapPin,
          label: labels.address,
          labelIsLatin: false,
          valueAs: 'address',
          verbatim: false,
          copy: contact.address,
          value: contact.address,
        });
        break;

      case 'keys':
        rows.push({
          id,
          Icon: KeyRound,
          label: labels.keys,
          labelIsLatin: false,
          link: { href: pagePath(locale, 'keys'), kind: 'internal' },
          valueAs: 'text',
          verbatim: false,
          value: contact.keysLinkText,
        });
        break;

      case 'wechat':
        // Shown only where the dictionary defines the label.
        if (labels.wechat === undefined) break;
        rows.push({
          id,
          Icon: WeChatMark,
          label: labels.wechat,
          labelIsLatin: false,
          valueAs: 'text',
          verbatim: true,
          copy: person.wechatId,
          value: person.wechatId,
        });
        break;

      default: {
        const profile = person.links.find((link) => link.id === id);
        if (profile === undefined) break;
        rows.push({
          id,
          Icon: profileIcons[profile.id],
          label: profile.label,
          labelIsLatin: true,
          link: { href: profileLinkHref(profile, locale), rel: 'me', kind: 'outbound' },
          valueAs: 'text',
          verbatim: true,
          value: <Breakable parts={profile.text} />,
        });
      }
    }
  }

  return rows;
}

/** id of the label of a row: names the copy button of the row. */
function labelId(id: ContactRowId): string {
  return `contact-label-${id}`;
}

function RowBody({ row, chinesePage }: { row: RowView; chinesePage: boolean }) {
  const { Icon } = row;
  const verbatim = row.verbatim ? ({ translate: 'no' } as const) : {};

  return (
    <>
      <ItemMedia variant="icon" className={mediaClass}>
        <Icon aria-hidden="true" className="size-4" />
      </ItemMedia>

      <ItemContent className="min-w-0 gap-0.5">
        <ItemTitle
          id={labelId(row.id)}
          lang={row.labelIsLatin && chinesePage ? 'en' : undefined}
          className={cn(
            labelClass,
            chinesePage && labelChinesePage,
            chinesePage && !row.labelIsLatin && labelChineseText,
          )}
        >
          {row.label}
        </ItemTitle>

        {row.valueAs === 'address' ? (
          // <address> is not phrasing content, so it cannot stand inside the
          // <p> of ItemDescription; it takes the place of that element.
          <address data-slot="item-description" className={cn(valueClass, 'text-pretty')}>
            {row.value}
          </address>
        ) : (
          <ItemDescription
            {...verbatim}
            className={cn(
              valueClass,
              // The links of a value style themselves.
              '[&>a]:underline-offset-[0.22em]',
              row.link?.kind === 'internal' && 'text-primary',
            )}
          >
            {row.value}
          </ItemDescription>
        )}
      </ItemContent>

      {row.link ? (
        <ItemActions className="mt-0.5 self-start">
          {row.link.kind === 'internal' ? (
            <ArrowRight aria-hidden="true" className={cn(arrowClass, 'text-primary')} />
          ) : (
            <ArrowUpRight aria-hidden="true" className={arrowClass} />
          )}
        </ItemActions>
      ) : null}
    </>
  );
}

/* Card ----------------------------------------------------------------- */

export interface ContactCardProps {
  locale: Locale;
  contact: HomeContent['contact'];
  copyLabels: CommonContent['copy'];
  className?: string;
}

export function ContactCard({ locale, contact, copyLabels, className }: ContactCardProps) {
  const rows = buildRows(locale, contact);
  const chinesePage = locale !== 'en';

  return (
    <Card className={cn(surface, className)}>
      {/*
        Every row starts with a separator, the first one too: the list is
        moved up by the height of one separator and the card clips it. In two
        columns the first row of the second column is then treated like the
        first row of the first.
      */}
      <ItemGroup
        className={cn(
          '-mt-px gap-0',
          'sm:max-lg:block sm:max-lg:columns-2 sm:max-lg:gap-x-0',
          'sm:max-lg:[column-rule:1px_solid_var(--border)]',
        )}
      >
        {rows.map((row) => (
          <div key={row.id} role="listitem" data-row={row.id} className="break-inside-avoid">
            {/* the rows are list items already; the line is for the eye only */}
            <ItemSeparator aria-hidden="true" className="my-0" />
            {row.link ? (
              <Item
                className={linkRowClass}
                render={<a href={row.link.href} rel={row.link.rel} />}
              >
                <RowBody row={row} chinesePage={chinesePage} />
              </Item>
            ) : row.copy !== undefined ? (
              <CopyRow
                text={row.copy}
                labels={copyLabels}
                labelId={labelId(row.id)}
                className={rowClass}
              >
                <RowBody row={row} chinesePage={chinesePage} />
              </CopyRow>
            ) : (
              <Item className={rowClass}>
                <RowBody row={row} chinesePage={chinesePage} />
              </Item>
            )}
          </div>
        ))}
      </ItemGroup>
    </Card>
  );
}
