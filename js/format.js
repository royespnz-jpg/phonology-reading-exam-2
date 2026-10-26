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
      { text: 'Everybody **stood up** at **the end** of the movie.' },
      { text: '**Turn off** the TV, and **go out** with your friends.' },
      { text: '**Hold on**, I am still waiting at the **bus stop**.' },
      { text: '**Think about** a long trip **far away** from home.' },
      { text: '**Why is** this new game **so easy** for you?' },
      { text: '**Three apples** fell in the **big garden** last night.' },
      { text: '**Stay in** the shade **after eleven** every day.' },
      { text: '**Do it** right now, or you will be **late today**.' },
      { text: '**How old** is your little **brother Alex**?' },
      { text: 'We need **some more** chairs **for everyone** at the party.' },
    ],
  },
  {
    id: 'r4',
    n: 4,
    kind: 'stress',
    title: 'Word stress',
    focus: 'the stressed syllable of each word',
    sentences: [
      { text: 'The singer will **record** her new songs in the **desert**.' },
      { text: 'The workers **protest** because the new **contract** is unfair.' },
      { text: 'The scientist found a **minute** **object** in the water.' },
      { text: 'We **refuse** to accept the **permit** for the factory.' },
      { text: 'Our farmers **produce** coffee, our main **export**.' },
      { text: 'She was **upset** because the **present** was broken.' },
      { text: 'The students will **perfect** their **project** before Friday.' },
      { text: 'My grandfather is **content** with his **progress** this month.' },
      { text: 'The police **suspect** that the **rebel** is hiding in town.' },
      { text: 'They will **refund** you if your ticket is **invalid**.' },
    ],
  },
];

// What the test is worth: a share of the grade, and points for each sentence.
export const WORTH = 5;
export const POINTS_PER_SENTENCE = 2;
export const TOTAL_POINTS = READINGS.reduce((n, r) => n + r.sentences.length, 0) * POINTS_PER_SENTENCE;

export const INTRO =
  'This is the second part of the phonology test. It has four readings: vowels, consonants, connected speech, and word stress. ' +
  `This test is worth ${WORTH}% of your grade. Each sentence is worth ${POINTS_PER_SENTENCE} points, and the total is ${TOTAL_POINTS} points. ` +
  'For each reading you will have forty seconds to prepare and fifty seconds to read the sentences aloud. ' +
  'The test runs by itself. Your microphone turns on when it is time to read and turns off when the time is up. You cannot pause or go back.';

export const directions = (r) =>
  `In this part of the test, you will read aloud the sentences on the screen. Pay attention to the words in bold: ${r.focus}. ` +
  `You will have ${PREP} seconds to prepare. Then you will have ${RESPONSE} seconds to read the sentences aloud.`;

// The recorded answers, in order.
export const RESPONSES = READINGS.map((r) => ({ id: r.id, label: `Reading ${r.n}`, short: String(r.n), title: r.title }));

// "**word**" → the plain text (what the teacher's sheet keeps) and the targets.
export const plain = (s) => s.replace(/\*\*/g, '');
export const targets = (s) => [...s.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1]);
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
