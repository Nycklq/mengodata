import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import pino from 'pino';
import request from 'supertest';
import { createAnalyticsService } from '../src/application/get-analytics.js';
import { getProjectMetadata } from '../src/application/get-project-metadata.js';
import { assessDataset } from '../src/domain/dataset-approval.js';
import {
  artifactSchema,
  createAnalyticsFiles,
} from '../src/infrastructure/persistence/analytics-files.js';
import { createApp } from '../src/interfaces/http/create-app.js';
import {
  syntheticApproval,
  syntheticArtifact,
  syntheticSnapshot,
} from './analytics-fixture.js';

function appFor(snapshot, options = {}) {
  return createApp({
    getMetadata: getProjectMetadata,
    getAnalytics: createAnalyticsService({ read: async () => snapshot }),
    logger: pino({ level: 'silent' }),
    corsOrigin: 'http://127.0.0.1:5173',
    ...options,
  });
}

test('unavailable and partial snapshots never produce season totals', async () => {
  for (const availability of ['unavailable', 'partial']) {
    const app = appFor({ ...syntheticSnapshot(availability), availability });
    const result = await request(app).get('/api/dashboard/summary').expect(200);
    assert.equal(result.body.data.goals, null);
    assert.equal(result.body.availability, availability);
    if (availability === 'unavailable') {
      const roster = await request(app).get('/api/players').expect(200);
      assert.deepEqual(roster.body.data, []);
      assert.equal(roster.body.pagination.total, null);
    }
  }
});
test('search, position, thresholds, sorting and pagination affect the selected population', async () => {
  const app = appFor(syntheticSnapshot());
  const result = await request(app)
    .get('/api/players')
    .query({
      q: 'synthetic',
      sort: 'minutes',
      direction: 'desc',
      page_size: 1,
      page: 2,
    })
    .expect(200);
  assert.equal(result.body.data[0].display_name, 'Synthetic Beta');
  assert.equal(result.body.pagination.total, 2);
  const filtered = await request(app)
    .get('/api/players')
    .query({ position: 'forward', min_minutes: 100 })
    .expect(200);
  assert.equal(filtered.body.data.length, 1);
  assert.equal(filtered.body.data[0].minutes, 180);
  const none = await request(app)
    .get('/api/players')
    .query({ q: "';DROP TABLE players;--" })
    .expect(200);
  assert.deepEqual(none.body.data, []);
});
test('only Flamengo 2025 appearances in the correct competition and official rounds are aggregated', async () => {
  const snapshot = syntheticSnapshot();
  for (const change of [
    { season: 2026 },
    { season: 2024 },
    { official_round: 0 },
    { official_round: 39 },
    { team_id: 'synthetic:other' },
    { competition_id: 'synthetic:cup' },
  ])
    snapshot.appearances.push({ ...snapshot.appearances[0], ...change, goals: 999 });
  const result = await request(appFor(snapshot)).get('/api/summary').expect(200);
  assert.equal(result.body.data.goals, 2);
  assert.equal(result.body.data.matches, 2);
});
test('comparison preserves null metrics and contextualizes different positions', async () => {
  const snapshot = syntheticSnapshot('partial');
  const result = await request(appFor(snapshot))
    .get('/api/compare')
    .query({ ids: snapshot.players.map((player) => player.player_id).join(',') })
    .expect(200);
  assert.equal(result.body.position_warning, true);
  assert.equal(result.body.differences.goals, 2);
  assert.equal(result.body.differences.tackles, null);
});
test('rankings omit unknown values while distributions report the known sample', async () => {
  const app = appFor(syntheticSnapshot());
  const result = await request(app).get('/api/analytics/defensive').expect(200);
  assert.equal(result.body.data.length, 1);
  const distribution = await request(app)
    .get('/api/analytics/distribution')
    .query({ metric: 'tackles' })
    .expect(200);
  assert.equal(distribution.body.data.sample_size, 1);
  assert.equal(distribution.body.data.median, 6);
});
for (const [url, query] of [
  ['/api/players', { season: 2026 }],
  ['/api/players', { page_size: 101 }],
  ['/api/players', { sort: 'minutes;SELECT' }],
  ['/api/players', { min_minutes: -1 }],
  ['/api/players', { position: 'coach' }],
  ['/api/compare', { ids: 'one,two' }],
  ['/api/rankings', { metric: 'fantasy_points' }],
  ['/api/players/not-a-uuid', {}],
])
  test(`transport rejects ${url} ${JSON.stringify(query)}`, async () => {
    await request(appFor(syntheticSnapshot())).get(url).query(query).expect(400);
  });
test('CSV rights are separate and exported cells neutralize spreadsheet formulas', async () => {
  const snapshot = syntheticSnapshot();
  await request(appFor(snapshot)).get('/api/exports/players').expect(409);
  snapshot.permissions.csv_export = true;
  snapshot.players[0].display_name = '=SYNTHETIC()';
  const result = await request(appFor(snapshot))
    .get('/api/exports/players')
    .expect(200)
    .expect('Content-Type', /text\/csv/);
  assert.match(result.text, /'=SYNTHETIC/);
  assert.match(result.text, /player_id/);
});
test('rate limiting and sanitized failures apply to analytical endpoints', async () => {
  const app = appFor(syntheticSnapshot(), { rateLimit: 1 });
  await request(app).get('/api/players').expect(200);
  await request(app).get('/api/players').expect(429).expect('Retry-After', '60');
  const failing = appFor(null, {
    getAnalytics: async () => {
      throw new Error('synthetic-secret');
    },
  });
  const result = await request(failing).get('/api/players').expect(500);
  assert.equal(result.body.error.code, 'INTERNAL_ERROR');
  assert.ok(!result.text.includes('synthetic-secret'));
});
test('38 match references alone cannot approve individual coverage', () => {
  const document = syntheticArtifact(
    Array.from({ length: 38 }, (_, index) => index + 1),
  );
  const approval = syntheticApproval('a'.repeat(64));
  const source = {
    technical_status: 'approved',
    approved_data_kinds: ['player_match'],
    reviewed_sha256: approval.sha256,
  };
  assert.equal(
    assessDataset(document, approval, source, approval.sha256, ['rest_api'])
      .availability,
    'available',
  );
  approval.participation_verified = false;
  assert.equal(
    assessDataset(document, approval, source, approval.sha256, ['rest_api'])
      .availability,
    'partial',
  );
  document.appearances.push(document.appearances[0]);
  assert.equal(
    assessDataset(document, approval, source, approval.sha256, ['rest_api']).authorized,
    false,
  );
});
test('file repository requires exact fingerprints and permissions before returning individual data', async () => {
  const root = await mkdtemp(join(tmpdir(), 'flamengo-synthetic-test-'));
  await mkdir(join(root, 'contracts'));
  await mkdir(join(root, 'data/analytics'), { recursive: true });
  const document = syntheticArtifact();
  assert.equal(artifactSchema.safeParse(document).success, true);
  const payload = JSON.stringify(document);
  const hash = createHash('sha256').update(payload).digest('hex');
  await writeFile(join(root, 'data/analytics/individual.json'), payload);
  await writeFile(
    join(root, 'contracts/dataset-approvals.json'),
    JSON.stringify({ schema_version: 1, datasets: [] }),
  );
  const files = createAnalyticsFiles({ root });
  assert.equal((await files.read()).availability, 'unavailable');
  const approval = syntheticApproval(hash);
  await writeFile(
    join(root, 'contracts/dataset-approvals.json'),
    JSON.stringify({ schema_version: 1, datasets: [approval] }),
  );
  await writeFile(
    join(root, 'contracts/source-approval.json'),
    JSON.stringify({
      sources: [
        {
          source_id: document.source_id,
          technical_status: 'approved',
          approved_data_kinds: ['player_match'],
          reviewed_sha256: hash,
        },
      ],
    }),
  );
  assert.equal((await files.read()).availability, 'partial');
  assert.equal((await files.read()).permissions.csv_export, false);
  approval.permissions.rest_api.status = 'pending';
  await writeFile(
    join(root, 'contracts/dataset-approvals.json'),
    JSON.stringify({ schema_version: 1, datasets: [approval] }),
  );
  assert.equal((await files.read()).availability, 'unavailable');
  assert.equal(
    (await createAnalyticsFiles({ root, purpose: 'storage' }).read()).availability,
    'partial',
  );
  await writeFile(join(root, 'data/analytics/individual.json'), payload + ' ');
  assert.equal((await files.read()).availability, 'unavailable');
});
