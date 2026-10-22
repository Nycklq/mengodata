import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';
import test from 'node:test';

const execute = promisify(execFile);
const base = fileURLToPath(new URL('../../.tmp/', import.meta.url));

async function inspectEnvironment(t, inherited) {
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
  const env = { ...process.env };
  if (inherited) env.DATABASE_URL = inherited;
  else delete env.DATABASE_URL;
  const script = `import { readEnvironment } from ${JSON.stringify(pathToFileURL(module).href)}; readEnvironment(); const target = new URL(process.env.DATABASE_URL); console.log(JSON.stringify({ host: target.hostname, database: target.pathname }));`;
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

test('an inherited DATABASE_URL takes precedence over the root env without exposing its password', async (t) => {
  assert.deepEqual(
    await inspectEnvironment(
      t,
      'postgresql://synthetic:synthetic-password@127.0.0.1:5432/synthetic-inherited',
    ),
    { host: '127.0.0.1', database: '/synthetic-inherited' },
  );
});
