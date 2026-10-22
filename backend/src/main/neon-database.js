import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { readNeonConnection } from '../infrastructure/config/neon-environment.js';
import { createPostgresPool } from '../infrastructure/persistence/postgres-pool.js';
import { createCollectiveFiles } from '../infrastructure/persistence/collective-files.js';
import { createPostgresCollective } from '../infrastructure/persistence/postgres-collective.js';
import { checkConnection } from '../infrastructure/persistence/check-connection.js';
import { describeDatabaseError } from '../infrastructure/persistence/database-error.js';
import { migrate } from '../infrastructure/persistence/migrate.js';

const command = process.argv[2];
const expectedErrors = new Set([
  'INVALID_NEON_DATABASE_COMMAND',
  'NEON_DATABASE_URL_REQUIRED',
  'INVALID_NEON_DATABASE_URL',
  'NEON_DIRECT_CONNECTION_REQUIRED',
  'DATABASE_TLS_REQUIRED',
  'INVALID_DATABASE_TLS_CONFIGURATION',
  'COLLECTIVE_DATA_REQUIRED',
  'COLLECTIVE_SNAPSHOT_MISMATCH',
]);
let pool;
try {
  if (
    !['check', 'migrate', 'import', 'verify'].includes(command) ||
    process.argv.length !== 3
  )
    throw new Error('INVALID_NEON_DATABASE_COMMAND');
  pool = createPostgresPool(readNeonConnection());
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const files = createCollectiveFiles(root);
  const repository = createPostgresCollective(pool, files);
  let result;
  if (command === 'check') result = await checkConnection(pool);
  if (command === 'migrate')
    result = {
      applied: await migrate(
        pool,
        fileURLToPath(
          new URL('../../../database/collective-migrations', import.meta.url),
        ),
        'collective_migrations',
      ),
    };
  if (command === 'import' || command === 'verify') {
    const document = await files.read();
    if (!document) throw new Error('COLLECTIVE_DATA_REQUIRED');
    if (command === 'import') result = await repository.store(document);
    else {
      if (!isDeepStrictEqual(await repository.read(), document))
        throw new Error('COLLECTIVE_SNAPSHOT_MISMATCH');
      result = {
        status: 'ok',
        dataset_version: document.dataset_version,
        matches: document.matches.length,
        team_matches: document.team_matches.length,
        clubs: document.clubs.length,
        rounds: document.coverage.rounds,
      };
    }
  }
  process.stdout.write(JSON.stringify({ target: 'neon', command, ...result }) + '\n');
} catch (error) {
  process.stderr.write(
    JSON.stringify({
      error: expectedErrors.has(error.message)
        ? error.message
        : 'NEON_DATABASE_OPERATION_FAILED',
      ...(pool ? { database_error: describeDatabaseError(error) } : {}),
    }) + '\n',
  );
  process.exitCode = 1;
} finally {
  await pool?.end();
}
