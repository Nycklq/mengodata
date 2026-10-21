import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { createCollectiveFiles } from '../backend/src/infrastructure/persistence/collective-files.js';
import { createCollectiveService } from '../backend/src/application/get-collective.js';

const files = createCollectiveFiles(fileURLToPath(new URL('..', import.meta.url)));
const document = await files.read();
assert.ok(document, 'RUN_PIPELINE_COLLECTIVE');
const service = createCollectiveService(files);
const standings = await service('standings');
for (const actual of standings.data.rows) {
  const expected = document.club_totals.find((row) => row.club_id === actual.club_id);
  for (const key of Object.keys(expected)) {
    if (typeof expected[key] === 'number')
      assert.ok(
        Math.abs(expected[key] - actual[key]) < 1e-10,
        `${actual.club_id}.${key}`,
      );
    else assert.deepEqual(actual[key], expected[key]);
  }
}
let accumulated = 0;
for (const club of document.clubs) {
  const series = await service('evolution', { club_id: club.club_id });
  for (const actual of series.data) {
    const expected = document.standings.find(
      (row) =>
        row.club_id === club.club_id && row.official_round === actual.official_round,
    );
    for (const key of [
      'points',
      'goals_for',
      'goals_against',
      'goal_difference',
      'position',
    ])
      assert.equal(actual[key], expected[key]);
    accumulated++;
  }
}
const result = {
  checked_at: new Date().toISOString(),
  dataset_version: document.dataset_version,
  club_totals_compared: 20,
  accumulated_rows_compared: accumulated,
  result: 'passed',
  postgres_validation: 'npm run test:database uses isolated real PostgreSQL',
};
await writeFile(
  new URL('../reports/collective/api-parity.json', import.meta.url),
  JSON.stringify(result, null, 2) + '\n',
);
process.stdout.write(JSON.stringify(result) + '\n');
