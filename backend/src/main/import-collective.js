import { fileURLToPath } from 'node:url';
import { readEnvironment } from '../infrastructure/config/environment.js';
import { createCollectiveFiles } from '../infrastructure/persistence/collective-files.js';
import { createPostgresCollective } from '../infrastructure/persistence/postgres-collective.js';
import { createPostgresPool } from '../infrastructure/persistence/postgres-pool.js';

readEnvironment();
let pool;
try {
  pool = createPostgresPool(process.env.DATABASE_URL);
  const files = createCollectiveFiles(
    fileURLToPath(new URL('../../../', import.meta.url)),
  );
  const document = await files.read();
  if (!document) throw new Error('RUN_COLLECTIVE_PIPELINE_FIRST');
  const result = await createPostgresCollective(pool, files).store(document);
  process.stdout.write(JSON.stringify(result) + '\n');
} catch (error) {
  process.stderr.write(
    JSON.stringify({
      error:
        error.message === 'DATABASE_URL_REQUIRED'
          ? error.message
          : 'COLLECTIVE_DATABASE_IMPORT_FAILED',
    }) + '\n',
  );
  process.exitCode = 1;
} finally {
  await pool?.end();
}
