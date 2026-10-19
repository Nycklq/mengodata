import {
  aggregateAppearances,
  describeDistribution,
} from '@flamengo-analytics/domain/metrics';
import { ANALYTICS_SCOPE } from '@flamengo-analytics/domain/scope';

export const positions = ['goalkeeper', 'defender', 'midfielder', 'forward', 'unknown'];

export function eligibleRows(rows) {
  return rows.filter(
    (row) =>
      row.season === 2025 &&
      row.competition_id === ANALYTICS_SCOPE.competition_id &&
      row.team_id === ANALYTICS_SCOPE.team_id &&
      Number.isInteger(row.official_round) &&
      row.official_round >= 1 &&
      row.official_round <= 38,
  );
}

export function playerSummaries(snapshot) {
  const rows = eligibleRows(snapshot.appearances);
  return snapshot.players.map((player) => ({
    ...player,
    ...aggregateAppearances(rows.filter((row) => row.player_id === player.player_id)),
  }));
}

export function filterPlayers(players, filters = {}) {
  return players.filter(
    (player) =>
      (!filters.q ||
        player.display_name
          .toLocaleLowerCase('pt-BR')
          .includes(filters.q.toLocaleLowerCase('pt-BR'))) &&
      (!filters.position || player.position === filters.position) &&
      (filters.min_minutes === 0 ||
        !filters.min_minutes ||
        (player.minutes !== null && player.minutes >= filters.min_minutes)),
  );
}

export function sortPlayers(players, sort = 'display_name', direction = 'asc') {
  return [...players].sort((a, b) => {
    if (a[sort] === null && b[sort] !== null) return 1;
    if (b[sort] === null && a[sort] !== null) return -1;
    const compared =
      typeof a[sort] === 'string'
        ? a[sort].localeCompare(b[sort], 'pt-BR')
        : (a[sort] ?? 0) - (b[sort] ?? 0);
    return (
      (direction === 'desc' ? -compared : compared) ||
      a.player_id.localeCompare(b.player_id)
    );
  });
}

export function distribution(players, metric) {
  return {
    metric,
    ...describeDistribution(
      players.map((player) => player[metric]).filter((value) => value !== null),
    ),
  };
}

export function analyticsEnvelope(snapshot) {
  return {
    schema_version: 1,
    scope: ANALYTICS_SCOPE,
    availability: snapshot.availability,
    reason: snapshot.reason,
    coverage: snapshot.coverage,
    dataset_version: snapshot.dataset_version,
    source: snapshot.source,
  };
}
