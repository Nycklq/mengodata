import { ANALYTICS_SCOPE } from '@flamengo-analytics/domain/scope';

export const collectiveCounts = [
  'played',
  'wins',
  'draws',
  'losses',
  'goals_for',
  'goals_against',
  'goal_difference',
  'points',
  'clean_sheets',
];
export const rankingNote =
  'Classificação calculada por pontos, vitórias, saldo e gols pró. Empates restantes compartilham posição. Confronto direto, cartões, sorteio e sanções não são reproduzidos. Rodada oficial não representa ordem cronológica.';

export function selectFacts(rows, filters = {}) {
  return rows.filter(
    (row) =>
      row.official_round >= (filters.from_round ?? 1) &&
      row.official_round <= (filters.to_round ?? 38) &&
      (!filters.venue || row.venue === filters.venue) &&
      (!filters.club_id || row.club_id === filters.club_id) &&
      (!filters.opponent_id || row.opponent_id === filters.opponent_id) &&
      (!filters.result || row.result === filters.result),
  );
}

export function aggregateClubs(rows) {
  const groups = new Map();
  for (const fact of rows) {
    const row = groups.get(fact.club_id) ?? {
      club_id: fact.club_id,
      name: fact.name,
      ...Object.fromEntries(collectiveCounts.map((key) => [key, 0])),
    };
    for (const key of collectiveCounts) row[key] += fact[key];
    groups.set(row.club_id, row);
  }
  for (const row of groups.values()) {
    row.efficiency = (100 * row.points) / (3 * row.played);
    row.goals_for_average = row.goals_for / row.played;
    row.goals_against_average = row.goals_against / row.played;
    let wins = 0,
      unbeaten = 0;
    row.winning_streak = 0;
    row.unbeaten_streak = 0;
    for (const fact of rows
      .filter((fact) => fact.club_id === row.club_id)
      .sort(
        (a, b) => a.date.localeCompare(b.date) || a.match_id.localeCompare(b.match_id),
      )) {
      wins = fact.wins ? wins + 1 : 0;
      unbeaten = fact.losses ? 0 : unbeaten + 1;
      row.winning_streak = Math.max(row.winning_streak, wins);
      row.unbeaten_streak = Math.max(row.unbeaten_streak, unbeaten);
    }
  }
  const keys = ['points', 'wins', 'goal_difference', 'goals_for'];
  const result = [...groups.values()].sort((a, b) => {
    for (const key of keys) if (a[key] !== b[key]) return b[key] - a[key];
    return a.club_id.localeCompare(b.club_id);
  });
  let position = 0;
  result.forEach((row, index) => {
    if (!index || keys.some((key) => row[key] !== result[index - 1][key]))
      position = index + 1;
    row.position = position;
    row.tied = result.some(
      (other) => other !== row && keys.every((key) => row[key] === other[key]),
    );
  });
  return result;
}

export function describe(values) {
  if (!values.length) return { n: 0 };
  const ordered = [...values].sort((a, b) => a - b);
  const quantile = (probability) => {
    const point = (ordered.length - 1) * probability;
    const lower = Math.floor(point);
    return (
      ordered[lower] + (ordered[Math.ceil(point)] - ordered[lower]) * (point - lower)
    );
  };
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return {
    n: values.length,
    mean,
    median: quantile(0.5),
    q1: quantile(0.25),
    q3: quantile(0.75),
    std_population: Math.sqrt(variance),
    variance_population: variance,
    min: ordered[0],
    max: ordered.at(-1),
  };
}

export function collectiveEnvelope(snapshot, data) {
  return {
    schema_version: 1,
    scope: { ...ANALYTICS_SCOPE },
    availability: snapshot ? 'available' : 'unavailable',
    reason: snapshot
      ? null
      : 'Execute pipeline:collective e, se configurado, db:import.',
    coverage: snapshot?.coverage ?? null,
    source: snapshot?.source ?? null,
    dataset_version: snapshot?.dataset_version ?? null,
    ranking_note: rankingNote,
    data,
  };
}
