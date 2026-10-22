import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { z } from 'zod';
import { artifactSchema } from '../backend/src/infrastructure/persistence/analytics-files.js';

test('Python JSON Schema and JavaScript transport share the exact individual artifact contract', async () => {
  const schema = JSON.parse(
    await readFile(
      new URL('../contracts/individual.schema.json', import.meta.url),
      'utf8',
    ),
  );
  assert.deepEqual(schema, z.toJSONSchema(artifactSchema));
});
test('OpenAPI describes all implemented route families and nullable availability', async () => {
  const spec = JSON.parse(
    await readFile(new URL('../docs/api/openapi.json', import.meta.url), 'utf8'),
  );
  assert.equal(spec.openapi, '3.1.0');
  for (const path of [
    '/api/dashboard/summary',
    '/api/matches',
    '/api/compare',
    '/api/exports/matches',
    '/api/standings',
  ])
    assert.ok(spec.paths[path].get.responses[200]);
  assert.ok(spec.paths['/api/exports/matches'].get.responses[409]);
  assert.deepEqual(
    spec.components.schemas.AnalyticsEnvelope.properties.availability.enum,
    ['unavailable', 'available'],
  );
});
test('Power BI assets declare their unverified native state and canonical scope', async () => {
  const model = JSON.parse(
    await readFile(new URL('../powerbi/model.json', import.meta.url), 'utf8'),
  );
  const theme = JSON.parse(
    await readFile(new URL('../powerbi/theme.json', import.meta.url), 'utf8'),
  );
  assert.equal(model.status, 'prepared_not_validated_in_desktop');
  assert.equal(model.scope.season, 2025);
  assert.equal(model.scope.last_round, 38);
  assert.equal(model.relationships.length, 6);
  assert.equal(theme.dataColors[0], '#C3271D');
});
