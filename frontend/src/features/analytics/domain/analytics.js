import { matchesAnalyticsScope } from '@flamengo-analytics/domain/scope';

export function assertAnalyticsScope(document) {
  if (!matchesAnalyticsScope(document.scope))
    throw new Error('ANALYTICS_SCOPE_MISMATCH');
  return document;
}

export const positionLabels = {
  goalkeeper: 'Goleiro',
  defender: 'Defensor',
  midfielder: 'Meio-campista',
  forward: 'Atacante',
  unknown: 'Não informada',
};
export const metricLabels = {
  matches: 'Jogos',
  starts: 'Titularidades',
  minutes: 'Minutos',
  goals: 'Gols',
  assists: 'Assistências',
  contributions: 'Gols + assistências',
  goals_per90: 'Gols / 90 min',
  assists_per90: 'Assistências / 90 min',
  contributions_per90: 'G + A / 90 min',
  shots: 'Finalizações',
  shots_on_target: 'No alvo',
  conversion_pct: 'Conversão (%)',
  tackles: 'Desarmes',
  interceptions: 'Interceptações',
  clearances: 'Cortes',
  blocks: 'Bloqueios',
  passes_completed: 'Passes certos',
  passes_attempted: 'Passes tentados',
  pass_accuracy_pct: 'Acerto de passes (%)',
  yellow_cards: 'Amarelos',
  red_cards: 'Vermelhos',
  xg: 'xG',
  xa: 'xA',
};
export function isDatasetReady(document) {
  return ['available', 'partial'].includes(document?.availability);
}
