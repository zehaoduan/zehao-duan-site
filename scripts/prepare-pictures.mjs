#!/usr/bin/env node
/**
 * Prepares the originals of the pictures for the public repository.
 *
 *   src/content/blog/<slug>/*.jpg|png|...   the pictures of the posts
 *   src/content/photo/photo.*               the portrait
 *
 * A photo from a phone holds the camera, the time and often the place (GPS),
 * and is several megabytes large. The originals are part of the repository,
 * so this script rewrites each original that needs it, in place:
 *   - the picture is turned as its EXIF data says, then all data inside the
 *     file (EXIF, GPS, XMP, IPTC, colour profile) is dropped; colours are
 *     converted to sRGB first;
 *   - a picture wider than 2400 pixels is made 2400 pixels wide.
 * An original that is clean and small enough already is not touched, so the
 * script can run any number of times without loss.
 *
 *   npm run pictures          rewrite the originals that need it
 *   npm run pictures:check    change nothing; list them and end with code 1
 *                             if there is one (before a push or a deployment)
 *
 * The old file is lost: keep a copy outside the project if it is wanted.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirs = [join(root, 'src', 'content', 'blog'), join(root, 'src', 'content', 'photo')];

/** Width of an original at most; the widest picture the site serves is 1600 pixels wide. */
const maxWidth = 2400;

const encoders = {
  '.jpg': (image) => image.jpeg({ quality: 82, mozjpeg: true }),
  '.jpeg': (image) => image.jpeg({ quality: 82, mozjpeg: true }),
  '.png': (image) => image.png({ compressionLevel: 9 }),
  '.webp': (image) => image.webp({ quality: 90, effort: 6 }),
  '.avif': (image) => image.avif({ quality: 70, effort: 6 }),
  '.tif': (image) => image.tiff({ compression: 'lzw' }),
  '.tiff': (image) => image.tiff({ compression: 'lzw' }),
};

const checkOnly = process.argv.includes('--check');

const show = (file) => relative(root, file);
const log = (message) => console.log(`prepare-pictures: ${message}`);
const kilobytes = (bytes) => `${Math.round(bytes / 1024)} KB`;

function filesOf(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const file = join(folder, entry.name);
    if (entry.isDirectory()) return filesOf(file);
    return extname(entry.name).toLowerCase() in encoders ? [file] : [];
  });
}

/** Why the original must be rewritten; empty if it is ready. */
async function faults(file) {
  const found = await sharp(file).metadata();
  const gps =
    found.exif &&
    (found.exif.includes(Buffer.from([0x88, 0x25])) || found.exif.includes(Buffer.from([0x25, 0x88])));
  // the turned picture is as wide as the file is high
  const width = (found.orientation ?? 1) >= 5 ? found.height : found.width;
  return [
    ...(gps ? ['place (GPS)'] : []),
    ...(found.exif && !gps ? ['camera data'] : []),
    ...(found.xmp || found.iptc ? ['XMP or IPTC data'] : []),
    ...(found.icc ? ['colour profile'] : []),
    ...(width > maxWidth ? [`${width} px wide`] : []),
  ];
}

let open = 0;
for (const file of sourceDirs.flatMap(filesOf).sort()) {
  const found = await faults(file);
  if (found.length === 0) continue;
  open += 1;
  if (checkOnly) {
    log(`${show(file)}: ${found.join(', ')}`);
    continue;
  }
  const before = statSync(file).size;
  const image = sharp(readFileSync(file))
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .toColourspace('srgb');
  const { data, info } = await encoders[extname(file).toLowerCase()](image).toBuffer({
    resolveWithObject: true,
  });
  writeFileSync(file, data);
  log(
    `${show(file)}: ${found.join(', ')}; now ${info.width} x ${info.height}, ` +
      `${kilobytes(before)} to ${kilobytes(data.length)}`,
  );
}

if (open === 0) {
  log('every original is ready');
} else if (checkOnly) {
  log(`${open} of the originals must be prepared: npm run pictures`);
  process.exit(1);
} else {
  log(`${open} of the originals rewritten`);
}
