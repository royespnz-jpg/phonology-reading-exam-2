import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stamps } from '../scripts/version.mjs';

test('every file the page loads carries the same version (run: npm run version)', () => {
  const all = stamps();
  assert.ok(all.length >= 9, `${all.length} references`);
  const missing = all.filter(([, v]) => !v).map(([f]) => f);
  assert.deepEqual(missing, [], 'references without ?v=');
  assert.equal(new Set(all.map(([, v]) => v)).size, 1, 'one version everywhere');
});
