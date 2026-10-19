import { aggregateAppearances } from '@flamengo-analytics/domain/metrics';
import {
  analyticsEnvelope,
  distribution,
  eligibleRows,
  filterPlayers,
  playerSummaries,
  sortPlayers,
} from '../domain/analytics.js';

export function createAnalyticsService(repository) {
  return async function getAnalytics(resource, filters = {}) {
    const snapshot = await repository.read();
    const envelope = analyticsEnvelope(snapshot);
    const ready =
      snapshot.availability === 'available' || snapshot.availability === 'partial';
    const players = ready ? filterPlayers(playerSummaries(snapshot), filters) : [];
    const metrics = ['matches', 'minutes', 'goals', 'assists', 'contributions'];
    const base = { ...envelope, filters };
    if (resource === 'data-quality')
      return {
        ...base,
        individual_statistics_ready: snapshot.availability === 'available',
        permissions: snapshot.permissions,
        references: snapshot.references,
        metric_definitions_version: 1,
      };
    if (resource === 'references')
      return {
        ...base,
        data: snapshot.references?.matches ?? [],
        reference_kind: 'auxiliary',
        official_mapping_verified: false,
      };
    if (resource === 'summary')
      return {
        ...base,
        data:
          snapshot.availability === 'available'
            ? {
                players: players.length,
                ...aggregateAppearances(
                  eligibleRows(snapshot.appearances).filter((row) =>
                    players.some((player) => player.player_id === row.player_id),
                  ),
                ),
              }
            : {
                players: null,
                ...Object.fromEntries(metrics.map((metric) => [metric, null])),
              },
      };
    if (resource === 'players') {
      const ordered = sortPlayers(players, filters.sort, filters.direction);
      const page = filters.page ?? 1;
      const pageSize = filters.page_size ?? 20;
      return {
        ...base,
        data: ordered.slice((page - 1) * pageSize, page * pageSize),
        pagination: {
          page,
          page_size: pageSize,
          total: ready ? players.length : null,
          pages: ready ? Math.ceil(players.length / pageSize) : null,
        },
        export_authorized: ready && snapshot.permissions.csv_export === true,
      };
    }
    if (resource === 'player') {
      const player = players.find((item) => item.player_id === filters.player_id);
      return {
        ...base,
        data: player ?? null,
        appearances: player
          ? eligibleRows(snapshot.appearances)
              .filter((row) => row.player_id === filters.player_id)
              .toSorted((a, b) => a.official_round - b.official_round)
          : [],
        found: Boolean(player),
      };
    }
    if (resource === 'compare') {
      const selected = (filters.ids ?? [])
        .map((id) => players.find((player) => player.player_id === id))
        .filter(Boolean);
      return {
        ...base,
        data: selected,
        position_warning:
          selected.length === 2 && selected[0].position !== selected[1].position,
        complete: selected.length === 2,
        differences:
          selected.length === 2
            ? Object.fromEntries(
                [
                  'minutes',
                  'goals',
                  'assists',
                  'contributions',
                  'goals_per90',
                  'tackles',
                  'pass_accuracy_pct',
                ].map((metric) => [
                  metric,
                  selected.every((player) => typeof player[metric] === 'number')
                    ? selected[0][metric] - selected[1][metric]
                    : null,
                ]),
              )
            : null,
      };
    }
    if (resource === 'distribution')
      return { ...base, data: distribution(players, filters.metric ?? 'minutes') };
    if (resource === 'positions')
      return {
        ...base,
        data: [...new Set(players.map((player) => player.position))].map(
          (position) => ({
            position,
            players: players.filter((player) => player.position === position).length,
          }),
        ),
      };
    if (resource === 'exports')
      return {
        ...base,
        authorized: ready && snapshot.permissions.csv_export === true,
        data: players,
      };
    if (resource === 'statistics')
      return {
        ...base,
        data: metrics
          .concat([
            'goals_per90',
            'assists_per90',
            'conversion_pct',
            'pass_accuracy_pct',
          ])
          .map((metric) => distribution(players, metric)),
      };
    const fixedMetric = {
      goals: 'goals',
      assists: 'assists',
      contributions: 'contributions',
    }[resource];
    const metric =
      fixedMetric ??
      filters.metric ??
      {
        goals: 'goals',
        assists: 'assists',
        contributions: 'contributions',
        offensive: 'contributions_per90',
        defensive: 'tackles',
      }[resource] ??
      'goals';
    return {
      ...base,
      metric,
      data: sortPlayers(
        players.filter((player) => player[metric] !== null),
        metric,
        'desc',
      ).slice(0, filters.top ?? 10),
    };
  };
}
