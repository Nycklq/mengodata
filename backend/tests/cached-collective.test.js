import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import pino from 'pino';
import { createCollectiveService } from '../src/application/get-collective.js';
import { createCollectiveFiles } from '../src/infrastructure/persistence/collective-files.js';
import { createCachedCollectiveRepository } from '../src/infrastructure/persistence/cached-collective.js';
import { createApp } from '../src/interfaces/http/create-app.js';

const root = fileURLToPath(new URL('../../', import.meta.url));

test('one summary request reads the validated snapshot once', async () => {
  const snapshot = await createCollectiveFiles(root).read();
  let reads = 0;
  const repository = createCachedCollectiveRepository({
    async read() {
      reads += 1;
      return snapshot;
    },
  });
  const app = createApp({
    getMetadata: async () => ({}),
    getCollective: createCollectiveService(repository),
    logger: pino({ level: 'silent' }),
    corsOrigin: 'http://127.0.0.1:5173',
  });

  const response = await request(app).get('/api/summary').expect(200);
  assert.equal(response.body.data.club.points, 79);
  assert.equal(reads, 1);
});

test('cached snapshots refresh when their time window expires', async () => {
  let currentTime = 0;
  let reads = 0;
  const snapshots = [{ dataset_version: 'first' }, { dataset_version: 'second' }];
  const repository = createCachedCollectiveRepository(
    {
      async read() {
        return snapshots[reads++];
      },
    },
    { ttlMs: 10, now: () => currentTime },
  );

  assert.equal((await repository.read()).dataset_version, 'first');
  currentTime = 9;
  assert.equal((await repository.read()).dataset_version, 'first');
  currentTime = 10;
  assert.equal((await repository.read()).dataset_version, 'second');
  assert.equal(reads, 2);
});

test('concurrent reads share one repository operation', async () => {
  let reads = 0;
  let resolveRead;
  const snapshot = { dataset_version: 'shared' };
  const repository = createCachedCollectiveRepository({
    read() {
      reads += 1;
      return new Promise((resolve) => {
        resolveRead = resolve;
      });
    },
  });

  const first = repository.read();
  const second = repository.read();
  assert.equal(reads, 0);
  await Promise.resolve();
  assert.equal(reads, 1);
  resolveRead(snapshot);
  assert.strictEqual(await first, snapshot);
  assert.strictEqual(await second, snapshot);
});

test('failed reads are retried instead of cached', async () => {
  let reads = 0;
  const snapshot = { dataset_version: 'recovered' };
  const repository = createCachedCollectiveRepository({
    async read() {
      reads += 1;
      if (reads === 1) throw new Error('temporary read failure');
      return snapshot;
    },
  });

  await assert.rejects(repository.read(), /temporary read failure/);
  assert.strictEqual(await repository.read(), snapshot);
  assert.equal(reads, 2);
});
