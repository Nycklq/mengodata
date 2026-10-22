import { expect, it } from 'vitest';
import { createHttpAnalyticsGateway } from '../src/features/analytics/infrastructure/http-analytics-gateway.js';

it.each([
  [400, 'INVALID_ANALYTICS_FILTERS'],
  [500, 'ANALYTICS_UNAVAILABLE'],
])('traduz HTTP %s sem revelar o corpo da falha', async (status, code) => {
  const gateway = createHttpAnalyticsGateway(async () => ({
    ok: false,
    status,
    json: () => {
      throw new Error('must not read internal diagnostics');
    },
  }));
  await expect(gateway.get('compare')).rejects.toMatchObject({
    message: 'ANALYTICS_REQUEST_FAILED',
    code,
  });
});
