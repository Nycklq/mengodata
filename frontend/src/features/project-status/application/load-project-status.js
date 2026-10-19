import { assertProjectScope } from '../domain/project-status.js';

export async function loadProjectStatus(gateway, signal) {
  const metadata = await gateway.getMetadata(signal);
  return assertProjectScope(metadata);
}
