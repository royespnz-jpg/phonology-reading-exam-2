import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { splitCode, stripMarkers, MAX_LINES } from '../scripts/split-gs.mjs';
import { readingRows, metaRows } from '../scripts/readings-gs.mjs';
import { SCRIPT_VERSION } from '../js/config.js';

const DIR = new URL('../google-apps-script/', import.meta.url);
const code = readFileSync(new URL('Code.gs', DIR), 'utf8');

// A small stand-in for the Google services the script uses.
function makeEnv(src = code) {
  const sheets = new Map();
  const makeSheet = (name) => {
    const data = [];
    const formulas = new Map(); // "r,c" → formula
    const sheet = {
      name,
      data,
      formulas,
      getLastRow: () => data.length,
      getLastColumn: () => Math.max(0, ...data.map((r) => r.length)),
      appendRow: (row) => data.push([...row]),
      setFrozenRows: () => {},
      getRange: (r, c, nr = 1, nc = 1) => ({
        setValues: (vals) => {
          vals.forEach((row, i) => row.forEach((v, j) => ((data[r - 1 + i] ??= [])[c - 1 + j] = v)));
          return { setFontWeight: () => {} };
        },
        setValue: (v) => ((data[r - 1] ??= [])[c - 1] = v),
        setFormula: (f) => formulas.set(`${r},${c}`, f),
        clearContent: () => data.splice(r - 1, nr),
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => data[r - 1 + i]?.[c - 1 + j] ?? '')),
        getFormulas: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => formulas.get(`${r + i},${c + j}`) ?? '')),
        setFontWeight: () => {},
      }),
    };
    return sheet;
  };
  const folders = new Map();
  const files = [];
  const makeFolder = (path) => {
    if (folders.has(path)) return folders.get(path);
    const f = {
      path,
      getUrl: () => `https://drive/${encodeURIComponent(path)}`,
      getFoldersByName: (name) => iter(folders.has(`${path}/${name}`) ? [folders.get(`${path}/${name}`)] : []),
      createFolder: (name) => makeFolder(`${path}/${name}`),
      createFile: (blob) => {
        const n = files.length;
        const file = { blob, folder: path, getUrl: () => `https://drive/file/${n}`, getId: () => `id${n}`, setDescription: (d) => (file.description = d) };
        files.push(file);
        return file;
      },
    };
    folders.set(path, f);
    return f;
  };
  const iter = (items) => {
    let i = 0;
    return { hasNext: () => i < items.length, next: () => items[i++] };
  };
  const ctx = {
    console,
    Logger: { log: () => {} },
    SpreadsheetApp: {
      getActiveSpreadsheet: () => ({
        getName: () => 'Phonology 2026',
        getSheetByName: (n) => sheets.get(n) || null,
        insertSheet: (n) => {
          const s = makeSheet(n);
          sheets.set(n, s);
          return s;
        },
      }),
    },
    DriveApp: {
      getFoldersByName: (name) => iter(folders.has(name) ? [folders.get(name)] : []),
      createFolder: (name) => makeFolder(name),
    },
    Utilities: {
      base64Decode: (s) => [...Buffer.from(s, 'base64')],
      newBlob: (bytes, type, name) => ({ bytes, type, name }),
    },
    LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (body) => ({ body, setMimeType() { return this; } }),
    },
  };
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  const post = (payload) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(payload) } }).body);
  return { ctx, post, sheets, files, folders };
}

const who = { attempt: 'mg1abc-x7y8z9', student: 'Ana Pérez', group: '3B' };
const audio = Buffer.from('fake webm').toString('base64');

test('setup makes the sheets, the rubric, the readings and the Drive folder', () => {
  const { ctx, sheets, folders } = makeEnv();
  assert.match(ctx.setup(), /Listo/);
  assert.deepEqual([...sheets.keys()], ['Exams', 'Responses', 'Rubric', 'Readings']);
  assert.equal(sheets.get('Rubric').data.length, 5);
  assert.equal(sheets.get('Rubric').data[0].length, 5, 'a column for each of the four readings');
  assert.equal(sheets.get('Rubric').data[1][3], 'At least 18 of the 20 adjustments of connected speech are made.');
  assert.equal(sheets.get('Rubric').data[4][1], 'Fewer than 7, no reading, or it can’t be understood.');
  const readings = sheets.get('Readings').data;
  assert.equal(readings.length, 1 + readingRows().length);
  assert.deepEqual(readings[0], ['Reading', 'Sentence', 'Text (targets in CAPITALS)', 'Target words', 'What it tests']);
  // Running setup again rewrites the reference tabs instead of adding rows twice.
  ctx.setup();
  assert.equal(sheets.get('Readings').data.length, 1 + readingRows().length);
  assert.equal(sheets.get('Rubric').data.length, 5);
  assert.equal(sheets.get('Rubric').data[0][4], 'Reading 4 · Word stress');
  assert.ok(folders.has('Phonology Reading Exam II — Recordings'));
  assert.ok(!folders.has('Phonology Reading Exam — Recordings'), 'never the first exam’s folder');
  const info = JSON.parse(ctx.doGet().body);
  assert.deepEqual(info, { ok: true, app: 'Phonology Reading Exam II', sheet: 'Phonology 2026', version: 2 });
  assert.ok(info.version >= SCRIPT_VERSION, 'the page works with this script');
});

test('the readings in the script are the ones on the page', () => {
  const { ctx } = makeEnv();
  assert.deepEqual(JSON.parse(JSON.stringify(ctx.readingRows_())), readingRows(), 'run: npm run gs');
  assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext('READINGS_META', ctx))), metaRows(), 'run: npm run gs');
  assert.deepEqual(JSON.parse(JSON.stringify(vm.runInContext('QUESTIONS', ctx))), metaRows().map(([id]) => id));
  assert.deepEqual(readingRows()[0], [1, 1, 'The SHEEP were taken to the island by SHIP last week.', 'sheep, ship', '']);
  // The public script never says what a target tests: that is only in the teacher's private copy.
  assert.ok(readingRows().every((row) => row[4] === ''));
  assert.doesNotMatch(code, /: (verb|noun|adjective): |re-CORD|REcord|\/ɪ\/|\/dʒ\/ \+/);
  assert.equal(readingRows().length, 40);
});

test('an exam: start, four readings in the student’s folder, finish', () => {
  const { post, sheets, files } = makeEnv();
  assert.equal(post({ type: 'start', ...who, startedAt: '2026-10-13T15:00:00Z' }).ok, true);
  assert.equal(post({ type: 'start', ...who }).duplicate, true);
  for (const [qid, label] of metaRows().map(([id], i) => [id, `Reading ${i + 1}`])) {
    const res = post({ type: 'recording', ...who, qid, label, prompt: `1. ${label.toUpperCase()}.`, durationSec: 49.6, mime: 'audio/webm;codecs=opus', audio, recordedAt: '2026-10-13T15:05:00Z' });
    assert.equal(res.ok, true, res.error);
    assert.match(res.url, /^https:\/\/drive\/file\//);
  }
  // The same reading sent twice (the first reply got lost) is saved once.
  const again = post({ type: 'recording', ...who, qid: 'r2', mime: 'audio/webm', audio });
  assert.equal(again.duplicate, true);
  assert.equal(files.length, 4);
  assert.equal(files[3].blob.name, 'Reading 4.webm');
  assert.equal(files[0].folder, 'Phonology Reading Exam II — Recordings/3B/Ana Pérez · x7y8z9');
  assert.equal(files[0].blob.name, 'Reading 1.webm');
  const responses = sheets.get('Responses');
  assert.equal(responses.data.length, 5);
  assert.deepEqual(responses.data[1].slice(1, 6), ['Ana Pérez', '3B', 'Reading 1', '1. READING 1.', 50]);
  assert.equal(responses.data[1][9], who.attempt);
  assert.match(responses.formulas.get('2,7'), /^=HYPERLINK\("https:\/\/drive\/file\/0","▶ Listen"\)$/);

  assert.equal(post({ type: 'finish', ...who, leftPage: 1, resumed: 0, finishedAt: '2026-10-13T15:08:00Z' }).ok, true);
  const exam = sheets.get('Exams').data[1];
  assert.deepEqual([exam[1], exam[2], exam[3], exam[4], exam[6], exam[7], exam[10]], ['Ana Pérez', '3B', 'finished', 4, 1, 0, who.attempt]);
  assert.match(sheets.get('Exams').formulas.get('2,9'), /SUMIFS\(Responses!H:H,Responses!J:J,K2\)/);
});

test('what each target tests: only the teacher’s copy gives it, and only with the key', () => {
  // The public script has no key: it never gives the explanations.
  assert.match(code, /^const TEACHER_KEY = "";$/m);
  const { post } = makeEnv();
  assert.match(post({ type: 'readings', key: '' }).error, /clave del docente/);
  assert.match(post({ type: 'readings', key: 'abc123' }).error, /clave del docente/);
  // The teacher's own copy (not in the repository) gives them with its key.
  const privateCopy = new URL('private/Code.gs', DIR);
  if (!existsSync(privateCopy)) return;
  const priv = readFileSync(privateCopy, 'utf8');
  const key = priv.match(/^const TEACHER_KEY = "([^"]+)";$/m)[1];
  const env = makeEnv(priv);
  assert.match(env.post({ type: 'readings', key: 'wrong' }).error, /clave del docente/);
  const res = env.post({ type: 'readings', key: ` ${key} ` });
  assert.equal(res.ok, true);
  assert.equal(res.rows.length, 40);
  assert.ok(res.rows.every((row) => row[4] !== ''), 'every sentence says what it tests');
});

test('a demo is marked as one', () => {
  const { post, sheets } = makeEnv();
  post({ type: 'start', ...who, demo: true });
  assert.equal(sheets.get('Exams').data[1][3], 'demo');
});

test('bad requests are refused with a message', () => {
  const { post } = makeEnv();
  assert.match(post({ type: 'recording', ...who, qid: 'r5', mime: 'audio/webm', audio }).error, /Lectura desconocida/);
  assert.match(post({ type: 'recording', ...who, qid: 'r1', mime: 'text/html', audio }).error, /no es un audio/);
  assert.match(post({ type: 'recording', ...who, attempt: '../x', qid: 'r1', mime: 'audio/webm', audio }).error, /Intento inválido/);
  assert.match(post({ type: 'start', ...who, student: ' ' }).error, /Falta el nombre/);
  assert.match(post({ type: 'nope' }).error, /Pedido desconocido/);
  // A name that looks like a formula stays text.
  const { post: post2, sheets } = makeEnv();
  post2({ type: 'start', ...who, student: '=IMPORTXML("x")' });
  assert.equal(sheets.get('Exams').data[1][1], '\'=IMPORTXML("x")');
});

test('the code still works if the editor joins its lines (only block comments)', () => {
  assert.doesNotThrow(() => new vm.Script(code.replace(/\n/g, ' ')));
});

test('the parts are the whole Code.gs, in order, and short', () => {
  const names = readdirSync(new URL('partes/', DIR)).filter((f) => f.endsWith('.gs')).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
  const parts = names.map((n) => stripMarkers(readFileSync(new URL(`partes/${n}`, DIR), 'utf8')));
  assert.deepEqual(parts, splitCode(code), 'run: node scripts/split-gs.mjs');
  for (const p of parts) {
    assert.doesNotThrow(() => new vm.Script(p), 'each part is complete code');
    assert.ok(p.split('\n').length <= MAX_LINES, `a part has ${p.split('\n').length} lines`);
  }
});
