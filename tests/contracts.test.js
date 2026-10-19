import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import { getProjectMetadata } from '../backend/src/application/get-project-metadata.js';
import { loadProjectStatus } from '../frontend/src/features/project-status/application/load-project-status.js';
import { createHttpProjectGateway } from '../frontend/src/features/project-status/infrastructure/http-project-gateway.js';
import { matchesAnalyticsScope } from '@flamengo-analytics/domain/scope';

test('backend response passes the shared contract and the frontend gateway', async () => {
  const readJson = async (name) =>
    JSON.parse(await readFile(new URL(`../contracts/${name}`, import.meta.url)));
  const validator = new Ajv();
  addFormats(validator);
  validator.addSchema(await readJson('manifest.schema.json'));
  const validate = validator.compile(await readJson('project-metadata.schema.json'));
  const body = getProjectMetadata();
  assert.equal(validate(body), true, JSON.stringify(validate.errors));
  const gateway = createHttpProjectGateway(async () => Response.json(body));
  assert.deepEqual(await loadProjectStatus(gateway), body);
});

test('shared scope rejects widening, missing fields and numeric strings', () => {
  const scope = getProjectMetadata().scope;
  assert.equal(matchesAnalyticsScope(scope), true);
  assert.equal(matchesAnalyticsScope({ ...scope, last_round: 19 }), false);
  assert.equal(matchesAnalyticsScope({ ...scope, last_round: 39 }), false);
  assert.equal(matchesAnalyticsScope({ ...scope, season: '2025' }), false);
  assert.equal(matchesAnalyticsScope({ ...scope, season: 2024 }), false);
  assert.equal(matchesAnalyticsScope({ ...scope, season: 2026 }), false);
  assert.equal(matchesAnalyticsScope({}), false);
  assert.equal(matchesAnalyticsScope(null), false);
});
