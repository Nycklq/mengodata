import { fileURLToPath } from 'node:url';
import { readEnvironment } from '../infrastructure/config/environment.js';
import { createAnalyticsFiles } from '../infrastructure/persistence/analytics-files.js';
import { createPostgresPool } from '../infrastructure/persistence/postgres-pool.js';
import { createPostgresStatistics } from '../infrastructure/persistence/postgres-statistics.js';
import { importStatistics } from '../application/import-statistics.js';

readEnvironment();
const files = createAnalyticsFiles({
  purpose: 'storage',
  root: fileURLToPath(new URL('../../../', import.meta.url)),
});
let pool;
try {
  const snapshot = await files.read();
  if (snapshot.storage_authorized !== true)
    throw new Error('STATISTICS_STORAGE_NOT_AUTHORIZED');
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL_REQUIRED');
  pool = createPostgresPool(process.env.DATABASE_URL);
  process.stdout.write(
    JSON.stringify(
      await importStatistics(() => files.read(), createPostgresStatistics(pool)),
    ) + '\n',
  );
} catch {
  process.stderr.write(
    JSON.stringify({ error: 'STATISTICS_IMPORT_BLOCKED_OR_FAILED' }) + '\n',
  );
  process.exitCode = 1;
} finally {
  await pool?.end();
}
