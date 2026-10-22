import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import { postgresConnectionOptions } from '../src/infrastructure/persistence/postgres-pool.js';

const remote =
  'postgresql://synthetic:synthetic-password@ep-fixture.region.aws.neon.tech/neondb';

for (const query of [
  '',
  '?sslmode=require',
  '?sslmode=verify-ca',
  '?sslmode=verify-full&channel_binding=require',
]) {
  test(`remote PostgreSQL retains certificate verification through pg parsing: ${query || 'default'}`, () => {
    const options = postgresConnectionOptions(remote + query);
    const client = new pg.Client(options);
    assert.equal(client.connectionParameters.ssl.rejectUnauthorized, true);
    assert.equal(client.enableChannelBinding, true);
    assert.equal(client.connectionParameters.host, 'ep-fixture.region.aws.neon.tech');
    assert.equal(client.connectionParameters.database, 'neondb');
  });
}

for (const mode of ['disable', 'allow', 'prefer', 'no-verify', 'unknown']) {
  test(`remote PostgreSQL cannot weaken TLS with sslmode=${mode}`, () => {
    assert.throws(() => postgresConnectionOptions(remote + '?sslmode=' + mode), {
      message: 'DATABASE_TLS_REQUIRED',
    });
  });
}

for (const parameter of [
  'ssl=false',
  'sslcert=synthetic',
  'sslkey=synthetic',
  'sslrootcert=synthetic',
  'uselibpqcompat=true',
  'host=127.0.0.1',
  'port=5432',
  'channel_binding=disable',
]) {
  test(`remote URI options cannot override verified TLS: ${parameter.split('=')[0]}`, () => {
    assert.throws(() => postgresConnectionOptions(remote + '?' + parameter), {
      message: 'INVALID_DATABASE_TLS_CONFIGURATION',
    });
  });
}

test('local PostgreSQL keeps the existing connection string and driver TLS behavior', () => {
  const connection =
    'postgresql://synthetic:synthetic-password@127.0.0.1:5432/synthetic';
  const options = postgresConnectionOptions(connection);
  assert.equal(options.connectionString, connection);
  assert.equal(options.ssl, undefined);
  assert.equal(new pg.Client(options).connectionParameters.ssl, false);
});

for (const value of [
  '',
  'postgresql://synthetic:synthetic-password@',
  'https://synthetic.invalid/db',
]) {
  test('invalid database configuration returns a fixed error without credentials', () => {
    assert.throws(
      () => postgresConnectionOptions(value),
      (error) => {
        assert.ok(
          ['DATABASE_URL_REQUIRED', 'INVALID_DATABASE_URL'].includes(error.message),
        );
        assert.ok(!error.message.includes('synthetic-password'));
        return true;
      },
    );
  });
}
