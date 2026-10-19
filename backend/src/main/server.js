import pino from 'pino';
import { fileURLToPath } from 'node:url';
import { createAnalyticsService } from '../application/get-analytics.js';
import { createAnalyticsFiles } from '../infrastructure/persistence/analytics-files.js';
import { createPostgresAnalytics } from '../infrastructure/persistence/postgres-analytics.js';
import { createPostgresPool } from '../infrastructure/persistence/postgres-pool.js';

import { getProjectMetadata } from '../application/get-project-metadata.js';
import { readEnvironment } from '../infrastructure/config/environment.js';
import { createApp } from '../interfaces/http/create-app.js';

const environment = readEnvironment();
const files = createAnalyticsFiles({
  root: fileURLToPath(new URL('../../../', import.meta.url)),
});
const pool = process.env.DATABASE_URL
  ? createPostgresPool(process.env.DATABASE_URL)
  : null;
const logger = pino({
  level: environment.LOG_LEVEL,
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.headers["x-api-key"]',
  ],
});
const app = createApp({
  getMetadata: getProjectMetadata,
  getAnalytics: createAnalyticsService(
    pool ? createPostgresAnalytics(pool, files) : files,
  ),
  logger,
  corsOrigin: environment.CORS_ORIGIN,
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
