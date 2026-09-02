import test from 'node:test';
import assert from 'node:assert/strict';
import { auditDescriptions } from './collection-checker.mjs';

test('flags exact duplicates after case and whitespace normalization', () => {
  const rows = auditDescriptions('A practical description with enough useful detail for a Shopify collection page and clear intent.\n  a PRACTICAL description with enough useful detail for a Shopify collection page and clear intent.  ');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].duplicateQA, 'Exact duplicate');
  assert.equal(rows[1].duplicateQA, 'Exact duplicate');
});

test('flags missing, short, in-band, and long descriptions', () => {
  const inBand = 'A'.repeat(70);
  const rows = auditDescriptions(`\nShort\n${inBand}\n${'B'.repeat(161)}`);
  assert.deepEqual(rows.map((r) => r.lengthQA), [
    'Missing',
    'Review: under 70',
    'Within 70–160 review band',
    'Review: over 160',
  ]);
});

test('limits the public checker to ten rows', () => {
  assert.equal(auditDescriptions(Array(12).fill('Description').join('\n')).length, 10);
});
