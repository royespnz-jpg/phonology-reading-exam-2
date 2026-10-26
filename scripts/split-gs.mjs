#!/usr/bin/env node
// Splits google-apps-script/Code.gs into short files (google-apps-script/partes/)
// for editors that don't let you paste the whole script at once. Apps Script
// shares one global scope across the files of a project, so the parts work
// exactly like Code.gs.
//
//   node scripts/split-gs.mjs      (run after editing Code.gs; npm test checks it)

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const MAX_LINES = 112; // with the two marker lines, under the editor’s 120
export const CUT = '/* ✂ */';

// Code.gs marks where each part starts with a line "/* ✂ */", so the parts
// stay the same when code is added elsewhere (only the changed part has to be
// pasted again). Every part is complete code on its own.
export function splitCode(code) {
  return code
    .replace(/\n+$/, '')
    .split(`\n${CUT}\n`)
    .map((p) => p.replace(/^\n+|\n+$/g, ''));
}

// The first and last lines let you check that nothing was cut off when pasting.
export function withMarkers(part, n, total) {
  return `/* ── Phonology Exam II · parte ${n} de ${total} ── */\n\n${part}\n\n/* ── fin de la parte ${n} de ${total} ── */\n`;
}

export function stripMarkers(text) {
  return text
    .replace(/^\/\* ── Phonology Exam II · parte \d+ de \d+ ── \*\/\n\n/, '')
    .replace(/\n\n\/\* ── fin de la parte \d+ de \d+ ── \*\/\n$/, '');
}

// Writes the parts of one Code.gs into its partes/ folder.
export function writeParts(dir) {
  const parts = splitCode(readFileSync(join(dir, 'Code.gs'), 'utf8'));
  const out = join(dir, 'partes');
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(out)) if (f.endsWith('.gs')) rmSync(join(out, f));
  parts.forEach((p, i) => {
    const name = `parte-${i + 1}.gs`;
    writeFileSync(join(out, name), withMarkers(p, i + 1, parts.length));
    console.log(`${relative(ROOT, join(out, name))}: ${p.split('\n').length} lines, ${Buffer.byteLength(p)} bytes`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeParts(join(ROOT, 'google-apps-script'));
  // The teacher's copy, with what each target tests (never committed).
  const priv = join(ROOT, 'google-apps-script', 'private');
  if (existsSync(join(priv, 'Code.gs'))) writeParts(priv);
}
