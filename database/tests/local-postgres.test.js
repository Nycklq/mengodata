import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parse } from 'dotenv';
import pg from 'pg';
import { createLocalPostgres } from '../../backend/src/infrastructure/persistence/local-postgres.js';

const base = fileURLToPath(new URL('../../.tmp/', import.meta.url));

async function workspace(t) {
  await mkdir(base, { recursive: true });
  const root = await mkdtemp(join(base, 'local-database-test-'));
  t.after(async () => {
    try {
      const marker = JSON.parse(
        await readFile(join(root, '.local/postgres/owner.json'), 'utf8'),
      );
      if (marker.owner === 'flamengo-analytics-local-postgres-v1')
        await createLocalPostgres(root).stop();
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const child = relative(base, resolve(root));
    assert.ok(child.startsWith('local-database-test-') && !child.includes('..'));
    await rm(root, { recursive: true, force: true });
  });
  return root;
}

test('local setup refuses an existing env file without modifying it', async (t) => {
  const root = await workspace(t);
  await writeFile(join(root, '.env'), 'EXTERNAL_DATABASE_PRESERVED=true\n');
  await assert.rejects(
    createLocalPostgres(root).setup(),
    /EXISTING_DATABASE_CONFIGURATION/,
  );
  assert.equal(
    await readFile(join(root, '.env'), 'utf8'),
    'EXTERNAL_DATABASE_PRESERVED=true\n',
  );
});

test('local controls refuse an unowned cluster before running PostgreSQL', async (t) => {
  const root = await workspace(t);
  await mkdir(join(root, '.local/postgres'), { recursive: true });
  await writeFile(
    join(root, '.local/postgres/owner.json'),
    JSON.stringify({ owner: 'other', directory: root, port: 55432 }),
  );
  await assert.rejects(
    createLocalPostgres(root).start(),
    /LOCAL_POSTGRES_OWNERSHIP_MISMATCH/,
  );
  await assert.rejects(
    createLocalPostgres(root).setup(),
    /LOCAL_POSTGRES_ALREADY_EXISTS/,
  );
});

test('dedicated local PostgreSQL retains data across restart with SCRAM and no automatic migration', async (t) => {
  const root = await workspace(t);
  const database = createLocalPostgres(root);
  const created = await database.setup();
  assert.equal(created.migrations, 'pending');
  const environment = parse(await readFile(join(root, '.env')));
  const saved = await readFile(join(root, '.local/postgres/connection.env'), 'utf8');
  assert.equal(parse(saved).DATABASE_URL, environment.DATABASE_URL);
  await writeFile(join(root, '.env'), 'EXTERNAL_CONFIGURATION_PRESERVED=true\n');
  const restored = await database.configure();
  assert.equal(
    await readFile(join(root, '.local/postgres', restored.backup), 'utf8'),
    'EXTERNAL_CONFIGURATION_PRESERVED=true\n',
  );
  assert.equal(
    parse(await readFile(join(root, '.env'))).DATABASE_URL,
    environment.DATABASE_URL,
  );
  const read = async (query) => {
    const pool = new pg.Pool({ connectionString: environment.DATABASE_URL });
    try {
      return await pool.query(query);
    } finally {
      await pool.end();
    }
  };
  assert.equal(
    (await read("SELECT to_regnamespace('collective') AS schema")).rows[0].schema,
    null,
  );
  assert.equal(
    (await read('SHOW password_encryption')).rows[0].password_encryption,
    'scram-sha-256',
  );
  await read('CREATE TABLE persistence_probe (value integer)');
  await read('INSERT INTO persistence_probe VALUES (2025)');
  await database.stop();
  assert.equal((await database.status()).status, 'stopped');
  await database.start();
  assert.equal((await read('SELECT value FROM persistence_probe')).rows[0].value, 2025);
  await assert.rejects(database.setup(), /LOCAL_POSTGRES_ALREADY_EXISTS/);
  await database.stop();
});
