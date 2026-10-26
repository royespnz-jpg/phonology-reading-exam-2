// A rough syllable count for English words: vowel groups, minus silent endings
// (home, looked, hopes), plus vowels said apart (going, usually, biology).
// Over a whole reading it lands within a few syllables of a dictionary, which
// is all the tests need to check that a reading fits its minute.
export function syllables(word) {
  let w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  w = w
    .replace(/que$/, 'k')
    .replace(/(?<![td])ed$/, 'd')
    .replace(/(?<!s|z|x|ch|sh|g|c)es$/, 's')
    .replace(/(?<!l)e$/, '')
    .replace(/^y/, '');
  const groups = (w.match(/[aeiouy]+/g) || []).length;
  const apart = (w.match(/[aeiouy]ing$|(?<![ctsg])i[aou]|ua/g) || []).length;
  return Math.max(1, groups + apart);
}

export const syllablesOf = (text) => (text.match(/[A-Za-z’']+/g) || []).reduce((n, w) => n + syllables(w), 0);
