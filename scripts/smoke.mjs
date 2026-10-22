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
  env: {
    ...process.env,
    NODE_ENV: 'test',
    DATABASE_URL: '',
    HOST: '127.0.0.1',
    PORT: String(port),
    LOG_LEVEL: 'silent',
  },
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
      const reply = await fetch(`http://127.0.0.1:${port}/api/health`, {
        signal: AbortSignal.timeout(1000),
      });
      assert.equal(reply.status, 200);
      healthy = true;
    } catch {
      if (child.exitCode !== null) throw new Error('BACKEND_EXITED_DURING_SMOKE');
      await new Promise((accept) => setTimeout(accept, 100));
    }
  }
  assert.ok(healthy, 'BACKEND_HEALTH_TIMEOUT');
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
  const read = async (path) => {
    const response = await fetch(origin + '/api/' + path);
    assert.equal(response.status, 200, path);
    return response.json();
  };
  const metadata = await read('metadata');
  assert.equal(metadata.scope.season, 2025);
  assert.equal(metadata.data_status, 'available');
  assert.equal(metadata.coverage.matches, 380);
  const summary = await read('summary');
  assert.equal(summary.data.club.points, 79);
  assert.equal(summary.data.club.goals_for, 78);
  assert.deepEqual(
    summary.data.home_away.map((row) => [row.venue, row.played, row.points]),
    [
      ['home', 19, 47],
      ['away', 19, 32],
    ],
  );
  assert.equal((await read('clubs')).data.length, 20);
  assert.equal((await read('standings?to_round=1')).data.rows.length, 20);
  for (const resource of [
    'evolution',
    'compare',
    'analytics/offensive',
    'analytics/defensive',
    'statistics',
    'data-quality',
  ])
    assert.equal((await read(resource)).availability, 'available');
  const matches = await read(
    'matches?club_id=club%3Aflamengo&from_round=12&to_round=12',
  );
  assert.equal(matches.data.rows[0].date, '2025-11-15');
  assert.equal(matches.data.rows[0].official_round, 12);
  const csv = await fetch(
    origin + '/api/exports/matches?club_id=club%3Aflamengo&from_round=12&to_round=12',
  );
  assert.equal(csv.status, 200);
  assert.equal((await csv.text()).trim().split('\r\n').length, 2);
  assert.equal((await fetch(origin + '/api/matches?season=2026')).status, 400);
  assert.equal((await fetch(origin + '/api/players')).status, 404);
  const pages = [
    '',
    'partidas',
    'classificacao',
    'comparar',
    'ofensivo',
    'defensivo',
    'estatisticas',
    'metodologia',
  ];
  const paths = [
    '',
    'power-bi',
    'dashboard/power-bi',
    ...pages.map((path) => 'dashboard' + (path ? '/' + path : '')),
    ...pages.filter(Boolean),
  ];
  for (const path of paths) {
    const response = await fetch(origin + '/' + path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /lang="pt-BR"/);
    assert.match(html, /MengoData/);
    assert.ok(html.indexOf('/theme-init.js') < html.indexOf('/src/app/main.jsx'));
  }
  const entry = await fetch(origin + '/src/app/main.jsx');
  assert.equal(entry.status, 200);
  assert.match(await entry.text(), /Application/);
  for (const asset of ['brand/flamengo.png', 'theme-init.js', 'brand/Poppins-OFL.txt'])
    assert.equal((await fetch(origin + '/' + asset)).status, 200);
  process.stdout.write(
    JSON.stringify({
      smoke: 'passed',
      season: 2025,
      rounds: [1, 38],
      matches: 380,
      flamengo_points: 79,
      spa_pages: 9,
      legacy_paths: 7,
      retired_redirects: 2,
      home_points: 47,
      away_points: 32,
    }) + '\n',
  );
} finally {
  await vite?.close();
  if (child.exitCode === null) child.kill();
  await exited;
}
