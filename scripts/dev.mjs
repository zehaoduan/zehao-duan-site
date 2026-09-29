#!/usr/bin/env node
/**
 * `npm run dev`: the development server of Next.js, and beside it the blog
 * generator in watch mode, so that a change to a post shows in the browser
 * without a restart. Drafts are included.
 *
 * Arguments go to `next dev` (npm run dev -- --port 3101). Both programs
 * stop when this one does.
 */

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const start = (file, args) =>
  spawn(process.execPath, [join(root, file), ...args], { cwd: root, stdio: 'inherit' });

const watcher = start('scripts/generate-blog.mjs', ['--drafts', '--watch']);
const server = start('node_modules/next/dist/bin/next', ['dev', ...process.argv.slice(2)]);

let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  watcher.kill();
  server.kill();
  process.exitCode = code;
}

server.on('exit', (code) => stop(code ?? 0));
watcher.on('exit', (code) => {
  if (!stopping) console.error(`dev: the blog generator stopped (${code}); posts are no longer watched`);
});
for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(signal, () => stop(0));
