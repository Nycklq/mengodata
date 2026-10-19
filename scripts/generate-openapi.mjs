import { writeFile } from 'node:fs/promises';
import { format } from 'prettier';
import configuration from '../prettier.config.js';
import { countMetrics, derivedMetrics } from '@flamengo-analytics/domain/metrics';
import { ANALYTICS_SCOPE } from '@flamengo-analytics/domain/scope';

const parameter = (name, schema, required = false) => ({
  name,
  in: 'query',
  required,
  schema,
});
const metrics = ['matches', 'starts', ...countMetrics, ...derivedMetrics];
const common = [
  parameter('q', { type: 'string', maxLength: 100 }),
  parameter('position', {
    type: 'string',
    enum: ['goalkeeper', 'defender', 'midfielder', 'forward', 'unknown'],
  }),
  parameter('min_minutes', { type: 'integer', minimum: 0, maximum: 10000, default: 0 }),
];
const metric = parameter('metric', { type: 'string', enum: metrics });
const ranking = [
  ...common,
  metric,
  parameter('top', { type: 'integer', minimum: 1, maximum: 50, default: 10 }),
];
const paths = {};
const routes = [
  ['health', []],
  ['metadata', []],
  ['data-quality', []],
  ['references', []],
  ['dashboard/summary', common],
  ['summary', common],
  [
    'players',
    [
      ...common,
      parameter('page', { type: 'integer', minimum: 1, maximum: 10000, default: 1 }),
      parameter('page_size', {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
      }),
      parameter('sort', {
        type: 'string',
        enum: ['display_name', 'position', ...metrics],
        default: 'display_name',
      }),
      parameter('direction', { type: 'string', enum: ['asc', 'desc'], default: 'asc' }),
    ],
  ],
  ['players/{id}', []],
  ['players/{id}/stats', []],
  ['rankings', ranking],
  ['rankings/goals', ranking],
  ['rankings/assists', ranking],
  ['rankings/contributions', ranking],
  ['analytics/offensive', ranking],
  ['analytics/defensive', ranking],
  ['analytics/positions', common],
  ['analytics/distribution', [...common, metric]],
  ['statistics', common],
  [
    'compare',
    [
      ...common,
      parameter(
        'ids',
        { type: 'string', description: 'Dois UUIDs distintos separados por vírgula' },
        true,
      ),
    ],
  ],
  ['exports/players', common],
];
for (const [path, parameters] of routes) {
  const individual = path.startsWith('players/{id}');
  const analytical = !['health', 'metadata'].includes(path);
  const exporting = path === 'exports/players';
  paths['/api/' + path] = {
    get: {
      operationId: path.replaceAll('/', '_').replaceAll(/[{}]/g, ''),
      summary: path,
      description: analytical
        ? 'Escopo fixo Flamengo/2025/rodadas oficiais 1–38. HTTP 200 pode representar indisponibilidade ou cobertura parcial. Parâmetros desconhecidos são rejeitados.'
        : 'Saúde do processo ou contrato inicial de prontidão individual.',
      parameters: individual
        ? [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
            ...parameters,
          ]
        : parameters,
      responses: {
        200: {
          description: exporting
            ? 'CSV autorizado; nulos vazios, UTF-8 e células protegidas contra fórmulas.'
            : 'Resposta válida, inclusive estado indisponível.',
          content: exporting
            ? { 'text/csv': { schema: { type: 'string' } } }
            : {
                'application/json': {
                  schema: analytical
                    ? { $ref: '#/components/schemas/AnalyticsEnvelope' }
                    : { type: 'object' },
                },
              },
        },
        400: { $ref: '#/components/responses/InvalidQuery' },
        ...(individual
          ? { 404: { description: 'Jogador não encontrado em dataset disponível.' } }
          : {}),
        ...(exporting
          ? {
              409: {
                description:
                  'EXPORT_NOT_AUTHORIZED: sem fonte ou direitos específicos de exportação.',
              },
            }
          : {}),
        429: { $ref: '#/components/responses/RateLimited' },
        500: { $ref: '#/components/responses/InternalError' },
      },
    },
  };
}
const error = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code'],
      properties: { code: { type: 'string' } },
    },
  },
};
const response = (description) => ({
  description,
  content: { 'application/json': { schema: error } },
});
const document = {
  openapi: '3.1.0',
  info: {
    title: 'Flamengo Analytics 2025',
    version: '0.2.0',
    description:
      'API local de análise individual. Fonte individual ainda não homologada. Referências auxiliares CC0 não comprovam cobertura estatística.',
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
          'dataset_version',
          'source',
        ],
        properties: {
          schema_version: { const: 1 },
          scope: { const: ANALYTICS_SCOPE },
          availability: { enum: ['unavailable', 'partial', 'available'] },
          reason: { type: ['string', 'null'] },
          coverage: { type: ['object', 'null'] },
          dataset_version: { type: ['string', 'null'] },
          source: { type: ['object', 'null'] },
          data: {
            description:
              'Objeto, lista ou null conforme o recurso. Valores desconhecidos permanecem null; listas vazias não representam zeros esportivos.',
            type: ['object', 'array', 'null'],
          },
        },
      },
      Error: error,
    },
    responses: {
      InvalidQuery: response(
        'INVALID_QUERY: parâmetro, UUID, limite ou ordenação inválida.',
      ),
      RateLimited: {
        ...response(
          'RATE_LIMITED: máximo de 300 requisições por IP em 60 segundos, processo local.',
        ),
        headers: {
          'Retry-After': {
            schema: { type: 'integer' },
            description: 'Segundos até nova tentativa',
          },
        },
      },
      InternalError: response(
        'INTERNAL_ERROR: falha interna sem exposição de detalhes.',
      ),
    },
  },
};
await writeFile(
  new URL('../docs/api/openapi.json', import.meta.url),
  await format(JSON.stringify(document), { ...configuration, parser: 'json' }),
);
