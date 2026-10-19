import definition from '../../../contracts/scope.json' with { type: 'json' };

export const ANALYTICS_SCOPE = Object.freeze({ ...definition });

export const SCOPE_LABEL =
  'Brasileirão Série A 2025 — temporada completa (rodadas 1 a 38)';

export function matchesAnalyticsScope(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    Object.keys(value).length === Object.keys(ANALYTICS_SCOPE).length &&
    Object.entries(ANALYTICS_SCOPE).every(([key, expected]) => value[key] === expected)
  );
}
