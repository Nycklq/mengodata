import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  collectiveFilters,
  collectiveLabels,
  matchExportUrl,
} from '../domain/collective.js';
import { useAnalytics, useFilters } from './analytics-hooks.js';
import { PageTitle, Panel, QueryState } from './AnalyticsUi.jsx';
import { SportsIcon } from './SportsIcon.jsx';

const Plot = lazy(() => import('./CollectivePlot.jsx'));
const format = (value) =>
  value === null || value === undefined
    ? 'Indisponível'
    : Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

function Chart(props) {
  if (!props.rows?.length)
    return <p className="prose">Nenhum resultado para estes filtros.</p>;
  return (
    <Suspense fallback={<p role="status">Carregando gráfico…</p>}>
      <Plot {...props} />
    </Suspense>
  );
}

function Ready({ query, children }) {
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

function Controls({
  parameters,
  update,
  clubs,
  club = false,
  matches = false,
  roundOnly = false,
}) {
  return (
    <div className="filters collective-filters">
      {!roundOnly && (
        <label>
          Rodada inicial
          <select
            value={parameters.get('from_round') ?? '1'}
            onChange={(event) => update('from_round', event.target.value)}
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
          onChange={(event) => update('to_round', event.target.value)}
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
    </div>
  );
}

function ClubTable({
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
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {position && <th>Pos.</th>}
            <th>Clube</th>
            {metrics.map((key) => (
              <th key={key}>{collectiveLabels[key]}</th>
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

function Cards({ row, metrics = ['points', 'wins', 'goals_for', 'goal_difference'] }) {
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

export function OverviewPage() {
  const { parameters, update } = useFilters();
  const filters = collectiveFilters(parameters);
  const summary = useAnalytics('summary', filters);
  const evolution = useAnalytics('evolution', filters);
  return (
    <>
      <div className="hero">
        <div>
          <span className="eyebrow">BRASILEIRÃO 2025 · ANÁLISE COLETIVA</span>
          <h1>Uma temporada em perspectiva.</h1>
          <p>Flamengo e os outros 19 clubes. Resultados reais, rodada a rodada.</p>
        </div>
        <SportsIcon kind="pitch" size={100} />
      </div>
      <Controls parameters={parameters} update={update} />
      <Ready query={summary}>
        {(document) => (
          <>
            <div className="notice success">
              <SportsIcon kind="shield" size={22} />
              <div>
                <strong>380 partidas verificadas · 38 rodadas · 20 clubes</strong>
                <p>
                  Fonte OpenFootball · CC0. Flamengo: 38 partidas na temporada completa.
                  Filtros alteram os indicadores abaixo.
                </p>
              </div>
            </div>
            <Cards row={document.data.club} />
            <div className="two-columns">
              <Panel
                title="Construção da campanha"
                subtitle="Acumulado pela rodada oficial selecionada"
              >
                <Ready query={evolution}>
                  {(series) => (
                    <Chart
                      rows={series.data}
                      metrics={['points', 'goals_for', 'goals_against']}
                    />
                  )}
                </Ready>
              </Panel>
              <Panel title="Dentro e fora de casa" subtitle="Mesma janela de rodadas">
                <ClubTable
                  rows={document.data.home_away
                    .filter((row) => row.club_id)
                    .map((row) => ({
                      ...row,
                      club_id: row.venue,
                      name: row.venue === 'home' ? 'Mandante' : 'Visitante',
                    }))}
                  metrics={['played', 'points', 'goals_for', 'goals_against']}
                />
                <p className="prose">
                  Aproveitamento: {format(document.data.club?.efficiency)}%. A posição
                  ao final de uma rodada oficial é uma reconstrução analítica; partidas
                  adiadas mantêm sua rodada.
                </p>
              </Panel>
            </div>
            <Panel
              title="Flamengo no campeonato"
              action={
                <Link className="text-link" to="/classificacao">
                  Ver classificação
                </Link>
              }
            >
              <ClubTable rows={document.data.clubs.slice(0, 5)} position />
            </Panel>
          </>
        )}
      </Ready>
    </>
  );
}

export function MatchesPage() {
  const { parameters, update } = useFilters();
  const filters = collectiveFilters(parameters, { club_id: 'club:flamengo' });
  const query = useAnalytics('matches', filters);
  const clubs = useAnalytics('clubs');
  return (
    <>
      <PageTitle
        kicker="CADA JOGO CONTA"
        title="Partidas"
        description="Resultados por rodada oficial. Datas preservadas da fonte, sem inferência de fuso horário."
      />
      <Controls
        parameters={parameters}
        update={update}
        clubs={clubs.data?.data}
        club
        matches
      />
      <Ready query={query}>
        {(document) => (
          <Panel
            title={`${document.data.total} partidas no recorte`}
            action={
              <a className="button" href={matchExportUrl(filters)}>
                Exportar CSV
              </a>
            }
          >
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Rodada</th>
                    <th>Data</th>
                    <th>Mandante</th>
                    <th>Placar</th>
                    <th>Visitante</th>
                  </tr>
                </thead>
                <tbody>
                  {document.data.rows.map((row) => (
                    <tr key={row.match_id}>
                      <td>{row.official_round}</td>
                      <td>{row.date.split('-').reverse().join('/')}</td>
                      <td>{row.home_name}</td>
                      <td>
                        <strong>
                          {row.home_goals} × {row.away_goals}
                        </strong>
                      </td>
                      <td>{row.away_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!document.data.rows.length && (
              <p className="prose">Nenhuma partida para estes filtros.</p>
            )}
            <div className="pagination">
              <button
                className="button secondary"
                disabled={document.data.page <= 1}
                onClick={() => update('page', String(document.data.page - 1))}
              >
                Anterior
              </button>
              <span>
                Página {document.data.page} · {document.data.total} resultados
              </span>
              <button
                className="button secondary"
                disabled={
                  document.data.page * document.data.page_size >= document.data.total
                }
                onClick={() => update('page', String(document.data.page + 1))}
              >
                Próxima
              </button>
            </div>
          </Panel>
        )}
      </Ready>
    </>
  );
}

export function StandingsPage() {
  const { parameters, update } = useFilters();
  const query = useAnalytics('standings', {
    to_round: parameters.get('to_round') ?? 38,
  });
  const evolution = useAnalytics('evolution');
  return (
    <>
      <PageTitle
        kicker="OS 20 CLUBES"
        title="Classificação calculada"
        description="Campanha acumulada até a rodada oficial selecionada."
      />
      <Controls parameters={parameters} update={update} roundOnly />
      <Ready query={query}>
        {(document) => (
          <Panel title={`Rodada ${document.data.round}`}>
            <ClubTable rows={document.data.rows} position />
            <p className="prose">{document.ranking_note}</p>
          </Panel>
        )}
      </Ready>
      <Panel
        title="Posição calculada do Flamengo"
        subtitle="Empates residuais compartilham posição; menor valor indica melhor colocação"
      >
        <Ready query={evolution}>
          {(document) => <Chart rows={document.data} metrics={['position']} />}
        </Ready>
      </Panel>
    </>
  );
}

export function ComparisonPage() {
  const { parameters, update } = useFilters();
  const clubs = useAnalytics('clubs');
  const filters = collectiveFilters(parameters, {
    club_id: 'club:flamengo',
    opponent_id: 'club:palmeiras',
  });
  const query = useAnalytics('compare', filters);
  return (
    <>
      <PageTitle
        kicker="MESMA JANELA, MESMAS REGRAS"
        title="Comparar clubes"
        description="Flamengo versus qualquer adversário da Série A de 2025."
      />
      <Controls parameters={parameters} update={update} />
      <div className="filters">
        <label>
          Clube para comparar
          <select
            value={filters.opponent_id}
            onChange={(event) => update('opponent_id', event.target.value)}
          >
            {clubs.data?.data
              ?.filter((row) => row.club_id !== 'club:flamengo')
              .map((row) => (
                <option key={row.club_id} value={row.club_id}>
                  {row.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      <Ready query={query}>
        {(document) => (
          <>
            <Panel title="Comparação de campanha">
              <ClubTable rows={document.data.filter(Boolean)} />
            </Panel>
            <div className="two-columns">
              <Panel title="Produção e defesa" subtitle="Gols no mesmo recorte">
                <Chart
                  rows={document.data.filter(Boolean)}
                  metrics={['goals_for', 'goals_against']}
                  category="name"
                  bars
                />
              </Panel>
              <Panel
                title="Regularidade"
                subtitle="Sequências em ordem da data de realização dentro do recorte"
              >
                <ClubTable
                  rows={document.data.filter(Boolean)}
                  metrics={['clean_sheets', 'winning_streak', 'unbeaten_streak']}
                />
                <p className="prose">
                  Os números descrevem resultados. Sem dados de posse, finalizações ou
                  xG, não é possível avaliar a qualidade das chances ou atribuir
                  causalidade.
                </p>
              </Panel>
            </div>
          </>
        )}
      </Ready>
    </>
  );
}

export function AnalysisPage({ kind }) {
  const { parameters, update } = useFilters();
  const filters = collectiveFilters(parameters);
  const query = useAnalytics(`analytics/${kind}`, filters);
  const evolution = useAnalytics('evolution', filters);
  const offense = kind === 'offensive';
  const metrics = offense
    ? ['goals_for', 'goals_for_average', 'wins']
    : ['goals_against', 'goals_against_average', 'clean_sheets', 'goal_difference'];
  return (
    <>
      <PageTitle
        kicker={offense ? 'PRODUÇÃO EM GOLS' : 'PROTEÇÃO DO RESULTADO'}
        title={offense ? 'Análise ofensiva' : 'Análise defensiva'}
        description="Comparação dos 20 clubes com indicadores derivados exclusivamente dos placares."
      />
      <Controls parameters={parameters} update={update} />
      <Ready query={query}>
        {(document) => (
          <>
            <Panel
              title={offense ? 'Gols marcados por clube' : 'Gols sofridos por clube'}
              subtitle={
                offense
                  ? 'Ordem decrescente de gols pró'
                  : 'Ordem crescente de gols contra'
              }
            >
              <Chart
                rows={document.data.rows}
                metrics={[document.data.metric]}
                category="name"
                bars
              />
              <ClubTable rows={document.data.rows} metrics={metrics} />
            </Panel>
            <Panel
              title="Evolução do Flamengo"
              subtitle="Acumulado no recorte selecionado"
            >
              <Ready query={evolution}>
                {(series) => (
                  <Chart
                    rows={series.data}
                    metrics={[
                      offense ? 'goals_for' : 'goals_against',
                      'goal_difference',
                    ]}
                  />
                )}
              </Ready>
            </Panel>
          </>
        )}
      </Ready>
    </>
  );
}

export function StatisticsPage() {
  const { parameters, update } = useFilters();
  const clubs = useAnalytics('clubs');
  const query = useAnalytics(
    'statistics',
    collectiveFilters(parameters, { club_id: 'club:flamengo' }),
  );
  return (
    <>
      <PageTitle
        kicker="VARIABILIDADE E CONTEXTO"
        title="Estatística descritiva"
        description="Distribuições de gols e resultados. Estatísticas populacionais do recorte observado."
      />
      <Controls parameters={parameters} update={update} club clubs={clubs.data?.data} />
      <Ready query={query}>
        {(document) => (
          <>
            <div className="metrics-grid">
              {[
                ['mean', 'Média de gols'],
                ['median', 'Mediana de gols'],
                ['std_population', 'Desvio padrão'],
                ['q3', 'Terceiro quartil'],
              ].map(([key, label]) => (
                <section className="metric-card" key={key}>
                  <div>
                    <span>{label}</span>
                    <SportsIcon kind="chart" size={25} />
                  </div>
                  <strong>{format(document.data.goals_for[key])}</strong>
                  <p>{document.data.goals_for.n} observações · gols / partida</p>
                </section>
              ))}
            </div>
            <div className="two-columns">
              <Panel title="Distribuição de gols por jogo">
                <Chart
                  rows={document.data.distribution}
                  category="goals"
                  metrics={['frequency']}
                  bars
                />
              </Panel>
              <Panel title="Resultados do clube">
                <Chart
                  rows={document.data.results.map((row) => ({
                    ...row,
                    name: { W: 'Vitórias', D: 'Empates', L: 'Derrotas' }[row.result],
                  }))}
                  category="name"
                  metrics={['frequency']}
                  bars
                />
              </Panel>
            </div>
            <Panel title="Leitura estatística">
              <p className="prose">
                Primeiro quartil: {format(document.data.goals_for.q1)}. Terceiro
                quartil: {format(document.data.goals_for.q3)}. Mínimo:{' '}
                {format(document.data.goals_for.min)}; máximo:{' '}
                {format(document.data.goals_for.max)}. Unidade:{' '}
                {document.data.population}. Quartis por interpolação linear; dispersão
                com denominador N.
              </p>
              <p className="prose">
                Na temporada completa dos 20 clubes, a correlação exploratória entre
                gols pró e pontos é{' '}
                {format(document.data.season_statistics.correlation_goals_points)}. Esse
                coeficiente não muda com os filtros e não demonstra causalidade. Não há
                inferência sobre outras temporadas.
              </p>
            </Panel>
          </>
        )}
      </Ready>
    </>
  );
}
