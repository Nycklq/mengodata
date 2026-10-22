import { z } from 'zod';

const envelope = z
  .object({
    schema_version: z.literal(1),
    scope: z
      .object({
        competition_id: z.string(),
        season: z.number().int(),
        team_id: z.string(),
        first_round: z.number().int(),
        last_round: z.number().int(),
      })
      .strict(),
    availability: z.enum(['available', 'partial', 'unavailable']),
    reason: z.string().nullable(),
    coverage: z.object({}).passthrough().nullable(),
    dataset_version: z.string().nullable(),
    source: z.object({}).passthrough().nullable(),
  })
  .passthrough();
export function createHttpAnalyticsGateway(fetchRequest = globalThis.fetch) {
  return {
    async get(resource, filters = {}, signal) {
      const parameters = new URLSearchParams(
        Object.entries(filters).filter(
          ([, value]) => value !== '' && value !== undefined && value !== null,
        ),
      );
      const response = await fetchRequest(
        `/api/${resource}${parameters.size ? '?' + parameters : ''}`,
        { signal },
      );
      if (!response.ok) {
        const error = new Error('ANALYTICS_REQUEST_FAILED');
        error.code =
          response.status === 400
            ? 'INVALID_ANALYTICS_FILTERS'
            : 'ANALYTICS_UNAVAILABLE';
        throw error;
      }
      return envelope.parse(await response.json());
    },
  };
}
