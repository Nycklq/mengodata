import { expect, it, vi } from 'vitest';
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

it('uses the production API origin with filters and cancellation, without changing the local default', async () => {
  const syntheticEnvelope = {
    schema_version: 1,
    scope: {
      competition_id: 'competition:brasileirao-serie-a-men',
      season: 2025,
      team_id: 'club:flamengo',
      first_round: 1,
      last_round: 38,
    },
    availability: 'unavailable',
    reason: 'synthetic-fixture',
    coverage: null,
    dataset_version: null,
    source: null,
  };
  const fetchRequest = vi.fn(async () => Response.json(syntheticEnvelope));
  const signal = new AbortController().signal;
  const publicGateway = createHttpAnalyticsGateway(
    fetchRequest,
    'https://api.example.invalid/',
  );
  await publicGateway.get(
    'matches',
    { from_round: 12, to_round: 12, venue: '' },
    signal,
  );
  expect(fetchRequest).toHaveBeenLastCalledWith(
    'https://api.example.invalid/api/matches?from_round=12&to_round=12',
    { signal },
  );
  await createHttpAnalyticsGateway(fetchRequest).get('clubs');
  expect(fetchRequest).toHaveBeenLastCalledWith('/api/clubs', { signal: undefined });
});

it.each([
  'http://api.example.invalid',
  'https://api.example.invalid/api',
  'https://api.example.invalid?token=synthetic',
  'https://api.example.invalid/#fragment',
  'https://synthetic:secret@api.example.invalid',
  'javascript:synthetic',
])(
  'rejects unsafe or ambiguous API configuration before making requests: %s',
  (origin) => {
    const fetchRequest = vi.fn();
    expect(() => createHttpAnalyticsGateway(fetchRequest, origin)).toThrow(
      'INVALID_API_ORIGIN',
    );
    expect(fetchRequest).not.toHaveBeenCalled();
  },
);
