export const comparisonMetrics = [
  ['played', 'neutral'],
  ['points', 'higher'],
  ['wins', 'higher'],
  ['draws', 'neutral'],
  ['losses', 'lower'],
  ['goals_for', 'higher'],
  ['goals_against', 'lower'],
  ['goal_difference', 'higher'],
  ['efficiency', 'higher'],
  ['goals_for_average', 'higher'],
  ['goals_against_average', 'lower'],
  ['clean_sheets', 'higher'],
  ['winning_streak', 'higher'],
  ['unbeaten_streak', 'higher'],
];

export function comparisonFilters(parameters) {
  return Object.fromEntries(
    Object.entries({
      club_id: parameters.get('club_id') || 'club:flamengo',
      opponent_id: parameters.get('opponent_id') || 'club:palmeiras',
      from_round: parameters.get('from_round') || '1',
      to_round: parameters.get('to_round') || '38',
      venue: parameters.get('venue') || '',
    }).filter(([, value]) => value !== ''),
  );
}

export function compareMetrics(left, right) {
  return comparisonMetrics.map(([metric, preference]) => {
    const a = left?.[metric];
    const b = right?.[metric];
    const available = Number.isFinite(a) && Number.isFinite(b);
    const difference = available ? a - b : null;
    const winner =
      !available || a === b || preference === 'neutral'
        ? null
        : a > b === (preference === 'higher')
          ? 'left'
          : 'right';
    const scale = available ? Math.max(Math.abs(a), Math.abs(b), 1) : 1;
    return {
      metric,
      preference,
      left: a ?? null,
      right: b ?? null,
      difference,
      relative: available && b !== 0 ? (100 * difference) / Math.abs(b) : null,
      winner,
      leftWidth: available ? (100 * Math.abs(a)) / scale : 0,
      rightWidth: available ? (100 * Math.abs(b)) / scale : 0,
    };
  });
}

export function mergeEvolution(left = [], right = [], metric = 'points') {
  const rounds = [...new Set([...left, ...right].map((row) => row.official_round))];
  return rounds
    .sort((a, b) => a - b)
    .map((official_round) => ({
      official_round,
      left: left.find((row) => row.official_round === official_round)?.[metric] ?? null,
      right:
        right.find((row) => row.official_round === official_round)?.[metric] ?? null,
    }));
}

export function roundFilterUpdate(parameters, key, value) {
  const changes = { [key]: value };
  if (key === 'from_round' && Number(value) > Number(parameters.get('to_round') ?? 38))
    changes.to_round = value;
  if (key === 'to_round' && Number(value) < Number(parameters.get('from_round') ?? 1))
    changes.from_round = value;
  return changes;
}
