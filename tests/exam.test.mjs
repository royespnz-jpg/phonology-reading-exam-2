import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { READINGS, RESPONSES, PREP, RESPONSE, buildTimeline, timedSeconds, plain, targets, caps, words } from '../js/format.js';
import { fmt } from '../js/clock.js';
import { syllables, syllablesOf } from './syllables.mjs';

const byId = (id) => READINGS.find((r) => r.id === id);
const repeated = (list) => list.filter((x, i) => list.indexOf(x) !== i);
const targetWords = (rs) => rs.flatMap((r) => r.sentences.flatMap((s) => targets(s.text).map((t) => t.toLowerCase())));

// The 150 targets of the first phonology reading exam: none comes back.
const FIRST_EXAM = [
  'need', 'big', 'pen', 'pin', 'wait', 'wet', 'eight', 'people', 'hat', 'hot', 'curtain', 'cotton', 'bird', 'bug', 'cup', 'cap',
  'bought', 'boat', 'joe', 'june', 'pool', 'full', 'could', 'walk', 'child', 'house', 'crowd', 'noise', 'boy', 'buy',
  'price', 'prize', 'thought', 'taught', 'they', 'day', 'few', 'view', 'share', 'chair', 'cheered', 'judge', 'major', 'mayor',
  'pleasure', 'pleasant', 'best', 'vest', 'wendy', 'bet', 'hall', 'floor', 'right', 'light', 'king', 'knows', 'some', 'sun',
  'think', 'sink', 'walked', 'called', 'finished', 'visited', 'returned', 'decided', 'thinks', 'dogs', 'takes', 'classes',
  'loves', 'sandwiches', 'helped', 'results', 'laughed', 'animals', 'watched', 'dances', 'planned', 'states', 'opened', 'gloves',
  'enjoyed', 'exercises', 'wanted', 'chocolates', 'waited', 'rides', 'needed', 'suitcases', 'did you', 'last night', 'going to',
  'stay up', 'give me', 'chocolate', 'have to', 'go away', 'is your', 'twenty', 'i’ll', 'lots of', 'keep out', 'football',
  'good boy', 'had to', 'what you', 'want to', 'his shirt', 'big gap', 'used to', 'february', 'water', 'kind of', 'can go',
  'ask her', 'got to', 'kindness', 'can buy', 'find out', 'employee', 'unique', 'volunteer', 'japanese', 'entertain',
  'picturesque', 'cigarette', 'decision', 'physical', 'fantastic', 'official', 'publicity', 'canadian', 'delicious', 'classify',
  'sensitive', 'attitude', 'biology', 'geography', 'appreciate', 'secretary', 'mistake', 'apologize', 'mother', 'newspaper',
  'increase', 'pick up', 'beautiful', 'introduce', 'ourselves',
];

test('four readings, each with 40 seconds to prepare and 50 to read', () => {
  const steps = buildTimeline();
  assert.equal(steps[0].type, 'intro');
  assert.match(steps[0].say, /four readings/);
  assert.match(steps[0].say, /forty seconds to prepare and fifty seconds to read/);
  assert.deepEqual(READINGS.map((r) => r.title), ['Vowels', 'Consonants', 'Connected speech', 'Word stress']);
  assert.deepEqual(READINGS.map((r) => r.kind), ['vowels', 'consonants', 'connected', 'stress']);
  assert.deepEqual(READINGS.map((r) => r.id), READINGS.map((r, i) => `r${i + 1}`));
  assert.deepEqual(
    steps.filter((s) => s.seconds).map((s) => `${s.type}:${s.reading}:${s.seconds}`),
    READINGS.flatMap((r) => [`prep:${r.id}:40`, `response:${r.id}:50`]),
  );
  assert.equal(PREP, 40);
  assert.equal(RESPONSE, 50);
  assert.equal(timedSeconds(steps), 360);
  assert.deepEqual(steps.filter((s) => s.type === 'response').map((s) => s.id), RESPONSES.map((r) => r.id));
  // Each reading: its directions, then "Begin preparing now", then "Begin reading aloud now".
  const r3 = steps.findIndex((s) => s.type === 'part' && s.reading === 'r3');
  assert.match(steps[r3].say, /^Reading 3\. Connected speech\. .*40 seconds to prepare.*50 seconds to read/);
  assert.equal(steps[r3 + 1].say, 'Begin preparing now.');
  assert.equal(steps[r3 + 2].say, 'Begin reading aloud now.');
  // The sheet keeps the sentences, numbered, with the targets in capitals.
  assert.match(steps[r3 + 2].prompt, /^1\. WOULD YOU like to try the FISH AND CHIPS today\? 2\. /);
});

test('the quick demo shortens every clock but keeps at least 3 seconds', () => {
  assert.deepEqual(buildTimeline({ scale: 0.1 }).filter((s) => s.seconds).map((s) => s.seconds), [4, 5, 4, 5, 4, 5, 4, 5]);
  assert.deepEqual(buildTimeline({ scale: 0.01 }).filter((s) => s.seconds).map((s) => s.seconds), Array(8).fill(3));
});

test('10 separate sentences per reading, each with exactly two targets in bold', () => {
  for (const r of READINGS) {
    assert.equal(r.sentences.length, 10, `${r.id}: ${r.sentences.length} sentences`);
    for (const s of r.sentences) {
      assert.equal(s.text.split('**').length % 2, 1, `unbalanced ** in: ${s.text}`);
      assert.match(plain(s.text), /^[A-Z].*[.?!]$/, `one whole sentence: ${s.text}`);
      assert.doesNotMatch(plain(s.text), /[.?!]\s/, `one sentence per line: ${s.text}`);
      assert.equal(targets(s.text).length, 2, `two targets: ${s.text}`);
    }
  }
});

test('vowels and consonants: every sentence is a pair of single words', () => {
  // (Which sounds each pair contrasts is in the private key: key/key.test.mjs.)
  for (const r of [byId('r1'), byId('r2')]) {
    for (const s of r.sentences) {
      const [a, b] = targets(s.text).map((t) => t.toLowerCase());
      assert.notEqual(a, b, s.text);
      assert.match(a, /^[a-z’]+$/, s.text);
      assert.match(b, /^[a-z’]+$/, s.text);
    }
  }
});

test('word stress targets have more than one syllable', () => {
  for (const s of byId('r4').sentences) {
    for (const t of targets(s.text)) assert.ok(syllables(t) >= 2, `${t} has one syllable`);
  }
});

test('the page never says what a target tests', () => {
  // The repository is public: no explanations in the page's code.
  for (const r of READINGS) for (const s of r.sentences) assert.deepEqual(Object.keys(s), ['text'], s.text);
  for (const f of ['../js/format.js', '../js/app.js']) {
    const src = readFileSync(new URL(f, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /ruleOf|tests:|palataliz|re-CORD|REcord|\/ɪ\//, f);
  }
});

test('no target word is used twice, and none comes from the first exam', () => {
  const all = targetWords(READINGS);
  assert.equal(all.length, READINGS.length * 20);
  assert.deepEqual(repeated(all), []);
  assert.deepEqual(all.filter((t) => FIRST_EXAM.includes(t)), []);
});

test('each reading fits its 50 seconds, with time to spare', () => {
  // A learner reading steadily says about 3.5 syllables a second and pauses
  // briefly between sentences: every reading should take about 40 seconds.
  for (const r of READINGS) {
    const syl = r.sentences.reduce((n, s) => n + syllablesOf(plain(s.text)), 0);
    const seconds = syl / 3.5 + 0.4 * (r.sentences.length - 1);
    assert.ok(syl >= 110 && syl <= 140, `${r.id}: ${syl} syllables`);
    assert.ok(seconds >= 35 && seconds <= 45, `${r.id}: about ${Math.round(seconds)} s`);
    assert.ok(words(r).length >= 70 && words(r).length <= 120, `${r.id}: ${words(r).length} words`);
  }
});

test('helpers: plain text, targets, capitals, syllables', () => {
  const s = { text: '**Did you** **stay up** last night?' };
  assert.equal(plain(s.text), 'Did you stay up last night?');
  assert.deepEqual(targets(s.text), ['Did you', 'stay up']);
  assert.equal(caps(s.text), 'DID YOU STAY UP last night?');
  assert.deepEqual(['home', 'looked', 'decided', 'washes', 'hopes', 'usually', 'technique', 'little'].map(syllables), [1, 1, 3, 2, 1, 4, 2, 2]);
});

test('the clock shows mm:ss and rounds up', () => {
  assert.equal(fmt(60), '01:00');
  assert.equal(fmt(44.2), '00:45');
  assert.equal(fmt(0.01), '00:01');
  assert.equal(fmt(-1), '00:00');
});
