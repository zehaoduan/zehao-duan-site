# Design specification

The design is direction A, "Neutral modern", chosen on 2026-09-28 from three rendered
mock-ups by a panel of three judges, with specific ideas merged in from the other two
directions. Where this document and the mock-up differ, this document wins.

The site must stay credible, restrained and content first. No terminal or ASCII styling,
no shields-style badges, no decorative animation (120 ms colour transitions only, off
under `prefers-reduced-motion`).

**Wording:** the owner changed a few words on 2026-09-28, listed in
[content-decisions.md](content-decisions.md) (employer name in the English biography,
一等荣誉 / 一等榮譽, and 電郵, 澳洲, 南澳洲, 新南威爾斯 on the Traditional Chinese pages),
and the last-updated date is 2026-09-28. The same changes were made in the old static
pages, so both agree. Never change this wording back.

## Tokens

Accent is mapped to `--primary`. `--radius: 0.5rem`.

| Token | Light (`:root`) | Dark (`.dark`) |
| --- | --- | --- |
| background | `oklch(0.985 0.002 255)` | `oklch(0.165 0.006 260)` |
| foreground | `oklch(0.21 0.012 260)` | `oklch(0.95 0.004 255)` |
| card | `oklch(1 0 0)` | `oklch(0.2 0.007 260)` |
| card-foreground | `oklch(0.21 0.012 260)` | `oklch(0.95 0.004 255)` |
| popover | `oklch(1 0 0)` | `oklch(0.22 0.008 260)` |
| popover-foreground | `oklch(0.21 0.012 260)` | `oklch(0.95 0.004 255)` |
| primary | `oklch(0.46 0.13 258)` | `oklch(0.78 0.1 255)` |
| primary-foreground | `oklch(0.985 0.002 255)` | `oklch(0.18 0.02 260)` |
| secondary | `oklch(0.955 0.004 255)` | `oklch(0.26 0.008 260)` |
| secondary-foreground | `oklch(0.27 0.012 260)` | `oklch(0.95 0.004 255)` |
| muted | `oklch(0.962 0.003 255)` | `oklch(0.235 0.007 260)` |
| muted-foreground | `oklch(0.48 0.014 260)` | `oklch(0.72 0.012 258)` |
| accent | `oklch(0.95 0.015 258)` | `oklch(0.28 0.025 258)` |
| accent-foreground | `oklch(0.3 0.06 258)` | `oklch(0.93 0.02 255)` |
| destructive | `oklch(0.55 0.2 27)` | `oklch(0.7 0.18 22)` |
| border | `oklch(0.915 0.004 255)` | `oklch(0.3 0.008 260)` |
| input | `oklch(0.87 0.006 255)` | `oklch(0.35 0.01 260)` |
| ring | `oklch(0.6 0.13 258)` | `oklch(0.65 0.12 258)` |

`theme-color`: `#ffffff` light, `#141619` dark. The ORCID mark keeps its official green
`#A6CE39`; every other mark is monochrome `currentColor`.

Dark tokens are declared twice: under `.dark`, and under
`@media (prefers-color-scheme: dark)` for `:root:not(.light)`, so the page follows the
system setting before and without JavaScript. The Tailwind `dark:` variant must match both.

## Typography

Self-hosted through `next/font/local` (no request to any third party, at build or at run time):

- Inter Variable with optical-size axis (`inter-latin-opsz-normal.woff2`) for all text and UI.
- Geist Mono Variable (`geist-mono-latin-wght-normal.woff2`) for fingerprints, key blocks,
  shell commands and inline code.

Inter is declared a second time as "Inter Zh" with a `unicode-range` that leaves out
U+2014, U+2018, U+201C, U+201D and U+2026, so that on Chinese pages the dash, curly quotes and
ellipsis come from the Chinese font and are set full width.

Chinese uses system fonts. No Latin system font may stand before the Chinese fonts:

- zh-Hans: Inter Zh, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, Noto Sans SC, sans-serif
- zh-Hant: Inter Zh, PingFang HK, PingFang TC, Microsoft JhengHei, Noto Sans CJK HK, Noto Sans HK, Noto Sans CJK TC, sans-serif

Scale (rem): name 2.875 desktop / 2.5 tablet / 2 phone, weight 650, tracking -0.032em;
keys page title 2.5 / 2; section heading 1.25, weight 620; role and lede 1.0625; body 1 with
line-height 1.7 and a measure of at most 41rem; timeline title 0.9375 weight 580, details
0.875, date 0.8125; contact value 0.875, label 0.75 weight 500; mono 0.8125.

Chinese pages: line-height 1.85, paragraphs left-aligned (never justified),
`text-wrap: pretty`, headings and timeline titles weight 600, body 400 (weights 500 and 650
do not exist in YaHei or JhengHei), no negative tracking. Dates inside Chinese prose never
break (`white-space: nowrap`). Latin labels on Chinese pages (ORCID, Google Scholar,
CityUHK Scholars, GitHub, LinkedIn) carry `lang="en"` and Latin letter-spacing.

The role sentence is set in the foreground colour, not muted.

## Layout

Container at most 72rem; gutters 16 px below 640, 24 px from 640, 32 px from 1024.
Breakpoints: 640, 768, 1024, 1200. DOM order equals visual order at every width.

### Header (every page)

Sticky, translucent card colour with backdrop blur and a bottom hairline. The bar is 56 px
high. `scroll-padding-top` on `html`: 5rem from 768 px, 7.75rem below.

- Left: the name as wordmark, linking to the home page of the current language.
- Page links Home, Blog, Public keys, in this order, at every width (owner's decision,
  2026-09-29), the current one underlined in the accent. From 768 px they stand in the bar
  beside the wordmark. Below 768 px the bar has no room for them; they stand in a second
  row of 44 px under the bar, inside the sticky header.
- Right: the language switch and the theme switch.
- Language switch: three plain links at every width, order English / 繁體 / 简体, each with
  `lang`, `hreflang`, and `aria-current="page"` on the current one, styled as a segmented
  control. Each links to the same page in the other language. They are ordinary `<a>`
  elements (a full document load, so `html lang` and the CSP nonce are always fresh). No
  dropdown, no sheet, no hamburger menu. Works without JavaScript.
- Theme switch: client component. From 768 px three icon buttons (light, dark, system) with
  tooltips; below 768 px one icon button that cycles. Rendered only after hydration, so no
  dead control is shown when scripts are blocked.

### Home page

1. Hero band (card colour, bottom hairline): portrait (3:4, 96 / 136 / 152 px wide,
   rounded, 1 px ring, `brightness(0.92)` in dark), field label in the accent, name with the
   alternate-script name on its baseline, role sentence, then the last-updated dateline
   directly under the role sentence.
2. Body, from 1024 px a two-column grid with the contact column on the LEFT (20 to 22.5rem)
   and the reading column on the right. Below 1024 px one column: contact first, then the
   sections. The contact column is sticky only when the viewport is tall enough to show all
   of it.
3. Contact card: one row per item in the fixed order email, mobile, address, ORCID, Google
   Scholar, CityUHK Scholars, GitHub, LinkedIn, Keys, and WeChat on zh-hans only (plain
   text, no link). Each row: icon, small label, value. Rows that are links are whole-row
   links with a persistent affordance: an up-right arrow on outbound rows, and the accent
   colour with a right arrow on the internal Keys row. E-mail and mobile values are
   underlined links. The address row and the WeChat row copy their value to the clipboard
   when clicked (owner's decision, 2026-09-29): a copy icon at the right end, a tick for
   about 2 s after a copy; without JavaScript they are plain text. Nothing is ever truncated (override the `line-clamp` defaults of the
   shadcn Item); the soft break points in long addresses are kept. Touch targets on phones
   are at least 44 px high. Outbound profile links keep `rel="me"`.
4. Reading column: Biography, Education, Experience, Awards, Research interest, in this
   order (as on the old site). Each section starts with a hairline whose first 32 px are
   2 px high in the accent colour, then the heading.
5. Timelines: date column (muted, regular weight, never wrapping on Chinese pages), a marker
   gutter with a hollow ring per entry and a filled dot for the ongoing entry
   (Sep 2026 – present), then title, first detail line in the foreground colour, further
   lines muted. On phones the date stacks above the title.
6. Footer: name, last-updated date.

### Public keys page

1. Head band: breadcrumb (name > Public keys), title, first lede paragraph in the foreground
   colour at lede size, second paragraph muted; then a single row of in-page links to
   `#pgp`, `#ssh` and `#verify` (hidden below 640 px).
2. One section per key. From 1200 px two columns: the key card (about 40.5rem) and the
   usage steps. From 1024 to 1199 px the steps are laid out as explanation | command rows
   under the card so the width is used.
3. Key card (one Card per key): facts (label, value; the fingerprint with its own Copy
   button), the key-file strip (file name, Copy), the key text, and a footer with the
   Download button (`<a download>`).
4. Key text: focusable region (`role="region"`, label, `tabindex="0"`), scrolls sideways on
   narrow screens with an edge shadow as the scroll hint (never a fade mask over the text).
   `translate="no"` and `lang="en"` on fingerprints, file names, key text and commands. The
   40-character fingerprint and the two halves of the SSH fingerprint never break except at
   the defined point. On narrow screens the fingerprint's Copy button goes below the value.
5. Usage steps: numbered; command blocks go full width on phones; URLs in commands break
   only after a slash; options such as `--with-fingerprint` never break; inline code chips
   never break across lines.
6. Trust notes: six numbered notes in one Card, 2 x 3 from 832 px, one column below.
7. Back link, footer.
8. Copy buttons: client component, rendered only after hydration. The label changes to
   Copied or Copy by hand for about 2.2 s; a visually hidden `role="status"` region announces
   it. No toast. The PGP fingerprint is copied without spaces.

### Not-found page

Quiet: header with the three names (each linking to its home page), a small "404" in the
accent colour, one card with the three languages (stacked on phones), footer.

## Focus and interaction

Every focusable element shows a solid 2 px outline in `--ring` with 2 px offset. A skip link
is the first focusable element on every page.

## Components

shadcn/ui (style base-nova, Base UI primitives): Button, Card, Item, Separator, Toggle and
ToggleGroup, Tooltip, Breadcrumb, ScrollArea. lucide icons. Brand marks (ORCID, Google
Scholar, GitHub, LinkedIn, WeChat) are small local SVG components with the path data of
the old site; CityUHK Scholars uses the neutral lucide `landmark` glyph, not the university
logo. Badge is deliberately not used.
