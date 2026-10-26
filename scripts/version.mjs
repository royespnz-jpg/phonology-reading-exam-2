#!/usr/bin/env node
// Stamps one version on every file the page loads (the JS modules and the
// CSS), so a normal reload gets a new release instead of the copies the
// browser keeps for 10 minutes (GitHub Pages' cache).
//
//   node scripts/version.mjs      (before publishing a change; npm test checks it)

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');
const JS = join(ROOT, 'js');
const IMPORT = /(from\s+'\.{1,2}\/[^'?]+\.js)(?:\?v=[\w.-]+)?'/g;
const PAGE = /(js\/app\.js|css\/exam\.css)(?:\?v=[\w.-]+)?"/g;

export const jsFiles = () => readdirSync(JS).filter((f) => f.endsWith('.js')).map((f) => join(JS, f));

// Every version stamp in the page's files: [file, version].
export function stamps() {
  const out = [];
  for (const f of jsFiles()) {
    for (const m of readFileSync(f, 'utf8').matchAll(/from\s+'\.{1,2}\/[^']+\.js(?:\?v=([\w.-]+))?'/g)) out.push([relative(ROOT, f), m[1] || null]);
  }
  for (const m of readFileSync(join(ROOT, 'index.html'), 'utf8').matchAll(/(?:js\/app\.js|css\/exam\.css)(?:\?v=([\w.-]+))?"/g)) out.push(['index.html', m[1] || null]);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const v = process.argv[2] || new Date().toISOString().replace(/\D/g, '').slice(0, 12);
  for (const f of jsFiles()) {
    const src = readFileSync(f, 'utf8');
    const next = src.replace(IMPORT, `$1?v=${v}'`);
    if (next !== src) writeFileSync(f, next);
  }
  const p = join(ROOT, 'index.html');
  writeFileSync(p, readFileSync(p, 'utf8').replace(PAGE, `$1?v=${v}"`));
  console.log(`version ${v}: ${stamps().length} references`);
}
