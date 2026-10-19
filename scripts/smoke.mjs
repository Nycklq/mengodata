import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer as createNetServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const reservation = createNetServer();
reservation.listen(0, '127.0.0.1');
await once(reservation, 'listening');
const port = reservation.address().port;
await new Promise((accept, reject) =>
  reservation.close((error) => (error ? reject(error) : accept())),
);

const child = spawn(process.execPath, ['backend/src/main/server.js'], {
  cwd: root,
  env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), LOG_LEVEL: 'silent' },
  stdio: 'ignore',
  windowsHide: true,
});
const exited = once(child, 'exit');
let vite;
try {
  const deadline = Date.now() + 15000;
  let healthy = false;
  while (!healthy && Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`, {
        signal: AbortSignal.timeout(1000),
      });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).status, 'ok');
      healthy = true;
    } catch {
      if (child.exitCode !== null) throw new Error('BACKEND_EXITED_DURING_SMOKE');
      await new Promise((accept) => setTimeout(accept, 100));
    }
  }
  assert.equal(healthy, true, 'BACKEND_HEALTH_TIMEOUT');
  vite = await createViteServer({
    root: fileURLToPath(new URL('../frontend', import.meta.url)),
    configFile: fileURLToPath(new URL('../frontend/vite.config.js', import.meta.url)),
    logLevel: 'silent',
    server: {
      host: '127.0.0.1',
      port: 0,
      proxy: { '/api': `http://127.0.0.1:${port}` },
    },
  });
  await vite.listen();
  const origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
  const page = await fetch(origin);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /lang="pt-BR"/);
  const entry = await fetch(`${origin}/src/app/main.jsx`);
  assert.equal(entry.status, 200);
  assert.match(await entry.text(), /Dashboard/);
  const response = await fetch(`${origin}/api/metadata`);
  assert.equal(response.status, 200);
  const metadata = await response.json();
  assert.deepEqual(metadata.scope, {
    competition_id: 'competition:brasileirao-serie-a-men',
    season: 2025,
    team_id: 'club:flamengo',
    first_round: 1,
    last_round: 38,
  });
  assert.equal(metadata.schema_version, 2);
  assert.match(metadata.label, /2025.*1 a 38/);
  assert.equal(metadata.source_status, 'pending');
  assert.equal(metadata.data_status, 'unavailable');
  assert.equal(metadata.coverage, null);
  assert.equal(metadata.dataset_version, null);
  const analytical = [
    'dashboard/summary',
    'players',
    'rankings/goals',
    'rankings/assists',
    'rankings/contributions',
    'analytics/offensive',
    'analytics/defensive',
    'analytics/positions',
    'analytics/distribution',
    'statistics',
    'data-quality',
    'references',
  ];
  for (const resource of analytical) {
    const reply = await fetch(`${origin}/api/${resource}`);
    assert.equal(reply.status, 200, resource);
    const document = await reply.json();
    assert.deepEqual(document.scope, metadata.scope);
    assert.equal(document.availability, 'unavailable');
    if (resource === 'dashboard/summary') assert.equal(document.data.goals, null);
    if (resource === 'players') assert.deepEqual(document.data, []);
  }
  const denied = await fetch(`${origin}/api/exports/players`);
  assert.equal(denied.status, 409);
  for (const path of [
    'jogadores',
    'comparar',
    'ofensivo',
    'defensivo',
    'estatisticas',
    'power-bi',
    'metodologia',
    'jogadores/00000000-0000-4000-8000-000000000001',
  ]) {
    const reply = await fetch(`${origin}/${path}`);
    assert.equal(reply.status, 200, path);
    assert.match(await reply.text(), /lang="pt-BR"/);
  }
  process.stdout.write(
    JSON.stringify({ smoke: 'passed', season: 2025, rounds: [1, 38] }) + '\n',
  );
} finally {
  await vite?.close();
  if (child.exitCode === null) child.kill();
  await exited;
}
