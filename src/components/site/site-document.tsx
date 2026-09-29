/**
 * SiteDocument: the <html> and <body> shell of every response.
 *
 * Used by the root layout (src/app/[lang]/layout.tsx) and by the global
 * not-found page, which does not go through the layout. Pages never use it.
 *
 * It reads the CSP nonce that src/proxy.ts put on the request and hands it to
 * next-themes, whose inline script sets the theme class before first paint.
 * Reading a request header also means every route is rendered per request.
 *
 * Props
 *   locale    language of the document; sets <html lang>
 *   children  the page, including its SiteFrame
 */

import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { fontVariables } from '@/app/fonts';
import { ThemeProvider } from '@/components/site/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { localeMeta, type Locale } from '@/i18n/config';
import { NONCE_HEADER } from '@/lib/request-headers';

export interface SiteDocumentProps {
  locale: Locale;
  children: ReactNode;
}

export async function SiteDocument({ locale, children }: SiteDocumentProps) {
  const nonce = (await headers()).get(NONCE_HEADER) ?? undefined;
  return (
    <html lang={localeMeta[locale].htmlLang} className={fontVariables} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          <TooltipProvider delay={300}>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
