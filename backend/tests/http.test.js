import assert from 'node:assert/strict';
import test from 'node:test';
import pino from 'pino';
import request from 'supertest';

import { getProjectMetadata } from '../src/application/get-project-metadata.js';
import { createApp } from '../src/interfaces/http/create-app.js';

const logger = pino({ level: 'silent' });
const app = createApp({
  getMetadata: getProjectMetadata,
  logger,
  corsOrigin: 'http://localhost:5173',
});

test('health confirms process liveness without claiming database readiness', async () => {
  const response = await request(app).get('/api/health').expect(200);
  assert.deepEqual(response.body, {
    status: 'ok',
    service: 'flamengo-analytics-api',
  });
  assert.equal(response.headers['x-powered-by'], undefined);
  assert.ok(response.headers['x-content-type-options']);
});

test('metadata states fixed scope and unavailable data without false zeros', async () => {
  const response = await request(app).get('/api/metadata').expect(200);
  assert.deepEqual(response.body.scope, {
    competition_id: 'competition:brasileirao-serie-a-men',
    season: 2025,
    team_id: 'club:flamengo',
    first_round: 1,
    last_round: 38,
  });
  assert.equal(response.body.source_status, 'pending');
  assert.equal(response.body.data_status, 'unavailable');
  assert.equal(response.body.coverage, null);
  assert.equal(response.body.dataset_version, null);
  assert.equal(response.body.schema_version, 2);
  assert.equal(
    response.body.label,
    'Brasileirão Série A 2025 — temporada completa (rodadas 1 a 38)',
  );
  assert.equal(response.headers['cache-control'], 'no-store');
});

for (const query of [
  'season=2026',
  'last_round=19',
  'team_id=other',
  'scope[season]=2025',
]) {
  test(`metadata rejects scope overrides: ${query}`, async () => {
    const response = await request(app).get(`/api/metadata?${query}`).expect(400);
    assert.equal(response.body.error.code, 'INVALID_QUERY');
  });
}

test('unexpected failures do not leak infrastructure details', async () => {
  const failing = createApp({
    getMetadata: async () => {
      throw new Error('postgresql://synthetic:secret@synthetic.invalid');
    },
    logger,
    corsOrigin: 'http://localhost:5173',
  });
  const response = await request(failing).get('/api/metadata').expect(500);
  assert.deepEqual(response.body, { error: { code: 'INTERNAL_ERROR' } });
});

test('an application without an injected analytics port exposes no statistical routes', async () => {
  await request(app).get('/api/players').expect(404);
});

test('configured browser origin is explicit', async () => {
  const response = await request(app)
    .get('/api/metadata')
    .set('Origin', 'http://localhost:5173')
    .expect(200);
  assert.equal(
    response.headers['access-control-allow-origin'],
    'http://localhost:5173',
  );
});

test('CORS does not authorize another origin or a forged hostname suffix', async () => {
  for (const origin of [
    'https://unrelated.example.invalid',
    'http://localhost:5173.evil.invalid',
  ]) {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', origin)
      .expect(200);
    assert.equal(response.headers['access-control-allow-origin'], undefined);
  }
});

test('CORS preflight authorizes only the configured origin and read methods', async () => {
  const response = await request(app)
    .options('/api/metadata')
    .set('Origin', 'http://localhost:5173')
    .set('Access-Control-Request-Method', 'GET')
    .expect(204);
  assert.equal(
    response.headers['access-control-allow-origin'],
    'http://localhost:5173',
  );
  assert.ok(response.headers['access-control-allow-methods'].includes('GET'));
  assert.ok(!response.headers['access-control-allow-methods'].includes('POST'));
});

test('trusted proxy depth separates clients while ignoring a forged XFF prefix', async () => {
  const proxied = createApp({
    getMetadata: getProjectMetadata,
    logger,
    corsOrigin: 'https://frontend.example.invalid',
    trustProxyHops: 1,
    rateLimit: 1,
  });
  await request(proxied)
    .get('/api/health')
    .set('X-Forwarded-For', '203.0.113.1')
    .expect(200);
  await request(proxied)
    .get('/api/health')
    .set('X-Forwarded-For', '198.51.100.7, 203.0.113.1')
    .expect(429);
  await request(proxied)
    .get('/api/health')
    .set('X-Forwarded-For', '203.0.113.2')
    .expect(200);
});

test('local default does not trust client-supplied proxy headers', async () => {
  const local = createApp({
    getMetadata: getProjectMetadata,
    logger,
    corsOrigin: 'http://localhost:5173',
    rateLimit: 1,
  });
  await request(local)
    .get('/api/health')
    .set('X-Forwarded-For', '203.0.113.1')
    .expect(200);
  await request(local)
    .get('/api/health')
    .set('X-Forwarded-For', '203.0.113.2')
    .expect(429);
});
