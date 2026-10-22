import { fileURLToPath } from 'node:url';
import pino from 'pino';
import { createServer } from 'vite';
import { createApp } from '../../backend/src/interfaces/http/create-app.js';
import { createCollectiveService } from '../../backend/src/application/get-collective.js';
import { createCollectiveFiles } from '../../backend/src/infrastructure/persistence/collective-files.js';
import { getProjectMetadata } from '../../backend/src/application/get-project-metadata.js';

const root = fileURLToPath(new URL('../..', import.meta.url));
const collective = createCollectiveService(createCollectiveFiles(root));
const app = createApp({
  getMetadata: getProjectMetadata,
  getCollective: collective,
  logger: pino({ level: 'silent' }),
  corsOrigin: 'http://127.0.0.1:4174',
  rateLimit: 10000,
});
const api = app.listen(0, '127.0.0.1');
await new Promise((resolve) => api.once('listening', resolve));
const vite = await createServer({
  root: fileURLToPath(new URL('..', import.meta.url)),
  configFile: fileURLToPath(new URL('../vite.config.js', import.meta.url)),
  logLevel: 'error',
  server: {
    host: '127.0.0.1',
    port: 4174,
    strictPort: true,
    proxy: { '/api': `http://127.0.0.1:${api.address().port}` },
  },
});
await vite.listen();
for (const signal of ['SIGINT', 'SIGTERM'])
  process.once(signal, async () => {
    await vite.close();
    api.close();
  });
