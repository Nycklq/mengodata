import { matchesAnalyticsScope } from '@flamengo-analytics/domain/scope';

export function seasonPreview(document) {
  const coverage = document?.coverage;
  const available =
    document?.availability === 'available' &&
    coverage?.status === 'verified' &&
    matchesAnalyticsScope(document.scope) &&
    coverage.matches === 380 &&
    coverage.rounds === 38 &&
    coverage.clubs === 20;
  return {
    available,
    coverage: available ? coverage : null,
    club: available ? (document.data?.club ?? null) : null,
    venues: available ? (document.data?.home_away ?? []) : [],
    clubs: available ? (document.data?.clubs ?? []) : [],
    source: available ? document.source : null,
  };
}

export function seasonComparison(summary, comparison) {
  return seasonPreview(summary).available &&
    seasonPreview(comparison).available &&
    summary.dataset_version === comparison.dataset_version &&
    Array.isArray(comparison.data)
    ? comparison.data
    : [];
}
