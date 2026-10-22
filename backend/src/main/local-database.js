import { fileURLToPath } from 'node:url';
import { createLocalPostgres } from '../infrastructure/persistence/local-postgres.js';

const action = process.argv[2];
try {
  if (!['setup', 'start', 'stop', 'status', 'configure'].includes(action))
    throw new Error('INVALID_LOCAL_DATABASE_ACTION');
  const database = createLocalPostgres(
    fileURLToPath(new URL('../../../', import.meta.url)),
  );
  process.stdout.write(JSON.stringify(await database[action]()) + '\n');
} catch (error) {
  const allowed = [
    'INVALID_LOCAL_DATABASE_ACTION',
    'POSTGRES_BINARIES_REQUIRED',
    'LOCAL_POSTGRES_ALREADY_EXISTS',
    'EXISTING_DATABASE_CONFIGURATION',
    'LOCAL_POSTGRES_OWNERSHIP_MISMATCH',
  ];
  process.stderr.write(
    JSON.stringify({
      error: allowed.includes(error.message)
        ? error.message
        : 'LOCAL_DATABASE_OPERATION_FAILED',
    }) + '\n',
  );
  process.exitCode = 1;
}
