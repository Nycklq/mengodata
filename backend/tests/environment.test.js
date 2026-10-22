import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';

const execute = promisify(execFile);
const base = fileURLToPath(new URL('../../.tmp/', import.meta.url));

async function inspectEnvironment(t, inherited, overrides = {}, details = false) {
  await mkdir(base, { recursive: true });
  const root = await mkdtemp(join(base, 'environment-test-'));
  t.after(async () => {
    const child = relative(base, resolve(root));
    assert.ok(child.startsWith('environment-test-') && !child.includes('..'));
    await rm(root, { recursive: true, force: true });
  });
  const configuration = join(root, 'backend/src/infrastructure/config');
  await mkdir(configuration, { recursive: true });
  const module = join(configuration, 'environment.js');
  await copyFile(
    new URL('../src/infrastructure/config/environment.js', import.meta.url),
    module,
  );
  await writeFile(
    join(root, '.env'),
    'DATABASE_URL=postgresql://synthetic:synthetic-password@127.0.0.1:5432/synthetic-file\n',
  );
  const env = { ...process.env, NODE_ENV: 'development' };
  for (const key of ['HOST', 'PORT', 'CORS_ORIGIN', 'TRUST_PROXY_HOPS'])
    delete env[key];
  if (inherited) env.DATABASE_URL = inherited;
  else delete env.DATABASE_URL;
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete env[key];
    else env[key] = value;
  }
  const projection = details
    ? '{ host: configuration.HOST, port: configuration.PORT, origin: configuration.CORS_ORIGIN, proxy: configuration.TRUST_PROXY_HOPS, mode: configuration.NODE_ENV }'
    : '{ host: target.hostname, database: target.pathname }';
  const script = `import { readEnvironment } from ${JSON.stringify(pathToFileURL(module).href)}; const configuration = readEnvironment(); const target = new URL(process.env.DATABASE_URL); console.log(JSON.stringify(${projection}));`;
  const reply = await execute(process.execPath, ['--input-type=module', '-e', script], {
    cwd: join(root, 'backend'),
    env,
    windowsHide: true,
    timeout: 10000,
  });
  assert.equal(reply.stderr, '');
  assert.ok(!reply.stdout.includes('synthetic-password'));
  return JSON.parse(reply.stdout);
}

test('backend loads the root env when launched from its workspace directory', async (t) => {
  assert.deepEqual(await inspectEnvironment(t), {
    host: '127.0.0.1',
    database: '/synthetic-file',
  });
});

test('production accepts the Render bind and port with an exact HTTPS frontend origin', async (t) => {
  assert.deepEqual(
    await inspectEnvironment(
      t,
      'postgresql://synthetic:synthetic-password@ep-fixture.region.aws.neon.tech/neondb',
      {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: '10000',
        CORS_ORIGIN: 'https://frontend.example.invalid/',
        TRUST_PROXY_HOPS: '1',
      },
      true,
    ),
    {
      host: '0.0.0.0',
      port: 10000,
      origin: 'https://frontend.example.invalid',
      proxy: 1,
      mode: 'production',
    },
  );
});

test('production does not load the local root env or silently fall back to files', async (t) => {
  await assert.rejects(
    inspectEnvironment(t, undefined, {
      NODE_ENV: 'production',
      CORS_ORIGIN: 'https://frontend.example.invalid',
    }),
    /INVALID_ENVIRONMENT/,
  );
});

for (const origin of [
  '*',
  'http://frontend.example.invalid',
  'https://frontend.example.invalid/path',
  'https://frontend.example.invalid?token=synthetic',
  'https://synthetic:secret@frontend.example.invalid',
]) {
  test(`production rejects a wildcard, insecure or non-origin CORS configuration: ${new URL(origin === '*' ? 'https://synthetic.invalid' : origin).pathname} ${origin.startsWith('https:')}`, async (t) => {
    await assert.rejects(
      inspectEnvironment(
        t,
        'postgresql://synthetic:synthetic-password@localhost/synthetic',
        {
          NODE_ENV: 'production',
          CORS_ORIGIN: origin,
        },
      ),
      /INVALID_ENVIRONMENT/,
    );
  });
}

test('an inherited DATABASE_URL takes precedence over the root env without exposing its password', async (t) => {
  assert.deepEqual(
    await inspectEnvironment(
      t,
      'postgresql://synthetic:synthetic-password@127.0.0.1:5432/synthetic-inherited',
    ),
    { host: '127.0.0.1', database: '/synthetic-inherited' },
  );
});
