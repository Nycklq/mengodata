import assert from 'node:assert/strict';
import test, { before, after } from 'node:test';
import { fileURLToPath } from 'node:url';
import { temporaryPostgres } from './temporary-postgres.js';
import { createPostgresPool } from '../../backend/src/infrastructure/persistence/postgres-pool.js';
import { migrate } from '../../backend/src/infrastructure/persistence/migrate.js';
import { createCollectiveFiles } from '../../backend/src/infrastructure/persistence/collective-files.js';
import { createPostgresCollective } from '../../backend/src/infrastructure/persistence/postgres-collective.js';
import { createCollectiveService } from '../../backend/src/application/get-collective.js';

let cluster, pool, repository, document;
const migrations = fileURLToPath(new URL('../collective-migrations', import.meta.url));
before(async () => {
  cluster = await temporaryPostgres();
  pool = createPostgresPool(cluster.connectionString);
  await pool.query('CREATE TABLE matches (legacy_value text)');
  await pool.query('INSERT INTO matches VALUES ($1)', ['preserve 2026']);
  await migrate(pool, migrations, 'collective_migrations');
  const files = createCollectiveFiles(
    fileURLToPath(new URL('../../', import.meta.url)),
  );
  document = await files.read();
  repository = createPostgresCollective(pool, files);
});
after(async () => {
  await pool?.end();
  await cluster?.close();
});

test('additive collective migration preserves legacy tables and is idempotent', async () => {
  assert.deepEqual((await pool.query('SELECT * FROM matches')).rows, [
    { legacy_value: 'preserve 2026' },
  ]);
  assert.deepEqual(await migrate(pool, migrations, 'collective_migrations'), []);
});

test('real 380-match import is transactional and idempotent', async () => {
  assert.equal((await repository.store(document)).changed, true);
  assert.equal((await repository.store(document)).changed, false);
  assert.equal(
    (await pool.query('SELECT count(*)::int AS n FROM collective.matches')).rows[0].n,
    380,
  );
  assert.equal(
    (await pool.query('SELECT count(*)::int AS n FROM collective.imports')).rows[0].n,
    1,
  );
});

test('all 20 SQL club totals agree with Python and PostgreSQL-backed API', async () => {
  const rows = (await pool.query('SELECT * FROM collective.club_totals')).rows;
  assert.equal(rows.length, 20);
  for (const row of rows) {
    const expected = document.club_totals.find((item) => item.club_id === row.club_id);
    for (const key of [
      'played',
      'points',
      'wins',
      'draws',
      'losses',
      'goals_for',
      'goals_against',
      'goal_difference',
      'clean_sheets',
      'efficiency',
      'goals_for_average',
      'goals_against_average',
    ])
      assert.ok(
        Math.abs(Number(row[key]) - expected[key]) < 1e-10,
        `${row.club_id}.${key}`,
      );
  }
  const summary = await createCollectiveService(repository)('summary');
  assert.equal(summary.data.club.points, 79);
  assert.equal(summary.dataset_version, document.dataset_version);
});

test('all 760 SQL cumulative rows agree with Python and keep postponed games in round 12', async () => {
  const rows = (await pool.query('SELECT * FROM collective.round_totals')).rows;
  assert.equal(rows.length, 760);
  for (const row of rows) {
    const expected = document.standings.find(
      (item) =>
        item.club_id === row.club_id && item.official_round === row.official_round,
    );
    for (const key of ['points', 'goals_for', 'goals_against', 'goal_difference'])
      assert.equal(Number(row[key]), expected[key]);
  }
  const match = (
    await pool.query(
      'SELECT official_round, played_date::text FROM collective.matches WHERE home_id=$1 AND away_id=$2',
      ['club:sport', 'club:flamengo'],
    )
  ).rows[0];
  assert.deepEqual(match, { official_round: 12, played_date: '2025-11-15' });
});

test('invalid import rolls back both metadata and facts', async () => {
  const changed = structuredClone(document);
  changed.dataset_version = 'e'.repeat(64);
  changed.matches[0].official_round = 39;
  await assert.rejects(repository.store(changed), { code: '23514' });
  const count = (await pool.query('SELECT count(*)::int AS n FROM collective.imports'))
    .rows[0].n;
  assert.equal(count, 1);
});
