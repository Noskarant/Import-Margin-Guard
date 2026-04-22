import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFrenchNumber, parseCsvPreview } from '../../features/imports/lib/parse.ts';

test('parseFrenchNumber accepts French decimals', () => {
  assert.equal(parseFrenchNumber('1 250,75'), 1250.75);
  assert.equal(parseFrenchNumber('1250.75'), 1250.75);
});

test('parseCsvPreview detects semicolon delimiter', () => {
  const csv = 'prix unitaire;quantité\n12,50;100\n';
  const preview = parseCsvPreview(csv);
  assert.equal(preview.delimiter, ';');
  assert.deepEqual(preview.headers, ['prix unitaire', 'quantité']);
});
