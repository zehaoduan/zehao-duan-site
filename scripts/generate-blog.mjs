#!/usr/bin/env node
/**
 * Turns the blog posts into TypeScript modules and web pictures.
 *
 *   src/content/blog/<slug>/post.json      date, updated, cover, draft
 *   src/content/blog/<slug>/en.md          front matter (title, description,
 *   src/content/blog/<slug>/zh-hant.md     coverAlt) and the text in Markdown
 *   src/content/blog/<slug>/zh-hans.md
 *   src/content/blog/<slug>/*.jpg|png|...  the pictures of the post
 *
 *   written to src/content/blog-generated/   facts.ts, loaders.ts,
 *                                            <language>/index.ts (the list),
 *                                            <language>/<slug>.ts (the text)
 *   written to public/media/blog/<slug>/     the pictures as WebP, at most
 *                                            1600 px wide, and 800 px wide;
 *                                            and of each a square preview
 *                                            for the list of posts
 *
 * Runs before `next dev` and `next build` (see package.json). Markdown is
 * rendered here, at build time, so no Markdown parser reaches the Worker.
 *
 *   --drafts   include the posts with "draft": true (also: BLOG_DRAFTS=1).
 *              `npm run dev` sets it; production builds never do.
 *   --watch    stay and generate again when a file of a post changes.
 *
 * It stops the build when
 *   - a post lacks one of the three languages, a title or a description;
 *   - post.json is not valid, or a date is not a calendar date;
 *   - a picture is missing, lies outside the folder of the post, or is on
 *     another site (the Content-Security-Policy allows pictures of the site
 *     only);
 *   - the text has a first-level heading (the title of the post is the only
 *     one on the page) or the rendered HTML would carry a style attribute
 *     (the Content-Security-Policy forbids it).
 */

import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  watch,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import sharp from 'sharp';
import { unified } from 'unified';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const blogDir = join(root, 'src', 'content', 'blog');
const outDir = join(root, 'src', 'content', 'blog-generated');
const mediaDir = join(root, 'public', 'media', 'blog');
/** Site path of mediaDir. */
const mediaPath = '/media/blog';

/** The languages of the site, as in src/i18n/config.ts. */
const locales = ['en', 'zh-hant', 'zh-hans'];

/** Widths of the pictures that are written; the largest is the limit. */
const widths = [800, 1600];
const maxWidth = widths[widths.length - 1];
const webpQuality = 82;
/** Side of the square previews in the list of posts; they are shown at about 100 px. */
const previewSide = 240;
/** Width of the text column (41rem) for the sizes attribute. */
const sizes = '(min-width: 44rem) 41rem, 100vw';

const pictureTypes = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.tif', '.tiff']);

const args = new Set(process.argv.slice(2));
const withDrafts = args.has('--drafts') || process.env.BLOG_DRAFTS === '1';
const watching = args.has('--watch');

const show = (file) => relative(root, file);
const log = (message) => console.log(`generate-blog: ${message}`);

class BuildError extends Error {}

function fail(message) {
  throw new BuildError(message);
}

/* Reading a post ---------------------------------------------------------- */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value) {
  if (typeof value !== 'string' || !datePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function readFacts(slug) {
  const file = join(blogDir, slug, 'post.json');
  if (!existsSync(file)) fail(`${show(file)} is missing`);
  let facts;
  try {
    facts = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`${show(file)} is not valid JSON: ${error.message}`);
  }
  if (facts === null || typeof facts !== 'object' || Array.isArray(facts)) {
    fail(`${show(file)} must hold an object`);
  }
  for (const key of Object.keys(facts)) {
    if (!['date', 'updated', 'draft', 'cover'].includes(key)) {
      fail(`${show(file)}: unknown entry "${key}" (known: date, updated, draft, cover)`);
    }
  }
  if (!isCalendarDate(facts.date)) fail(`${show(file)}: "date" must be a date such as "2026-09-29"`);
  if (facts.updated !== undefined) {
    if (!isCalendarDate(facts.updated)) {
      fail(`${show(file)}: "updated" must be a date such as "2026-09-29"`);
    }
    if (facts.updated < facts.date) fail(`${show(file)}: "updated" is earlier than "date"`);
  }
  if (facts.draft !== undefined && typeof facts.draft !== 'boolean') {
    fail(`${show(file)}: "draft" must be true or false`);
  }
  if (facts.cover !== undefined && (typeof facts.cover !== 'string' || facts.cover === '')) {
    fail(`${show(file)}: "cover" must be the file name of a picture in the folder of the post`);
  }
  return {
    date: facts.date,
    updated: facts.updated !== undefined && facts.updated !== facts.date ? facts.updated : undefined,
    draft: facts.draft === true,
    cover: facts.cover,
  };
}

function readText(slug, locale, hasCover) {
  const file = join(blogDir, slug, `${locale}.md`);
  if (!existsSync(file)) fail(`${show(file)} is missing; a post needs all three languages`);
  const parsed = matter(readFileSync(file, 'utf8'));
  const text = (key, required) => {
    const value = parsed.data[key];
    if (value === undefined && !required) return undefined;
    if (typeof value !== 'string' || value.trim() === '') {
      fail(`${show(file)}: the front matter needs "${key}", a text`);
    }
    return value.trim();
  };
  for (const key of Object.keys(parsed.data)) {
    if (!['title', 'description', 'coverAlt'].includes(key)) {
      fail(`${show(file)}: unknown front matter "${key}" (known: title, description, coverAlt)`);
    }
  }
  return {
    file,
    title: text('title', true),
    description: text('description', true),
    coverAlt: text('coverAlt', hasCover),
    markdown: parsed.content,
  };
}

/* Pictures ---------------------------------------------------------------- */

/** Files that belong in public/media/blog/ after this run. */
let wanted = new Set();
/** Pictures of this run by source file, so that a picture of three languages is made once. */
let pictures = new Map();

async function picture(slug, reference, from) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(reference) || reference.startsWith('//')) {
    fail(`${show(from)}: the picture ${reference} is on another site; put the file into the folder of the post`);
  }
  const folder = join(blogDir, slug);
  const source = resolve(folder, decodeURIComponent(reference));
  if (!source.startsWith(folder + sep)) {
    fail(`${show(from)}: the picture ${reference} lies outside the folder of the post`);
  }
  if (!existsSync(source) || !statSync(source).isFile()) {
    fail(`${show(from)}: the picture ${reference} does not exist`);
  }
  const type = extname(source).toLowerCase();
  if (!pictureTypes.has(type)) {
    fail(`${show(from)}: ${reference} is not a picture this script knows (${[...pictureTypes].join(', ')})`);
  }
  const known = pictures.get(source);
  if (known) return known;

  const made = (async () => {
    const bytes = readFileSync(source);
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
    const name = basename(source, extname(source))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    // rotate(): turns the picture as its EXIF data says, before the data is dropped
    const original = await sharp(bytes).rotate().toBuffer({ resolveWithObject: true });
    const fullWidth = Math.min(original.info.width, maxWidth);
    const targets = [...widths.filter((width) => width < fullWidth), fullWidth];

    const versions = [];
    for (const width of targets) {
      const fileName = `${name || 'picture'}-${hash}-${width}.webp`;
      const file = join(mediaDir, slug, fileName);
      wanted.add(file);
      if (!existsSync(file)) {
        mkdirSync(dirname(file), { recursive: true });
        await sharp(original.data)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: webpQuality })
          .toFile(file);
        log(`wrote ${show(file)}`);
      }
      const { width: w, height: h } = await sharp(file).metadata();
      versions.push({ src: `${mediaPath}/${slug}/${fileName}`, width: w, height: h });
    }
    const largest = versions[versions.length - 1];
    return {
      src: largest.src,
      width: largest.width,
      height: largest.height,
      ...(versions.length > 1
        ? { srcSet: versions.map((version) => `${version.src} ${version.width}w`).join(', ') }
        : {}),
    };
  })();
  pictures.set(source, made);
  return made;
}

/** Square previews of this run by source file. */
let previews = new Map();

/** The square preview of a picture that picture() has taken already. */
function preview(slug, reference) {
  const source = resolve(join(blogDir, slug), decodeURIComponent(reference));
  const known = previews.get(source);
  if (known) return known;

  const made = (async () => {
    const bytes = readFileSync(source);
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
    const name = basename(source, extname(source))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const fileName = `${name || 'picture'}-${hash}-preview.webp`;
    const file = join(mediaDir, slug, fileName);
    wanted.add(file);
    if (!existsSync(file)) {
      mkdirSync(dirname(file), { recursive: true });
      await sharp(bytes)
        .rotate()
        // attention: the square is cut around the part of the picture that draws the eye
        .resize({ width: previewSide, height: previewSide, fit: 'cover', position: 'attention' })
        .webp({ quality: webpQuality })
        .toFile(file);
      log(`wrote ${show(file)}`);
    }
    return { source, src: `${mediaPath}/${slug}/${fileName}`, width: previewSide, height: previewSide };
  })();
  previews.set(source, made);
  return made;
}

/* Markdown to HTML ---------------------------------------------------------- */

const element = (tagName, properties, children) => ({
  type: 'element',
  tagName,
  properties,
  children,
});

const isBlank = (node) => node.type === 'text' && node.value.trim() === '';

/** The changes to the HTML tree of a post; see the head of this file. */
function postTree({ slug, file, found }) {
  return async function transform(tree) {
    const images = [];

    function walk(node) {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.map((child) => {
        if (child.type !== 'element') return child;
        walk(child);
        const { tagName, properties } = child;

        if ('style' in properties) {
          fail(`${show(file)}: <${tagName}> would carry a style attribute`);
        }
        if (tagName === 'h1') {
          fail(`${show(file)}: start headings at "##"; the title of the post is the only first-level heading`);
        }
        if (tagName === 'img') images.push(child);

        // A picture that stands alone in a paragraph becomes a figure; its title is the caption.
        if (tagName === 'p') {
          const content = child.children.filter((inner) => !isBlank(inner));
          const [only] = content;
          if (content.length === 1 && only.type === 'element' && only.tagName === 'img') {
            const caption = only.properties.title;
            delete only.properties.title;
            return element('figure', {}, [
              only,
              ...(typeof caption === 'string' && caption !== ''
                ? [element('figcaption', {}, [{ type: 'text', value: caption }])]
                : []),
            ]);
          }
        }

        // A wide table scrolls inside its own box, not the page.
        if (tagName === 'table') {
          return element('div', { dataSlot: 'post-table', tabIndex: 0 }, [child]);
        }
        return child;
      });
    }
    walk(tree);

    for (const image of images) {
      const { src, alt } = image.properties;
      if (typeof src !== 'string' || src === '') fail(`${show(file)}: a picture without a file`);
      if (typeof alt !== 'string' || alt.trim() === '') {
        fail(`${show(file)}: the picture ${src} needs a description: ![description](${src})`);
      }
      const made = await picture(slug, src, file);
      found.push(src);
      image.properties = {
        src: made.src,
        ...(made.srcSet ? { srcSet: made.srcSet, sizes } : {}),
        alt,
        ...(image.properties.title ? { title: image.properties.title } : {}),
        width: made.width,
        height: made.height,
        loading: 'lazy',
        decoding: 'async',
      };
    }
  };
}

/** The HTML of a text, and the pictures in it in their order. */
async function render(slug, text) {
  const found = [];
  const html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    // HTML written inside the Markdown is dropped: it could carry styles and scripts
    .use(remarkRehype)
    .use(postTree, { slug, file: text.file, found })
    .use(rehypeStringify)
    .process(text.markdown);
  return { html: String(html).trim(), pictures: found };
}

/* Writing ------------------------------------------------------------------- */

const header = `/**
 * GENERATED FILE. Do not edit.
 *
 * Written by scripts/generate-blog.mjs from the posts in src/content/blog/.
 */
`;

const literal = (value) => JSON.stringify(value, null, 2);

/** Files that belong in src/content/blog-generated/ after this run. */
let written = new Set();

function write(file, content) {
  written.add(file);
  if (existsSync(file) && readFileSync(file, 'utf8') === content) return;
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  log(`wrote ${show(file)}`);
}

/** Removes every file below `folder` that is not in `keep`, and the folders left empty. */
function sweep(folder, keep) {
  if (!existsSync(folder)) return;
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      sweep(path, keep);
      if (readdirSync(path).length === 0) rmSync(path, { recursive: true });
    } else if (!keep.has(path)) {
      rmSync(path);
      log(`removed ${show(path)}`);
    }
  }
}

/* One run ------------------------------------------------------------------- */

async function generate() {
  wanted = new Set();
  pictures = new Map();
  previews = new Map();
  written = new Set();

  const slugs = existsSync(blogDir)
    ? readdirSync(blogDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];

  const posts = [];
  let drafts = 0;
  for (const slug of slugs) {
    if (!slugPattern.test(slug)) {
      fail(`${show(join(blogDir, slug))}: the name of the folder is the address of the post; use small letters, digits and hyphens ("my-first-post")`);
    }
    const facts = readFacts(slug);
    if (facts.draft && !withDrafts) {
      drafts += 1;
      continue;
    }
    const cover = facts.cover
      ? await picture(slug, facts.cover, join(blogDir, slug, 'post.json'))
      : undefined;
    const texts = {};
    for (const locale of locales) {
      const text = readText(slug, locale, cover !== undefined);
      const { html, pictures: inText } = await render(slug, text);
      // the cover first, then the pictures of the text; a picture used twice is shown once
      const shown = new Map();
      for (const reference of [...(facts.cover ? [facts.cover] : []), ...inText]) {
        const { source, ...made } = await preview(slug, reference);
        shown.set(source, made);
      }
      texts[locale] = { ...text, html, previews: [...shown.values()] };
    }
    posts.push({
      facts: {
        slug,
        date: facts.date,
        ...(facts.updated ? { updated: facts.updated } : {}),
        draft: facts.draft,
        ...(cover ? { cover } : {}),
      },
      texts,
    });
  }

  // newest first; posts of one day in the order of their slugs
  posts.sort(
    (a, b) => b.facts.date.localeCompare(a.facts.date) || a.facts.slug.localeCompare(b.facts.slug),
  );

  write(
    join(outDir, 'facts.ts'),
    `${header}
import type { PostFacts } from '@/content/types';

/** The posts, newest first: what is the same in every language. */
export const postFacts: readonly PostFacts[] = ${literal(posts.map((post) => post.facts))};
`,
  );

  for (const locale of locales) {
    write(
      join(outDir, locale, 'index.ts'),
      `${header}
import type { PostSummary } from '@/content/types';

/** The posts in this language, newest first, without their text. */
export const posts: readonly PostSummary[] = ${literal(
        posts.map((post) => ({
          ...post.facts,
          title: post.texts[locale].title,
          description: post.texts[locale].description,
          ...(post.texts[locale].coverAlt ? { coverAlt: post.texts[locale].coverAlt } : {}),
          ...(post.texts[locale].previews.length > 0
            ? { previews: post.texts[locale].previews }
            : {}),
        })),
      )};
`,
    );
    for (const post of posts) {
      write(
        join(outDir, locale, `${post.facts.slug}.ts`),
        `${header}
export const html = ${JSON.stringify(post.texts[locale].html)};
`,
      );
    }
  }

  const loaders = (body) =>
    locales.map((locale) => `  ${JSON.stringify(locale)}: ${body(locale)},`).join('\n');
  write(
    join(outDir, 'loaders.ts'),
    `${header}
import type { PostSummary } from '@/content/types';
import type { Locale } from '@/i18n/config';

/**
 * Each list and each text is a module of its own behind a dynamic import, so
 * a request loads one language, and of the texts only the one it shows.
 */
export const summaryLoaders: Record<Locale, () => Promise<readonly PostSummary[]>> = {
${loaders((locale) => `() => import('./${locale}').then((module) => module.posts)`)}
};

export const textLoaders: Record<Locale, Record<string, () => Promise<string>>> = {
${loaders(
  (locale) =>
    `{\n${posts
      .map(
        (post) =>
          `    ${JSON.stringify(post.facts.slug)}: () => import('./${locale}/${post.facts.slug}').then((module) => module.html),`,
      )
      .join('\n')}\n  }`,
)}
};
`,
  );

  sweep(outDir, written);
  sweep(mediaDir, wanted);

  const count = `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`;
  const left = drafts > 0 ? `, ${drafts} ${drafts === 1 ? 'draft' : 'drafts'} left out` : '';
  log(`${count}${withDrafts ? ' (drafts included)' : ''}${left}`);
}

/* Start --------------------------------------------------------------------- */

async function run() {
  try {
    await generate();
    return true;
  } catch (error) {
    if (!(error instanceof BuildError)) throw error;
    console.error(`generate-blog: ${error.message}`);
    return false;
  }
}

const ok = await run();

if (!watching) {
  process.exit(ok ? 0 : 1);
} else {
  mkdirSync(blogDir, { recursive: true });
  let timer = null;
  let busy = false;
  let again = false;
  const changed = async () => {
    if (busy) {
      again = true;
      return;
    }
    busy = true;
    await run();
    busy = false;
    if (again) {
      again = false;
      changed();
    }
  };
  watch(blogDir, { recursive: true }, (_event, name) => {
    if (name && basename(name) === '.DS_Store') return;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(changed, 150);
  });
  log(`watching ${show(blogDir)}`);
}
