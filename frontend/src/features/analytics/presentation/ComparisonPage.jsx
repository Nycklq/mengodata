import { useState } from 'react';
import { ArrowLeftRight, RotateCcw, Trophy } from 'lucide-react';
import { collectiveLabels } from '../domain/collective.js';
import {
  compareMetrics,
  comparisonFilters,
  mergeEvolution,
} from '../domain/comparison.js';
import { PageTitle, Panel } from './AnalyticsUi.jsx';
import { Chart, ClubTable, Controls, Ready } from './CollectiveUi.jsx';
import { formatCollectiveValue as format } from './format-value.js';
import { useAnalytics, useFilters } from './analytics-hooks.js';

function signed(value, suffix = '') {
  return value === null
    ? 'Indisponível'
    : `${value > 0 ? '+' : ''}${format(value)}${suffix}`;
}

function ComparisonMetrics({ left, right }) {
  return (
    <div className="comparison-metrics">
      <div className="comparison-key">
        <span>
          <i className="series-dot" />
          {left?.name ?? 'Clube A'}
        </span>
        <span>
          <i className="series-dot secondary-dot" />
          {right?.name ?? 'Clube B'}
        </span>
      </div>
      {compareMetrics(left, right).map((row) => (
        <article className="comparison-metric" key={row.metric}>
          <div className="comparison-metric-heading">
            <h3>{collectiveLabels[row.metric]}</h3>
            <span>
              {row.preference === 'lower'
                ? 'Menor é melhor'
                : row.preference === 'neutral'
                  ? 'Indicador descritivo'
                  : 'Maior é melhor'}
            </span>
          </div>
          <div className="comparison-values">
            <strong className={row.winner === 'left' ? 'metric-winner' : ''}>
              {format(row.left)}
              {row.winner === 'left' && (
                <Trophy size={14} aria-label={`Melhor: ${left.name}`} />
              )}
            </strong>
            <span>
              {row.difference === 0
                ? 'Mesmo valor'
                : `Δ ${signed(row.difference, row.metric === 'efficiency' ? ' p.p.' : '')}`}
            </span>
            <strong className={row.winner === 'right' ? 'metric-winner' : ''}>
              {format(row.right)}
              {row.winner === 'right' && (
                <Trophy size={14} aria-label={`Melhor: ${right.name}`} />
              )}
            </strong>
          </div>
          <div className="comparison-bars" aria-hidden="true">
            <span>
              <i style={{ width: `${row.leftWidth}%` }} />
            </span>
            <span>
              <i style={{ width: `${row.rightWidth}%` }} />
            </span>
          </div>
          <p className="comparison-relative">
            Variação A sobre B: {signed(row.relative, '%')}
          </p>
        </article>
      ))}
      <p className="panel-footnote">
        Δ = A − B. Variação = (A − B) ÷ |B| × 100; base zero fica indisponível.
        Aproveitamento está na escala 0–100 e seu Δ usa pontos percentuais. Barras
        representam a magnitude; o sinal aparece no valor. Empates não têm vencedor.
      </p>
    </div>
  );
}

export function ComparisonPage() {
  const { parameters, update, updateMany } = useFilters();
  const [metric, setMetric] = useState('points');
  const filters = comparisonFilters(parameters);
  const clubs = useAnalytics('clubs');
  const query = useAnalytics('compare', filters);
  const { opponent_id, ...leftFilters } = filters;
  const rightFilters = { ...leftFilters, club_id: opponent_id };
  const leftEvolution = useAnalytics('evolution', leftFilters);
  const rightEvolution = useAnalytics('evolution', rightFilters);
  const leftSummary = useAnalytics('summary', leftFilters);
  const rightSummary = useAnalytics('summary', rightFilters);
  const choose = (key, value) => {
    const other = key === 'club_id' ? 'opponent_id' : 'club_id';
    updateMany({
      [key]: value,
      ...(value === filters[other] ? { [other]: filters[key] } : {}),
    });
  };
  return (
    <>
      <PageTitle
        kicker="FRENTE A FRENTE"
        title="Comparar clubes"
        description="Dois clubes. A mesma janela. Uma leitura completa da campanha."
      />
      <div className="comparison-selectors">
        {['club_id', 'opponent_id'].map((key, index) => (
          <label
            className={`club-selector ${index ? 'club-selector-secondary' : ''}`}
            key={key}
          >
            <span className="club-monogram" aria-hidden="true">
              {index ? 'B' : 'A'}
            </span>
            <span className="club-selector-field">
              <span>{index ? 'Clube para comparar' : 'Clube de referência'}</span>
              <select
                value={filters[key]}
                onChange={(event) => choose(key, event.target.value)}
              >
                {clubs.data?.data
                  ?.filter((row) => !index || row.club_id !== filters.club_id)
                  .map((row) => (
                    <option key={row.club_id} value={row.club_id}>
                      {row.name}
                    </option>
                  ))}
              </select>
            </span>
          </label>
        ))}
        <button
          className="swap-clubs icon-button"
          aria-label="Trocar clubes"
          title="Trocar clubes"
          onClick={() =>
            updateMany({ club_id: opponent_id, opponent_id: filters.club_id })
          }
        >
          <ArrowLeftRight size={20} />
        </button>
      </div>
      <Controls parameters={parameters} update={update} updateMany={updateMany} />
      <div className="comparison-toolbar">
        <p>Seleção e filtros salvos no endereço desta página.</p>
        <button
          className="button secondary"
          onClick={() =>
            updateMany({
              club_id: '',
              opponent_id: '',
              from_round: '',
              to_round: '',
              venue: '',
              result: '',
              page_size: '',
            })
          }
        >
          <RotateCcw size={14} />
          Restaurar comparação
        </button>
      </div>
      <Ready query={query}>
        {(document) => (
          <>
            <Panel
              title="Indicadores lado a lado"
              subtitle="Destaque para o melhor resultado em cada indicador"
            >
              <ComparisonMetrics left={document.data[0]} right={document.data[1]} />
            </Panel>
            <Panel
              title="Evolução dos clubes"
              subtitle="Acumulado por rodada oficial dentro do recorte"
              action={
                <label>
                  Indicador
                  <select
                    value={metric}
                    onChange={(event) => setMetric(event.target.value)}
                  >
                    {[
                      'points',
                      'goals_for',
                      'goals_against',
                      'goal_difference',
                      'efficiency',
                    ].map((key) => (
                      <option value={key} key={key}>
                        {collectiveLabels[key]}
                      </option>
                    ))}
                  </select>
                </label>
              }
            >
              <Ready query={leftEvolution}>
                {(a) => (
                  <Ready query={rightEvolution}>
                    {(b) => (
                      <Chart
                        rows={mergeEvolution(a.data, b.data, metric)}
                        metrics={['left', 'right']}
                        labels={{
                          left: document.data[0]?.name ?? 'Clube A',
                          right: document.data[1]?.name ?? 'Clube B',
                        }}
                      />
                    )}
                  </Ready>
                )}
              </Ready>
            </Panel>
            <div className="two-columns">
              {[leftSummary, rightSummary].map((summary, index) => (
                <Panel
                  key={index}
                  title={`${document.data[index]?.name ?? 'Clube'} · casa e fora`}
                  subtitle="O filtro de mando também se aplica a este detalhamento"
                >
                  <Ready query={summary}>
                    {(item) => (
                      <ClubTable
                        rows={item.data.home_away
                          .filter((row) => row.club_id)
                          .map((row) => ({
                            ...row,
                            club_id: row.venue,
                            name: row.venue === 'home' ? 'Mandante' : 'Visitante',
                          }))}
                        metrics={[
                          'played',
                          'points',
                          'efficiency',
                          'goals_for',
                          'goals_against',
                        ]}
                      />
                    )}
                  </Ready>
                </Panel>
              ))}
            </div>
          </>
        )}
      </Ready>
    </>
  );
}
