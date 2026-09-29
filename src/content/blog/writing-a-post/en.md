---
title: Writing a post
description: An example post that shows what a post on this site can contain. Copy its folder to start a new one.
coverAlt: A damped oscillation drawn as a blue line on a pale background.
---

This post is an example. It is marked as a draft, so it appears under `npm run dev` and never on the live site. To write the first real post, copy this folder, give the copy a new name, and change the text.

## The folder of a post

The name of the folder is the address of the post: the folder `writing-a-post` is served at `/blog/writing-a-post/`. Use small letters, digits and hyphens. The folder holds

- `post.json`, with the facts that are the same in every language;
- `en.md`, `zh-hant.md` and `zh-hans.md`, one file for each language;
- the pictures of the post.

All three language files must exist. The build stops with a message if one is missing.

## Text

Paragraphs are separated by an empty line. Text can be *emphasised* or **strong**, and can carry a [link to another site](https://www.cityu.edu.hk/) or a link to a page of this site, such as the [public keys](/public-key/).

Headings inside a post start at the second level, with two number signs. The title of the post is the only first-level heading of the page.

### A smaller heading

A numbered list:

1. Write the text in English.
2. Translate it into Traditional and Simplified Chinese.
3. Set `"draft": false` in `post.json`.

> A quotation stands in a block of its own.

## Pictures

Put the file into the folder of the post and name it in the text. The text in square brackets describes the picture for readers who cannot see it, and is required. The text in quotation marks becomes the caption.

![Two damped oscillations on a grid. The blue one settles after about three cycles, the grey one takes much longer.](figure-1.png "Response after a disturbance with strong (blue) and weak (grey) damping.")

The build makes the pictures smaller, at most 1600 pixels wide, and converts them to WebP. The original file stays as it is.

## Tables

| Quantity | Symbol | Unit |
| --- | --- | --- |
| Frequency | *f* | Hz |
| Active power | *P* | MW |
| Reactive power | *Q* | Mvar |

## What a post cannot contain

HTML written inside the Markdown file is dropped, and pictures must be files in the folder of the post. Both follow from the security policy of the site.
