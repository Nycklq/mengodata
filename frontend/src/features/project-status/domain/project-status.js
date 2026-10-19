import { matchesAnalyticsScope } from '@flamengo-analytics/domain/scope';

export function assertProjectScope(metadata) {
  if (!matchesAnalyticsScope(metadata.scope)) {
    throw new Error('PROJECT_SCOPE_MISMATCH');
  }
  return metadata;
}
