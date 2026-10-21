import { z } from 'zod';

const club = z
  .string()
  .regex(/^club:[a-z-]+$/)
  .max(50);
const window = {
  from_round: z.coerce.number().int().min(1).max(38).default(1),
  to_round: z.coerce.number().int().min(1).max(38).default(38),
  venue: z.enum(['home', 'away']).optional(),
};
const common = z
  .object({ ...window, club_id: club.optional() })
  .strict()
  .refine((value) => value.from_round <= value.to_round);
const matchFilters = z
  .object({
    ...window,
    club_id: club.optional(),
    opponent_id: club.optional(),
    result: z.enum(['W', 'D', 'L']).optional(),
    page: z.coerce.number().int().min(1).max(10000).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict()
  .refine(
    (value) =>
      value.from_round <= value.to_round &&
      ((!value.opponent_id && !value.result) || Boolean(value.club_id)),
  );
const compare = z
  .object({
    ...window,
    club_id: club.default('club:flamengo'),
    opponent_id: club.default('club:palmeiras'),
  })
  .strict()
  .refine(
    (value) =>
      value.from_round <= value.to_round && value.club_id !== value.opponent_id,
  );
const empty = z.object({}).strict();

function csvCell(value) {
  const text = String(value ?? '');
  return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`;
}

export function registerCollectiveRoutes(app, service) {
  for (const [path, resource, schema] of [
    ['clubs', 'clubs', empty],
    ['data-quality', 'data-quality', empty],
    ['summary', 'summary', common],
    ['dashboard/summary', 'summary', common],
    ['matches', 'matches', matchFilters],
    ['standings', 'standings', common],
    ['evolution', 'evolution', common],
    ['compare', 'compare', compare],
    ['analytics/offensive', 'offensive', common],
    ['analytics/defensive', 'defensive', common],
    ['statistics', 'statistics', common],
    ['exports/matches', 'exports', matchFilters],
  ]) {
    app.get(`/api/${path}`, async (request, response) => {
      const parsed = schema.safeParse(request.query);
      if (!parsed.success)
        return response.status(400).json({ error: { code: 'INVALID_QUERY' } });
      const catalogue = await service('clubs');
      for (const id of [parsed.data.club_id, parsed.data.opponent_id].filter(Boolean)) {
        if (catalogue.data && !catalogue.data.some((row) => row.club_id === id))
          return response.status(400).json({ error: { code: 'UNKNOWN_CLUB' } });
      }
      const document =
        resource === 'clubs' ? catalogue : await service(resource, parsed.data);
      response.set('Cache-Control', 'no-store');
      if (resource === 'exports') {
        if (!document.data)
          return response.status(409).json({ error: { code: 'DATA_UNAVAILABLE' } });
        const fields = [
          'match_id',
          'competition_id',
          'season',
          'official_round',
          'date',
          'home_id',
          'home_name',
          'away_id',
          'away_name',
          'home_goals',
          'away_goals',
          'source_id',
          'source_locator',
          'collected_at',
          'dataset_version',
          'source_url',
          'license',
        ];
        response.set(
          'Content-Disposition',
          'attachment; filename="brasileirao-2025-partidas.csv"',
        );
        return response.type('text/csv').send(
          '\uFEFF' +
            [
              fields,
              ...document.data.map((row) => {
                const exported = {
                  ...row,
                  dataset_version: document.dataset_version,
                  source_url: document.source.url,
                  license: document.source.license,
                };
                return fields.map((key) => exported[key]);
              }),
            ]
              .map((row) => row.map(csvCell).join(','))
              .join('\r\n'),
        );
      }
      response.json(document);
    });
  }
}
