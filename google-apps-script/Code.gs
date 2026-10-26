/*
 * ── Phonology Reading Exam II · Google Apps Script ──
 *
 * Recibe las grabaciones del segundo examen de lectura (minimal pairs de
 * vocales y consonantes, connected speech y word stress) y las guarda en tu
 * Google Drive, con una fila por lectura en esta planilla para que pongas la
 * nota. Es aparte del primer examen: otra planilla y otra carpeta.
 *
 * Instalación (una vez):
 *   1. Creá una planilla nueva (sheets.new) → Extensiones → Apps Script.
 *   2. Borrá lo que haya, pegá todo este archivo (o las partes, en orden) y guardá.
 *   3. Elegí la función «setup» → ▶ Ejecutar → aceptá los permisos.
 *   4. Implementar → Nueva implementación → Aplicación web · Ejecutar como: Yo ·
 *      Quién tiene acceso: Cualquier persona → copiá la URL que termina en /exec.
 *   5. Pasale la URL a quien arma la página (o pegala en …/#teacher y guardá).
 * Si cambiás este código: Implementar → Administrar implementaciones → ✏ →
 * Nueva versión.
 */

const APP = 'Phonology Reading Exam II';
const VERSION = 1;
const ROOT_FOLDER = 'Phonology Reading Exam II — Recordings';
/* The readings: id, title and kind. Made from js/format.js: npm run gs. */
const READINGS_META = [
  ["r1","Vowels","vowels"],
  ["r2","Consonants","consonants"],
  ["r3","Connected speech","connected"],
  ["r4","Word stress","stress"],
];
const QUESTIONS = READINGS_META.map(function (r) { return r[0]; });
const LABELS = {};
READINGS_META.forEach(function (r, i) { LABELS[r[0]] = 'Reading ' + (i + 1); });
const MAX_AUDIO_BYTES = 20 * 1024 * 1024;

const SHEETS = {
  exams: {
    name: 'Exams',
    headers: [
      'Started', 'Student', 'Group', 'Status', 'Readings', 'Finished',
      'Left the page', 'Restarts', 'Total score', 'Folder', 'Attempt',
    ],
  },
  responses: {
    name: 'Responses',
    headers: [
      'Recorded', 'Student', 'Group', 'Reading', 'Text (targets in CAPITALS)',
      'Seconds', 'Recording', 'Score (0–3)', 'Comments', 'Attempt',
    ],
  },
  rubric: {
    name: 'Rubric',
    headers: ['Score'].concat(READINGS_META.map(function (r, i) { return 'Reading ' + (i + 1) + ' · ' + r[1]; })),
  },
  readings: {
    name: 'Readings',
    headers: ['Reading', 'Sentence', 'Text (targets in CAPITALS)', 'Target words', 'What it tests'],
  },
};
const EX = { status: 4, answers: 5, finished: 6, left: 7, restarts: 8, total: 9, folder: 10, attempt: 11 };
const RE = { label: 4, recording: 7, score: 8, attempt: 10 };


/* Each reading has 10 sentences with two targets each: 20 targets. The
   rubric has a column per reading, from the descriptors of its kind. */
const RUBRIC_KINDS = {
  vowels: [
    'At least 18 of the 20 target vowels are right, and the two words of each pair sound different.',
    '13 to 17 vowels right; some pairs sound the same.',
    '7 to 12 vowels right.',
  ],
  consonants: [
    'At least 18 of the 20 target consonants are right, and the two words of each pair sound different.',
    '13 to 17 consonants right; some pairs sound the same.',
    '7 to 12 consonants right.',
  ],
  connected: [
    'At least 18 of the 20 adjustments of connected speech are made.',
    '13 to 17 adjustments made; some phrases are read word by word.',
    '7 to 12 adjustments made; the reading is choppy.',
  ],
  stress: [
    'At least 18 of the 20 words are stressed right for what they are in the sentence.',
    '13 to 17 words stressed right.',
    '7 to 12 words stressed right.',
  ],
};

function rubric_() {
  return ['3', '2', '1', '0'].map(function (score, i) {
    return [score].concat(READINGS_META.map(function (r) {
      return i < 3 ? RUBRIC_KINDS[r[2]][i] : 'Fewer than 7, no reading, or it can’t be understood.';
    }));
  });
}

/* ✂ */

/* readings:start */
/* The readings, as the page shows them (the words in CAPITALS are the targets),
   and what each target tests. Made from js/format.js: npm run gs. */
const READINGS_ROWS_1 = [
  [1,1,"The SHEEP were taken to the island by SHIP last week.","sheep, ship",""],
  [1,2,"Our CAT CAUGHT a little mouse in the garden yesterday.","cat, caught",""],
  [1,3,"The old man who lives in the HUT has a very kind HEART.","hut, heart",""],
  [1,4,"We were DONE with all the work before DAWN.","done, dawn",""],
  [1,5,"A big TRUCK stopped right next to the train TRACK.","truck, track",""],
  [1,6,"LUKE wants to LOOK at the photos from the trip.","Luke, look",""],
  [1,7,"He WOULD have WOOED her with flowers and songs.","would, wooed",""],
  [1,8,"WHO’D like to wear the red HOOD tonight?","Who’d, hood",""],
  [1,9,"There was black SOOT on his new SUIT.","soot, suit",""],
  [1,10,"Our KOOKY neighbor bakes a COOKIE every day.","kooky, cookie",""],
  [2,1,"Babies TEETHE when their first TEETH appear.","teethe, teeth",""],
  [2,2,"Please don’t WASH your new WATCH with soap.","wash, watch",""],
  [2,3,"The price of RICE will RISE again next month.","rice, rise",""],
  [2,4,"It is no JOKE: the egg YOLK is green.","joke, yolk",""],
  [2,5,"JACQUES wants to ride a YAK in the mountains.","Jacques, yak",""],
  [2,6,"A soldier of the LEGION had a LESION on his arm.","legion, lesion",""],
  [2,7,"In his LEISURE time, he writes in a big LEDGER.","leisure, ledger",""],
  [2,8,"The guard wore a BEIGE jacket and a gold BADGE.","beige, badge",""],
  [2,9,"The new VERSION of the story is about a VIRGIN forest.","version, virgin",""],
  [2,10,"She made a COLLAGE for her COLLEGE art class.","collage, college",""],
  [3,1,"We ordered FISH AND CHIPS BECAUSE we were very hungry.","fish and chips, because",""],
  [3,2,"I SUPPOSE we OUGHT TO call the doctor right now.","suppose, ought to",""],
  [3,3,"Tell me ABOUT your FAMILY and your new job.","about, family",""],
  [3,4,"Please PUT IT on the table and TELL THEM to wait.","put it, tell them",""],
  [3,5,"GIVE HIM SOMETHING cold to drink after the game.","Give him, something",""],
  [3,6,"The answer is WRITTEN in the CENTER of the page.","written, center",""],
  [3,7,"WHAT DO YOU think of THAT GIRL in the red dress?","What do you, that girl",""],
  [3,8,"She bought TEN BOOKS, but MOSTLY she reads online.","ten books, mostly",""],
  [3,9,"Please TURN OFF the lights and LET ME sleep a little longer.","turn off, let me",""],
  [3,10,"The new LIBRARY has very COMFORTABLE chairs.","library, comfortable",""],
  [4,1,"The singer will RECORD her new songs in the DESERT.","record, desert",""],
  [4,2,"The workers PROTEST because the new CONTRACT is unfair.","protest, contract",""],
  [4,3,"The scientist found a MINUTE OBJECT in the water.","minute, object",""],
  [4,4,"We REFUSE to accept the PERMIT for the factory.","refuse, permit",""],
  [4,5,"Our farmers PRODUCE coffee, our main EXPORT.","produce, export",""],
  [4,6,"She was UPSET because the PRESENT was broken.","upset, present",""],
  [4,7,"The students will PERFECT their PROJECT before Friday.","perfect, project",""],
  [4,8,"My grandfather is CONTENT with his PROGRESS this month.","content, progress",""],
  [4,9,"The police SUSPECT that the REBEL is hiding in town.","suspect, rebel",""],
  [4,10,"They will REFUND you if your ticket is INVALID.","refund, invalid",""],
];

function readingRows_() {
  return [].concat(READINGS_ROWS_1);
}
/* readings:end */


function setup() {
  Object.keys(SHEETS).forEach(function (k) { sheet_(k); });
  reference_('rubric', rubric_());
  reference_('readings', readingRows_());
  rootFolder_();
  const msg = 'Listo: hojas Exams, Responses, Rubric y Readings, y la carpeta «' + ROOT_FOLDER +
    '» en tu Drive. Ahora implementá la aplicación web.';
  Logger.log(msg);
  return msg;
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu(APP).addItem('Configurar (setup)', 'setup').addToUi();
}

function doGet() {
  const name = SpreadsheetApp.getActiveSpreadsheet().getName();
  return json_({ ok: true, app: APP, sheet: name, version: VERSION });
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.type === 'start') return json_(withLock_(function () { return start_(data); }));
    if (data.type === 'recording') return json_(recording_(data));
    if (data.type === 'finish') return json_(withLock_(function () { return finish_(data); }));
    throw new Error('Pedido desconocido: ' + String(data.type));
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

/* ✂ */

/* ─── requests ─── */

function start_(d) {
  const who = person_(d);
  const sheet = sheet_('exams');
  const row = findRow_(sheet, EX.attempt, who.attempt);
  if (row) return { ok: true, duplicate: true };
  const folder = studentFolder_(who);
  sheet.appendRow([
    date_(d.startedAt),
    text_(who.student),
    text_(who.group),
    d.demo ? 'demo' : 'started',
    0,
    '',
    '',
    '',
    '',
    folder.getUrl(),
    who.attempt,
  ]);
  const last = sheet.getLastRow();
  sheet.getRange(last, EX.total).setFormula(
    '=IF(COUNTIFS(Responses!J:J,K' + last + ',Responses!H:H,"<>")=0,"",' +
      'SUMIFS(Responses!H:H,Responses!J:J,K' + last + '))'
  );
  return { ok: true };
}


function recording_(d) {
  const who = person_(d);
  if (QUESTIONS.indexOf(d.qid) < 0) throw new Error('Lectura desconocida.');
  const mime = String(d.mime || '').split(';')[0];
  if (mime.indexOf('audio/') !== 0) throw new Error('Eso no es un audio.');
  if (!d.audio) throw new Error('No llegó el audio.');
  const bytes = Utilities.base64Decode(d.audio);
  if (bytes.length > MAX_AUDIO_BYTES) throw new Error('La grabación es demasiado grande.');

  /* The same reading sent again (the first one did arrive) gets the same file back. */
  const sheet = sheet_('responses');
  const existing = findResponse_(sheet, who.attempt, d.qid);
  if (existing) return { ok: true, duplicate: true, url: existing };

  const ext = /mp4|m4a|aac/.test(d.mime) ? 'm4a' : /ogg/.test(d.mime) ? 'ogg' : 'webm';
  const label = LABELS[d.qid];
  const blob = Utilities.newBlob(bytes, mime, label + '.' + ext);
  const file = studentFolder_(who).createFile(blob);
  file.setDescription(String(d.prompt || '').slice(0, 1000));
  const url = file.getUrl();

  withLock_(function () {
    if (findResponse_(sheet, who.attempt, d.qid)) return;
    sheet.appendRow([
      date_(d.recordedAt),
      text_(who.student),
      text_(who.group),
      label,
      text_(String(d.prompt || '').slice(0, 2000)),
      Math.round(Number(d.durationSec) || 0),
      '',
      '',
      '',
      who.attempt,
    ]);
    sheet.getRange(sheet.getLastRow(), RE.recording).setFormula('=HYPERLINK("' + url + '","▶ Listen")');
    const exams = sheet_('exams');
    const row = findRow_(exams, EX.attempt, who.attempt);
    if (row) exams.getRange(row, EX.answers).setValue(countResponses_(sheet, who.attempt));
  });
  return { ok: true, url: url, id: file.getId() };
}

function finish_(d) {
  const who = person_(d);
  const sheet = sheet_('exams');
  let row = findRow_(sheet, EX.attempt, who.attempt);
  if (!row) {
    start_(d);
    row = sheet.getLastRow();
  }
  sheet.getRange(row, EX.status).setValue('finished');
  sheet.getRange(row, EX.answers).setValue(countResponses_(sheet_('responses'), who.attempt));
  sheet.getRange(row, EX.finished).setValue(date_(d.finishedAt));
  sheet.getRange(row, EX.left).setValue(Number(d.leftPage) || 0);
  sheet.getRange(row, EX.restarts).setValue(Number(d.resumed) || 0);
  return { ok: true };
}

/* ✂ */

/* ─── helpers ─── */

function person_(d) {
  const attempt = String(d.attempt || '');
  if (!/^[\w-]{6,40}$/.test(attempt)) throw new Error('Intento inválido.');
  const student = String(d.student || '').trim().slice(0, 80);
  if (!student) throw new Error('Falta el nombre.');
  const group = String(d.group || '').trim().slice(0, 40);
  return { attempt: attempt, student: student, group: group };
}

/* The Rubric and Readings tabs are rewritten each time setup runs. */
function reference_(key, rows) {
  const sheet = sheet_(key);
  const headers = SHEETS[key].headers;
  if (sheet.getLastRow() > 0) {
    sheet.getRange(1, 1, sheet.getLastRow(), Math.max(sheet.getLastColumn(), headers.length)).clearContent();
  }
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function sheet_(key) {
  const def = SHEETS[key];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(def.name);
  if (!sheet) {
    sheet = ss.insertSheet(def.name);
    sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow_(sheet, col, value) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const values = sheet.getRange(2, col, last - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]) === value) return i + 2;
  }
  return 0;
}

/* The recording link of a reading already saved, or ''. */
function findResponse_(sheet, attempt, qid) {
  const last = sheet.getLastRow();
  if (last < 2) return '';
  const label = LABELS[qid];
  const rows = sheet.getRange(2, 1, last - 1, SHEETS.responses.headers.length).getValues();
  const formulas = sheet.getRange(2, RE.recording, last - 1, 1).getFormulas();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][RE.attempt - 1]) === attempt && String(rows[i][RE.label - 1]) === label) {
      const m = String(formulas[i][0]).match(/HYPERLINK\("([^"]+)"/);
      return m ? m[1] : 'saved';
    }
  }
  return '';
}

function countResponses_(sheet, attempt) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  return sheet
    .getRange(2, RE.attempt, last - 1, 1)
    .getValues()
    .filter(function (r) { return String(r[0]) === attempt; }).length;
}


function rootFolder_() {
  const it = DriveApp.getFoldersByName(ROOT_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(ROOT_FOLDER);
}

function childFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

/* Phonology Reading Exam II — Recordings / <group> / <student> · <attempt> */
function studentFolder_(who) {
  const group = childFolder_(rootFolder_(), who.group || 'No group');
  const name = who.student.replace(/[\\/:*?"<>|]/g, '-');
  return childFolder_(group, name + ' · ' + who.attempt.slice(-6));
}

function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/* Text that looks like a formula is kept as text. */
function text_(s) {
  s = String(s || '');
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function date_(iso) {
  const d = new Date(iso);
  return isNaN(d) ? new Date() : d;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
