import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  Info,
} from 'lucide-react';
import { isDatasetReady, metricLabels, positionLabels } from '../domain/analytics.js';
import { SportsIcon } from './SportsIcon.jsx';
import {
  DataNotice,
  Empty,
  Filters,
  MetricCard,
  PageTitle,
  Panel,
  PlayerTable,
  QueryState,
  RankingChart,
} from './AnalyticsUi.jsx';
import { useAnalytics, useFilters } from './analytics-hooks.js';
import { formatValue } from './format-value.js';

export function OverviewPage() {
  const summary = useAnalytics('summary');
  const ranking = useAnalytics('rankings/contributions');
  const references = useAnalytics('references');
  const leaders = useAnalytics('rankings/goals', { top: 1 });
  const assists = useAnalytics('rankings/assists', { top: 1 });
  return (
    <>
      <div className="hero">
        <div>
          <span className="eyebrow">TEMPORADA 2025 · BRASILEIRÃO SÉRIE A</span>
          <h1>O jogo, em perspectiva.</h1>
          <p>Análise individual do Flamengo, da primeira à última rodada.</p>
        </div>
        <SportsIcon kind="ball" size={102} />
      </div>
      <QueryState query={summary}>
        {(document) => (
          <>
            <DataNotice document={document} />
            <div className="metrics-grid">
              <MetricCard
                label="Jogadores"
                amount={document.data.players}
                icon="shirt"
              />
              <MetricCard label="Gols" amount={document.data.goals} icon="target" />
              <MetricCard
                label="Assistências"
                amount={document.data.assists}
                icon="boot"
              />
              <MetricCard
                label="Minutos em campo"
                amount={document.data.minutes}
                icon="pitch"
                detail="Soma dos minutos individuais"
              />
            </div>
            <div className="season-contributions">
              <SportsIcon kind="trophy" size={30} />
              <div>
                <strong>Participações diretas em gols</strong>
                <p>
                  {formatValue(document.data.contributions)}{' '}
                  <span>gols + assistências individuais</span>
                </p>
              </div>
            </div>
          </>
        )}
      </QueryState>
      <div className="two-columns">
        <Panel
          title="Participação ofensiva"
          subtitle="Gols + assistências · por jogador"
          action={
            <Link className="subtle-link" to="/ofensivo">
              Ver análise <ArrowRight size={15} />
            </Link>
          }
        >
          <QueryState query={ranking}>
            {(document) => <RankingChart document={document} />}
          </QueryState>
        </Panel>
        <Panel title="Da fonte à análise" subtitle="Qualidade em cada etapa">
          <div className="pipeline-steps">
            <div>
              <span className="step-number">01</span>
              <div>
                <strong>Escopo definido</strong>
                <p>Flamengo · Série A masculina · 2025 · rodadas 1–38.</p>
              </div>
              <Check size={17} />
            </div>
            <div>
              <span className="step-number">02</span>
              <div>
                <strong>Referências auxiliares</strong>
                <p>Resultados CC0 com origem e hash preservados.</p>
              </div>
              <Database size={17} />
            </div>
            <div>
              <span className="step-number">03</span>
              <div>
                <strong>Estatísticas por partida</strong>
                <p>Homologação e autorização ainda pendentes.</p>
              </div>
              <Info size={17} />
            </div>
          </div>
          <Link className="text-link" to="/metodologia">
            Conhecer a metodologia <ArrowRight size={15} />
          </Link>
        </Panel>
      </div>
      <div className="two-columns">
        <Panel title="Liderança em gols" subtitle="Maior volume individual no filtro">
          <QueryState query={leaders}>
            {(document) =>
              document.data.length ? (
                <PlayerTable
                  rows={document.data}
                  metrics={['goals', 'minutes', 'goals_per90']}
                />
              ) : (
                <Empty kind="target" title="Artilharia individual indisponível" />
              )
            }
          </QueryState>
        </Panel>
        <Panel
          title="Liderança em assistências"
          subtitle="Maior volume individual no filtro"
        >
          <QueryState query={assists}>
            {(document) =>
              document.data.length ? (
                <PlayerTable
                  rows={document.data}
                  metrics={['assists', 'minutes', 'assists_per90']}
                />
              ) : (
                <Empty kind="boot" title="Liderança de assistências indisponível" />
              )
            }
          </QueryState>
        </Panel>
      </div>
      <Panel
        title="Referências de partidas"
        subtitle="OpenFootball · CC0 · apoio à conferência, sem estatísticas individuais"
      >
        <QueryState query={references}>
          {(document) =>
            document.data.length ? (
              <div className="fixtures">
                {document.data.map((match) => (
                  <article key={match.source_record_id}>
                    <span className="round">
                      RODADA {String(match.source_round).padStart(2, '0')}
                    </span>
                    <div>
                      <span>{match.home_team.replace('CR Flamengo', 'Flamengo')}</span>
                      <strong>{match.score?.join(' : ') ?? '—'}</strong>
                      <span>{match.away_team.replace('CR Flamengo', 'Flamengo')}</span>
                    </div>
                    <time dateTime={match.played_on}>
                      {match.played_on.split('-').reverse().join('/')}
                    </time>
                  </article>
                ))}
              </div>
            ) : (
              <Empty kind="pitch" title="Referências ainda não importadas">
                Execute o pipeline de referências autorizado para carregar este catálogo
                auxiliar.
              </Empty>
            )
          }
        </QueryState>
        <p className="panel-footnote">
          A rodada é a de origem. Referências auxiliares não comprovam cobertura
          individual e não substituem a conciliação com os IDs oficiais da CBF.
        </p>
      </Panel>
    </>
  );
}

export function PlayersPage() {
  const { parameters, update } = useFilters();
  const filters = {
    q: parameters.get('q') ?? '',
    position: parameters.get('position') ?? '',
    min_minutes: parameters.get('min_minutes') ?? 0,
    page: parameters.get('page') ?? 1,
    sort: parameters.get('sort') ?? 'display_name',
    direction: parameters.get('direction') ?? 'asc',
  };
  const query = useAnalytics('players', filters);
  return (
    <>
      <PageTitle
        kicker="ELENCO EM NÚMEROS"
        title="Jogadores"
        description="Busque, filtre e conheça as contribuições individuais no recorte disponível."
      />
      <Filters parameters={parameters} update={update} search />
      <div className="sort-row">
        <label>
          Ordenar por
          <select
            value={filters.sort}
            onChange={(event) => update('sort', event.target.value)}
          >
            {['display_name', 'minutes', 'goals', 'assists', 'contributions_per90'].map(
              (key) => (
                <option key={key} value={key}>
                  {key === 'display_name' ? 'Nome' : metricLabels[key]}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Direção
          <select
            value={filters.direction}
            onChange={(event) => update('direction', event.target.value)}
          >
            <option value="asc">Crescente</option>
            <option value="desc">Decrescente</option>
          </select>
        </label>
      </div>
      <QueryState query={query}>
        {(document) => (
          <>
            <DataNotice document={document} />
            <Panel
              title="Estatísticas dos jogadores"
              subtitle={
                document.pagination.total === null
                  ? 'Cobertura individual não verificada'
                  : `${document.pagination.total} jogadores no filtro`
              }
              action={
                <button
                  className="button secondary"
                  disabled={!document.export_authorized}
                  onClick={() => {
                    if (document.export_url?.startsWith('/api/exports/players?'))
                      window.location.assign(document.export_url);
                  }}
                  title="A exportação exige autorização específica da fonte"
                >
                  <ArrowDownToLine size={16} />
                  {document.export_authorized ? 'Exportar CSV' : 'CSV bloqueado'}
                </button>
              }
            >
              {document.data.length ? (
                <PlayerTable rows={document.data} />
              ) : (
                <Empty
                  kind="shirt"
                  title={
                    isDatasetReady(document)
                      ? 'Nenhum jogador encontrado'
                      : 'Elenco estatístico indisponível'
                  }
                >
                  {isDatasetReady(document)
                    ? 'Ajuste a busca, a posição ou o mínimo de minutos.'
                    : 'O cadastro exibirá somente jogadores com vínculo e aparições verificados pelo Flamengo neste campeonato.'}
                </Empty>
              )}
              {document.pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="button secondary"
                    disabled={Number(filters.page) <= 1}
                    onClick={() => update('page', String(Number(filters.page) - 1))}
                  >
                    Anterior
                  </button>
                  <span>
                    Página {filters.page} de {document.pagination.pages}
                  </span>
                  <button
                    className="button secondary"
                    disabled={Number(filters.page) >= document.pagination.pages}
                    onClick={() => update('page', String(Number(filters.page) + 1))}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </Panel>
          </>
        )}
      </QueryState>
    </>
  );
}

export function ProfilePage() {
  const { id } = useParams();
  const query = useAnalytics(`players/${id}`);
  return (
    <>
      <Link className="text-link" to="/jogadores">
        <ArrowLeft size={15} /> Voltar aos jogadores
      </Link>
      <QueryState query={query}>
        {(document) => (
          <>
            <PageTitle
              kicker="PERFIL INDIVIDUAL"
              title={document.data?.display_name ?? 'Perfil do jogador'}
              description={
                document.data
                  ? positionLabels[document.data.position]
                  : 'Identidade e estatísticas dependem da homologação individual.'
              }
            />
            <DataNotice document={document} />
            {document.data ? (
              <>
                <div className="metrics-grid">
                  {['matches', 'minutes', 'goals', 'assists'].map((key, index) => (
                    <MetricCard
                      key={key}
                      label={metricLabels[key]}
                      amount={document.data[key]}
                      icon={['shirt', 'pitch', 'target', 'boot'][index]}
                    />
                  ))}
                </div>
                <Panel title="Indicadores individuais">
                  <PlayerTable
                    rows={[document.data]}
                    metrics={[
                      'starts',
                      'contributions',
                      'goals_per90',
                      'pass_accuracy_pct',
                      'tackles',
                    ]}
                  />
                </Panel>
                <Panel
                  title="Partida a partida"
                  subtitle="Ordenação pela rodada oficial"
                >
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          {['Rodada', 'Minutos', 'Gols', 'Assistências'].map(
                            (label) => (
                              <th key={label}>{label}</th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {document.appearances.map((row) => (
                          <tr key={row.match_id}>
                            <td>{row.official_round}</td>
                            <td>{formatValue(row.minutes)}</td>
                            <td>{formatValue(row.goals)}</td>
                            <td>{formatValue(row.assists)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </>
            ) : (
              <Empty
                kind="shirt"
                title={
                  isDatasetReady(document)
                    ? 'Jogador não encontrado'
                    : 'Perfil ainda indisponível'
                }
              />
            )}
          </>
        )}
      </QueryState>
    </>
  );
}

export function ComparisonPage() {
  const { parameters, update } = useFilters();
  const minMinutes = parameters.get('min_minutes') ?? 0;
  const roster = useAnalytics('players', { page_size: 100, min_minutes: minMinutes });
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const query = useAnalytics(
    'compare',
    { ids: `${first},${second}`, min_minutes: minMinutes },
    Boolean(first && second && first !== second),
  );
  return (
    <>
      <PageTitle
        kicker="DUAS PERSPECTIVAS"
        title="Comparar jogadores"
        description="Considere posição, tempo em campo e cobertura antes de comparar desempenhos."
      />
      <Filters parameters={parameters} update={update} />
      <QueryState query={roster}>
        {(document) => (
          <>
            <DataNotice document={document} />
            <div className="compare-selectors">
              {[
                [first, setFirst, 'Primeiro jogador'],
                [second, setSecond, 'Segundo jogador'],
              ].map(([selected, setSelected, label]) => (
                <label key={label}>
                  <SportsIcon kind="shirt" size={32} />
                  {label}
                  <select
                    disabled={!document.data.length}
                    value={selected}
                    onChange={(event) => setSelected(event.target.value)}
                  >
                    <option value="">Selecione um jogador</option>
                    {document.data.map((player) => (
                      <option key={player.player_id} value={player.player_id}>
                        {player.display_name}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </>
        )}
      </QueryState>
      {first && second && first === second ? (
        <p role="alert" className="notice">
          Escolha dois jogadores diferentes.
        </p>
      ) : first && second ? (
        <QueryState query={query}>
          {(document) => (
            <Panel title="Comparação de indicadores">
              {document.position_warning && (
                <p className="notice">
                  Posições diferentes: funções táticas limitam a comparação direta.
                </p>
              )}
              {document.complete ? (
                <>
                  <PlayerTable
                    rows={document.data}
                    metrics={[
                      'minutes',
                      'goals',
                      'assists',
                      'goals_per90',
                      'tackles',
                      'pass_accuracy_pct',
                    ]}
                  />
                  <div className="comparison-differences">
                    <h3>Diferença: primeiro − segundo</h3>
                    <dl>
                      {Object.entries(document.differences ?? {}).map(
                        ([metric, amount]) => (
                          <div key={metric}>
                            <dt>{metricLabels[metric]}</dt>
                            <dd>{formatValue(amount, 2)}</dd>
                          </div>
                        ),
                      )}
                    </dl>
                  </div>
                </>
              ) : (
                <Empty kind="shirt" title="Comparação indisponível para esta seleção" />
              )}
            </Panel>
          )}
        </QueryState>
      ) : (
        <Panel title="Lado a lado">
          <Empty kind="pitch" title="Selecione dois jogadores">
            A comparação utilizará os mesmos indicadores e o mesmo recorte para ambos.
          </Empty>
        </Panel>
      )}
    </>
  );
}

export function AnalysisPage({ kind }) {
  const offensive = kind === 'offensive';
  const { parameters, update } = useFilters();
  const selected =
    parameters.get('metric') ?? (offensive ? 'contributions_per90' : 'tackles');
  const options = offensive
    ? [
        'goals',
        'assists',
        'contributions',
        'goals_per90',
        'assists_per90',
        'contributions_per90',
        'shots',
        'shots_on_target',
        'conversion_pct',
        'xg',
        'xa',
      ]
    : [
        'tackles',
        'interceptions',
        'clearances',
        'blocks',
        'yellow_cards',
        'red_cards',
        'passes_completed',
        'pass_accuracy_pct',
      ];
  const query = useAnalytics(`analytics/${kind}`, {
    position: parameters.get('position') ?? '',
    min_minutes: parameters.get('min_minutes') ?? 0,
    metric: selected,
    top: 10,
  });
  return (
    <>
      <PageTitle
        kicker={offensive ? 'CRIAÇÃO E FINALIZAÇÃO' : 'RECUPERAÇÃO E PROTEÇÃO'}
        title={offensive ? 'Análise ofensiva' : 'Análise defensiva'}
        description={
          offensive
            ? 'Produção, eficiência e participação direta em gols.'
            : 'Ações defensivas e disciplina, com contexto de posição.'
        }
      />
      <Filters parameters={parameters} update={update} />
      <div className="sort-row">
        <label>
          Indicador
          <select
            value={selected}
            onChange={(event) => update('metric', event.target.value)}
          >
            {options.map((key) => (
              <option key={key} value={key}>
                {metricLabels[key]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <QueryState query={query}>
        {(document) => (
          <>
            <DataNotice document={document} />
            <Panel
              title={metricLabels[selected]}
              subtitle="Até 10 jogadores · valores ausentes excluídos"
            >
              <RankingChart document={document} />
            </Panel>
            {document.data.length > 0 && (
              <Panel title="Detalhamento">
                <PlayerTable
                  rows={document.data}
                  metrics={[selected, 'minutes', 'matches']}
                />
              </Panel>
            )}
          </>
        )}
      </QueryState>
      <div className="method-note">
        <SportsIcon kind={offensive ? 'target' : 'shield'} size={34} />
        <p>
          {offensive
            ? 'Indicadores por 90 minutos dividem a produção pelos minutos totais e multiplicam por 90. Sem minutos confiáveis, o resultado é indisponível.'
            : 'Mais ações defensivas não implicam automaticamente melhor desempenho. Posição, exposição e contexto tático influenciam os volumes.'}
        </p>
      </div>
    </>
  );
}

export function StatisticsPage() {
  const { parameters, update } = useFilters();
  const query = useAnalytics('statistics', {
    position: parameters.get('position') ?? '',
    min_minutes: parameters.get('min_minutes') ?? 0,
  });
  return (
    <>
      <PageTitle
        kicker="ALÉM DOS TOTAIS"
        title="Estatística descritiva"
        description="Distribuições, medidas de posição e dispersão das métricas individuais."
      />
      <Filters parameters={parameters} update={update} />
      <QueryState query={query}>
        {(document) => (
          <>
            <DataNotice document={document} />
            <Panel
              title="Distribuição entre jogadores"
              subtitle="Quartis com interpolação linear · n é a quantidade de valores conhecidos"
            >
              {isDatasetReady(document) ? (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        {[
                          'Indicador',
                          'n',
                          'Média',
                          'Mediana',
                          'Q1',
                          'Q3',
                          'Mínimo',
                          'Máximo',
                          'Outliers',
                        ].map((label) => (
                          <th key={label}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {document.data.map((row) => (
                        <tr key={row.metric}>
                          <td>{metricLabels[row.metric]}</td>
                          {[
                            'sample_size',
                            'mean',
                            'median',
                            'q1',
                            'q3',
                            'minimum',
                            'maximum',
                          ].map((field) => (
                            <td key={field}>{formatValue(row[field], 2)}</td>
                          ))}
                          <td>
                            {row.outliers
                              .map((number) => formatValue(number, 2))
                              .join(', ') || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty kind="chart" title="Distribuições ainda indisponíveis" />
              )}
            </Panel>
          </>
        )}
      </QueryState>
      <div className="two-columns">
        <Panel title="Quartis e mediana">
          <p className="prose">
            Os valores conhecidos são ordenados. O quantil p usa a posição (n − 1) × p e
            interpolação linear entre vizinhos. Valores ausentes ficam fora da amostra;
            não recebem zero.
          </p>
        </Panel>
        <Panel title="Outliers e interpretação">
          <p className="prose">
            Valores abaixo de Q1 − 1,5 × AIQ ou acima de Q3 + 1,5 × AIQ são sinalizados.
            A marcação é descritiva e não determina qualidade, causalidade ou exclusão.
          </p>
        </Panel>
      </div>
    </>
  );
}
