import { fileURLToPath } from 'node:url';

import { readEnvironment } from '../infrastructure/config/environment.js';
import { migrate } from '../infrastructure/persistence/migrate.js';
import { createPostgresPool } from '../infrastructure/persistence/postgres-pool.js';

readEnvironment();
let pool;
try {
  pool = createPostgresPool(process.env.DATABASE_URL);
  const directory = fileURLToPath(
    new URL('../../../database/collective-migrations', import.meta.url),
  );
  const applied = await migrate(pool, directory, 'collective_migrations');
  process.stdout.write(JSON.stringify({ applied }) + '\n');
} catch {
  process.stderr.write('Falha na migração. Verifique a configuração e o histórico.\n');
  process.exitCode = 1;
} finally {
  await pool?.end();
}
