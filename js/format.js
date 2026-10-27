// The exam: four readings aloud — vowels, consonants, connected speech and
// word stress — each with 40 seconds to prepare and 50 seconds to read. Each
// reading has 10 separate sentences, and each sentence has exactly two
// targets in **bold**.
//
// What each target tests is not here: this page and its repository are
// public. It lives only in the teacher's Apps Script (the «Readings» tab of
// the sheet), made from a private file that is not in the repository.
//
// No target word is used twice in the exam, and none comes from the first
// phonology reading exam. Each reading has about 120–130 syllables: about
// 40 seconds at a steady learner's pace (≈ 3.5 syllables a second with a
// short pause between sentences), so it fits the 50 seconds.

export const PREP = 40;
export const RESPONSE = 50;

export const READINGS = [
  {
    id: 'r1',
    n: 1,
    kind: 'vowels',
    title: 'Vowels',
    focus: 'the vowel sounds',
    sentences: [
      { text: 'The **sheep** were taken to the island by **ship** last week.' },
      { text: 'Our **cat** **caught** a little mouse in the garden yesterday.' },
      { text: 'The old man who lives in the **hut** has a very kind **heart**.' },
      { text: 'We were **done** with all the work before **dawn**.' },
      { text: 'A big **truck** stopped right next to the train **track**.' },
      { text: '**Luke** wants to **look** at the photos from the trip.' },
      { text: 'He **would** have **wooed** her with flowers and songs.' },
      { text: '**Who’d** like to wear the red **hood** tonight?' },
      { text: 'There was black **soot** on his new **suit**.' },
      { text: 'Our **kooky** neighbor bakes a **cookie** every day.' },
    ],
  },
  {
    id: 'r2',
    n: 2,
    kind: 'consonants',
    title: 'Consonants',
    focus: 'the consonant sounds',
    sentences: [
      { text: 'Babies **teethe** when their first **teeth** appear.' },
      { text: 'Please don’t **wash** your new **watch** with soap.' },
      { text: 'The price of **rice** will **rise** again next month.' },
      { text: 'It is no **joke**: the egg **yolk** is green.' },
      { text: '**Jacques** wants to ride a **yak** in the mountains.' },
      { text: 'A soldier of the **legion** had a **lesion** on his arm.' },
      { text: 'In his **leisure** time, he writes in a big **ledger**.' },
      { text: 'The guard wore a **beige** jacket and a gold **badge**.' },
      { text: 'The new **version** of the story is about a **virgin** forest.' },
      { text: 'She made a **collage** for her **college** art class.' },
    ],
  },
  {
    id: 'r3',
    n: 3,
    kind: 'connected',
    title: 'Connected speech',
    focus: 'how the words join together',
    sentences: [
      { text: '**She is** very glad she **learned English** in Canada.' },
      { text: 'We **watched a** movie for **two hours** last night.' },
      { text: '**James’s uncle** drives a **black car** to work.' },
      { text: '**George’s office** is very **near our** new school.' },
      { text: 'The water **runs out** if you **leave it** open all day.' },
      { text: 'My sister **painted a** cat with big **blue eyes**.' },
      { text: 'My **father’s idea** was to make **hot tea** for everyone.' },
      { text: 'The children **played outside** **after all** the rain.' },
      { text: '**Three of** us stayed in my **aunt’s apartment** in Madrid.' },
      { text: 'The teacher **asked us** to **clean up** the classroom.' },
    ],
  },
  {
    id: 'r4',
    n: 4,
    kind: 'stress',
    title: 'Word stress',
    focus: 'the stress in each word or phrase',
    sentences: [
      { text: 'The **refugees** will **protest** at the city hall.' },
      { text: 'The **conflict** caused a lot of **excitement** in town.' },
      { text: 'If you **look for** a job, never **give up**.' },
      { text: 'She can’t **keep up with** the new **engineers**.' },
      { text: 'Your **estimate** is **basically** right, but a little high.' },
      { text: 'In a **democracy**, people **participate** in decisions.' },
      { text: 'Grandma is **forgetful**, but this song sounds **familiar**.' },
      { text: 'The town **depends on** **electricity** from the river.' },
      { text: 'Please **throw away** that old **toothbrush**.' },
      { text: 'We **ran out of** milk again this morning.' },
      { text: 'Please write your **credit card number** here.' },
    ],
  },
];

// "**word**" → the plain text (what the teacher's sheet keeps) and the targets.
export const plain = (s) => s.replace(/\*\*/g, '');
export const targets = (s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1]);

// What the test is worth: a share of the grade, and a point for each target.
export const WORTH = 5;
export const POINTS_PER_TARGET = 1;
export const TOTAL_POINTS = READINGS.reduce((n, r) => n + r.sentences.reduce((m, s) => m + targets(s.text).length, 0), 0) * POINTS_PER_TARGET;

export const INTRO =
  'This is the second part of the phonology test. It has four readings: vowels, consonants, connected speech, and word stress. ' +
  `This test is worth ${WORTH}% of your grade. Each word in bold is worth ${POINTS_PER_TARGET} point, and the total is ${TOTAL_POINTS} points. ` +
  'For each reading you will have forty seconds to prepare and fifty seconds to read the sentences aloud. ' +
  'The test runs by itself. Your microphone turns on when it is time to read and turns off when the time is up. You cannot pause or go back.';

export const directions = (r) =>
  `In this part of the test, you will read aloud the sentences on the screen. Pay attention to the words in bold: ${r.focus}. ` +
  `You will have ${PREP} seconds to prepare. Then you will have ${RESPONSE} seconds to read the sentences aloud.`;

// The recorded answers, in order.
export const RESPONSES = READINGS.map((r) => ({ id: r.id, label: `Reading ${r.n}`, short: String(r.n), title: r.title }));

export const caps = (s) => s.replace(/\*\*(.+?)\*\*/g, (m, w) => w.toUpperCase());
export const words = (r) => r.sentences.map((s) => plain(s.text)).join(' ').match(/[A-Za-z’']+/g) || [];

// Every step of the exam, in order. `scale` shortens the clocks (quick tests of the page).
//   intro     – general directions, spoken
//   part      – a reading's directions, spoken (the sentences are not shown yet)
//   prep      – preparation time on the clock; the sentences appear
//   response  – the microphone records for `seconds`
export function buildTimeline({ scale = 1 } = {}) {
  const t = (s) => Math.max(3, Math.round(s * scale));
  const steps = [{ type: 'intro', say: INTRO }];
  for (const r of READINGS) {
    steps.push({ type: 'part', reading: r.id, say: `Reading ${r.n}. ${r.spoken || r.title}. ${directions(r)}` });
    steps.push({ type: 'prep', reading: r.id, seconds: t(PREP), say: 'Begin preparing now.' });
    steps.push({
      type: 'response',
      reading: r.id,
      id: r.id,
      seconds: t(RESPONSE),
      say: 'Begin reading aloud now.',
      prompt: r.sentences.map((s, i) => `${i + 1}. ${caps(s.text)}`).join(' '),
    });
  }
  return steps;
}

// How long the exam takes, in seconds, not counting the spoken directions.
export function timedSeconds(steps) {
  return steps.reduce((n, s) => n + (s.seconds || 0), 0);
}
