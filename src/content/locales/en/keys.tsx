/**
 * English: the public-key page.
 *
 * Algorithm names, dates and file names come from keys/facts.ts, so they are
 * typed once for all languages. Each paragraph stays on one line, so that no
 * space is gained or lost where a line would otherwise end.
 */

import { Code, IsoDate, NoTranslate } from '@/components/content/inline';
import { keyFacts } from '@/content/keys/facts';
import { site } from '@/content/site';
import type { KeysContent } from '@/content/types';

import { common, name } from './common';

const { pgp, ssh } = keyFacts;

const description = 'Zehao Duan’s PGP and SSH public keys, with fingerprints, download links and notes on checking them before use.';

export const keys: KeysContent = {
  meta: {
    title: 'Public keys — Zehao Duan',
    description,
    ogDescription: description,
    author: name,
    siteName: name,
  },

  head: {
    kicker: name,
    title: 'Public keys',
    breadcrumbLabel: 'Breadcrumb',
    sectionsLabel: 'On this page',
    lede: [
      <>These are my public keys, for anyone who wants to send me something only I can read, check that a file really came from me, or let me log in to a server without a password.</>,
      <>A public key is meant to be shared. It can lock a message or check a signature, but it cannot unlock or sign anything: that takes the matching private key, which never leaves my devices. If none of this means anything to you, nothing here needs your attention, and ordinary email is fine.</>,
    ],
  },

  pgp: {
    title: 'PGP key',
    intro: <>For encrypted email and files, and for checking my signatures. It works with GnuPG, Thunderbird and other OpenPGP software.</>,
    factLabels: {
      fingerprint: 'Fingerprint',
      userId: 'User ID',
      type: 'Type',
      validity: 'Validity',
    },
    factValues: {
      type: <>{pgp.algorithm.primary.name} (signing), with a {pgp.algorithm.subkey.name} subkey (encryption)</>,
      validity: <>Created <IsoDate value={pgp.created} />, expires <IsoDate value={pgp.expires} /></>,
    },
    keyAriaLabel: 'PGP public key, ASCII-armoured',
    download: <>Download <NoTranslate>{pgp.file.fileName}</NoTranslate></>,
    usageTitle: 'Using it',
    steps: {
      download: <>Download the key.</>,
      check: <>Check it before importing. The fingerprint on the line under <Code>pub</Code> must match the one on this page, character for character. Newer GnuPG versions print a second fingerprint under <Code>sub</Code>; that one belongs to the encryption subkey and is not the one to compare.</>,
      import: <>Import it.</>,
      encrypt: <>Encrypt a file so that only I can read it. GnuPG will ask you to confirm, because it has no proof yet that the key is mine; the fingerprint check below is that proof.</>,
      verify: <>Check a signature I made. Look for “Good signature” and the same fingerprint. GnuPG also warns that the key “is not certified with a trusted signature”; that is the same missing proof as in step 4, not a failed check.</>,
    },
  },

  ssh: {
    title: 'SSH key',
    intro: <>For logging in to servers and Git hosting without a password. If you run a machine I should have access to, this is the line to add.</>,
    factLabels: {
      fingerprint: 'Fingerprint',
      type: 'Type',
    },
    factValues: {
      type: <>{ssh.algorithm.name}, {ssh.algorithm.bits} bits</>,
    },
    download: <>Download <NoTranslate>{ssh.file.fileName}</NoTranslate></>,
    usageTitle: 'Using it',
    steps: {
      download: <>Download the key.</>,
      check: <>Check it. The fingerprint it prints must match the one on this page, character for character.</>,
      authorise: <>Authorise it by appending the line to <Code>~/.ssh/authorized_keys</Code> of the account I should use. That lets whoever holds my private key log in to that one account, so add it only where I am meant to have access. If the account has no <Code>~/.ssh</Code> yet, create it first with <Code>mkdir -m 700 ~/.ssh</Code>, and keep <Code>authorized_keys</Code> at mode 600: sshd ignores the file if anyone else can write to it.</>,
    },
  },

  trust: {
    title: 'Before you trust these keys',
    notes: [
      {
        id: 'location',
        lead: 'Check where you are.',
        body: <>The address bar should read <NoTranslate>{site.origin}</NoTranslate>, with no certificate warning. Do not take “my” key from an email attachment, a chat message or a link that merely claims to be me.</>,
      },
      {
        id: 'whole-fingerprint',
        lead: 'Compare the whole fingerprint.',
        body: <>Every character, not just the first and last few. A forged key whose fingerprint matches at both ends is cheap to make.</>,
      },
      {
        id: 'second-channel',
        lead: 'When it matters, confirm it another way.',
        body: <>This page and the key files come from the same server, so a fingerprint shown here only proves that the two agree with each other. For anything sensitive, have me read the fingerprint to you in person, or on a call where you recognise my voice or face, using contact details you already trusted rather than ones from the message you are checking.</>,
      },
      {
        id: 'not-secret',
        lead: 'A public key is not a secret.',
        body: <>Anyone may have it. On its own it cannot decrypt, sign or log in anywhere. Never send anyone a private key; I will never ask for yours.</>,
      },
      {
        id: 'keys-change',
        lead: 'Keys change.',
        body: <>This PGP key expires on {pgp.expires} unless I extend it. If this page ever shows a different key from the one you hold, treat the new one as unverified until you have confirmed it with me.</>,
      },
      {
        id: 'metadata',
        lead: 'Encryption hides the content, not everything.',
        body: <>A PGP-encrypted email still shows who sent it, who received it and when, and in many mail programs the subject line too, so keep the subject bland.</>,
      },
    ],
  },

  backLink: common.backToHome,
};
