import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { copyFile, cp, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, test } from 'node:test';
import { promisify } from 'node:util';

import { checkConnection } from '../../backend/src/infrastructure/persistence/check-connection.js';
import { migrate } from '../../backend/src/infrastructure/persistence/migrate.js';
import { createPostgresPool } from '../../backend/src/infrastructure/persistence/postgres-pool.js';
import { temporaryPostgres } from './temporary-postgres.js';
import { createPostgresStatistics } from '../../backend/src/infrastructure/persistence/postgres-statistics.js';
import { createPostgresAnalytics } from '../../backend/src/infrastructure/persistence/postgres-analytics.js';
import { syntheticSnapshot } from '../../backend/tests/analytics-fixture.js';
import { createAnalyticsService } from '../../backend/src/application/get-analytics.js';

const migrations = fileURLToPath(new URL('../migrations', import.meta.url));
const checkDatabase = fileURLToPath(
  new URL('../../backend/src/main/check-database.js', import.meta.url),
);
const execute = promisify(execFile);
let cluster;
let pool;

before(
  async () => {
    cluster = await temporaryPostgres();
    pool = createPostgresPool(cluster.connectionString);
  },
  { timeout: 60000 },
);

after(async () => {
  await pool?.end();
  await cluster?.close();
});

test('local connection check confirms a read-only transaction without creating tables', async () => {
  const before = await pool.query(
    "SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY schemaname, tablename",
  );
  assert.deepEqual(await checkConnection(pool), { status: 'ok', read_only: true });
  const after = await pool.query(
    "SELECT schemaname, tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema') ORDER BY schemaname, tablename",
  );
  assert.deepEqual(after.rows, before.rows);
});

test('database check entry point connects locally without applying migrations', async () => {
  const result = await execute(process.execPath, [checkDatabase], {
    env: { ...process.env, DATABASE_URL: cluster.connectionString },
    windowsHide: true,
    timeout: 15000,
  });
  assert.deepEqual(JSON.parse(result.stdout), { status: 'ok', read_only: true });
  assert.equal(result.stderr, '');
  const tables = await pool.query("SELECT to_regclass('schema_migrations') AS history");
  assert.equal(tables.rows[0].history, null);
});

test('database check entry point fails explicitly when local credentials are absent', async () => {
  await assert.rejects(
    execute(process.execPath, [checkDatabase], {
      env: { ...process.env, DATABASE_URL: '' },
      windowsHide: true,
      timeout: 15000,
    }),
    (error) => {
      assert.equal(error.code, 1);
      assert.deepEqual(JSON.parse(error.stderr), { error: 'DATABASE_URL_REQUIRED' });
      assert.equal(error.stdout, '');
      return true;
    },
  );
});

test('migrations apply once and insert no sports data', async () => {
  assert.deepEqual(await migrate(pool, migrations), [
    '001_identity.sql',
    '002_scope_2025.sql',
    '003_player_statistics.sql',
  ]);
  assert.deepEqual(await migrate(pool, migrations), []);
  for (const table of ['matches', 'players', 'data_sources']) {
    const result = await pool.query(`SELECT count(*)::int AS count FROM ${table}`);
    assert.equal(result.rows[0].count, 0);
  }
});

test('approved statistical imports are transactional, idempotent, scoped and retain unknown metrics', async () => {
  const snapshot = {
    ...syntheticSnapshot('partial'),
    storage_authorized: true,
    approval_reference: 'https://example.invalid/synthetic-review',
  };
  const repository = createPostgresStatistics(pool);
  const first = await repository.store(snapshot);
  assert.equal(first.changed, true);
  assert.equal((await repository.store(snapshot)).changed, false);
  const reader = createPostgresAnalytics(pool, { read: async () => snapshot });
  const actual = await reader.read();
  assert.equal(actual.appearances.length, 4);
  assert.equal(actual.appearances[0].shots, null);
  assert.deepEqual(
    await createAnalyticsService(reader)('players'),
    await createAnalyticsService({ read: async () => snapshot })('players'),
  );
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await assert.rejects(
      client.query(
        'UPDATE player_match_statistics SET team_id = $1 WHERE import_id = $2',
        ['synthetic:other', first.import_id],
      ),
      { code: '23514' },
    );
    await client.query('ROLLBACK');
    await client.query('BEGIN');
    await assert.rejects(
      client.query(
        'UPDATE player_match_statistics SET official_round = 2 WHERE import_id = $1',
        [first.import_id],
      ),
      { code: '23514' },
    );
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
  const invalid = {
    ...snapshot,
    source: { ...snapshot.source, sha256: 'b'.repeat(64) },
    appearances: [{ ...snapshot.appearances[0], goals: -1 }],
  };
  await assert.rejects(repository.store(invalid), { code: '23514' });
  const imports = await pool.query(
    'SELECT count(*)::int AS count FROM analytics_imports',
  );
  assert.equal(imports.rows[0].count, 1);
  await pool.query('DELETE FROM player_match_statistics WHERE import_id = $1', [
    first.import_id,
  ]);
  await pool.query('DELETE FROM analytics_imports WHERE import_id = $1', [
    first.import_id,
  ]);
  await pool.query('DELETE FROM match_source_ids WHERE source_id = $1', [
    snapshot.source_id,
  ]);
  await pool.query('DELETE FROM player_source_ids WHERE source_id = $1', [
    snapshot.source_id,
  ]);
  await pool.query('DELETE FROM matches WHERE match_id = ANY($1::uuid[])', [
    snapshot.matches.map((row) => row.match_id),
  ]);
  await pool.query('DELETE FROM players WHERE player_id = ANY($1::uuid[])', [
    snapshot.players.map((row) => row.player_id),
  ]);
  await pool.query('DELETE FROM data_sources WHERE source_id = $1', [
    snapshot.source_id,
  ]);
});

async function withRollback(check) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await check(client);
  } finally {
    await client.query('ROLLBACK');
    client.release();
  }
}

function insertMatch(
  client,
  {
    round = 1,
    season = 2025,
    competition = 'competition:brasileirao-serie-a-men',
    home = 'club:flamengo',
    status = 'postponed',
    playedAt = null,
  } = {},
) {
  return client.query(
    `
    INSERT INTO matches (match_id, competition_id, season, official_round,
      official_match_number, home_team_id, away_team_id, status, played_at)
    VALUES ($1, $2, $3, $4, 1, $5, 'synthetic:opponent', $6, $7)
  `,
    [randomUUID(), competition, season, round, home, status, playedAt],
  );
}

test('postponed match retains official round with a later playing date', async () => {
  await withRollback(async (client) => {
    await insertMatch(client, {
      round: 4,
      status: 'finished',
      playedAt: '2027-01-01T12:00:00Z',
    });
    const response = await client.query('SELECT official_round FROM matches');
    assert.equal(response.rows[0].official_round, 4);
  });
});

for (const changes of [
  { round: 39 },
  { round: 0 },
  { season: 2024 },
  { season: 2026 },
  { competition: 'synthetic:cup' },
  { home: 'synthetic:other-club' },
  { status: 'finished' },
]) {
  test(`database rejects invalid scope or finished match without date: ${JSON.stringify(changes)}`, async () => {
    await withRollback(async (client) => {
      await assert.rejects(insertMatch(client, changes), { code: '23514' });
    });
  });
}

test('approved source cannot omit approval evidence', async () => {
  await withRollback(async (client) => {
    await assert.rejects(
      client.query(
        `INSERT INTO data_sources (source_id, name, approval_status) VALUES ($1, $2, $3)`,
        ['synthetic:source', 'Synthetic test source', 'approved'],
      ),
      { code: '23514' },
    );
  });
});

test('provider player identifiers cannot reference a missing player', async () => {
  await withRollback(async (client) => {
    await client.query('INSERT INTO data_sources (source_id, name) VALUES ($1, $2)', [
      'synthetic:source',
      'Synthetic test source',
    ]);
    await assert.rejects(
      client.query(
        'INSERT INTO player_source_ids (source_id, external_player_id, player_id) VALUES ($1, $2, $3)',
        ['synthetic:source', 'synthetic-player', randomUUID()],
      ),
      { code: '23503' },
    );
  });
});

test('names are descriptive and provider identifiers have a source namespace', async () => {
  await withRollback(async (client) => {
    const first = randomUUID();
    const second = randomUUID();
    await client.query(
      'INSERT INTO players (player_id, display_name) VALUES ($1, $3), ($2, $3)',
      [first, second, 'Synthetic test identity'],
    );
    await client.query(
      'INSERT INTO data_sources (source_id, name) VALUES ($1, $3), ($2, $3)',
      ['synthetic:first', 'synthetic:second', 'Synthetic test source'],
    );
    await client.query(
      'INSERT INTO player_source_ids (source_id, external_player_id, player_id) VALUES ($1, $3, $4), ($2, $3, $5)',
      ['synthetic:first', 'synthetic:second', 'same-external-id', first, second],
    );
    await assert.rejects(
      client.query(
        'INSERT INTO player_source_ids (source_id, external_player_id, player_id) VALUES ($1, $2, $3)',
        ['synthetic:first', 'same-external-id', second],
      ),
      { code: '23505' },
    );
  });
});

test('a duplicated official fixture is rejected', async () => {
  await withRollback(async (client) => {
    await insertMatch(client);
    await assert.rejects(insertMatch(client, { round: 2 }), { code: '23505' });
  });
});

test('failed migrations roll back their schema changes and history', async () => {
  const directory = await mkdtemp(
    fileURLToPath(new URL('../../.tmp/migration-test-', import.meta.url)),
  );
  await cp(migrations, directory, { recursive: true });
  await writeFile(
    join(directory, '003_synthetic_failure.sql'),
    'CREATE TABLE synthetic_rollback_probe (id integer); SELECT * FROM synthetic_missing_relation;',
  );
  await assert.rejects(migrate(pool, directory), { code: '42P01' });
  const result = await pool.query(
    "SELECT to_regclass('synthetic_rollback_probe') AS relation",
  );
  assert.equal(result.rows[0].relation, null);
  const history = await pool.query(
    'SELECT count(*)::int AS count FROM schema_migrations',
  );
  assert.equal(history.rows[0].count, 3);
});

test('a migration changed after application is rejected', async () => {
  const directory = await mkdtemp(
    fileURLToPath(new URL('../../.tmp/migration-test-', import.meta.url)),
  );
  await cp(migrations, directory, { recursive: true });
  const file = join(directory, '001_identity.sql');
  await writeFile(file, (await readFile(file, 'utf8')) + '\nSELECT 1;\n');
  await assert.rejects(migrate(pool, directory), { message: 'MIGRATION_CHANGED' });
});

for (const round of [1, 19, 20, 38]) {
  test(`database accepts official round ${round} of the full 2025 season`, async () => {
    await withRollback(async (client) => {
      await insertMatch(client, { round });
      const result = await client.query('SELECT season, official_round FROM matches');
      assert.deepEqual(result.rows, [{ season: 2025, official_round: round }]);
    });
  });
}

for (const populated of [false, true]) {
  test(`forward scope migration preserves committed legacy history with populated=${populated}`, async () => {
    const schema = populated ? 'synthetic_legacy_populated' : 'synthetic_legacy_empty';
    await pool.query(`CREATE SCHEMA ${schema}`);
    const connection = new URL(cluster.connectionString);
    connection.searchParams.set('options', `-c search_path=${schema}`);
    const legacyPool = createPostgresPool(connection.href);
    try {
      const directory = await mkdtemp(
        fileURLToPath(new URL('../../.tmp/migration-test-', import.meta.url)),
      );
      const original = join(migrations, '001_identity.sql');
      await copyFile(original, join(directory, '001_identity.sql'));
      await migrate(legacyPool, directory);
      const checksum = createHash('sha256')
        .update(await readFile(original))
        .digest('hex');
      if (populated) {
        await insertMatch(legacyPool, { season: 2026 });
        await assert.rejects(migrate(legacyPool, migrations), {
          code: 'P0001',
          message: 'SCOPE_MIGRATION_REQUIRES_EMPTY_MATCHES',
        });
        const matches = await legacyPool.query(
          'SELECT season, official_round FROM matches',
        );
        assert.deepEqual(matches.rows, [{ season: 2026, official_round: 1 }]);
        const history = await legacyPool.query(
          'SELECT name, checksum FROM schema_migrations',
        );
        assert.deepEqual(history.rows, [{ name: '001_identity.sql', checksum }]);
        await assert.rejects(insertMatch(legacyPool, { round: 2 }), { code: '23514' });
      } else {
        assert.deepEqual(await migrate(legacyPool, migrations), [
          '002_scope_2025.sql',
          '003_player_statistics.sql',
        ]);
        await insertMatch(legacyPool, { round: 38 });
        const history = await legacyPool.query(
          'SELECT checksum FROM schema_migrations WHERE name = $1',
          ['001_identity.sql'],
        );
        assert.equal(history.rows[0].checksum, checksum);
        assert.deepEqual(await migrate(legacyPool, migrations), []);
      }
    } finally {
      await legacyPool.end();
    }
  });
}
