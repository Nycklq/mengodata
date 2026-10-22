import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { temporaryPostgres } from './temporary-postgres.js';
import { createPostgresPool } from '../../backend/src/infrastructure/persistence/postgres-pool.js';
import { createPostgresCollective } from '../../backend/src/infrastructure/persistence/postgres-collective.js';
import { createCollectiveFiles } from '../../backend/src/infrastructure/persistence/collective-files.js';
import { migrate } from '../../backend/src/infrastructure/persistence/migrate.js';

test('production server binds the Render host and reads the approved dataset without startup migrations', async () => {
  const cluster = await temporaryPostgres();
  const pool = createPostgresPool(cluster.connectionString);
  let child;
  let exited;
  try {
    const root = fileURLToPath(new URL('../..', import.meta.url));
    const files = createCollectiveFiles(root);
    const document = await files.read();
    const directory = fileURLToPath(
      new URL('../collective-migrations', import.meta.url),
    );
    await migrate(pool, directory, 'collective_migrations');
    await createPostgresCollective(pool, files).store(document);
    const fingerprint = async () =>
      (
        await pool.query(
          'SELECT (SELECT count(*)::int FROM collective.matches) AS matches, (SELECT count(*)::int FROM collective.imports) AS imports, (SELECT count(*)::int FROM collective_migrations) AS migrations',
        )
      ).rows;
    const before = await fingerprint();
    const reservation = createServer();
    reservation.listen(0, '127.0.0.1');
    await once(reservation, 'listening');
    const port = reservation.address().port;
    await new Promise((accept, reject) =>
      reservation.close((error) => (error ? reject(error) : accept())),
    );
    child = spawn(process.execPath, ['backend/src/main/server.js'], {
      cwd: root,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: String(port),
        CORS_ORIGIN: 'https://frontend.example.invalid',
        TRUST_PROXY_HOPS: '1',
        DATABASE_URL: cluster.connectionString,
        LOG_LEVEL: 'silent',
      },
      stdio: 'ignore',
      windowsHide: true,
    });
    exited = once(child, 'exit');
    const origin = `http://127.0.0.1:${port}`;
    const deadline = Date.now() + 15000;
    let healthy = false;
    while (!healthy && Date.now() < deadline) {
      try {
        healthy = (
          await fetch(origin + '/api/health', { signal: AbortSignal.timeout(500) })
        ).ok;
      } catch {
        assert.equal(child.exitCode, null, 'Production server exited');
        await new Promise((accept) => setTimeout(accept, 50));
      }
    }
    assert.ok(healthy, 'Production server did not bind the configured port');
    const response = await fetch(origin + '/api/summary', {
      headers: { Origin: 'https://frontend.example.invalid' },
    });
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('access-control-allow-origin'),
      'https://frontend.example.invalid',
    );
    const summary = await response.json();
    assert.equal(summary.coverage.matches, 380);
    assert.equal(summary.data.club.points, 79);
    const denied = await fetch(origin + '/api/summary', {
      headers: { Origin: 'https://unrelated.example.invalid' },
    });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
    assert.equal((await fetch(origin + '/api/matches?season=2026')).status, 400);
    assert.deepEqual(await fingerprint(), before);
  } finally {
    if (child && child.exitCode === null) child.kill();
    if (exited) await exited;
    await pool.end();
    await cluster.close();
  }
});
