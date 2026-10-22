import { execFile } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  access,
  copyFile,
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { constants } from 'node:fs';
import { parse } from 'dotenv';
import { createServer } from 'node:net';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';

const execute = promisify(execFile);
const owner = 'flamengo-analytics-local-postgres-v1';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

async function findBinaries() {
  if (process.env.PG_BIN) return process.env.PG_BIN;
  if (process.platform !== 'win32')
    return (await execute('pg_config', ['--bindir'])).stdout.trim();
  const base = join(process.env.ProgramFiles ?? 'C:/Program Files', 'PostgreSQL');
  const versions = (await readdir(base)).sort((a, b) => Number(b) - Number(a));
  for (const version of versions) {
    const directory = join(base, version, 'bin');
    if (await exists(join(directory, 'initdb.exe'))) return directory;
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

export function createLocalPostgres(root) {
  const directory = resolve(root, '.local', 'postgres');
  const data = join(directory, 'data');
  const marker = join(directory, 'owner.json');
  const environmentFile = resolve(root, '.env');
  const run = async (name, args, options = {}) => {
    const binaries = await findBinaries();
    return execute(
      join(binaries, name + (process.platform === 'win32' ? '.exe' : '')),
      args,
      { windowsHide: true, timeout: 45000, ...options },
    );
  };
  const configuration = async () => {
    const config = JSON.parse(await readFile(marker, 'utf8'));
    if (
      config.owner !== owner ||
      config.directory !== directory ||
      !Number.isInteger(config.port) ||
      config.port < 1024 ||
      config.port > 65535
    )
      throw new Error('LOCAL_POSTGRES_OWNERSHIP_MISMATCH');
    return config;
  };
  const status = async () => {
    const config = await configuration();
    try {
      await run('pg_ctl', ['-D', data, 'status']);
      return { status: 'running', port: config.port };
    } catch (error) {
      if (error.code === 3) return { status: 'stopped', port: config.port };
      throw error;
    }
  };
  const start = async () => {
    const current = await status();
    if (current.status === 'running') return current;
    await run('pg_ctl', [
      '-D',
      data,
      '-l',
      join(directory, 'server.log'),
      '-o',
      `-h 127.0.0.1 -p ${current.port}`,
      '-w',
      '-t',
      '20',
      'start',
    ]);
    return status();
  };
  return {
    status,
    start,
    async configure() {
      const config = await configuration();
      const saved = await readFile(join(directory, 'connection.env'), 'utf8');
      const url = new URL(parse(saved).DATABASE_URL);
      if (
        url.protocol !== 'postgresql:' ||
        !url.password ||
        url.hostname !== '127.0.0.1' ||
        Number(url.port) !== config.port ||
        url.username !== 'flamengo_local' ||
        url.pathname !== '/flamengo_analytics'
      )
        throw new Error('LOCAL_POSTGRES_OWNERSHIP_MISMATCH');
      let backup = null;
      if (await exists(environmentFile)) {
        backup = `env-backup-${Date.now()}.env`;
        await copyFile(
          environmentFile,
          join(directory, backup),
          constants.COPYFILE_EXCL,
        );
      }
      await writeFile(environmentFile, saved, { mode: 0o600 });
      return { status: 'configured', port: config.port, backup };
    },
    async stop() {
      const current = await status();
      if (current.status === 'running')
        await run('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop']);
      return { status: 'stopped', port: current.port };
    },
    async setup() {
      if (await exists(directory)) throw new Error('LOCAL_POSTGRES_ALREADY_EXISTS');
      if ((await exists(environmentFile)) || process.env.DATABASE_URL)
        throw new Error('EXISTING_DATABASE_CONFIGURATION');
      await findBinaries();
      await mkdir(directory, { recursive: true });
      const config = { owner, directory, port: await freePort() };
      const password = randomBytes(32).toString('hex');
      const passwordFile = join(directory, 'password');
      await writeFile(marker, JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
      await writeFile(passwordFile, password, { flag: 'wx', mode: 0o600 });
      try {
        await run('initdb', [
          '-D',
          data,
          '-U',
          'flamengo_local',
          '--pwfile',
          passwordFile,
          '--auth',
          'scram-sha-256',
          '--encoding',
          'UTF8',
          '--locale',
          'C',
        ]);
      } finally {
        await unlink(passwordFile);
      }
      await start();
      try {
        await run(
          'createdb',
          [
            '-h',
            '127.0.0.1',
            '-p',
            String(config.port),
            '-U',
            'flamengo_local',
            'flamengo_analytics',
          ],
          { env: { ...process.env, PGPASSWORD: password } },
        );
        const url = `postgresql://flamengo_local:${password}@127.0.0.1:${config.port}/flamengo_analytics`;
        await writeFile(
          environmentFile,
          `HOST=127.0.0.1\nPORT=3001\nCORS_ORIGIN=http://127.0.0.1:5173\nLOG_LEVEL=info\nDATABASE_URL=${url}\n`,
          { flag: 'wx', mode: 0o600 },
        );
        await copyFile(
          environmentFile,
          join(directory, 'connection.env'),
          constants.COPYFILE_EXCL,
        );
      } catch (error) {
        await run('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop']);
        throw error;
      }
      return {
        status: 'created',
        port: config.port,
        database: 'flamengo_analytics',
        migrations: 'pending',
      };
    },
  };
}
