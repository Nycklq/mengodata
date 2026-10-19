import { z } from 'zod';

const metadataSchema = z
  .object({
    schema_version: z.literal(2),
    scope: z
      .object({
        competition_id: z.string(),
        season: z.number().int(),
        team_id: z.string(),
        first_round: z.number().int(),
        last_round: z.number().int(),
      })
      .strict(),
    label: z.string().min(1),
    source_status: z.literal('pending'),
    data_status: z.literal('unavailable'),
    dataset_version: z.null(),
    coverage: z.null(),
  })
  .strict();

export function createHttpProjectGateway(fetchRequest = globalThis.fetch) {
  return {
    async getMetadata(signal) {
      const response = await fetchRequest('/api/metadata', { signal });
      if (!response.ok) throw new Error('METADATA_REQUEST_FAILED');
      return metadataSchema.parse(await response.json());
    },
  };
}
