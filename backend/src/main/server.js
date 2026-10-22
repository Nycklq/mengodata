import pino from 'pino';
import { fileURLToPath } from 'node:url';
import { createCollectiveService } from '../application/get-collective.js';
import { createCollectiveFiles } from '../infrastructure/persistence/collective-files.js';
import { createPostgresCollective } from '../infrastructure/persistence/postgres-collective.js';
import { createPostgresPool } from '../infrastructure/persistence/postgres-pool.js';

import { getProjectMetadata } from '../application/get-project-metadata.js';
import { readEnvironment } from '../infrastructure/config/environment.js';
import { createApp } from '../interfaces/http/create-app.js';

const environment = readEnvironment();
const files = createCollectiveFiles(
  fileURLToPath(new URL('../../../', import.meta.url)),
);
const pool = environment.DATABASE_URL
  ? createPostgresPool(environment.DATABASE_URL)
  : null;
const logger = pino({
  level: environment.LOG_LEVEL,
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.headers["x-api-key"]',
  ],
});
const collective = createCollectiveService(
  pool ? createPostgresCollective(pool, files) : files,
);
const app = createApp({
  getMetadata: async () => {
    const document = await collective('data-quality');
    return {
      ...getProjectMetadata(),
      source_status: document.source ? 'approved' : 'pending',
      data_status: document.availability,
      dataset_version: document.dataset_version,
      coverage: document.coverage,
      source: document.source,
      analysis_unit: 'club_match',
    };
  },
  getCollective: collective,
  logger,
  corsOrigin: environment.CORS_ORIGIN,
  trustProxyHops: environment.TRUST_PROXY_HOPS,
});
const server = app.listen(environment.PORT, environment.HOST, () => {
  logger.info({ port: environment.PORT }, 'API iniciada');
});
server.on('error', () => {
  logger.error({ code: 'LISTEN_FAILED' }, 'Não foi possível iniciar a API');
  process.exitCode = 1;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    server.close(async () => {
      await pool?.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
