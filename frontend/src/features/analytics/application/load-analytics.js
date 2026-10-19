import { assertAnalyticsScope } from '../domain/analytics.js';

export async function loadAnalytics(gateway, resource, filters, signal) {
  return assertAnalyticsScope(await gateway.get(resource, filters, signal));
}
