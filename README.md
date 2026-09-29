# zehao-duan.com

Personal academic homepage of **Zehao Duan (段泽浩 / 段澤浩)**, PhD student in the Department of Electrical Engineering, City University of Hong Kong. Research interest: power system stability.

Live site: <https://zehao-duan.com>

This folder holds the new version of the site: a Next.js application (React, TypeScript, Tailwind CSS, shadcn/ui components) that runs on Cloudflare Workers. Every page is rendered by the server on each request. There is no analytics and no request to any third party; the fonts are served by the site itself.

This folder is `~/Developer/next-app`. It is kept outside `~/Documents` on purpose: `~/Documents` is synchronised by iCloud Drive, which creates duplicate files in the build output (names such as `routes.d 2.ts`) and breaks builds and type checks.

The old static site lives in `~/Documents/Website/personal-website`. It stays the live site until this one is deployed, and the two agree word for word.

## Pages

| URL | Content |
| --- | --- |
| `/` | Home page, English |
| `/zh-hant/` | Home page, Traditional Chinese |
| `/zh-hans/` | Home page, Simplified Chinese |
| `/public-key/` | Public keys, English |
| `/zh-hant/public-key/` | Public keys, Traditional Chinese |
| `/zh-hans/public-key/` | Public keys, Simplified Chinese |
| `/blog/`, `/zh-hant/blog/`, `/zh-hans/blog/` | The list of blog posts |
| `/blog/<slug>/` and the same below `/zh-hant`, `/zh-hans` | A blog post |
| `/blog/feed.xml` and the same below `/zh-hant`, `/zh-hans` | RSS feed of the blog, one per language |
| `/media/blog/<slug>/*.webp` | The pictures of the posts, and their square previews for the list of posts and the home page |
| `/media/photo/*` | The portrait: AVIF and WebP in three widths, one JPEG |
| `/public-key/pgp.asc`, `/public-key/ssh.pub` | The raw key files, `text/plain` |
| `/sitemap.xml`, `/robots.txt` | For search engines |
| anything else | Trilingual not-found page, status 404 |

Each home page shows the newest blog posts as small square pictures, in the section Blog after the biography.

Page URLs end with a slash; the form without it redirects (308). `/en/` is not part of the scheme and answers 404.

## Architecture in short

The full description is in [docs/architecture.md](docs/architecture.md); the design rules are in [docs/design.md](docs/design.md); wording decisions are in [docs/content-decisions.md](docs/content-decisions.md).

1. **Request flow.** Static files (`/_next/static/*`, `/favicon.svg`, `/media/*`) are answered by the Workers assets layer with the cache headers of `public/_headers`. Every other request reaches the Worker and first passes `src/proxy.ts`, which rewrites the English URLs to the internal `/en/...` routes, makes a fresh nonce, and sets the Content-Security-Policy and the other security headers.
2. **Route tree.** `src/app/[lang]/page.tsx` is the home page, `src/app/[lang]/public-key/page.tsx` the public-key page, and `src/app/[lang]/blog/` the blog (list, post, feed), for all three languages. The key files, the sitemap and robots.txt are small route files under `src/app/`. `src/app/global-not-found.tsx` is the 404 page.
3. **Per-request rendering.** No page is prerendered or cached. That is what allows a strict Content-Security-Policy with a new nonce on every response.
4. **Content modules.** All text is in `src/content/`: one folder per language under `locales/`, facts that are the same in every language in `site.ts` and `keys/facts.ts`. Components receive their text as properties and contain no wording.
5. **Components.** `src/components/ui/` holds the shadcn/ui components, `site/` the frame shared by all pages (header, footer, language links, theme switch), `home/`, `keys/` and `blog/` the parts of the pages (the blog section of the home page is `home/blog-section.tsx`), `icons/` the brand marks, `content/` the helpers for text inside the dictionaries.
6. **Design tokens.** Colours, fonts, radii and shadows are CSS variables in `src/app/globals.css`, light and dark.

## Folder map

```
docs/                     design.md, architecture.md, content-decisions.md
public/                   favicon.svg, _headers (cache headers of static files)
scripts/
  generate-key-text.mjs   turns the key files into a module; checks the fingerprints
  generate-photo.mjs      turns the portrait (src/content/photo/) into web pictures
  generate-blog.mjs       turns the blog posts into modules and web pictures
  prepare-pictures.mjs    removes the data inside the original pictures and makes them smaller
  dev.mjs                 `npm run dev`: the development server and the blog generator, watching
  checks/runtime.py       checks a running preview (status codes, headers, key files)
  checks/parity.py        compares the rendered pages with the old static pages
src/
  proxy.ts                URL scheme, nonce, security headers
  app/
    [lang]/layout.tsx     document shell (<html lang>, fonts, theme)
    [lang]/page.tsx       home page
    [lang]/public-key/page.tsx   public-key page
    [lang]/blog/page.tsx         list of blog posts
    [lang]/blog/[slug]/page.tsx  a blog post
    [lang]/blog/feed.xml/route.ts  RSS feed
    public-key/pgp.asc/route.ts  the raw PGP key
    public-key/ssh.pub/route.ts  the raw SSH key
    global-not-found.tsx  404 page
    sitemap.ts, robots.ts
    globals.css           design tokens and shared styles
    fonts.ts              font declarations
  components/             ui/, site/, home/, keys/, blog/, icons/, content/
  content/
    site.ts               facts shared by all languages, the last-updated date
    types.ts              the shape every dictionary must have
    locales/en|zh-hant|zh-hans/   common.tsx, home.tsx, keys.tsx, blog.tsx, not-found.tsx
    keys/                 pgp.asc, ssh.pub, facts.ts
    blog/<slug>/          a blog post: post.json, en.md, zh-hant.md, zh-hans.md, pictures
    photo/                photo.jpeg, the original of the portrait
    blog.ts               getPosts and getPost, which the pages of the blog and the home page call
  fonts/                  the two font files and their licences
  i18n/                   languages, URL paths, date format
  lib/                    metadata (head tags), JSON-LD
next.config.ts, open-next.config.ts, wrangler.jsonc   build and hosting settings
```

Generated, never edited by hand and ignored by git: `.next/`, `.open-next/`, `.wrangler/`, `next-env.d.ts`, `src/content/keys/key-text.generated.ts`, `src/content/photo.generated.ts`, `src/content/blog-generated/`, `public/media/blog/`, `public/media/photo/`. A fresh copy of the repository therefore has none of them; `npm run dev`, `npm run build` and `npm run cf:build` write them first.

## Running it locally

Node.js 20 or newer is needed. Install the packages once:

```bash
npm install
```

Development server with live reload, at <http://localhost:3000/>:

```bash
npm run dev
```

The production build on the local Workers runtime (the same runtime as on Cloudflare), at <http://localhost:8787/>:

```bash
npm run preview
```

The development server relaxes the Content-Security-Policy (the tools need it). Anything about the policy must be checked on the preview.

### If the project folder is synchronised (iCloud Drive and similar)

`~/Documents` on this Mac is kept in step by iCloud Drive. Such a service copies files while a build writes them and leaves duplicates such as `00000001 2.sst` behind. For that reason the Turbopack disk cache is switched off in `next.config.ts`. If a build still stops with an error like `Failed to open database`, delete the generated folders and build again:

```bash
rm -rf .next .open-next .wrangler
```

The better cure is to keep the project in a folder that is not synchronised.

## Changing text

Text exists three times, once per language. Change all three so the languages stay in step.

| What | Where |
| --- | --- |
| Home page: biography, education, experience, awards, labels, heading of the blog section | `src/content/locales/<language>/home.tsx` |
| Public-key page: explanations, steps, trust notes | `src/content/locales/<language>/keys.tsx` |
| Header, footer, theme labels, skip link | `src/content/locales/<language>/common.tsx` |
| Blog: heading, labels, link texts (not the posts) | `src/content/locales/<language>/blog.tsx` |
| Blog posts | `src/content/blog/<slug>/`, see below |
| Not-found page | `src/content/locales/<language>/not-found.tsx` |
| E-mail addresses, phone, profile links, order of contact rows | `src/content/site.ts` |
| Portrait | `src/content/photo/`, see below |
| Key fingerprints, user ID, dates, commands | `src/content/keys/facts.ts` |

`<language>` is `en`, `zh-hant` or `zh-hans`. TypeScript reports a dictionary that lacks an entry (`npx tsc --noEmit`). The head tags (title, description, Open Graph) and the JSON-LD block are built from the same modules, so they follow.

Standing content rules: no mainland-China (+86) phone number; no WeChat QR code; the WeChat ID as plain text on the Simplified Chinese home page only; no key fingerprints on the home pages; link order ORCID, Google Scholar, CityUHK Scholars, GitHub, LinkedIn, Keys; language order English / 繁體 / 简体.

## Writing a blog post

A post is a folder in `src/content/blog/`. The folder `writing-a-post` is an example that shows everything a post can contain; it is a draft and never reaches the live site.

1. Copy `src/content/blog/writing-a-post/` and give the copy a new name. The name is the address of the post (`my-first-post` is served at `/blog/my-first-post/`), so use small letters, digits and hyphens, and do not change it after the post is published.
2. Edit `post.json`:

   ```json
   {
     "date": "2026-10-05",
     "draft": true,
     "cover": "cover.jpg"
   }
   ```

   | Entry | Meaning |
   | --- | --- |
   | `date` | Date of publication. Posts are listed newest first, and the links "Previous post" and "Next post" at the end of a post follow the same order. |
   | `updated` | Optional. Date of the last change, shown beside the date. |
   | `draft` | `true`: the post is seen under `npm run dev` only. |
   | `cover` | Optional. File name of the picture at the top of the post, also used when the post is shared, the first preview in the list of posts, and the picture of the post on the home page. |

3. Write the text in `en.md`, `zh-hant.md` and `zh-hans.md`. Each file starts with the front matter, then the text in Markdown:

   ```markdown
   ---
   title: The title of the post
   description: One or two sentences, shown in the list of posts and in search results.
   coverAlt: What the cover picture shows, also shown below it as its caption (only if the post has a cover).
   ---

   The first paragraph.

   ## A heading

   ![What the picture shows](figure-1.png "The caption of the picture")
   ```

4. Put the pictures into the folder of the post (JPEG, PNG, WebP, AVIF, GIF or TIFF), then run `npm run pictures`, which removes the camera data and the place from each new original and makes it 2400 pixels wide at most (see Pictures and the public repository). The build writes each picture as WebP, at most 1600 pixels wide, to `public/media/blog/<slug>/`, and a small square preview of each for the list of posts (the cover first, then the pictures of the text); the build does not change the original.
5. Look at the post with `npm run dev`. The page follows the files as they are saved.

   A change to `scripts/generate-blog.mjs` itself is not followed; start `npm run dev` again, or run `node scripts/generate-blog.mjs --drafts`.
6. To publish, set `"draft": false` and deploy (see below).

Rules the build checks, and stops at with a message:

- all three language files exist, each with `title` and `description`;
- every picture exists, lies in the folder of the post, and has a description in the square brackets;
- headings in the text start at `##` (the title of the post is the only first-level heading);
- pictures from other sites are not allowed, and HTML written inside a Markdown file is dropped. Both follow from the Content-Security-Policy.

What the site adds to a post by itself:

- in the list of posts, a row of square previews of its pictures under the description: at most six, four on a phone;
- on the home page, in the section Blog after the biography, one square picture that links to the post: the cover, or the first picture of the text if the post has no cover. The section shows the twelve newest posts, newest first; a post without any picture is not shown there. The title of the post is the alt text of the picture and its tooltip;
- below the cover, the text of `coverAlt` as its caption, in the look of the captions in the text;
- at the end of the post, links to the post published before it and the one published after it. Under `npm run dev` these lead to drafts as well; the live site has no drafts.

Links to pages of this site are written with the path of the language of the file: `/public-key/` in `en.md`, `/zh-hans/public-key/` in `zh-hans.md`.

A published post appears on the home page by itself. Publishing a post does not change the last-updated date of the site; that date is set by hand (next section).

### People, names and links in a post

- Every person named in the text of a post carries a link, in all three languages. The link leads to the personal website of the person if there is one, otherwise to the profile page of the university.
- Titles, descriptions, `coverAlt` and captions are plain text and carry no link.
- English pages write "Professor Yue Zhu" in full, never "Professor Zhu Yue" and never the family name alone.
- English pages name the laboratory "JC STEM Lab of Future Energy Systems", as its sign does.
- Chinese pages write the Chinese name of a person where it is known; English pages keep the English name.

  | English pages | `zh-hans.md` | `zh-hant.md` |
  | --- | --- | --- |
  | Professor Z. Y. Dong | 董朝阳教授 | 董朝陽教授 |
  | Professor Leanne Chan | 陈俪行教授 | 陳儷行教授 |
- A photo of a group says in its caption which person is the author, by place and clothing.

| Person | Link |
| --- | --- |
| Professor Yue Zhu | <https://yuezhu.site> |
| Professor Z. Y. Dong | <https://www.cityu.edu.hk/stfprofile/zydong.htm> |
| Professor Leanne Chan | <https://www.cityu.edu.hk/stfprofile/lhlchan.htm> |
| Professor Tim Green | <https://profiles.imperial.ac.uk/t.green> |

To see drafts on the local Workers runtime, which applies the strict Content-Security-Policy:

```bash
BLOG_DRAFTS=1 npm run preview
```

## Changing the portrait

Replace the file in `src/content/photo/` and start `npm run dev` or the build again. Nothing else needs to change.

- The file is named `photo`, with the ending of its type (`photo.jpeg`; JPEG, PNG, WebP, AVIF or TIFF). The folder holds one portrait only.
- It can have any size from 640 pixels wide. The frame on the page is 3:4 (portrait format); a picture of another shape is cut at the edges to fill it.
- `scripts/generate-photo.mjs` writes it to `public/media/photo/` as AVIF and WebP, 160, 320 and 480 pixels wide, and as one JPEG, 640 pixels wide. The browser takes the smallest file that is sharp on its screen. The JPEG is for old browsers and for link previews (Open Graph, Twitter card, JSON-LD).
- The names of the files carry a hash of the original, so a new portrait has new addresses and is seen at once.
- The data inside the original (camera, place, time) is not copied into the files that are served.

Do not put the original into `public/`: everything in that folder is published as it is.

## Pictures and the public repository

The files that the site serves carry no camera data. The originals in `src/content/blog/` and `src/content/photo/` are part of the repository, and a photo from a phone holds the camera, the time and usually the place (GPS) where it was taken. Anyone could read that on GitHub. A photo from a phone is also several megabytes large, far more than the site needs.

After a picture is added or replaced:

```bash
npm run pictures
```

`scripts/prepare-pictures.mjs` rewrites each original that needs it, in place: it turns the picture upright, removes all data inside the file (EXIF, GPS, XMP, IPTC, colour profile) and makes the picture 2400 pixels wide if it is wider. An original that is ready is not touched. The old file is lost, so keep a copy outside the project if it is wanted.

Before the repository is pushed or the site is deployed:

```bash
npm run pictures:check
```

It changes nothing, lists the originals that still need the step, and must end with "every original is ready".

Files of the camera that the site cannot use (HEIC, DNG, the video of a Live Photo) are ignored by git, so that they do not reach the repository by accident.

On 2026-09-30 all 30 originals were ready; together they take 22 MB.

## The last-updated date

One place only:

```ts
// src/content/site.ts
lastUpdated: '2026-09-29',
```

The hero, the footer, `dateModified` in the JSON-LD and `<lastmod>` in the sitemap all read it. There is no cache-buster to change: the build gives every stylesheet and script a new name when its content changes.

## Public keys

| File | URL | Contents |
| --- | --- | --- |
| `src/content/keys/pgp.asc` | <https://zehao-duan.com/public-key/pgp.asc> | OpenPGP public key, ASCII-armoured: Ed25519 with a Cv25519 encryption subkey |
| `src/content/keys/ssh.pub` | <https://zehao-duan.com/public-key/ssh.pub> | OpenSSH public key, Ed25519 |

| Key | Fingerprint | Expires |
| --- | --- | --- |
| PGP | `3820 3A1C 91D7 EED4 CA65 8D3C F14B A896 331B 9793` | 2031-09-16 (primary key and subkey) |
| SSH | `SHA256:0JAhpUGbGd5G8ceQYFQ7GsxRzSfjT3ZLuZeCwFm3pFQ` | never |

The two files are the source of truth. `scripts/generate-key-text.mjs` runs before every `dev`, `build` and `preview`; it writes their text into `key-text.generated.ts`, which the pages show and the route files serve. The key text on the pages therefore always equals the files character for character. The script stops the build if a file holds a private key or if a fingerprint in `facts.ts` does not belong to the file.

What is still typed by hand, in `src/content/keys/facts.ts`: both fingerprints (the PGP one as a whole, in groups and in halves; the SSH one as a whole and in two parts), the PGP user ID, the key types, and the creation and expiry dates. The Chinese and English sentences that mention the expiry date are in the three `keys.tsx` files; search them for `2031-09-16` when the date changes. This README repeats the fingerprints and dates as well.

The key text and the user ID are wrapped in `<!--email_off-->` comments by the `EmailOff` component, so that Cloudflare's email obfuscation leaves the address inside them alone.

### Only public keys go in this folder

The project is uploaded to a public host and may be copied for backups. Never put a private key, a secret-key export or a revocation certificate (`.rev`) anywhere inside it. Before every deployment, this must print nothing:

```bash
grep -rli -e "BEGIN .*PRIVATE KEY" -e "revocation certificate" --exclude=README.md --exclude=generate-key-text.mjs --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.open-next --exclude-dir=.wrangler .
```

That search only sees text files; a binary export (`gpg --export-secret-keys` without `--armor`) would slip past it, so never export secret material into this folder in the first place. This file-name check must print nothing either:

```bash
find . \( -name node_modules -o -name .next -o -name .open-next -o -name .wrangler \) -prune -o -type f \( -name '*.gpg' -o -name '*.key' -o -name '*.rev' -o -name '*.pem' -o -name 'id_*' \) ! -name '*.pub' -print
```

`.dev.vars` holds one line, `NEXTJS_ENV=development`, and no secret. The site needs no secret of any kind.

### Checking that the pages match the files

Neither command imports anything. Their output must agree with `facts.ts` and with what the public-key pages show:

```bash
gpg --show-keys --with-fingerprint src/content/keys/pgp.asc
```

```bash
ssh-keygen -lf src/content/keys/ssh.pub
```

With the preview running, `scripts/checks/parity.py` compares the key text on the three rendered pages with the files byte for byte (see Checks before publishing).

### Extending the PGP expiry

Do this around March 2031, before the key expires on 2031-09-16. The fingerprint does not change. The second command extends the subkey, which expires on the same day:

```bash
gpg --quick-set-expire 38203A1C91D7EED4CA658D3CF14BA896331B9793 5y
```

```bash
gpg --quick-set-expire 38203A1C91D7EED4CA658D3CF14BA896331B9793 5y '*'
```

If the key has already expired, `'*'` skips the expired subkey; name the subkey instead:

```bash
gpg --quick-set-expire 38203A1C91D7EED4CA658D3CF14BA896331B9793 5y 148D2183C537C36EEEE2094F8FAF808B26D6B8F5
```

Then export the refreshed key and confirm with the `--show-keys` command above that both the `pub` and the `sub` line show the new date:

```bash
gpg --armor --export 38203A1C91D7EED4CA658D3CF14BA896331B9793 > src/content/keys/pgp.asc
```

Then:

1. change `expires` in `src/content/keys/facts.ts`;
2. change the date in the sentences of the three `keys.tsx` files that mention it;
3. change the dates in this README (the table and this section);
4. set the last-updated date, run the checks, deploy;
5. send the refreshed key to every other place it is published (a key server, GitHub).

### Replacing a key

- `pgp.asc` always holds the current PGP key. When it is replaced, put the new file in `src/content/keys/`, then update `facts.ts` (fingerprint in all three forms, user ID, key types, dates; the `gpg --encrypt` step takes the fingerprint from there) and this README (the table, and the primary and subkey fingerprints in the commands under Extending the PGP expiry, which would otherwise act on the old key). The build refuses to run while `facts.ts` still names the old fingerprint. A revoked key stays downloadable, with its revocation included, as `pgp-revoked-<last 8 hex digits>.asc`; serving it needs a new route file beside `src/app/public-key/pgp.asc/route.ts` and an entry in the list `fileRoutes` in `src/proxy.ts`. If there is no successor yet, the revoked key stays at `pgp.asc`.
- SSH keys have no expiry and cannot be revoked. When `ssh.pub` is replaced, put the new file in `src/content/keys/`, change the fingerprint in `facts.ts` (`text` and the two `parts`, split near the middle; the page breaks the line only there) and in the table above, and remove the old key from GitHub and from every server's `authorized_keys`.

### Adding another key or file

A further file needs: the file in `src/content/keys/`, a route file under `src/app/public-key/<name>/route.ts` (copy one of the two that exist), its path in `fileRoutes` in `src/proxy.ts`, and, if the page should show it, entries in `facts.ts`, `types.ts` and the three `keys.tsx` files.

## Checks before publishing

```bash
npx tsc --noEmit        # types, and that no dictionary lacks an entry
npm run lint
npm run preview         # builds, then serves on http://localhost:8787/
```

With the preview running, in a second terminal:

```bash
BASE=http://localhost:8787 python3 scripts/checks/runtime.py
BASE=http://localhost:8787 python3 scripts/checks/parity.py
```

`runtime.py` checks status codes, `html lang`, redirects, the not-found page, the key files byte for byte, the security headers, that every response has a new nonce, that the HTML has no `style` attribute and no script without the nonce, and the cache headers of static files.

Since the portrait was changed on 2026-09-29, `parity.py` reports the address and the size of the portrait in the head tags and in the JSON-LD of the three home pages as differences from the old site (27 lines). Since the last-updated date was set to 2026-09-29, while the old static pages keep 2026-09-28, it also reports the date on the three home pages and the three public-key pages (18 lines) and the JSON-LD of the three public-key pages (3 lines). The total is 48 lines. These are expected; any other line is a fault. The heading and the link of the blog section of the home page ("Blog", "All posts" and their Chinese forms) stand in the list "only in NEW" of the three home pages; that list is for information and is not counted as a fault.

`parity.py` compares each rendered page with the old static page in `~/Documents/Website/personal-website` (set `OLD_SITE` to use another folder): every piece of text of the old page must be on the new page, the key text must equal the key files, the `email_off` comments must be in place, head tags and JSON-LD must be equal, and the content rules (no +86 number, no key data on home pages, WeChat on the Simplified Chinese home page only) must hold. `python3 scripts/checks/parity.py --negative-control` damages the fetched pages on purpose and proves that the script can fail. Once the old site is retired and the text moves on, this comparison loses its reference; the content rules and the key checks in it remain useful.

Then the two searches under "Only public keys go in this folder", `npm run pictures:check` (see Pictures and the public repository), and a look at the pages in a browser: light and dark, a phone width, the copy buttons, and the browser console, which must show no Content-Security-Policy message.

Size of the Worker:

```bash
npm run cf:size
```

On 2026-09-30 it reported a total upload of 9643.37 KiB, 2323.58 KiB after gzip. The limit of the Workers Free plan is 3 MiB (3072 KiB) after gzip.

## Deploying to Cloudflare Workers

There are two ways. Both build the same Worker, named `zehao-duan-site` in `wrangler.jsonc`.

### From this folder

```bash
npx wrangler login      # once; opens the browser
npm run deploy          # builds and uploads the Worker "zehao-duan-site"
```

### From the GitHub repository (Workers Builds)

In the Cloudflare dashboard: Workers & Pages, Create, Import a repository, and choose the repository. Then every push to the main branch builds and deploys.

| Setting | Value |
| --- | --- |
| Project name | `zehao-duan-site` (must equal `name` in `wrangler.jsonc`) |
| Build command | `npm run cf:build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Root directory | `/` |

The build command must be `npm run cf:build`, not `npx opennextjs-cloudflare build` alone: the generated modules and pictures are not in the repository, and only the npm script writes them before the build. No environment variable and no secret is needed.

The first deployment publishes the Worker at a `workers.dev` address. Test it there before the domain is moved.

### Custom domain and DNS

The domain is on Cloudflare already and points at the old host (object storage).

1. **Apex (`zehao-duan.com`).** In the dashboard: Workers & Pages, the Worker, Settings, Domains & Routes, Add, Custom Domain. A Custom Domain cannot be created while a DNS record exists on that host name. The existing record of `zehao-duan.com` must be removed by hand first (DNS, Records); write its type and target down before deleting it, so the old site can be restored. Between the deletion and the creation of the Custom Domain the site is unreachable for a short while, so do both in one sitting.
2. **`www`.** A Custom Domain is not needed. Keep or create a placeholder record, proxied (orange cloud), for example `AAAA www 100::`, and add a redirect rule (Rules, Redirect Rules): when the host name equals `www.zehao-duan.com`, redirect to `https://zehao-duan.com` with the path kept, status 301. Without a proxied record the rule never runs.
3. Rules of the zone that were made for the old host should be reviewed: the response-header rule that set `Content-Type` for the two key files is no longer needed, since the Worker sends `text/plain; charset=utf-8` itself.
4. `Strict-Transport-Security` is not sent by the Worker. If wanted, switch it on in the dashboard (SSL/TLS, Edge Certificates, HSTS).

Going back: delete the Custom Domain and create the old DNS record again.

## After the first deployment

1. **CPU time.** The Workers Free plan allows 10 ms of CPU time per request. Rendering a page with React on the server may come near that. In the dashboard open the Worker, Metrics, and read the CPU time (median and 99th percentile) after some page views; or run `npx wrangler tail` while loading pages. If requests fail with error 1102 ("Worker exceeded resource limits") or the 99th percentile is near 10 ms, the choices are the Workers Paid plan or giving up per-request rendering for the pages.
2. **Email obfuscation and the Content-Security-Policy.** Cloudflare's Email Address Obfuscation (Scrape Shield) rewrites e-mail addresses in the HTML and adds a script of its own. That script has no nonce, so the policy blocks it, and the `mailto:` links of the home pages would stop working. Keep the feature switched off for the zone. Check:

   ```bash
   for p in "" zh-hant/ zh-hans/ public-key/ zh-hant/public-key/ zh-hans/public-key/; do curl -sS https://zehao-duan.com/$p > /tmp/page.html; echo "/$p $(grep -c -F 'zehao.duan@gmail.com' /tmp/page.html) $(grep -c -e 'email-protection' -e '__cf_email__' /tmp/page.html)"; done
   ```

   The second number of every line must be 0 and the first must not be 0. The same goes for other features that inject scripts (Rocket Loader, Web Analytics with automatic setup): leave them off, or the browser console will report violations.
3. **Dates.** The date is formatted by the runtime (`Intl.DateTimeFormat`). The pages must read "29 September 2026" in English and "2026年9月29日" on both Chinese pages. The local preview does; confirm it on the deployed site.
4. **Key files.** Both must come back unchanged:

   ```bash
   curl -sS -D - -o /tmp/pgp.asc https://zehao-duan.com/public-key/pgp.asc && cmp /tmp/pgp.asc src/content/keys/pgp.asc
   ```

   ```bash
   curl -sS -D - -o /tmp/ssh.pub https://zehao-duan.com/public-key/ssh.pub && cmp /tmp/ssh.pub src/content/keys/ssh.pub
   ```

   Expect status 200, `content-type: text/plain; charset=utf-8`, no `cf-mitigated` header (that would be a Cloudflare challenge page), and no output from `cmp`.
5. **The whole check script against the live site:** `BASE=https://zehao-duan.com python3 scripts/checks/runtime.py`.

## Design

- Direction "Neutral modern": neutral surfaces, one blue accent, light and dark theme. The theme follows the system setting and can be chosen with the switch in the header.
- Typography: Inter for text and interface, Geist Mono for fingerprints, key text and commands. Chinese text uses the visitor's system fonts (PingFang, Microsoft YaHei / JhengHei, Noto Sans CJK).
- Responsive from 320 px phones to wide desktops, with print styles.
- The pages work without JavaScript; the theme switch and the copy buttons appear only when scripts run.

## Licence

© Zehao Duan. All rights reserved.

This repository is published so the site can be hosted and viewed, not for reuse. The text, portrait, contact details, structured data, the source code written for this site, the stylesheet and the favicon may not be copied, modified or redistributed without written permission. No open-source licence is granted.

The exceptions are third-party works, which keep their own licences:

- the two font files in `src/fonts/`, both under the [SIL Open Font License 1.1](https://openfontlicense.org): `inter-latin-opsz-normal.woff2` ([Inter](https://github.com/rsms/inter), licence text in `src/fonts/LICENSE-inter.txt`) and `geist-mono-latin-wght-normal.woff2` ([Geist Mono](https://github.com/vercel/geist-font), licence text in `src/fonts/LICENSE-geist-mono.txt`);
- the components in `src/components/ui/`, generated by [shadcn/ui](https://ui.shadcn.com) (MIT licence);
- the icons of [Lucide](https://lucide.dev) (ISC licence) and the packages listed in `package.json`, under their own licences;
- the brand marks in `src/components/icons/` (ORCID, Google Scholar, GitHub, LinkedIn, WeChat), which are trademarks of their owners and are used only to point to the owner's profiles.
