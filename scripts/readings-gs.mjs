#!/usr/bin/env node
// Copies the readings of js/format.js into Code.gs (READINGS_ROWS), so the
// teacher's sheet has them on the «Readings» tab. Then split the script again:
//
//   node scripts/readings-gs.mjs && node scripts/split-gs.mjs   (npm run gs)
//
// What each target tests is private: it is not in this public repository.
// The public Code.gs leaves that column empty. If the private key
// (key/key.mjs, never committed) is here, the teacher's own copy — with the
// column filled — is written to google-apps-script/private/ (also never
// committed); that is the one the teacher pastes.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { READINGS, caps, targets } from '../js/format.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'google-apps-script', 'Code.gs');
export const PRIVATE = join(ROOT, 'google-apps-script', 'private');
const KEY_FILE = join(ROOT, 'key', 'key.mjs');

// What a sentence tests, target by target: "ship: /ɪ/ · sheep: /i/".
export const ruleOf = (s, tests) => targets(s.text).map((t, i) => `${t}: ${tests[i]}`).join(' · ');

// One row per sentence: reading, sentence number, the text with the targets
// in CAPITALS, the target words, and what the sentence tests ('' without the key).
export function readingRows(key = null) {
  return READINGS.flatMap((r) =>
    r.sentences.map((s, i) => [r.n, i + 1, caps(s.text), targets(s.text).join(', '), key ? ruleOf(s, key[r.id][i]) : '']),
  );
}

// The rows go in blocks of four readings, each in its own part of the script,
// so that every part stays short enough to paste.
const PER_BLOCK = 4;
export function rowsBlock(key = null) {
  const rows = readingRows(key);
  const blocks = [];
  for (let n = 0; n * PER_BLOCK < READINGS.length; n++) {
    const first = n * PER_BLOCK + 1;
    const last = Math.min(READINGS.length, first + PER_BLOCK - 1);
    const mine = rows.filter(([r]) => r >= first && r <= last);
    blocks.push(`const READINGS_ROWS_${n + 1} = [\n${mine.map((row) => `  ${JSON.stringify(row)},`).join('\n')}\n];`);
  }
  return [
    '/* readings:start */',
    '/* The readings, as the page shows them (the words in CAPITALS are the targets),',
    '   and what each target tests. Made from js/format.js: npm run gs. */',
    blocks.join('\n\n/* ✂ */\n\n'),
    '',
    `function readingRows_() {\n  return [].concat(${blocks.map((_, n) => `READINGS_ROWS_${n + 1}`).join(', ')});\n}`,
    '/* readings:end */',
  ].join('\n');
}

export const ROWS_RE = /\/\* readings:start \*\/[\s\S]*?\/\* readings:end \*\//;

// id, title and kind of each reading (the rubric and the sheet's labels).
export const metaRows = () => READINGS.map((r) => [r.id, r.title, r.kind]);
export const metaBlock = () => `const READINGS_META = [\n${metaRows().map((row) => `  ${JSON.stringify(row)},`).join('\n')}\n];`;
export const META_RE = /const READINGS_META = \[\n[\s\S]*?\];/;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const code = readFileSync(SRC, 'utf8');
  if (!ROWS_RE.test(code)) throw new Error('the readings block (readings:start … readings:end) is not in Code.gs');
  if (!META_RE.test(code)) throw new Error('READINGS_META not found in Code.gs');
  const build = (key) => code.replace(ROWS_RE, rowsBlock(key)).replace(META_RE, metaBlock());
  writeFileSync(SRC, build(null));
  console.log(`Code.gs: ${readingRows().length} sentences (public: without what each target tests)`);
  if (existsSync(KEY_FILE)) {
    const { KEY } = await import(pathToFileURL(KEY_FILE).href);
    mkdirSync(PRIVATE, { recursive: true });
    writeFileSync(join(PRIVATE, 'Code.gs'), build(KEY));
    console.log('private/Code.gs: the teacher’s copy, with what each target tests');
  } else {
    console.log('No key/key.mjs here: only the public Code.gs was made.');
  }
}
