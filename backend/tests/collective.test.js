import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import pino from 'pino';
import { aggregateClubs, describe, selectFacts } from '../src/domain/collective.js';
import { createCollectiveService } from '../src/application/get-collective.js';
import { createCollectiveFiles } from '../src/infrastructure/persistence/collective-files.js';
import { createApp } from '../src/interfaces/http/create-app.js';

const files = createCollectiveFiles(fileURLToPath(new URL('../../', import.meta.url)));
const service = createCollectiveService(files);
const app = createApp({
  getMetadata: () => ({}),
  getCollective: service,
  logger: pino({ level: 'silent' }),
  corsOrigin: 'http://127.0.0.1:5173',
});

test('all 20 Python club totals agree numerically with JavaScript', async () => {
  const data = await files.read();
  const actual = aggregateClubs(data.team_matches);
  for (const row of actual) {
    const expected = data.club_totals.find((item) => item.club_id === row.club_id);
    for (const [key, value] of Object.entries(expected)) {
      if (typeof value === 'number')
        assert.ok(Math.abs(row[key] - value) < 1e-10, `${row.club_id}.${key}`);
      else assert.deepEqual(row[key], value);
    }
  }
  assert.deepEqual(describe([]), { n: 0 });
  assert.equal(describe([0, 1, 2, 9]).q1, 0.75);
});

test('all 760 accumulated rows agree with Python including round 1 and 38', async () => {
  const snapshot = await files.read();
  for (let round = 1; round <= 38; round++) {
    const calculated = aggregateClubs(
      selectFacts(snapshot.team_matches, { to_round: round }),
    );
    for (const actual of calculated) {
      const expected = snapshot.standings.find(
        (row) => row.official_round === round && row.club_id === actual.club_id,
      );
      for (const key of [
        'played',
        'points',
        'goals_for',
        'goals_against',
        'goal_difference',
        'position',
      ])
        assert.equal(actual[key], expected[key]);
    }
  }
});

test('HTTP summary and complete source metadata contain real totals', async () => {
  const response = await request(app).get('/api/summary').expect(200);
  assert.equal(response.body.data.club.points, 79);
  assert.equal(response.body.data.club.clean_sheets, 18);
  assert.equal(response.body.coverage.matches, 380);
  assert.equal(response.body.source.license, 'CC0-1.0');
  await request(app).get('/api/players').expect(404);
});

test('matches preserve official postponed round and CSV filters', async () => {
  const query = {
    club_id: 'club:flamengo',
    opponent_id: 'club:sport',
    from_round: 12,
    to_round: 12,
    venue: 'away',
    result: 'W',
  };
  const response = await request(app).get('/api/matches').query(query).expect(200);
  assert.equal(response.body.data.total, 1);
  assert.equal(response.body.data.rows[0].date, '2025-11-15');
  const csv = await request(app).get('/api/exports/matches').query(query).expect(200);
  assert.equal(csv.text.trim().split('\r\n').length, 2);
  assert.match(csv.text, /Sport/);
  assert.match(csv.text, /source_locator/);
  assert.match(csv.text, /dataset_version/);
  assert.match(csv.text, /CC0-1.0/);
});

test('comparison uses identical round and venue windows and match pagination', async () => {
  const response = await request(app)
    .get('/api/compare')
    .query({
      opponent_id: 'club:palmeiras',
      from_round: 20,
      to_round: 38,
      venue: 'away',
    })
    .expect(200);
  assert.equal(response.body.data.length, 2);
  assert.ok(response.body.data.every((row) => row.played < 19));
  const page = await request(app)
    .get('/api/matches')
    .query({ page: 4, page_size: 100 })
    .expect(200);
  assert.equal(page.body.data.rows.length, 80);
  assert.equal(page.body.data.total, 380);
});

test('arbitrary clubs compare with totals and evolution from the same away window', async () => {
  const window = { from_round: 20, to_round: 38, venue: 'away' };
  const reply = await request(app)
    .get('/api/compare')
    .query({ ...window, club_id: 'club:bahia', opponent_id: 'club:sport' })
    .expect(200);
  for (const row of reply.body.data) {
    const summary = await request(app)
      .get('/api/summary')
      .query({ ...window, club_id: row.club_id })
      .expect(200);
    const evolution = await request(app)
      .get('/api/evolution')
      .query({ ...window, club_id: row.club_id })
      .expect(200);
    assert.deepEqual(summary.body.data.club, row);
    for (const metric of [
      'played',
      'points',
      'goals_for',
      'goals_against',
      'efficiency',
    ])
      assert.equal(evolution.body.data.at(-1)[metric], row[metric]);
    assert.ok(
      summary.body.data.home_away.every(
        (item) => item.venue === 'away' || !item.club_id,
      ),
    );
  }
});

for (const [path, query] of [
  ['matches', { to_round: 39 }],
  ['matches', { from_round: 38, to_round: 1 }],
  ['matches', { season: 2026 }],
  ['matches', { club_id: 'club:unknown' }],
  ['matches', { page_size: 101 }],
  ['matches', { result: 'W' }],
  ['compare', { opponent_id: 'club:flamengo' }],
  ['summary', { venue: 'home;SELECT' }],
])
  test(`collective transport rejects ${JSON.stringify(query)}`, async () => {
    await request(app).get(`/api/${path}`).query(query).expect(400);
  });

test('missing publication returns null metrics and empty windows remain empty', async () => {
  const unavailable = await createCollectiveService({ read: async () => null })(
    'summary',
  );
  assert.equal(unavailable.data, null);
  assert.equal(unavailable.availability, 'unavailable');
  const empty = await service('matches', {
    club_id: 'club:flamengo',
    from_round: 1,
    to_round: 1,
    result: 'W',
  });
  assert.equal(empty.data.total, 0);
});
