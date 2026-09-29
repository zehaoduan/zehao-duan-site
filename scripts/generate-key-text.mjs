#!/usr/bin/env node
/**
 * Turns the two public key files into a TypeScript module, so that the pages
 * show (and the copy buttons copy) the files character for character.
 *
 *   src/content/keys/pgp.asc  ->  PGP_ARMOR
 *   src/content/keys/ssh.pub  ->  SSH_LINE
 *   written to src/content/keys/key-text.generated.ts
 *
 * Runs before `next dev` and `next build` (see "predev" and "prebuild" in
 * package.json). It reads and writes local files only and has no dependencies.
 *
 * It also guards what must agree with the files:
 *   - the fingerprints written in src/content/keys/facts.ts are recomputed
 *     from the files, and a mismatch stops the build;
 *   - if copies of the files exist under public/public-key/ (the files that
 *     visitors download), they must be identical to the ones in src/content/keys/.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const keysDir = join(root, 'src', 'content', 'keys');
const publicDir = join(root, 'public', 'public-key');
const outFile = join(keysDir, 'key-text.generated.ts');
const factsFile = join(keysDir, 'facts.ts');

const show = (file) => relative(root, file);

function fail(message) {
  console.error(`generate-key-text: ${message}`);
  process.exit(1);
}

/** Reads a key file and returns its bytes and its text, which must be the same thing. */
function readKey(name) {
  const file = join(keysDir, name);
  if (!existsSync(file)) fail(`${show(file)} is missing`);
  const bytes = readFileSync(file);
  const text = bytes.toString('utf8');
  if (!Buffer.from(text, 'utf8').equals(bytes)) fail(`${show(file)} is not valid UTF-8 text`);
  if (/PRIVATE KEY/.test(text)) fail(`${show(file)} holds a PRIVATE key; only public keys belong here`);

  const served = join(publicDir, name);
  if (existsSync(served) && !readFileSync(served).equals(bytes)) {
    fail(`${show(served)} differs from ${show(file)}; the two must be identical`);
  }
  return { name, bytes, text };
}

/** SHA256 fingerprint of an OpenSSH public key line, as `ssh-keygen -lf` prints it. */
function sshFingerprint(line) {
  const blob = line.trim().split(/\s+/)[1];
  if (!blob) return null;
  const digest = createHash('sha256').update(Buffer.from(blob, 'base64')).digest('base64');
  return `SHA256:${digest.replace(/=+$/, '')}`;
}

/** Fingerprint of the primary key of an ASCII-armoured OpenPGP version 4 key, or null if it cannot be read. */
function pgpFingerprint(armor) {
  const lines = armor.split(/\r?\n/);
  const begin = lines.findIndex((line) => line.startsWith('-----BEGIN PGP PUBLIC KEY BLOCK-----'));
  const end = lines.findIndex((line) => line.startsWith('-----END PGP PUBLIC KEY BLOCK-----'));
  if (begin < 0 || end < begin) return null;
  const blank = lines.indexOf('', begin);
  if (blank < 0 || blank > end) return null;
  const base64 = lines
    .slice(blank + 1, end)
    .filter((line) => !line.startsWith('='))
    .join('');
  const data = Buffer.from(base64, 'base64');
  if (data.length < 3 || (data[0] & 0x80) === 0) return null;

  let tag;
  let start;
  let length;
  if (data[0] & 0x40) {
    tag = data[0] & 0x3f;
    if (data[1] < 192) [start, length] = [2, data[1]];
    else if (data[1] < 224) [start, length] = [3, ((data[1] - 192) << 8) + data[2] + 192];
    else if (data[1] === 255) [start, length] = [6, data.readUInt32BE(2)];
    else return null;
  } else {
    tag = (data[0] & 0x3c) >> 2;
    const lengthType = data[0] & 0x03;
    if (lengthType === 0) [start, length] = [2, data[1]];
    else if (lengthType === 1) [start, length] = [3, data.readUInt16BE(1)];
    else if (lengthType === 2) [start, length] = [5, data.readUInt32BE(1)];
    else return null;
  }
  const body = data.subarray(start, start + length);
  if (tag !== 6 || body.length !== length || body[0] !== 4) return null;

  const header = Buffer.from([0x99, length >> 8, length & 0xff]);
  return createHash('sha1').update(header).update(body).digest('hex').toUpperCase();
}

const pgp = readKey('pgp.asc');
const ssh = readKey('ssh.pub');

const output = `/**
 * GENERATED FILE. Do not edit.
 *
 * Written by scripts/generate-key-text.mjs from pgp.asc and ssh.pub in this
 * folder. The strings equal the files byte for byte, final newline included.
 * To change a key, replace the file and run: node scripts/generate-key-text.mjs
 */

export const PGP_ARMOR = ${JSON.stringify(pgp.text)};

export const SSH_LINE = ${JSON.stringify(ssh.text)};
`;

if (!existsSync(outFile) || readFileSync(outFile, 'utf8') !== output) {
  writeFileSync(outFile, output);
  console.log(`generate-key-text: wrote ${show(outFile)}`);
} else {
  console.log(`generate-key-text: ${show(outFile)} is up to date`);
}

if (existsSync(factsFile)) {
  const facts = readFileSync(factsFile, 'utf8');
  const checks = [
    ['PGP', pgpFingerprint(pgp.text), pgp.name],
    ['SSH', sshFingerprint(ssh.text), ssh.name],
  ];
  for (const [kind, fingerprint, name] of checks) {
    if (fingerprint === null) {
      console.warn(`generate-key-text: could not compute the ${kind} fingerprint of ${name}; check facts.ts by hand`);
    } else if (!facts.includes(`'${fingerprint}'`)) {
      fail(`the ${kind} fingerprint of ${name} is ${fingerprint}, but ${show(factsFile)} does not say so`);
    }
  }
}
