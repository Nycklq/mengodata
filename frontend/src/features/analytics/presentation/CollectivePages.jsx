import { Link } from 'react-router-dom';
import { collectiveFilters, matchExportUrl } from '../domain/collective.js';
import { useAnalytics, useFilters } from './analytics-hooks.js';
import { PageTitle, Panel } from './AnalyticsUi.jsx';
import { SportsIcon } from './SportsIcon.jsx';
import { Cards, Chart, ClubTable, Controls, Ready } from './CollectiveUi.jsx';
import { formatCollectiveValue as format } from './format-value.js';

export function OverviewPage() {
  const { parameters, update, updateMany } = useFilters();
  const filters = collectiveFilters(parameters, {}, 'summary');
  const summary = useAnalytics('summary', filters);
  const evolution = useAnalytics('evolution', filters);
  return (
    <>
      <div className="hero season-hero">
        <div>
          <span className="eyebrow">BRASILEIRÃO 2025 · ANÁLISE COLETIVA</span>
          <h1>
            Uma temporada.
            <br />
            <span>Muitas perspectivas.</span>
          </h1>
          <p>Flamengo e os outros 19 clubes. Resultados reais, rodada a rodada.</p>
        </div>
        <div className="hero-emblem">
          <img src="/flamengo-logo.png" alt="Escudo do Flamengo" />
          <span>RAÇA, AMOR E DADOS.</span>
        </div>
      </div>
      <Controls parameters={parameters} update={update} updateMany={updateMany} />
      <div className="section-intro">
        <span className="eyebrow">A CAMPANHA RUBRO-NEGRA</span>
        <Link className="text-link" to="/comparar">
          Comparar clubes ↗
        </Link>
      </div>
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
                <Chart
                  rows={document.data.home_away
                    .filter((row) => row.club_id)
                    .map((row) => ({
                      ...row,
                      name: row.venue === 'home' ? 'Mandante' : 'Visitante',
                    }))}
                  category="name"
                  metrics={['points']}
                  bars
                  height={180}
                />
                <ClubTable
                  rows={document.data.home_away
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
  const { parameters, update, updateMany } = useFilters();
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
        updateMany={updateMany}
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
            <div
              className="table-scroll"
              role="region"
              aria-label="Resultados das partidas"
              tabIndex={0}
            >
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
  const { parameters, update, updateMany } = useFilters();
  const query = useAnalytics('standings', {
    to_round: parameters.get('to_round') ?? 38,
  });
  const evolution = useAnalytics('evolution', {
    to_round: parameters.get('to_round') ?? 38,
  });
  return (
    <>
      <PageTitle
        kicker="OS 20 CLUBES"
        title="Classificação calculada"
        description="Campanha acumulada até a rodada oficial selecionada."
      />
      <Controls
        parameters={parameters}
        update={update}
        updateMany={updateMany}
        roundOnly
      />
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

export function AnalysisPage({ kind }) {
  const { parameters, update, updateMany } = useFilters();
  const filters = collectiveFilters(parameters, {}, 'analysis');
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
      <Controls parameters={parameters} update={update} updateMany={updateMany} />
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
                horizontal
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
  const { parameters, update, updateMany } = useFilters();
  const clubs = useAnalytics('clubs');
  const query = useAnalytics(
    'statistics',
    collectiveFilters(parameters, { club_id: 'club:flamengo' }, 'statistics'),
  );
  return (
    <>
      <PageTitle
        kicker="VARIABILIDADE E CONTEXTO"
        title="Estatística descritiva"
        description="Distribuições de gols e resultados. Estatísticas populacionais do recorte observado."
      />
      <Controls
        parameters={parameters}
        update={update}
        updateMany={updateMany}
        club
        clubs={clubs.data?.data}
      />
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
