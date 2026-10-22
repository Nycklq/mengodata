import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';
import { readNeonConnection } from '../src/infrastructure/config/neon-environment.js';

const execute = promisify(execFile);
const direct =
  'postgresql://synthetic:synthetic-password@ep-fixture.region.aws.neon.tech/neondb?sslmode=verify-full';

test('Neon commands require a separate explicit URI and never fall back to DATABASE_URL', () => {
  assert.throws(() => readNeonConnection({ DATABASE_URL: direct }), {
    message: 'NEON_DATABASE_URL_REQUIRED',
  });
  assert.equal(readNeonConnection({ NEON_DATABASE_URL: direct }), direct);
});

for (const uri of [
  'postgresql://synthetic:synthetic-password@127.0.0.1:5432/mengo_data',
  'postgresql://synthetic:synthetic-password@localhost/mengo_data',
  'postgresql://synthetic:synthetic-password@ep-fixture.neon.tech.evil.invalid/neondb',
  'https://synthetic:synthetic-password@ep-fixture.neon.tech/neondb',
  'postgresql://ep-fixture.neon.tech/neondb',
  direct + '&host=127.0.0.1',
  direct + '&port=5432',
]) {
  test('Neon target validation rejects local, unrelated or incomplete targets without exposing the URI', () => {
    assert.throws(() => readNeonConnection({ NEON_DATABASE_URL: uri }), {
      message: 'INVALID_NEON_DATABASE_URL',
    });
  });
}

test('migrations and imports require the direct Neon endpoint', () => {
  assert.throws(
    () =>
      readNeonConnection({
        NEON_DATABASE_URL: direct.replace('ep-fixture.', 'ep-fixture-pooler.'),
      }),
    { message: 'NEON_DIRECT_CONNECTION_REQUIRED' },
  );
});

for (const command of ['check', 'migrate', 'import', 'verify']) {
  test(`Neon ${command} CLI refuses local configuration before opening a pool`, async () => {
    const env = {
      ...process.env,
      DATABASE_URL: 'postgresql://synthetic:synthetic-password@127.0.0.1:1/synthetic',
    };
    delete env.NEON_DATABASE_URL;
    await assert.rejects(
      execute(
        process.execPath,
        [
          fileURLToPath(new URL('../src/main/neon-database.js', import.meta.url)),
          command,
        ],
        { env, windowsHide: true, timeout: 10000 },
      ),
      (error) => {
        assert.equal(error.code, 1);
        assert.equal(error.stdout, '');
        assert.deepEqual(JSON.parse(error.stderr), {
          error: 'NEON_DATABASE_URL_REQUIRED',
        });
        assert.ok(!error.stderr.includes('synthetic-password'));
        return true;
      },
    );
  });
}
