/**
 * Language-independent facts about the two public keys.
 *
 * The key files in this folder (pgp.asc, ssh.pub) are the source of truth.
 * Their full text comes from key-text.generated.ts. The facts below are typed
 * by hand from the output of
 *
 *   gpg --show-keys --with-fingerprint pgp.asc
 *   ssh-keygen -lf ssh.pub
 *
 * and scripts/generate-key-text.mjs refuses to continue if either fingerprint
 * written here does not belong to the files. When a key is replaced or its
 * expiry is extended, update this file; the pages in all three languages
 * follow from it.
 */

import { site } from '@/content/site';

import type { KeyFacts, KeyFile } from '../types';

export { PGP_ARMOR, SSH_LINE } from './key-text.generated';

/** The raw files have one address for all languages. */
function keyFile(fileName: string): KeyFile {
  const path = `/public-key/${fileName}`;
  return { fileName, path, url: `${site.origin}${path}` };
}

const pgpFile = keyFile('pgp.asc');
const sshFile = keyFile('ssh.pub');

const pgpFingerprint = '38203A1C91D7EED4CA658D3CF14BA896331B9793';

const sshFingerprint = 'SHA256:0JAhpUGbGd5G8ceQYFQ7GsxRzSfjT3ZLuZeCwFm3pFQ';

export const keyFacts: KeyFacts = {
  anchors: {
    pgp: 'pgp',
    ssh: 'ssh',
    trust: 'verify',
  },
  pgp: {
    fingerprint: {
      compact: pgpFingerprint,
      groups: ['3820', '3A1C', '91D7', 'EED4', 'CA65', '8D3C', 'F14B', 'A896', '331B', '9793'],
      halves: ['3820 3A1C 91D7 EED4 CA65', '8D3C F14B A896 331B 9793'],
    },
    userId: 'Zehao Duan (Main PGP Key) <zehao.duan@gmail.com>',
    algorithm: {
      primary: { name: 'Ed25519', usage: 'signing' },
      subkey: { name: 'Cv25519', usage: 'encryption' },
    },
    created: '2026-09-17',
    expires: '2031-09-16',
    file: pgpFile,
    steps: [
      {
        id: 'download',
        command: `curl -O ${pgpFile.url}`,
        noBreak: ['-O'],
      },
      {
        id: 'check',
        command: `gpg --show-keys --with-fingerprint ${pgpFile.fileName}`,
        noBreak: ['--show-keys', '--with-fingerprint'],
      },
      {
        id: 'import',
        command: `gpg --import ${pgpFile.fileName}`,
        noBreak: ['--import'],
      },
      {
        id: 'encrypt',
        command: `gpg --encrypt --armor --recipient ${pgpFingerprint} message.txt`,
        noBreak: ['--encrypt', '--armor', '--recipient'],
      },
      {
        id: 'verify',
        command: 'gpg --verify paper.pdf.sig paper.pdf',
        noBreak: ['--verify'],
      },
    ],
  },
  ssh: {
    fingerprint: {
      text: sshFingerprint,
      parts: ['SHA256:0JAhpUGbGd5G8ceQYFQ7', 'GsxRzSfjT3ZLuZeCwFm3pFQ'],
    },
    algorithm: { name: 'Ed25519', bits: 256 },
    file: sshFile,
    steps: [
      {
        id: 'download',
        command: `curl -O ${sshFile.url}`,
        noBreak: ['-O'],
      },
      {
        id: 'check',
        command: `ssh-keygen -lf ${sshFile.fileName}`,
        noBreak: ['ssh-keygen', '-lf'],
      },
      {
        id: 'authorise',
        command: `cat ${sshFile.fileName} >> ~/.ssh/authorized_keys`,
        noBreak: [],
      },
    ],
  },
};
