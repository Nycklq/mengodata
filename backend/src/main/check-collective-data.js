import { fileURLToPath } from 'node:url';
import { createCollectiveFiles } from '../infrastructure/persistence/collective-files.js';

try {
  if (Number(process.versions.node.split('.')[0]) !== 24)
    throw new Error('NODE_24_REQUIRED');
  const files = createCollectiveFiles(
    fileURLToPath(new URL('../../../', import.meta.url)),
  );
  const document = await files.read();
  if (!document) throw new Error('COLLECTIVE_DATA_REQUIRED');
  process.stdout.write(
    JSON.stringify({
      status: 'ok',
      dataset_version: document.dataset_version,
      coverage: document.coverage,
      team_matches: document.team_matches.length,
    }) + '\n',
  );
} catch {
  process.stderr.write('COLLECTIVE_DATA_CHECK_FAILED\n');
  process.exitCode = 1;
}
