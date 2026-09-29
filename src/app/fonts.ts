/**
 * Self-hosted fonts, loaded with next/font/local. No request leaves the site,
 * neither at build time nor at run time.
 *
 *   inter     Inter Variable (optical-size axis): all text and interface.
 *   interZh   the same file, declared a second time for Chinese pages without
 *             U+2014, U+2018, U+201C, U+201D and U+2026, so that the dash, the
 *             curly quotes and the ellipsis come from the Chinese font and
 *             are set full width.
 *   geistMono Geist Mono Variable: fingerprints, key text, commands, code.
 *
 * The options must be written as literals (a rule of next/font), which is
 * why the unicode ranges are repeated.
 *
 * Each font only defines a CSS variable here; globals.css builds the font
 * stacks per language from them.
 */

import localFont from 'next/font/local';

export const inter = localFont({
  src: '../fonts/inter-latin-opsz-normal.woff2',
  variable: '--font-inter',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  // No metric-adjusted fallback face: with the same options as interZh the
  // two declarations share one file URL, so the font is preloaded and
  // downloaded once on every page.
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

export const interZh = localFont({
  src: '../fonts/inter-latin-opsz-normal.woff2',
  variable: '--font-inter-zh',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  // The automatic fallback face is a metric-adjusted local Arial. On Chinese
  // pages no Latin system font may stand before the Chinese fonts, or the
  // dash and the quotation marks would come from it.
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-2013, U+2015-2017, U+2019-201B, U+201E-2025, U+2027-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

export const geistMono = localFont({
  src: '../fonts/geist-mono-latin-wght-normal.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  // Used on the public-key page only; not worth a preload on every page.
  preload: false,
  // No metric-adjusted Arial as the fallback face: until the font has
  // arrived, the text is set in a monospace system font of nearly the same
  // advance width, so that fingerprints and commands do not jump.
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    },
  ],
});

/** Class names that define the three font variables; put them on <html>. */
export const fontVariables = `${inter.variable} ${interZh.variable} ${geistMono.variable}`;
