import { lazy, Suspense } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { collectiveLabels } from '../domain/collective.js';
import { roundFilterUpdate } from '../domain/comparison.js';
import { QueryState } from './AnalyticsUi.jsx';
import { SportsIcon } from './SportsIcon.jsx';
import { formatCollectiveValue as format } from './format-value.js';

const Plot = lazy(() => import('./CollectivePlot.jsx'));
export function Chart(props) {
  if (!props.rows?.length)
    return <p className="prose">Nenhum resultado para estes filtros.</p>;
  return (
    <Suspense fallback={<p role="status">Carregando gráfico…</p>}>
      <Plot {...props} />
    </Suspense>
  );
}

export function Ready({ query, children }) {
  return (
    <QueryState query={query}>
      {(document) =>
        document.availability === 'available' ? (
          children(document)
        ) : (
          <div className="state">
            <SportsIcon kind="whistle" />
            <h2>Dados coletivos indisponíveis</h2>
            <p>{document.reason}</p>
          </div>
        )
      }
    </QueryState>
  );
}

export function Controls({
  parameters,
  update,
  clubs,
  club = false,
  matches = false,
  roundOnly = false,
  updateMany,
}) {
  const change = (key, value) =>
    updateMany
      ? updateMany(roundFilterUpdate(parameters, key, value))
      : update(key, value);
  return (
    <div className="filters collective-filters">
      <span className="filter-label">
        <SlidersHorizontal size={16} />
        Recorte da análise
      </span>
      {!roundOnly && (
        <label>
          Rodada inicial
          <select
            value={parameters.get('from_round') ?? '1'}
            onChange={(event) => change('from_round', event.target.value)}
          >
            {Array.from({ length: 38 }, (_, i) => (
              <option key={i + 1}>{i + 1}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        {roundOnly ? 'Rodada' : 'Rodada final'}
        <select
          value={parameters.get('to_round') ?? '38'}
          onChange={(event) => change('to_round', event.target.value)}
        >
          {Array.from({ length: 38 }, (_, i) => (
            <option key={i + 1}>{i + 1}</option>
          ))}
        </select>
      </label>
      {!roundOnly && (
        <label>
          Mando
          <select
            value={parameters.get('venue') ?? ''}
            onChange={(event) => update('venue', event.target.value)}
          >
            <option value="">Casa e fora</option>
            <option value="home">Mandante</option>
            <option value="away">Visitante</option>
          </select>
        </label>
      )}
      {club && (
        <label>
          Clube
          <select
            value={parameters.get('club_id') ?? 'club:flamengo'}
            onChange={(event) => update('club_id', event.target.value)}
          >
            {clubs?.map((row) => (
              <option key={row.club_id} value={row.club_id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {matches && (
        <>
          <label>
            Adversário
            <select
              value={parameters.get('opponent_id') ?? ''}
              onChange={(event) => update('opponent_id', event.target.value)}
            >
              <option value="">Todos</option>
              {clubs?.map((row) => (
                <option key={row.club_id} value={row.club_id}>
                  {row.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Resultado do clube
            <select
              value={parameters.get('result') ?? ''}
              onChange={(event) => update('result', event.target.value)}
            >
              <option value="">Todos</option>
              <option value="W">Vitória</option>
              <option value="D">Empate</option>
              <option value="L">Derrota</option>
            </select>
          </label>
        </>
      )}
      {matches && (
        <label>
          Por página
          <select
            value={parameters.get('page_size') ?? '20'}
            onChange={(event) => update('page_size', event.target.value)}
          >
            {[10, 20, 50, 100].map((size) => (
              <option value={size} key={size}>
                {size} jogos
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

export function ClubTable({
  rows,
  metrics = [
    'played',
    'points',
    'wins',
    'draws',
    'losses',
    'goals_for',
    'goals_against',
    'goal_difference',
    'efficiency',
  ],
  position = false,
}) {
  return (
    <div
      className="table-scroll"
      role="region"
      aria-label="Indicadores dos clubes"
      tabIndex={0}
    >
      <table>
        <thead>
          <tr>
            {position && <th>Pos.</th>}
            <th>Clube</th>
            {metrics.map((key) => (
              <th scope="col" key={key}>
                {collectiveLabels[key]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.map((row) => (
            <tr
              key={row.club_id}
              className={row.club_id === 'club:flamengo' ? 'flamengo-row' : ''}
            >
              {position && (
                <td>
                  {row.position}
                  {row.tied ? ' =' : ''}
                </td>
              )}
              <td>{row.name}</td>
              {metrics.map((key) => (
                <td key={key}>{format(row[key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows?.length && <p className="prose">Nenhum resultado para estes filtros.</p>}
    </div>
  );
}

export function Cards({
  row,
  metrics = ['points', 'wins', 'goals_for', 'goal_difference'],
}) {
  return (
    <div className="metrics-grid">
      {metrics.map((key, index) => (
        <section className="metric-card" key={key}>
          <div>
            <span>{collectiveLabels[key]}</span>
            <SportsIcon
              kind={['trophy', 'pitch', 'ball', 'shield'][index % 4]}
              size={26}
            />
          </div>
          <strong>{format(row?.[key])}</strong>
          <p>Brasileirão 2025 · recorte selecionado</p>
        </section>
      ))}
    </div>
  );
}
