import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function migrate(pool, directory) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [20260119]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    const applied = await client.query('SELECT name, checksum FROM schema_migrations');
    const history = new Map(applied.rows.map((row) => [row.name, row.checksum]));
    const names = (await readdir(directory))
      .filter((name) => /^\d{3}_[a-z0-9_-]+\.sql$/.test(name))
      .sort();
    if (names.length === 0) throw new Error('MIGRATIONS_NOT_FOUND');
    if ([...history.keys()].some((name) => !names.includes(name))) {
      throw new Error('MIGRATION_HISTORY_MISMATCH');
    }
    const executed = [];
    for (const name of names) {
      const sql = await readFile(join(directory, name), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      if (history.has(name)) {
        if (history.get(name) !== checksum) throw new Error('MIGRATION_CHANGED');
        continue;
      }
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)',
        [name, checksum],
      );
      executed.push(name);
    }
    await client.query('COMMIT');
    return executed;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
