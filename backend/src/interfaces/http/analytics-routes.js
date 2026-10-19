import { z } from 'zod';
import { countMetrics, derivedMetrics } from '@flamengo-analytics/domain/metrics';
import { positions } from '../../domain/analytics.js';

const metric = z.enum(['matches', 'starts', ...countMetrics, ...derivedMetrics]);
const filters = {
  q: z.string().trim().max(100).optional(),
  position: z.enum(positions).optional(),
  min_minutes: z.coerce.number().int().min(0).max(10000).default(0),
};
const common = z.object(filters).strict();
const paging = common
  .extend({
    page: z.coerce.number().int().min(1).max(10000).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
    sort: z
      .enum(['display_name', 'position', 'matches', ...countMetrics, ...derivedMetrics])
      .default('display_name'),
    direction: z.enum(['asc', 'desc']).default('asc'),
  })
  .strict();
const ranking = common
  .extend({
    metric: metric.optional(),
    top: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict();
const comparison = common
  .extend({
    ids: z
      .string()
      .transform((value) => value.split(','))
      .pipe(
        z
          .array(z.string().uuid())
          .length(2)
          .refine((ids) => ids[0] !== ids[1]),
      ),
  })
  .strict();

function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  const needsPrefix =
    ['=', '+', '@', '-'].includes(text.trimStart()[0]) ||
    ['\t', '\r'].includes(text[0]);
  const safe = needsPrefix ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function registerAnalyticsRoutes(app, getAnalytics) {
  const routes = [
    ['data-quality', 'data-quality', z.object({}).strict()],
    ['references', 'references', z.object({}).strict()],
    ['summary', 'summary', common],
    ['dashboard/summary', 'summary', common],
    ['players', 'players', paging],
    ['rankings', 'rankings', ranking],
    ['rankings/goals', 'goals', ranking],
    ['rankings/assists', 'assists', ranking],
    ['rankings/contributions', 'contributions', ranking],
    ['analytics/offensive', 'offensive', ranking],
    ['analytics/defensive', 'defensive', ranking],
    ['analytics/positions', 'positions', common],
    [
      'analytics/distribution',
      'distribution',
      common.extend({ metric: metric.default('minutes') }),
    ],
    ['statistics', 'statistics', common],
    ['compare', 'compare', comparison],
    ['exports/players', 'exports', common],
  ];
  for (const [path, resource, schema] of routes) {
    app.get(`/api/${path}`, async (request, response) => {
      const result = schema.safeParse(request.query);
      if (!result.success)
        return response.status(400).json({ error: { code: 'INVALID_QUERY' } });
      response.set('Cache-Control', 'no-store');
      const document = await getAnalytics(resource, result.data);
      if (resource === 'players' && document.export_authorized)
        document.export_url =
          '/api/exports/players?' +
          new URLSearchParams(
            Object.entries(result.data).filter(
              ([key, value]) =>
                ['q', 'position', 'min_minutes'].includes(key) && value !== '',
            ),
          );
      if (resource === 'exports') {
        if (!document.authorized)
          return response.status(409).json({
            error: { code: 'EXPORT_NOT_AUTHORIZED' },
            availability: document.availability,
          });
        const fields = [
          'player_id',
          'display_name',
          'position',
          'matches',
          ...countMetrics,
          ...derivedMetrics,
        ];
        response.set(
          'Content-Disposition',
          'attachment; filename="flamengo-2025-players.csv"',
        );
        return response
          .type('text/csv')
          .send(
            '\uFEFF' +
              [fields, ...document.data.map((row) => fields.map((field) => row[field]))]
                .map((row) => row.map(csvCell).join(','))
                .join('\r\n'),
          );
      }
      response.json(document);
    });
  }
  app.get(['/api/players/:id', '/api/players/:id/stats'], async (request, response) => {
    const parsed = z.string().uuid().safeParse(request.params.id);
    if (!parsed.success || !z.object({}).strict().safeParse(request.query).success)
      return response.status(400).json({ error: { code: 'INVALID_QUERY' } });
    const document = await getAnalytics('player', { player_id: parsed.data });
    response
      .status(document.availability === 'available' && !document.found ? 404 : 200)
      .json(document);
  });
}
