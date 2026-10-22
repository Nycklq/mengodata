export const collectiveLabels = {
  position: 'Posição calculada',
  frequency: 'Frequência (jogos)',
  goals: 'Gols por partida',
  played: 'Jogos',
  wins: 'Vitórias',
  draws: 'Empates',
  losses: 'Derrotas',
  points: 'Pontos',
  goals_for: 'Gols pró',
  goals_against: 'Gols contra',
  goal_difference: 'Saldo',
  clean_sheets: 'Sem sofrer gol',
  efficiency: 'Aproveitamento (%)',
  goals_for_average: 'Gols pró / jogo',
  goals_against_average: 'Gols contra / jogo',
  winning_streak: 'Maior sequência de vitórias',
  unbeaten_streak: 'Maior invencibilidade',
};

export function collectiveFilters(parameters, defaults = {}, resource = 'matches') {
  const allowed = ['from_round', 'to_round', 'venue'];
  if (resource === 'statistics' || resource === 'matches') allowed.push('club_id');
  if (resource === 'matches')
    allowed.push('opponent_id', 'result', 'page', 'page_size');
  return {
    ...defaults,
    ...Object.fromEntries([...parameters].filter(([key]) => allowed.includes(key))),
  };
}

export function matchExportUrl(filters) {
  return (
    '/api/exports/matches?' +
    new URLSearchParams(
      Object.entries(filters).filter(
        ([key, value]) => key !== 'page' && key !== 'page_size' && value !== '',
      ),
    )
  );
}
