import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  aggregateAppearances,
  completeSum,
  describeDistribution,
  quantile,
  safeRatio,
} from '../packages/domain/src/metrics.js';

const fixture = JSON.parse(
  await readFile(new URL('./fixtures/statistics.json', import.meta.url), 'utf8'),
);
test('aggregate formulas use weighted components and preserve unknown fields', () => {
  const actual = aggregateAppearances(fixture.rows);
  for (const [field, expected] of Object.entries(fixture.expected))
    assert.equal(actual[field], expected, field);
});
test('zero confirmed is distinct from missing and invalid denominators', () => {
  assert.equal(completeSum([0, 0]), 0);
  assert.equal(completeSum([0, null]), null);
  assert.equal(completeSum([]), null);
  for (const denominator of [0, null, -1, NaN])
    assert.equal(safeRatio(1, denominator, 90), null);
  assert.equal(safeRatio(0, 90, 90), 0);
  assert.equal(aggregateAppearances([]).matches, null);
});
test('linear quartiles and outliers exclude unknown values', () => {
  const actual = describeDistribution(fixture.distribution.values);
  for (const field of ['q1', 'median', 'q3', 'outliers'])
    assert.deepEqual(actual[field], fixture.distribution[field]);
  assert.equal(actual.sample_size, 6);
  assert.equal(describeDistribution([]).mean, null);
  assert.equal(quantile([1], 2), null);
});
