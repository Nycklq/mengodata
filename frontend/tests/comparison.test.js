import { describe, expect, it } from 'vitest';
import {
  compareMetrics,
  comparisonFilters,
  mergeEvolution,
  roundFilterUpdate,
} from '../src/features/analytics/domain/comparison.js';
import { collectiveFilters } from '../src/features/analytics/domain/collective.js';

describe('regras de comparação coletiva', () => {
  it('não envia filtros de partidas para endpoints analíticos nem muda o clube focal pela URL', () => {
    const parameters = new URLSearchParams(
      'club_id=club:sport&from_round=12&page=2&result=W&opponent_id=club:bahia',
    );
    expect(collectiveFilters(parameters, {}, 'summary')).toEqual({ from_round: '12' });
    expect(
      collectiveFilters(parameters, { club_id: 'club:flamengo' }, 'statistics'),
    ).toEqual({ club_id: 'club:sport', from_round: '12' });
  });
  it('calcula diferenças absolutas e relativas com o sentido correto de desempenho', () => {
    const rows = compareMetrics(
      { points: 79, goals_against: 27, losses: 5, draws: 10 },
      { points: 76, goals_against: 33, losses: 6, draws: 5 },
    );
    expect(rows.find((row) => row.metric === 'points')).toMatchObject({
      difference: 3,
      relative: 300 / 76,
      winner: 'left',
    });
    expect(rows.find((row) => row.metric === 'goals_against')).toMatchObject({
      difference: -6,
      winner: 'left',
    });
    expect(rows.find((row) => row.metric === 'losses').winner).toBe('left');
    expect(rows.find((row) => row.metric === 'draws').winner).toBeNull();
  });
  it('mantém ausências e base zero indisponíveis sem criar vencedor', () => {
    const rows = compareMetrics({ points: 0, wins: 1 }, { points: 0, wins: 0 });
    expect(rows.find((row) => row.metric === 'points')).toMatchObject({
      difference: 0,
      relative: null,
      winner: null,
    });
    expect(rows.find((row) => row.metric === 'wins')).toMatchObject({
      difference: 1,
      relative: null,
      winner: 'left',
    });
    expect(rows.find((row) => row.metric === 'goals_for')).toMatchObject({
      left: null,
      right: null,
      difference: null,
      winner: null,
    });
  });
  it('preserva sinal e usa módulo do denominador para saldos negativos', () => {
    const row = compareMetrics({ goal_difference: -5 }, { goal_difference: -10 }).find(
      (item) => item.metric === 'goal_difference',
    );
    expect(row).toMatchObject({
      difference: 5,
      relative: 50,
      winner: 'left',
      leftWidth: 50,
      rightWidth: 100,
    });
  });
  it('mescla evolução por rodada oficial sem preencher lacunas com zero', () => {
    expect(
      mergeEvolution(
        [{ official_round: 12, points: 3 }],
        [{ official_round: 11, points: 1 }],
      ),
    ).toEqual([
      { official_round: 11, left: null, right: 1 },
      { official_round: 12, left: 3, right: null },
    ]);
  });
  it('seleciona somente filtros aceitos pela comparação e conserva clubes arbitrários', () => {
    expect(
      comparisonFilters(
        new URLSearchParams(
          'club_id=club:bahia&opponent_id=club:sport&page=3&result=W&season=2026',
        ),
      ),
    ).toEqual({
      club_id: 'club:bahia',
      opponent_id: 'club:sport',
      from_round: '1',
      to_round: '38',
    });
  });
  it('mantém uma janela válida ao cruzar os limites dos seletores', () => {
    expect(
      roundFilterUpdate(new URLSearchParams('to_round=5'), 'from_round', '20'),
    ).toEqual({ from_round: '20', to_round: '20' });
    expect(
      roundFilterUpdate(new URLSearchParams('from_round=20'), 'to_round', '1'),
    ).toEqual({ from_round: '1', to_round: '1' });
    expect(roundFilterUpdate(new URLSearchParams(), 'to_round', '38')).toEqual({
      to_round: '38',
    });
  });
});
