import { readEnvironment } from '../infrastructure/config/environment.js';
import { checkConnection } from '../infrastructure/persistence/check-connection.js';
import { createPostgresPool } from '../infrastructure/persistence/postgres-pool.js';

let pool;
try {
  readEnvironment();
  pool = createPostgresPool(process.env.DATABASE_URL);
  process.stdout.write(JSON.stringify(await checkConnection(pool)) + '\n');
} catch (error) {
  const code =
    error.message === 'DATABASE_URL_REQUIRED'
      ? 'DATABASE_URL_REQUIRED'
      : 'DATABASE_CHECK_FAILED';
  process.stderr.write(JSON.stringify({ error: code }) + '\n');
  process.exitCode = 1;
} finally {
  await pool?.end();
}
