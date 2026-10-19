import { randomUUID } from 'node:crypto';
import { ANALYTICS_SCOPE } from '@flamengo-analytics/domain/scope';
import { countMetrics } from '@flamengo-analytics/domain/metrics';

export function syntheticArtifact(rounds = [1, 38]) {
  const players = [
    {
      player_id: randomUUID(),
      external_player_id: 'synthetic:a',
      display_name: 'Synthetic Alpha',
      position: 'forward',
    },
    {
      player_id: randomUUID(),
      external_player_id: 'synthetic:b',
      display_name: 'Synthetic Beta',
      position: 'defender',
    },
  ];
  const matches = rounds.map((round) => ({
    match_id: randomUUID(),
    official_round: round,
    official_match_number: round,
    home_team_id: 'club:flamengo',
    away_team_id: 'synthetic:opponent',
    played_at: '2025-12-01T12:00:00Z',
    external_match_id: `synthetic:${round}`,
    evidence_url: 'https://example.invalid/official-test-evidence',
  }));
  return {
    schema_version: 1,
    scope: ANALYTICS_SCOPE,
    source_id: 'synthetic:source',
    dataset_version: 'synthetic-test-only',
    collected_at: '2026-01-01T12:00:00Z',
    players,
    matches,
    appearances: players.flatMap((player, index) =>
      matches.map((match) => ({
        ...Object.fromEntries(countMetrics.map((field) => [field, null])),
        player_id: player.player_id,
        match_id: match.match_id,
        competition_id: ANALYTICS_SCOPE.competition_id,
        season: 2025,
        team_id: ANALYTICS_SCOPE.team_id,
        official_round: match.official_round,
        starter: true,
        minutes: index ? 30 : 90,
        goals: index ? 0 : 1,
        assists: 0,
        tackles: index ? 3 : null,
      })),
    ),
  };
}
export function syntheticSnapshot(availability = 'available') {
  return {
    ...syntheticArtifact(),
    availability,
    reason: availability === 'partial' ? 'individual_coverage_partial' : null,
    coverage: { verified: availability === 'available' },
    source: { source_id: 'synthetic:source', sha256: 'a'.repeat(64) },
    permissions: { csv_export: false, power_bi_distribution: false },
    references: null,
  };
}
export function syntheticApproval(hash, sourceId = 'synthetic:source') {
  return {
    status: 'approved',
    data_kind: 'player_match',
    source_id: sourceId,
    sha256: hash,
    evidence: 'https://example.invalid/synthetic-review',
    coverage_verified: true,
    participation_verified: true,
    official_mapping_verified: true,
    permissions: Object.fromEntries(
      [
        'acquisition',
        'postgres_storage',
        'academic_analysis',
        'react_display',
        'rest_api',
      ].map((usage) => [
        usage,
        { status: 'allowed', evidence: 'https://example.invalid/synthetic-permission' },
      ]),
    ),
  };
}
