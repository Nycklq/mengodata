import {
  ANALYTICS_SCOPE,
  matchesAnalyticsScope,
} from '@flamengo-analytics/domain/scope';

export function permissionAllowed(approval, usage) {
  const permission = approval?.permissions?.[usage];
  return (
    permission?.status === 'allowed' &&
    typeof permission.evidence === 'string' &&
    permission.evidence.startsWith('https://')
  );
}

export function assessDataset(document, approval, sourceReview, hash, usages) {
  if (
    !approval ||
    approval.status !== 'approved' ||
    approval.data_kind !== 'player_match' ||
    approval.sha256 !== hash ||
    approval.source_id !== document.source_id ||
    !approval.evidence?.startsWith('https://') ||
    !usages.every((usage) => permissionAllowed(approval, usage))
  )
    return { authorized: false, reason: 'artifact_not_approved_for_usage' };
  if (
    sourceReview?.technical_status !== 'approved' ||
    !sourceReview.approved_data_kinds.includes('player_match') ||
    sourceReview.reviewed_sha256 !== hash
  )
    return { authorized: false, reason: 'individual_source_not_approved' };
  if (!matchesAnalyticsScope(document.scope))
    return { authorized: false, reason: 'scope_mismatch' };
  const ids = new Set(document.players.map((row) => row.player_id));
  if (new Set(document.players.map((row) => row.external_player_id)).size !== ids.size)
    return { authorized: false, reason: 'duplicate_external_player_id' };
  const matches = new Map(document.matches.map((row) => [row.match_id, row]));
  const rounds = new Set(document.matches.map((row) => row.official_round));
  const keys = new Set(
    document.appearances.map((row) => `${row.player_id}:${row.match_id}`),
  );
  if (
    ids.size !== document.players.length ||
    matches.size !== document.matches.length ||
    rounds.size !== document.matches.length ||
    keys.size !== document.appearances.length ||
    new Set(document.matches.map((row) => row.official_match_number)).size !==
      matches.size ||
    new Set(document.matches.map((row) => row.external_match_id)).size !==
      matches.size ||
    document.appearances.some(
      (row) =>
        !ids.has(row.player_id) ||
        matches.get(row.match_id)?.official_round !== row.official_round,
    ) ||
    document.matches.some(
      (row) =>
        row.home_team_id === row.away_team_id ||
        ![row.home_team_id, row.away_team_id].includes(ANALYTICS_SCOPE.team_id) ||
        Date.parse(row.played_at) > Date.parse(document.collected_at),
    )
  )
    return { authorized: false, reason: 'invalid_individual_identity' };
  const observedRounds = [
    ...new Set(document.appearances.map((row) => row.official_round)),
  ].sort((a, b) => a - b);
  const complete =
    approval.coverage_verified === true &&
    approval.official_mapping_verified === true &&
    approval.participation_verified === true &&
    rounds.size === 38 &&
    observedRounds.length === 38;
  return {
    authorized: true,
    availability: complete ? 'available' : 'partial',
    reason: complete ? null : 'individual_coverage_partial',
    coverage: {
      verified: complete,
      rounds_with_player_rows: observedRounds,
      expected_rounds: 38,
      approval_reference: approval.evidence,
    },
  };
}
