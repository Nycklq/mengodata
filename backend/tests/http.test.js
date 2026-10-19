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
