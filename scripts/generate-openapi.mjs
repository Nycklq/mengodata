import { writeFile } from 'node:fs/promises';
import { format } from 'prettier';
import configuration from '../prettier.config.js';
import { ANALYTICS_SCOPE } from '@flamengo-analytics/domain/scope';

const parameter = (name, schema) => ({ name, in: 'query', required: false, schema });
const common = [
  parameter('from_round', { type: 'integer', minimum: 1, maximum: 38, default: 1 }),
  parameter('to_round', { type: 'integer', minimum: 1, maximum: 38, default: 38 }),
  parameter('venue', { type: 'string', enum: ['home', 'away'] }),
  parameter('club_id', { type: 'string', pattern: '^club:[a-z-]+$' }),
];
const opponent = parameter('opponent_id', {
  type: 'string',
  pattern: '^club:[a-z-]+$',
});
const match = [
  ...common,
  opponent,
  parameter('result', { type: 'string', enum: ['W', 'D', 'L'] }),
  parameter('page', { type: 'integer', minimum: 1, maximum: 10000, default: 1 }),
  parameter('page_size', { type: 'integer', minimum: 1, maximum: 100, default: 20 }),
];
const routes = [
  ['health', []],
  ['metadata', []],
  ['clubs', []],
  ['data-quality', []],
  ['summary', common],
  ['dashboard/summary', common],
  ['matches', match],
  ['standings', common],
  ['evolution', common],
  ['compare', [...common, opponent]],
  ['analytics/offensive', common],
  ['analytics/defensive', common],
  ['statistics', common],
  ['exports/matches', match],
];
const paths = {};
for (const [path, parameters] of routes) {
  const csv = path.startsWith('exports/');
  paths['/api/' + path] = {
    get: {
      operationId: path.replaceAll('/', '_'),
      summary: path,
      description:
        'Série A masculina 2025, rodadas oficiais 1–38. Janela inclusiva, clubes canônicos e parâmetros desconhecidos recusados. Classificação calculada. Adversário/resultado em partidas exigem club_id; comparação exige clubes distintos. CSV ignora paginação e mantém filtros.',
      parameters,
      responses: {
        200: {
          description: csv
            ? 'CSV UTF-8 com BOM e recorte filtrado.'
            : 'Envelope válido; data=null se publicação indisponível.',
          content: csv
            ? { 'text/csv': { schema: { type: 'string' } } }
            : {
                'application/json': {
                  schema: ['health', 'metadata'].includes(path)
                    ? { type: 'object' }
                    : { $ref: '#/components/schemas/AnalyticsEnvelope' },
                },
              },
        },
        400: { description: 'INVALID_QUERY ou UNKNOWN_CLUB' },
        ...(csv ? { 409: { description: 'DATA_UNAVAILABLE' } } : {}),
        429: { description: 'RATE_LIMITED; Retry-After em segundos' },
        500: { description: 'INTERNAL_ERROR sem detalhes sensíveis' },
      },
    },
  };
}
const document = {
  openapi: '3.1.0',
  info: {
    title: 'MengoData — desempenho coletivo 2025',
    version: '0.3.0',
    description:
      '20 clubes, 380 resultados reais OpenFootball CC0. Sem estatísticas individuais. Pontos 3/1/0; taxas calculadas por componentes do mesmo recorte.',
  },
  servers: [{ url: 'http://127.0.0.1:3001' }],
  paths,
  components: {
    schemas: {
      AnalyticsEnvelope: {
        type: 'object',
        required: [
          'schema_version',
          'scope',
          'availability',
          'reason',
          'coverage',
          'source',
          'dataset_version',
          'data',
        ],
        properties: {
          schema_version: { const: 1 },
          scope: { const: ANALYTICS_SCOPE },
          availability: { enum: ['unavailable', 'available'] },
          reason: { type: ['string', 'null'] },
          coverage: { type: ['object', 'null'] },
          source: { type: ['object', 'null'] },
          dataset_version: { type: ['string', 'null'] },
          ranking_note: { type: 'string' },
          data: {
            type: ['object', 'array', 'null'],
            description:
              'Clubes: lista; partidas: rows/total/page/page_size; resumo: club/home_away/clubs/league; classificação: rows/round/label; evolução/comparação: lista; estatísticas: goals_for/points/distribution/results/season_statistics.',
          },
        },
      },
    },
  },
};
await writeFile(
  new URL('../docs/api/openapi.json', import.meta.url),
  await format(JSON.stringify(document), { ...configuration, parser: 'json' }),
);
