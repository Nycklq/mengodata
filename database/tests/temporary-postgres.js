import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { access, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const workspace = fileURLToPath(new URL('../..', import.meta.url));

async function binariesDirectory() {
  if (process.env.PG_BIN) return process.env.PG_BIN;
  if (process.platform !== 'win32') {
    return (await execute('pg_config', ['--bindir'])).stdout.trim();
  }
  const base = join(process.env.ProgramFiles ?? 'C:/Program Files', 'PostgreSQL');
  const versions = (await readdir(base)).sort((a, b) => Number(b) - Number(a));
  for (const version of versions) {
    const candidate = join(base, version, 'bin');
    try {
      await access(join(candidate, 'initdb.exe'));
      return candidate;
    } catch {
      continue;
    }
  }
  throw new Error('POSTGRES_BINARIES_REQUIRED');
}

async function freePort() {
  const server = createServer();
  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', accept);
  });
  const port = server.address().port;
  await new Promise((accept, reject) =>
    server.close((error) => (error ? reject(error) : accept())),
  );
  return port;
}

export async function temporaryPostgres() {
  const binaries = await binariesDirectory();
  const tempRoot = resolve(workspace, '.tmp');
  await mkdir(tempRoot, { recursive: true });
  const directory = await mkdtemp(join(tempRoot, 'postgres-test-'));
  const data = join(directory, 'data');
  const password = randomBytes(24).toString('hex');
  const passwordFile = join(directory, 'password');
  await writeFile(passwordFile, password, { mode: 0o600 });
  const executable = (name) =>
    join(binaries, name + (process.platform === 'win32' ? '.exe' : ''));
  const run = (name, args) =>
    execute(executable(name), args, { windowsHide: true, timeout: 45000 });
  let started = false;
  async function close() {
    if (started) {
      await run('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop']);
      started = false;
    }
    const child = relative(tempRoot, resolve(directory));
    if (!child.startsWith('postgres-test-') || child.includes('..')) {
      throw new Error('UNSAFE_TEMPORARY_PATH');
    }
    await rm(directory, { recursive: true, force: true });
  }
  try {
    await run('initdb', [
      '-D',
      data,
      '-U',
      'synthetic_test_admin',
      '--pwfile',
      passwordFile,
      '--auth',
      'scram-sha-256',
      '--encoding',
      'UTF8',
      '--locale',
      'C',
    ]);
    const port = await freePort();
    await run('pg_ctl', [
      '-D',
      data,
      '-l',
      join(directory, 'server.log'),
      '-o',
      `-h 127.0.0.1 -p ${port}`,
      '-w',
      '-t',
      '20',
      'start',
    ]);
    started = true;
    return {
      connectionString: `postgresql://synthetic_test_admin:${password}@127.0.0.1:${port}/postgres`,
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
