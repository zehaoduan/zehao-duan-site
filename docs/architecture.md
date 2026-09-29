# Architecture

How the site is built and why. The design rules are in [design.md](design.md); the wording decisions are in [content-decisions.md](content-decisions.md); day-to-day instructions are in the [README](../README.md).

## Stack

| Part | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, `src/` folder), React 19, TypeScript |
| Styles | Tailwind CSS 4, design tokens as CSS variables |
| Components | shadcn/ui (style base-nova, Base UI primitives), lucide icons |
| Theme | next-themes (light, dark, system) |
| Hosting | Cloudflare Workers through the OpenNext Cloudflare adapter |

This version of Next.js differs from older ones (for example, middleware is now called proxy). Its documentation is bundled in `node_modules/next/dist/docs/`; read the relevant guide before changing framework code.

## The way of a request

```
browser
  │
  ▼
Cloudflare
  ├─ static file?  /_next/static/*, /favicon.svg, /media/*
  │     └─ answered by the assets layer, headers from public/_headers
  │        (the Worker does not run)
  ▼
Worker (.open-next/worker.js)
  │
  ▼
src/proxy.ts
  │   1. URL scheme: rewrite or 404
  │   2. new nonce, Content-Security-Policy
  │   3. security headers on the response
  │   4. x-locale and x-nonce request headers for the renderer
  ▼
route
  ├─ src/app/[lang]/page.tsx                 home page
  ├─ src/app/[lang]/public-key/page.tsx      public-key page
  ├─ src/app/[lang]/blog/page.tsx            list of blog posts
  ├─ src/app/[lang]/blog/[slug]/page.tsx     a blog post
  ├─ src/app/[lang]/blog/feed.xml/route.ts   RSS feed of the blog
  ├─ src/app/public-key/pgp.asc/route.ts     key file
  ├─ src/app/public-key/ssh.pub/route.ts     key file
  ├─ src/app/sitemap.ts, robots.ts
  └─ src/app/global-not-found.tsx            everything else, status 404
```

### URL scheme

English pages have no prefix, Chinese pages have `/zh-hant` or `/zh-hans`. Inside the application all three languages are served by the same route, `[lang]`, so the proxy rewrites `/` to `/en/` and `/public-key/` to `/en/public-key/`. The rewrite is internal; the browser never sees `/en`. A request that names `/en/...` itself is sent to the not-found page, so every page has exactly one address.

`trailingSlash: true` in `next.config.ts` makes page URLs end with a slash, as on the old static site, and redirects the form without it (308).

The files with one address for all languages (`/public-key/pgp.asc`, `/public-key/ssh.pub`, `/sitemap.xml`, `/robots.txt`) are listed in `fileRoutes` in the proxy and pass unchanged. A new file route must be added to that list.

The feed of the blog has one address per language (`/blog/feed.xml`, `/zh-hans/blog/feed.xml`), so it goes the way of a page: the English one is rewritten below `/en`. The pictures of the posts (`/media/...`) have one address for all languages and pass unchanged.

There is no language negotiation. The language comes from the URL only, and the language links in the header are plain links to the same page in the other language.

### Per-request rendering

Nothing is prerendered:

- the pages call `connection()` and read `headers()`;
- there is no `generateStaticParams`;
- `cacheComponents` is off;
- `open-next.config.ts` configures no cache.

The build output lists every route as dynamic. HTML responses carry `Cache-Control: private, no-cache, no-store`.

### Content-Security-Policy

```
default-src 'self';
script-src 'self' 'nonce-…' 'strict-dynamic';
style-src 'self' 'nonce-…';
img-src 'self' blob: data:;
font-src 'self'; connect-src 'self';
object-src 'none'; base-uri 'self'; form-action 'self';
frame-ancestors 'none'; upgrade-insecure-requests
```

The nonce is new on every request. Consequences for the code:

- HTML rendered on the server must not contain `style` attributes. Never write a `style={...}` property in a component that renders on the server. Styles that scripts set after the page has loaded (tooltip position, `color-scheme` on `<html>`) are allowed, because they go through the CSSOM.
- No inline script without the nonce. The JSON-LD block is data, not a script, and needs none.
- The portrait is a plain `<img>`; `next/image` would add a `style` attribute.
- Components that emit inline styles on the server are rendered only after hydration. The key text is the example: the server sends a plain `<pre>` that scrolls by itself; after hydration it sits in the shadcn ScrollArea (`src/components/keys/key-text-scroll.tsx`).
- Links inside the site are plain `<a>` elements, not `next/link`: every navigation loads a document with its own nonce and `html lang`.

Other headers set by the proxy: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`, `Permissions-Policy` (camera, microphone, geolocation, payment, usb and browsing-topics switched off).

The development server relaxes the policy (`unsafe-eval`, inline styles), because the development tools need it. Check the policy on the preview (`npm run preview`), never on `npm run dev`.

### Not-found page

`experimental.globalNotFound` with `src/app/global-not-found.tsx`. The page is a full document of its own, shows all three languages, and takes its `html lang` from the language prefix of the requested URL.

## Content model

```
src/content/
  types.ts            the shape of a dictionary; every language must fill all of it
  site.ts             facts shared by all languages: origin, names, e-mail, phone,
                      profile links, portrait, order of contact rows, lastUpdated
  get-dictionary.ts   loads the dictionary of a language
  locales/<language>/ common.tsx, home.tsx, keys.tsx, not-found.tsx
  keys/               pgp.asc, ssh.pub, facts.ts, key-text.generated.ts (generated)
src/components/content/inline.tsx
                      helpers for rich text inside the dictionaries:
                      ExtLink, Code, NoTranslate, Breakable, IsoDate
src/i18n/config.ts    languages, html lang, hreflang, date format, order of the switch
src/i18n/paths.ts     the URL of a page in a language
```

Rules:

- Components hold no wording. They receive a dictionary, or part of one, as properties.
- A string that is missing is added to `types.ts` and to all three languages, not written into a component.
- Head tags (`src/lib/metadata.ts`), JSON-LD (`src/lib/json-ld.ts`), the sitemap and the pages read the same modules, so a fact is typed once.

### Blog posts

```
src/content/blog/<slug>/      post.json, en.md, zh-hant.md, zh-hans.md, pictures
        │
        │  scripts/generate-blog.mjs   (before `dev` and `build`)
        ▼
src/content/blog-generated/   facts.ts, loaders.ts, <language>/index.ts, <language>/<slug>.ts
public/media/blog/<slug>/     the pictures as WebP, 800 and 1600 px wide, and square previews (240 px)
        │
        ▼
src/content/blog.ts           getPosts(locale), getPost(locale, slug)
```

- The Worker has no file system, so posts cannot be read from disk when a request comes in. The generator renders Markdown to HTML at build time and writes it into modules; no Markdown parser is part of the Worker.
- The list of each language and the text of each post are modules behind dynamic imports: a request loads one language, and of the texts only the one it shows.
- A post exists in all three languages under the same slug. The generator stops the build otherwise, so the language links and the hreflang alternates of a post never point at a page that is missing.
- Pictures carry a hash of their content in the file name and are cached for a year (`public/_headers`). A changed picture gets a new name.
- The rendered HTML holds no `style` attribute and no script: HTML inside the Markdown is dropped, and the generator stops if a `style` attribute would appear. The look of the text is in `globals.css` under `[data-slot="post-body"]`.
- Drafts (`"draft": true`) are generated only with `--drafts` or `BLOG_DRAFTS=1`. `npm run dev` sets the flag; `build`, `preview` and `deploy` do not. A draft that is shown carries `noindex`, and is in neither the sitemap nor the feed.
- The list of posts shows under each post a row of square previews of its pictures, the cover first (`previews` of a post, written by the generator).
- A post ends with links to the posts before and after it by date (`PostNav`); `getPost` reads them from the list of the language.
- The pages call `getPosts` and `getPost` only. If the posts move into a database, `src/content/blog.ts` is the one module to change.

### Interface strings that do not exist yet

These accessible names and labels have no entry in the dictionaries. The components are prepared for them and leave the attribute out until the wording exists in three languages:

| String | Effect while missing |
| --- | --- |
| Label of the link to the home page in the header ("Home") | The header shows only the link to the public-key page; the name at the left links to the home page |
| Accessible name of the page navigation in the header | The `<nav>` has no `aria-label` |
| Accessible name of the contact block on the home page | The `<aside>` has no name |
| Accessible name of the breadcrumb on the public-key page | The `<nav>` has no `aria-label` |
| Accessible name of the row of in-page links | It is named by the page title |
| Accessible name of the SSH key text | The block is not a focusable region (its lines wrap, nothing scrolls) |

## Components

```
src/components/
  ui/        shadcn/ui components, as generated by the shadcn CLI
  site/      shared by all pages: SiteFrame, SiteHeader, SiteFooter, LanguageSwitch,
             ThemeSwitch, SkipLink, Band, PageContainer, SectionHeading,
             LastUpdated, EmailOff, JsonLd, PageData, CopyStatus, surface
  home/      HomeBody, Hero, ContactCard, TimelineSection, ProseSection, keepDates
  home/      ... and CopyRow (the rows of the contact block that copy their value)
  keys/      KeysPage, PageHead, KeySection, KeyCard, Fingerprint, KeyText,
             UsageSteps, Command, TrustNotes, BackLink, CopyButton
  blog/      BlogPage, PostPage, BlogHead, PostDates, PostNav, PostData
  icons/     brand marks: ORCID, Google Scholar, GitHub, LinkedIn, WeChat
  content/   inline helpers used inside the dictionaries
```

A page wraps its content in `SiteFrame`, which renders the skip link, the header, `<main id="content">` and the footer.

Client components (they run in the browser): the theme switch, the copy buttons and copy rows with their status region, the scrolling key text. Everything else renders on the server only. Controls that need scripts are not in the server HTML, so a visitor without JavaScript sees no dead button.

## Design tokens and styles

`src/app/globals.css`, in this order: imports and variants, the mapping of tokens to Tailwind, the tokens (light, dark by class, dark by system setting), font stacks per language, base styles, shared utilities, hooks of the inline helpers, focus, motion and print.

- The dark tokens are declared twice, under `.dark` and under `prefers-color-scheme: dark` for `:root:not(.light)`, so the page follows the system before and without JavaScript. Keep the two blocks identical.
- Variants: `dark:` (matches both cases above), `lang-zh:` (inside Chinese text), `touch:` (below 640 px and on touch screens; for touch targets of 44 px).
- Utilities: `page-container`, `accent-tab`, `prose-measure`, `text-link`, `no-break`, `scroll-shadow-x`.
- `surface` (in `src/components/site/surface.ts`) is the look of every card: put it on the shadcn `Card`.
- Typographic values that differ between Latin and Chinese text are variables (`--site-leading`, `--site-weight-heading` and so on), set per language with `:lang()`.
- One focus style for every control: a 2 px outline in `--ring`.

Fonts are declared in `src/app/fonts.ts` with `next/font/local` and served from `/_next/static/media/`. Inter is declared a second time for Chinese pages without the dash, the curly quotes and the ellipsis, so those come from the Chinese font at full width.

## Build and hosting

| Command | What it does |
| --- | --- |
| `npm run dev` | development server, and the blog generator watching the posts (drafts included) |
| `npm run build` | Next.js production build into `.next/` |
| `npm run cf:build` | the same, then the Worker bundle into `.open-next/` |
| `npm run preview` | `cf:build`, then the local Workers runtime (workerd) |
| `npm run cf:size` | size of the upload, without uploading |
| `npm run deploy` | `cf:build`, then upload to Cloudflare |

Settings worth knowing:

- `wrangler.jsonc`: `keep_names` is `false`. next-themes writes a function into an inline script; with kept names the bundler would add a helper that does not exist in the browser.
- `wrangler.jsonc`: `compatibility_flags` contains `nodejs_compat`, which the adapter needs.
- `next.config.ts`: the Turbopack disk cache is off for `dev` and `build`, because the project folder may lie in a synchronised folder (see the README).
- `next.config.ts`: `NEXT_DIST_DIR` can name another build folder for a second development server (`NEXT_DIST_DIR=.next-b npm run dev -- --port 3001`). `next dev` then adds that folder to `include` in `tsconfig.json`; remove the entries afterwards. Production builds must not set it.
- The adapter prints a warning at build time that Node.js middleware on Cloudflare is experimental. The proxy passed every test on the local Workers runtime.
- The Worker bundle contains two WebAssembly files of the image generator of Next.js (`resvg.wasm`, `yoga.wasm`, about 1.4 MiB together before compression). The site does not use them; the adapter includes them regardless.

## Differences from the old static site

Deliberate, and the only ones in the head of the pages:

- `theme-color` is `#ffffff` / `#141619` (new design);
- the favicon is at `/favicon.svg`;
- the stylesheet and the scripts come from `/_next/static/`;
- the 404 page carries a second `robots` tag (`noindex`), which Next.js adds by itself;
- in the sitemap `<lastmod>` stands after the alternate links of each entry.

In the body: the last-updated date moved from the top bar into the hero of the home page (and stays in the footer of every page); the header has the name, a link to the public-key page and the theme switch; the public-key page has a breadcrumb and a row of in-page links.
