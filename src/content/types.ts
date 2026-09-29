/**
 * The content model: the contract between the content modules (src/content)
 * and the components that render them.
 *
 * Three kinds of content exist.
 *
 * 1. Language-independent facts (site.ts, keys/facts.ts): plain data, written
 *    once. Anything that reads the same in every language lives there.
 * 2. Dictionaries (locales/<locale>/): everything a reader sees in one
 *    language. Short labels and everything used in attributes or metadata are
 *    plain strings. Running text is RichText, written as JSX with the helpers
 *    from '@/components/content/inline', so it may carry links and inline code.
 *
 * 3. Blog posts (blog/<slug>/): Markdown files, one per language, and the
 *    pictures beside them. scripts/generate-blog.mjs turns them into modules
 *    (blog-generated/); the types of those modules are at the end of this file.
 *
 * Content modules hold no styling, no layout and no formatted dates.
 */

import type { ReactNode } from 'react';

import type { HtmlLang } from '@/i18n/config';

/** Running text: a string or JSX built with the inline helpers. */
export type RichText = ReactNode;

/* ------------------------------------------------------------------------ */
/* Language-independent facts: site.ts                                       */
/* ------------------------------------------------------------------------ */

export type ProfileLinkId =
  | 'orcid'
  | 'google-scholar'
  | 'cityuhk-scholars'
  | 'github'
  | 'linkedin';

export interface ProfileLink {
  /** Stable identifier: React key, and the hook for choosing an icon. */
  id: ProfileLinkId;
  /** Row label. A proper name, identical in every language. */
  label: string;
  /**
   * Canonical address, exactly as listed under sameAs in the structured data.
   * Use profileLinkHref() from site.ts for the address the page links to.
   */
  href: string;
  /**
   * When set, the page link carries this query parameter with the language
   * code of the page (Google Scholar: hl=en, hl=zh-TW, hl=zh-CN).
   */
  languageParam?: 'hl';
  /**
   * Visible link text, split where the old pages allow a line break inside a
   * long address. Render the parts in order with a <wbr> between neighbours
   * (the Breakable helper does this). A single part means no break hint.
   */
  text: readonly string[];
}

/** Rows of the contact block, in display order. */
export type ContactRowId = 'email' | 'mobile' | 'address' | ProfileLinkId | 'keys' | 'wechat';

export interface Phone {
  /** As shown to readers: '+852 6762 3354'. */
  display: string;
  /** E.164 form for tel: links: '+85267623354'. */
  e164: string;
}

export interface Person {
  /** Email addresses in display order. The links are mailto: plus the address. */
  emails: readonly string[];
  /** Hong Kong mobile number. There is no other phone number. */
  phone: Phone;
  /** ORCID iD, also the visible text of the ORCID link. */
  orcid: string;
  /** External profiles in the fixed order of the contact block. */
  links: readonly ProfileLink[];
  /**
   * WeChat ID, shown as plain text and only on the Simplified Chinese page
   * (the page whose dictionary defines home.contact.labels.wechat).
   */
  wechatId: string;
}

/** The portrait, as written by scripts/generate-photo.mjs. */
export interface Photo {
  /** The JPEG: for browsers without AVIF and WebP, and for link previews. */
  src: string;
  width: number;
  height: number;
  /** Width of the portrait on the page, for the sizes attribute. */
  sizes: string;
  /** The other formats, the one to prefer first. */
  sources: readonly { type: string; srcSet: string }[];
}

export type PageKey = 'home' | 'keys' | 'blog' | 'notFound';

export interface PageSettings {
  /** Content of the robots meta tag. */
  robots: string;
  /** Open Graph type; the not-found page has no Open Graph data. */
  ogType?: 'profile' | 'website';
  /** Twitter card type; only the home pages have Twitter card data. */
  twitterCard?: 'summary';
  /** Whether the portrait is the page's Open Graph and Twitter image. */
  image?: boolean;
}

export interface SchemaOrganization {
  '@type': 'CollegeOrUniversity';
  name: string;
}

/**
 * The language-independent part of the JSON-LD data, keyed as in schema.org.
 * What is left to the code that assembles the graph: '@id', 'url' and 'image'
 * references, the page node (from the page metadata of the dictionary and
 * site.lastUpdated), the photo dimensions (site.photo) and the postal address
 * (home.contact.postalAddress of the dictionary plus addressCountry below).
 */
export interface StructuredData {
  /** Fragment identifiers of the graph nodes. */
  ids: {
    /** Appended to the URL of the page itself. */
    webpage: string;
    /** The three below are always appended to the English home page URL. */
    website: string;
    person: string;
    photo: string;
  };
  website: {
    name: string;
    alternateName: readonly string[];
    inLanguage: readonly HtmlLang[];
  };
  photo: {
    caption: string;
  };
  person: {
    name: string;
    alternateName: readonly string[];
    gender: string;
    birthDate: string;
    birthPlace: { '@type': 'Place'; name: string };
    email: readonly string[];
    telephone: string;
    jobTitle: string;
    affiliation: SchemaOrganization;
    alumniOf: readonly SchemaOrganization[];
    knowsAbout: string;
    sameAs: readonly string[];
  };
  addressCountry: string;
}

export interface NotFoundFacts {
  /** The large status code: '404'. */
  code: string;
  /** Footer status line, English in every language on the old page. */
  status: string;
}

export interface Site {
  /** Scheme and host, no trailing slash. */
  origin: string;
  /** ISO date (YYYY-MM-DD) of the last content change. The only copy. */
  lastUpdated: string;
  photo: Photo;
  person: Person;
  /** Order of the rows in the contact block of the home page. */
  contactOrder: readonly ContactRowId[];
  pages: Record<PageKey, PageSettings>;
  notFound: NotFoundFacts;
  structuredData: StructuredData;
}

/* ------------------------------------------------------------------------ */
/* Language-independent facts: keys/facts.ts                                 */
/* ------------------------------------------------------------------------ */

export type PgpStepId = 'download' | 'check' | 'import' | 'encrypt' | 'verify';
export type SshStepId = 'download' | 'check' | 'authorise';

export interface UsageStep<Id extends string> {
  id: Id;
  /** The shell command, exactly as a reader should type it. */
  command: string;
  /**
   * Words of the command that must not be broken across lines (options and
   * hyphenated program names), in order of appearance. Presentational hint
   * carried over from the old pages; copying always uses `command`.
   */
  noBreak: readonly string[];
}

export interface KeyFile {
  /** 'pgp.asc' */
  fileName: string;
  /** Site path of the raw file: '/public-key/pgp.asc'. Not localised. */
  path: string;
  /** Absolute URL of the raw file. */
  url: string;
}

export interface KeyFacts {
  /** Element ids of the three sections of the public-key page. */
  anchors: { pgp: string; ssh: string; trust: string };
  pgp: {
    fingerprint: {
      /** 40 hexadecimal digits without spaces; what the copy button copies. */
      compact: string;
      /** The same digits in ten groups of four. */
      groups: readonly string[];
      /**
       * The groups as displayed: two halves of five groups each. The halves
       * are separated by a space and a line may break only between them.
       */
      halves: readonly [string, string];
    };
    userId: string;
    algorithm: {
      primary: { name: string; usage: 'signing' };
      subkey: { name: string; usage: 'encryption' };
    };
    /** ISO dates. */
    created: string;
    expires: string;
    file: KeyFile;
    /** Usage steps in order; the dictionaries describe each one by id. */
    steps: readonly UsageStep<PgpStepId>[];
  };
  ssh: {
    fingerprint: {
      /** The whole fingerprint; what the copy button copies. */
      text: string;
      /** The fingerprint split where a line break is allowed (see ProfileLink.text). */
      parts: readonly string[];
    };
    algorithm: { name: string; bits: number };
    file: KeyFile;
    steps: readonly UsageStep<SshStepId>[];
  };
}

/* ------------------------------------------------------------------------ */
/* Dictionaries: locales/<locale>/                                           */
/* ------------------------------------------------------------------------ */

/** Metadata every indexable page has. */
export interface PageMeta {
  /** <title>, og:title, twitter:title and the name of the page in JSON-LD. */
  title: string;
  /** Meta description and the description of the page in JSON-LD. */
  description: string;
  ogDescription: string;
  author: string;
  /** og:site_name: the owner's name in the language of the page. */
  siteName: string;
}

/** The home pages also have a Twitter card, the portrait and a profile. */
export interface HomeMeta extends PageMeta {
  twitterDescription: string;
  /** og:image:alt and twitter:image:alt. */
  imageAlt: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export interface NotFoundMeta {
  title: string;
  description: string;
}

/* Shared interface strings --------------------------------------------- */

export interface CommonContent {
  skipLink: string;
  /**
   * 'Last updated' line of the top bar and the footer. The old pages print
   * label + separator + date: 'Last updated' + ' ' + '17 September 2026' in
   * English, '最近更新' + '：' + '2026年9月17日' in Chinese. The date itself
   * comes from formatDate(locale, site.lastUpdated).
   */
  lastUpdated: {
    label: string;
    separator: string;
  };
  /** Accessible name of the language switch. */
  languageNavLabel: string;
  /** Page links of the header. Not on the old site; written for the new one. */
  nav: {
    /** Accessible name of the page navigation. Heard with the role, so no role word. */
    label: string;
    /** Visible label of the link to the home page. */
    home: string;
    /** Visible label of the link to the blog. */
    blog: string;
  };
  footer: {
    /** The owner's name in the language of the page. */
    name: string;
  };
  backToHome: string;
  /** Copy button: resting label, then the two results. */
  copy: {
    copy: string;
    copied: string;
    failed: string;
  };
  /** Theme switch. Not on the old site; written for the new one. */
  theme: {
    /** Accessible name of the control. */
    label: string;
    light: string;
    dark: string;
    system: string;
  };
}

/* Home page --------------------------------------------------------------- */

export interface TimelineEntry<Id extends string = string> {
  /** Stable identifier, the same in every language. */
  id: Id;
  /** Date or period, already in the language of the page. */
  when: string;
  title: string;
  /** Detail lines under the title, one item per line. */
  lines: readonly RichText[];
}

export type EducationId = 'phd' | 'msc' | 'beng' | 'secondary-school';
export type ExperienceId = 'motor-drives' | 'teaching-assistant';
export type AwardId = 'studentship' | 'rtp-scholarship' | 'deans-award';

export interface TimelineSection<Id extends string = string> {
  title: string;
  entries: readonly TimelineEntry<Id>[];
}

export interface ProseSection {
  title: string;
  paragraphs: readonly RichText[];
}

export interface HomeContent {
  meta: HomeMeta;
  hero: {
    kicker: string;
    /** The page heading: the name in the language of the page. */
    name: string;
    /**
     * The name in the other script, under the heading. `lang` is the lang
     * attribute the old page puts on it; leave it out where the old page has
     * none.
     */
    alternateName: {
      text: string;
      lang?: HtmlLang;
    };
    role: string;
    /** Alt text of the portrait. */
    portraitAlt: string;
  };
  contact: {
    /** Accessible name of the contact block, which has no visible heading. */
    label: string;
    /**
     * Labels of the rows that are not external profiles (those carry their
     * label in site.person.links). `wechat` is defined by the Simplified
     * Chinese dictionary only, and the WeChat row is shown only where it is
     * defined.
     */
    labels: {
      email: string;
      mobile: string;
      address: string;
      keys: string;
      wechat?: string;
    };
    /** Postal address as displayed. */
    address: string;
    /** The same address as the JSON-LD data of the page gives it. */
    postalAddress: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
    };
    /** Text of the link to the public-key page. */
    keysLinkText: string;
  };
  biography: ProseSection;
  education: TimelineSection<EducationId>;
  experience: TimelineSection<ExperienceId>;
  awards: TimelineSection<AwardId>;
  research: ProseSection;
}

/* Public-key page --------------------------------------------------------- */

export type TrustNoteId =
  | 'location'
  | 'whole-fingerprint'
  | 'second-channel'
  | 'not-secret'
  | 'keys-change'
  | 'metadata';

export interface TrustNote {
  id: TrustNoteId;
  /** The bold opening sentence. */
  lead: string;
  /** The rest of the note. The old pages put one space between lead and body. */
  body: RichText;
}

export interface KeysContent {
  meta: PageMeta;
  head: {
    /** Text of the kicker, which links to the home page in the same language. */
    kicker: string;
    title: string;
    lede: readonly [RichText, RichText];
    /** Accessible name of the breadcrumb. */
    breadcrumbLabel: string;
    /** Accessible name of the row of links to the sections of the page. */
    sectionsLabel: string;
  };
  pgp: {
    title: string;
    intro: RichText;
    factLabels: {
      fingerprint: string;
      userId: string;
      type: string;
      validity: string;
    };
    /**
     * Fact values that need words. They are built from keys/facts.ts, so the
     * algorithm names and the dates are never typed twice. The fingerprint
     * and the user ID are shown straight from keys/facts.ts.
     */
    factValues: {
      type: RichText;
      validity: RichText;
    };
    /** Accessible name of the block that shows the key in full. */
    keyAriaLabel: string;
    /** Label of the download link, file name included. */
    download: RichText;
    usageTitle: string;
    /** What each step of keyFacts.pgp.steps does. */
    steps: Record<PgpStepId, RichText>;
  };
  ssh: {
    title: string;
    intro: RichText;
    factLabels: {
      fingerprint: string;
      type: string;
    };
    factValues: {
      type: RichText;
    };
    /**
     * The old pages give the SSH key block no accessible name (the line wraps,
     * so the block is not a scrolling region) and no dictionary defines one.
     * The field exists so that the two sections have the same shape.
     */
    keyAriaLabel?: string;
    download: RichText;
    usageTitle: string;
    /** What each step of keyFacts.ssh.steps does. */
    steps: Record<SshStepId, RichText>;
  };
  trust: {
    title: string;
    /** The six notes in display order. */
    notes: readonly TrustNote[];
  };
  backLink: string;
}

/* Blog -------------------------------------------------------------------- */

/** The strings of the list of posts and of the frame around a post. */
export interface BlogContent {
  /** Metadata of the list of posts. A post brings its own title and description. */
  meta: PageMeta;
  head: {
    /** The owner's name: first crumb of the breadcrumb. */
    kicker: string;
    /** Heading of the list of posts, and the crumb that leads to it. */
    title: string;
    lede: RichText;
    /** Accessible name of the breadcrumb. */
    breadcrumbLabel: string;
  };
  /** Shown in place of the list while there is no post. */
  empty: string;
  /**
   * The line 'Updated 3 October 2026' under the date of a post that was
   * changed after it was published: label + separator + date, as in
   * CommonContent.lastUpdated.
   */
  updated: {
    label: string;
    separator: string;
  };
  /** Marks a post that is not published. Seen under `npm run dev` only. */
  draft: string;
  /** Text of the link to the feed. */
  feedLink: string;
  /** Text of the link from a post back to the list of posts. */
  backLink: string;
  /** The links at the end of a post to the posts before and after it, by date. */
  postNav: {
    /** Accessible name of the navigation. */
    label: string;
    /** Above the title of the post published before this one. */
    previous: string;
    /** Above the title of the post published after this one. */
    next: string;
  };
}

/* Not-found page ---------------------------------------------------------- */

export interface NotFoundContent {
  meta: NotFoundMeta;
  title: string;
  body: RichText;
  /** Text of the link to the home page in the same language. */
  returnLink: string;
}

/* The dictionary ---------------------------------------------------------- */

export interface Dictionary {
  common: CommonContent;
  home: HomeContent;
  keys: KeysContent;
  blog: BlogContent;
  notFound: NotFoundContent;
}

/* ------------------------------------------------------------------------ */
/* Blog posts: blog-generated/, written by scripts/generate-blog.mjs         */
/* ------------------------------------------------------------------------ */

/** A picture of a post, as the generator wrote it to public/media/blog/. */
export interface PostImage {
  /** Site path of the largest version. */
  src: string;
  width: number;
  height: number;
  /** All versions, for the srcset attribute; absent when there is only one. */
  srcSet?: string;
}

/** A square preview of a picture of a post. */
export type PostPreview = Omit<PostImage, 'srcSet'>;

/** What is the same in every language: post.json of the post. */
export interface PostFacts {
  /** Name of the folder of the post, and the last part of its address. */
  slug: string;
  /** ISO date (YYYY-MM-DD) of publication. */
  date: string;
  /** ISO date of the last change, if the post changed after publication. */
  updated?: string;
  /** Not published: left out of production builds. */
  draft: boolean;
  cover?: PostImage;
}

/** A post in one language, without its text: the front matter of the Markdown file. */
export interface PostSummary extends PostFacts {
  title: string;
  description: string;
  /** Alt text of the cover picture; present when the post has a cover. */
  coverAlt?: string;
  /**
   * Square previews of the pictures of the post for the list of posts: the
   * cover first, then the pictures of the text in their order. Absent when
   * the post has no picture.
   */
  previews?: readonly PostPreview[];
}

/** What a link to a post needs. */
export type PostLink = Pick<PostSummary, 'slug' | 'title'>;

/** A post in one language. `html` is the text, rendered from Markdown at build time. */
export interface Post extends PostSummary {
  html: string;
  /** The post published before this one, if there is one. */
  previous?: PostLink;
  /** The post published after this one, if there is one. */
  next?: PostLink;
}
