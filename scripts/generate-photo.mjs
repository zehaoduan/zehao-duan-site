#!/usr/bin/env node
/**
 * Turns the portrait into small web pictures and a TypeScript module.
 *
 *   src/content/photo/photo.<jpeg|jpg|png|...>   the original, in any size
 *
 *   written to public/media/photo/          AVIF and WebP, 160, 320 and 480 px
 *                                           wide, and one JPEG, 640 px wide
 *   written to src/content/photo.generated.ts   addresses, width and height
 *
 * Runs before `next dev` and `next build` (see package.json). To change the
 * portrait, replace the file in src/content/photo/ and start the build (or
 * `npm run dev`) again; nothing else needs to change.
 *
 * The portrait is shown 96, 136 and 152 px wide (src/components/home/hero.tsx),
 * so the three widths serve screens with one, two and three device pixels
 * per pixel. The JPEG is for browsers that read neither AVIF nor WebP, and
 * for link previews (Open Graph, Twitter card, JSON-LD), whose readers often
 * know JPEG and PNG only.
 *
 * The names of the files carry a hash of the original, so a new portrait has
 * new addresses and the files can be cached for a year (public/_headers).
 * The data inside the original (camera, place, time) is not copied.
 *
 * It stops the build when the original is missing, when there is more than
 * one, or when it is narrower than the JPEG that is written.
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(root, 'src', 'content', 'photo');
const outFile = join(root, 'src', 'content', 'photo.generated.ts');
const mediaDir = join(root, 'public', 'media', 'photo');
/** Site path of mediaDir. */
const mediaPath = '/media/photo';

const sourceName = 'photo';
const sourceTypes = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);

/** Widths of the AVIF and WebP pictures. */
const widths = [160, 320, 480];
/** Width of the JPEG. */
const fallbackWidth = 640;
/** Width of the portrait on the page, as in src/components/home/hero.tsx. */
const sizes = '(min-width: 64rem) 9.5rem, (min-width: 40rem) 8.5rem, 6rem';

const formats = [
  { type: 'image/avif', extension: 'avif', encode: (image) => image.avif({ quality: 55, effort: 6 }) },
  { type: 'image/webp', extension: 'webp', encode: (image) => image.webp({ quality: 80, effort: 6 }) },
];
const encodeFallback = (image) => image.jpeg({ quality: 80, mozjpeg: true });

const show = (file) => relative(root, file);
const log = (message) => console.log(`generate-photo: ${message}`);

function fail(message) {
  console.error(`generate-photo: ${message}`);
  process.exit(1);
}

function findSource() {
  const found = existsSync(sourceDir)
    ? readdirSync(sourceDir).filter((name) => {
        const type = extname(name);
        return name.slice(0, -type.length) === sourceName && sourceTypes.has(type.toLowerCase());
      })
    : [];
  if (found.length === 0) {
    fail(`${show(sourceDir)}/ needs the portrait, a file named ${sourceName}.jpeg (or ${[...sourceTypes].join(', ')})`);
  }
  if (found.length > 1) {
    fail(`${show(sourceDir)}/ holds more than one portrait (${found.join(', ')}); keep one`);
  }
  return join(sourceDir, found[0]);
}

const source = findSource();
const bytes = readFileSync(source);
const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
// rotate(): turns the picture as its EXIF data says, before the data is dropped
const original = await sharp(bytes).rotate().toBuffer({ resolveWithObject: true });
if (original.info.width < fallbackWidth) {
  fail(`${show(source)} is ${original.info.width} px wide; it must be at least ${fallbackWidth} px wide`);
}

const wanted = new Set();

async function make(width, extension, encode) {
  const fileName = `${sourceName}-${hash}-${width}.${extension}`;
  const file = join(mediaDir, fileName);
  wanted.add(fileName);
  if (!existsSync(file)) {
    mkdirSync(mediaDir, { recursive: true });
    await encode(sharp(original.data).resize({ width })).toFile(file);
    log(`wrote ${show(file)}`);
  }
  const { width: w, height: h } = await sharp(file).metadata();
  return { src: `${mediaPath}/${fileName}`, width: w, height: h };
}

const sources = [];
for (const { type, extension, encode } of formats) {
  const versions = [];
  for (const width of widths) versions.push(await make(width, extension, encode));
  sources.push({
    type,
    srcSet: versions.map((version) => `${version.src} ${version.width}w`).join(', '),
  });
}
const fallback = await make(fallbackWidth, 'jpg', encodeFallback);

for (const name of readdirSync(mediaDir)) {
  if (!wanted.has(name)) {
    rmSync(join(mediaDir, name));
    log(`removed ${show(join(mediaDir, name))}`);
  }
}

const content = `/**
 * GENERATED FILE. Do not edit.
 *
 * Written by scripts/generate-photo.mjs from ${show(source)}.
 */

import type { Photo } from './types';

export const photo: Photo = ${JSON.stringify({ ...fallback, sizes, sources }, null, 2)};
`;
if (!existsSync(outFile) || readFileSync(outFile, 'utf8') !== content) {
  writeFileSync(outFile, content);
  log(`wrote ${show(outFile)}`);
}
log(`${show(source)} (${original.info.width} x ${original.info.height}), ${wanted.size} pictures`);
