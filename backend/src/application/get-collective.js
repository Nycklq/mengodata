import {
  aggregateClubs,
  collectiveEnvelope,
  describe,
  selectFacts,
} from '../domain/collective.js';

export function createCollectiveService(repository) {
  return async (resource, filters = {}) => {
    const snapshot = await repository.read();
    if (!snapshot) return collectiveEnvelope(null, null);
    const clubId = filters.club_id ?? 'club:flamengo';
    const equivalent = {
      ...filters,
      club_id: undefined,
      opponent_id: undefined,
      result: undefined,
    };
    const allFacts = selectFacts(snapshot.team_matches, equivalent);
    const facts = selectFacts(snapshot.team_matches, filters);
    const totals = aggregateClubs(allFacts);
    let data;
    if (resource === 'clubs') data = snapshot.clubs;
    if (resource === 'data-quality') data = snapshot.coverage;
    if (resource === 'summary') {
      data = {
        club: aggregateClubs(selectFacts(allFacts, { club_id: clubId }))[0] ?? null,
        league: {
          matches: new Set(allFacts.map((row) => row.match_id)).size,
          goals: allFacts.reduce((sum, row) => sum + row.goals_for, 0),
        },
        home_away: ['home', 'away'].map((venue) => ({
          venue,
          ...aggregateClubs(selectFacts(allFacts, { club_id: clubId, venue }))[0],
        })),
        clubs: totals,
      };
    }
    if (resource === 'standings')
      data = {
        rows: totals,
        label: 'Classificação calculada',
        round: filters.to_round ?? 38,
      };
    if (resource === 'offensive' || resource === 'defensive') {
      const metric = resource === 'offensive' ? 'goals_for' : 'goals_against';
      data = {
        rows: [...totals].sort(
          (a, b) =>
            (a[metric] - b[metric]) * (resource === 'offensive' ? -1 : 1) ||
            a.club_id.localeCompare(b.club_id),
        ),
        metric,
        evolution: [],
      };
    }
    if (resource === 'evolution') {
      data = [];
      for (
        let round = filters.from_round ?? 1;
        round <= (filters.to_round ?? 38);
        round++
      ) {
        const row = aggregateClubs(
          selectFacts(allFacts, { club_id: clubId, to_round: round }),
        )[0];
        if (row)
          data.push({
            official_round: round,
            ...row,
            position: snapshot.standings.find(
              (item) => item.club_id === clubId && item.official_round === round,
            )?.position,
          });
      }
    }
    if (resource === 'compare')
      data = [clubId, filters.opponent_id ?? 'club:palmeiras'].map(
        (id) => totals.find((row) => row.club_id === id) ?? null,
      );
    if (resource === 'statistics') {
      const selected = selectFacts(
        allFacts,
        filters.club_id ? { club_id: clubId } : {},
      );
      const goals = selected.map((row) => row.goals_for);
      const distribution = [...new Set(goals)]
        .sort((a, b) => a - b)
        .map((goals_for) => ({
          goals: goals_for,
          frequency: goals.filter((value) => value === goals_for).length,
        }));
      data = {
        goals_for: describe(goals),
        points: describe(selected.map((row) => row.points)),
        distribution,
        results: ['W', 'D', 'L'].map((result) => ({
          result,
          frequency: selected.filter((row) => row.result === result).length,
        })),
        population: filters.club_id
          ? 'clube × partida'
          : 'clube × partida, dois registros por jogo',
        season_statistics: snapshot.statistics,
        clubs: totals,
      };
    }
    if (resource === 'matches' || resource === 'exports') {
      const ids = new Set(facts.map((row) => row.match_id));
      const matches = snapshot.matches.filter((row) => ids.has(row.match_id));
      const page = filters.page ?? 1,
        size = filters.page_size ?? 20;
      data =
        resource === 'exports'
          ? matches
          : {
              rows: matches.slice((page - 1) * size, page * size),
              total: matches.length,
              page,
              page_size: size,
            };
    }
    if (data === undefined) throw new Error('UNKNOWN_COLLECTIVE_RESOURCE');
    return collectiveEnvelope(snapshot, data);
  };
}
