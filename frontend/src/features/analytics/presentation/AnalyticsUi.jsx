import { Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import {
  ArrowRight,
  Check,
  Info,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { isDatasetReady, metricLabels, positionLabels } from '../domain/analytics.js';
import { SportsIcon } from './SportsIcon.jsx';
import { formatValue } from './format-value.js';
const RankingPlot = lazy(() => import('./RankingPlot.jsx'));

export function QueryState({ query, children }) {
  if (query.isPending)
    return (
      <div className="state loading" role="status">
        <RefreshCw size={24} />
        <p>Carregando dados verificados…</p>
      </div>
    );
  if (query.isError)
    return (
      <div className="state" role="alert">
        <SportsIcon kind="whistle" />
        <h3>Não foi possível carregar os dados</h3>
        <p>Verifique se a API local está em execução.</p>
        <button className="button" onClick={() => query.refetch()}>
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      </div>
    );
  return children(query.data);
}
export function DataNotice({ document }) {
  if (document.availability === 'available')
    return (
      <div className="notice success">
        <Check size={18} />
        <div>
          <strong>Dados individuais homologados</strong>
          <p>
            Versão {document.dataset_version}. Cobertura individual verificada para as
            rodadas 1 a 38.
          </p>
        </div>
      </div>
    );
  if (document.availability === 'partial')
    return (
      <div className="notice">
        <Info size={19} />
        <div>
          <strong>Cobertura parcial</strong>
          <p>
            Os valores representam apenas as partidas disponíveis. Totais da temporada
            permanecem bloqueados.
          </p>
        </div>
      </div>
    );
  return (
    <div className="notice">
      <Info size={19} />
      <div>
        <strong>Estatísticas individuais aguardam homologação</strong>
        <p>
          É necessário comprovar cobertura por jogador e partida nas 38 rodadas e
          autorização de uso. Números ausentes aparecem como indisponíveis.
        </p>
        <Link to="/metodologia">
          Entenda os critérios <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
export function Empty({
  kind = 'pitch',
  title = 'Aguardando dados individuais',
  children,
}) {
  return (
    <div className="state">
      <SportsIcon kind={kind} />
      <h3>{title}</h3>
      <p>
        {children ??
          'Esta análise será liberada quando a fonte, a cobertura e os direitos de uso forem verificados.'}
      </p>
    </div>
  );
}
export function Panel({ title, subtitle, children, action }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function MetricCard({ label, amount, icon, detail }) {
  return (
    <section className="metric-card">
      <div>
        <span>{label}</span>
        <SportsIcon kind={icon} size={26} />
      </div>
      <strong>{formatValue(amount)}</strong>
      <p>
        {amount === null || amount === undefined
          ? 'Indisponível'
          : (detail ?? 'No recorte verificado')}
      </p>
    </section>
  );
}
export function RankingChart({ document }) {
  if (!document.data?.length)
    return (
      <Empty
        kind="chart"
        title={
          isDatasetReady(document)
            ? 'Nenhum resultado para este filtro'
            : 'Ranking ainda indisponível'
        }
      />
    );
  return (
    <div
      className="chart"
      role="img"
      aria-label={`Ranking de ${metricLabels[document.metric]}`}
    >
      <Suspense fallback={<p role="status">Carregando gráfico…</p>}>
        <RankingPlot document={document} />
      </Suspense>
      <p className="chart-note">
        Valores do recorte disponível. Métricas ausentes são excluídas do ranking.
      </p>
    </div>
  );
}
export function PlayerTable({
  rows,
  metrics = [
    'matches',
    'minutes',
    'goals',
    'assists',
    'contributions',
    'contributions_per90',
  ],
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Jogador</th>
            <th>Posição</th>
            {metrics.map((metric) => (
              <th key={metric}>{metricLabels[metric]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((player) => (
            <tr key={player.player_id}>
              <td>
                <Link to={`/jogadores/${player.player_id}`}>
                  {player.display_name}
                  <ArrowRight size={14} />
                </Link>
              </td>
              <td>{positionLabels[player.position]}</td>
              {metrics.map((metric) => (
                <td key={metric}>
                  {formatValue(
                    player[metric],
                    metric.includes('per90') ||
                      metric.includes('pct') ||
                      ['xg', 'xa'].includes(metric)
                      ? 2
                      : 0,
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Filters({ parameters, update, search = false }) {
  return (
    <div className="filters">
      <span className="filter-label">
        <SlidersHorizontal size={16} />
        Filtros
      </span>
      {search && (
        <label className="search-input">
          <Search size={17} />
          <span className="sr-only">Buscar jogador</span>
          <input
            value={parameters.get('q') ?? ''}
            onChange={(event) => update('q', event.target.value)}
            placeholder="Buscar jogador"
            maxLength={100}
          />
        </label>
      )}
      <label>
        Posição
        <select
          value={parameters.get('position') ?? ''}
          onChange={(event) => update('position', event.target.value)}
        >
          <option value="">Todas as posições</option>
          {Object.entries(positionLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Mínimo de minutos
        <select
          value={parameters.get('min_minutes') ?? '0'}
          onChange={(event) => update('min_minutes', event.target.value)}
        >
          {[0, 450, 900, 1500].map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes ? `${minutes.toLocaleString('pt-BR')} min` : 'Sem mínimo'}
            </option>
          ))}
          {parameters.has('min_minutes') &&
            !['0', '450', '900', '1500'].includes(parameters.get('min_minutes')) && (
              <option value={parameters.get('min_minutes')}>Personalizado</option>
            )}
        </select>
      </label>
      <label>
        Minutos personalizados
        <input
          className="custom-minutes"
          type="number"
          min="0"
          max="10000"
          step="1"
          value={parameters.get('min_minutes') ?? '0'}
          onChange={(event) => update('min_minutes', event.target.value)}
        />
      </label>
    </div>
  );
}
export function PageTitle({ kicker, title, description }) {
  return (
    <div className="page-title">
      <span className="eyebrow">{kicker}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
