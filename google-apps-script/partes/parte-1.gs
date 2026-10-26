/* ── Phonology Exam II · parte 1 de 4 ── */

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
const VERSION = 2;
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

/* ── fin de la parte 1 de 4 ── */
