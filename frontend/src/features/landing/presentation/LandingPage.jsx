import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  GitCompareArrows,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Brand } from '../../identity/presentation/Brand.jsx';
import { ThemeToggle } from '../../appearance/presentation/ThemeToggle.jsx';
import { useAnalytics } from '../../analytics/presentation/analytics-hooks.js';
import { Chart } from '../../analytics/presentation/CollectiveUi.jsx';
import { formatCollectiveValue as format } from '../../analytics/presentation/format-value.js';
import { compareMetrics } from '../../analytics/domain/comparison.js';
import { SportsIcon } from '../../analytics/presentation/SportsIcon.jsx';
import { seasonComparison, seasonPreview } from '../domain/season-preview.js';
import { StadiumArt } from './StadiumArt.jsx';
import { DataFlow } from './DataFlow.jsx';
import { EvolutionIllustration, VenueIllustration } from './FeatureIllustrations.jsx';

const anchors = [
  ['#projeto', 'Projeto'],
  ['#indicadores', 'Indicadores'],
  ['#comparacoes', 'Comparações'],
  ['#metodologia', 'Metodologia'],
];

function PublicNavigation() {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const navigation = useRef(null);
  useEffect(() => {
    if (!open) return;
    navigation.current?.querySelector('a')?.focus();
    const key = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open]);
  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <Brand />
        <nav
          ref={navigation}
          id="landing-navigation"
          aria-label="Navegação da página inicial"
          className={`landing-nav ${open ? 'open' : ''}`}
        >
          {anchors.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="landing-header-actions">
          <ThemeToggle />
          <Link className="button header-cta" to="/dashboard">
            Explorar dashboard <ArrowUpRight size={15} />
          </Link>
          <button
            ref={trigger}
            type="button"
            className="landing-menu-toggle icon-button"
            aria-label={
              open ? 'Fechar menu da página inicial' : 'Abrir menu da página inicial'
            }
            aria-expanded={open}
            aria-controls="landing-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Kicker({ children }) {
  return (
    <span className="landing-kicker">
      <i />
      {children}
    </span>
  );
}

function ProductPreview({ season, evolution }) {
  return (
    <div className="product-preview" aria-label="Prévia real do dashboard MengoData">
      <div className="preview-chrome">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>mengodata / dashboard</span>
        <span className="preview-verified">
          <ShieldCheck size={12} />
          {season.available ? 'Dados verificados' : 'Dados indisponíveis'}
        </span>
      </div>
      <div className="preview-layout">
        <div className="preview-rail" aria-hidden="true">
          <SportsIcon kind="pitch" size={23} />
          <ChartNoAxesCombined size={19} />
          <GitCompareArrows size={19} />
          <ShieldCheck size={19} />
        </div>
        <div className="preview-content">
          <div className="preview-heading">
            <div>
              <span>BRASILEIRÃO · 2025</span>
              <h2>O Flamengo em números.</h2>
            </div>
            <span className="preview-season">
              Temporada completa <ChevronRight size={13} />
            </span>
          </div>
          <div className="preview-kpis">
            {[
              ['points', 'Pontos'],
              ['wins', 'Vitórias'],
              ['goals_for', 'Gols marcados'],
              ['clean_sheets', 'Sem sofrer gol'],
            ].map(([key, label]) => (
              <div key={key}>
                <span>{label}</span>
                <strong>{format(season.club?.[key])}</strong>
              </div>
            ))}
          </div>
          <div className="preview-chart">
            <span>
              Construção da campanha <small>Pontos por rodada oficial</small>
            </span>
            <Chart rows={evolution} metrics={['points']} height={150} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewAvailability({ query }) {
  if (query.isPending)
    return (
      <p className="landing-data-status" role="status">
        Carregando a temporada verificada…
      </p>
    );
  if (query.isError || !seasonPreview(query.data).available)
    return (
      <p className="landing-data-status" role="alert">
        Dados indisponíveis no momento.{' '}
        <button type="button" onClick={() => query.refetch()}>
          Tentar novamente
        </button>
      </p>
    );
  return (
    <p className="landing-data-status">
      <Check size={13} />
      Dados reais · acesso público · sem cadastro
    </p>
  );
}

export function LandingPage() {
  const summary = useAnalytics('summary');
  const evolution = useAnalytics('evolution');
  const [opponent, setOpponent] = useState('club:palmeiras');
  const comparison = useAnalytics('compare', {
    club_id: 'club:flamengo',
    opponent_id: opponent,
  });
  const [venueMetric, setVenueMetric] = useState('points');
  const season = seasonPreview(summary.data);
  const series =
    season.available &&
    seasonPreview(evolution.data).available &&
    summary.data.dataset_version === evolution.data.dataset_version
      ? evolution.data.data
      : [];
  const venues = season.venues
    .filter((row) => row.club_id)
    .map((row) => ({ ...row, name: row.venue === 'home' ? 'Mandante' : 'Visitante' }));
  const pair = seasonComparison(summary.data, comparison.data);
  const comparisonRows = compareMetrics(pair[0], pair[1]).filter((row) =>
    ['points', 'goals_for', 'goals_against', 'efficiency'].includes(row.metric),
  );
  const compareUrl =
    '/dashboard/comparar?' +
    new URLSearchParams({ club_id: 'club:flamengo', opponent_id: opponent });
  return (
    <div className="landing-page">
      <a className="skip-link" href="#landing-main">
        Pular para o conteúdo
      </a>
      <PublicNavigation />
      <main className="landing-main" id="landing-main" tabIndex={-1}>
        <section className="landing-hero" aria-labelledby="landing-title">
          <StadiumArt />
          <div className="hero-copy">
            <Kicker>FUTEBOL. CONTEXTO. PERSPECTIVA.</Kicker>
            <h1 id="landing-title">
              O jogo muda.
              <br />
              <em>Os dados revelam.</em>
            </h1>
            <p>
              Uma nova perspectiva sobre o Flamengo no Brasileirão 2025.
              <br className="desktop-break" /> Da primeira rodada ao último apito, cada
              resultado conta uma história.
            </p>
            <div className="hero-actions">
              <Link className="button" to="/dashboard">
                Explorar dashboard <ArrowUpRight size={17} />
              </Link>
              <a className="button secondary" href="#metodologia">
                Entender a análise <ArrowRight size={16} />
              </a>
            </div>
            <PreviewAvailability query={summary} />
          </div>
          <div className="hero-product">
            <div className="floating-stat">
              <SportsIcon kind="trophy" size={24} />
              <span>
                Aproveitamento
                <strong>
                  {season.club ? `${format(season.club.efficiency)}%` : 'Indisponível'}
                </strong>
              </span>
              <small>na temporada</small>
            </div>
            <ProductPreview season={season} evolution={series} />
          </div>
          <div className="hero-bottom">
            <span>
              <i />
              TEMPORADA 2025 · ANÁLISE COLETIVA
            </span>
            <a href="#projeto">
              EXPLORE A PERSPECTIVA <ArrowDown size={14} />
            </a>
          </div>
        </section>
        <section id="projeto" className="landing-section editorial-section">
          <Kicker>O PROJETO</Kicker>
          <p className="editorial-statement">
            <strong>MengoData transforma o placar em perspectiva.</strong> Uma
            plataforma para entender a campanha do Flamengo, descobrir padrões e
            comparar o desempenho coletivo com os outros clubes.{' '}
            <span>Porque acompanhar o jogo é só o começo.</span>
          </p>
          <div className="coverage-metrics">
            {[
              [
                'rounds',
                'Rodadas oficiais',
                'A história completa, rodada a rodada.',
                'pitch',
              ],
              [
                'matches',
                'Partidas verificadas',
                'Resultados reais, uma base consistente.',
                'ball',
              ],
              [
                'clubs',
                'Clubes em perspectiva',
                'O Flamengo e todo o Brasileirão.',
                'trophy',
              ],
            ].map(([key, label, description, icon]) => (
              <div key={key}>
                <SportsIcon kind={icon} size={25} />
                <strong>
                  {season.coverage ? format(season.coverage[key]) : '—'}
                  <small>{label}</small>
                </strong>
                <p>
                  {season.coverage ? description : 'Cobertura indisponível no momento.'}
                </p>
              </div>
            ))}
          </div>
          <Link className="button secondary" to="/dashboard/metodologia">
            Conhecer o projeto <ArrowUpRight size={15} />
          </Link>
        </section>
        <section id="indicadores" className="landing-section resources-section">
          <div className="section-center">
            <Kicker>LEITURAS QUE FAZEM A DIFERENÇA</Kicker>
            <h2>
              Cada partida conta.
              <br />
              <em>Cada dado também.</em>
            </h2>
            <p>
              Explore os resultados por diferentes ângulos.
              <br />
              Mais contexto para a sua leitura do jogo.
            </p>
          </div>
          <div className="feature-grid">
            <Link className="feature-card" to="/dashboard">
              <div className="feature-art evolution-art">
                <span className="feature-number">01 / EVOLUÇÃO</span>
                <EvolutionIllustration rows={series} />
                <span className="mini-label">DO PRIMEIRO AO ÚLTIMO APITO</span>
              </div>
              <div className="feature-copy">
                <h3>Evolução por rodada</h3>
                <p>Veja como a campanha se constrói a cada resultado.</p>
                <ArrowUpRight size={19} />
              </div>
            </Link>
            <Link className="feature-card" to={compareUrl}>
              <div className="feature-art comparison-art">
                <span className="feature-number">02 / FRENTE A FRENTE</span>
                <div className="versus-preview">
                  <span className="crest-surface">
                    <img
                      src="/brand/flamengo.png"
                      width="54"
                      height="54"
                      alt="Escudo do Flamengo"
                      loading="lazy"
                    />
                  </span>
                  <i>×</i>
                  <span className="neutral-club">
                    <SportsIcon kind="shirt" size={44} />
                  </span>
                </div>
                <span className="mini-label">A MESMA JANELA. NOVAS PERSPECTIVAS.</span>
              </div>
              <div className="feature-copy">
                <h3>Comparação entre clubes</h3>
                <p>Coloque duas campanhas lado a lado, com as mesmas regras.</p>
                <ArrowUpRight size={19} />
              </div>
            </Link>
            <Link className="feature-card" to="/dashboard#casa-fora">
              <div className="feature-art venue-art">
                <span className="feature-number">03 / O PESO DO MANDO</span>
                <VenueIllustration rows={venues} />
                <span className="mini-label">EM CASA OU LONGE DELA</span>
              </div>
              <div className="feature-copy">
                <h3>Dentro e fora de casa</h3>
                <p>Entenda o que muda quando muda o mando de campo.</p>
                <ArrowUpRight size={19} />
              </div>
            </Link>
          </div>
        </section>
        <section
          className="landing-section story-section"
          aria-labelledby="context-title"
        >
          <div className="story-copy">
            <Kicker>O CONTEXTO DA CAMPANHA</Kicker>
            <h2 id="context-title">
              Mais do que
              <br />
              <em>a tabela.</em>
            </h2>
            <p>
              Pontos mostram onde um clube chegou. Gols, regularidade e mando ajudam a
              entender o caminho.
            </p>
            <div
              className="story-options"
              role="group"
              aria-label="Indicador da prévia por mando"
            >
              {[
                [
                  'points',
                  'Mandante e visitante',
                  'O contexto muda. Os critérios permanecem.',
                ],
                [
                  'goals',
                  'Produção em gols',
                  'Gols marcados e sofridos na mesma janela.',
                ],
                [
                  'clean_sheets',
                  'Regularidade defensiva',
                  'Partidas sem sofrer gol, direto do placar.',
                ],
              ].map(([key, title, text]) => (
                <button
                  key={key}
                  type="button"
                  className={venueMetric === key ? 'selected' : ''}
                  aria-pressed={venueMetric === key}
                  onClick={() => setVenueMetric(key)}
                >
                  <SportsIcon
                    kind={
                      key === 'goals' ? 'ball' : key === 'points' ? 'pitch' : 'shield'
                    }
                    size={22}
                  />
                  <span>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
            <Link className="button secondary" to="/dashboard#casa-fora">
              Explorar os indicadores <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="story-visual venue-story">
            <div className="visual-topline">
              <span>FLAMENGO · 2025</span>
              <SportsIcon kind="pitch" size={26} />
            </div>
            <h3>Dentro e fora de casa</h3>
            <p>Dados reais. Mesma janela de rodadas.</p>
            <Chart
              rows={venues}
              category="name"
              metrics={
                venueMetric === 'goals' ? ['goals_for', 'goals_against'] : [venueMetric]
              }
              bars
              height={255}
            />
            <div className="venue-caption">
              {venues.map((row) => (
                <span key={row.venue}>
                  {row.name}
                  <strong>{format(row.played)} jogos</strong>
                </span>
              ))}
            </div>
          </div>
        </section>
        <section
          id="comparacoes"
          className="landing-section story-section reverse-story"
          aria-labelledby="comparison-title"
        >
          <div className="story-visual live-comparison">
            <div className="visual-topline">
              <span>FRENTE A FRENTE</span>
              <GitCompareArrows size={22} />
            </div>
            <label>
              Comparar Flamengo com
              <select
                value={opponent}
                disabled={!season.available}
                onChange={(event) => setOpponent(event.target.value)}
              >
                {season.clubs
                  .filter((row) => row.club_id !== 'club:flamengo')
                  .map((row) => (
                    <option value={row.club_id} key={row.club_id}>
                      {row.name}
                    </option>
                  ))}
              </select>
            </label>
            <div className="live-comparison-names">
              <strong>{pair[0]?.name ?? 'Flamengo'}</strong>
              <span>×</span>
              <strong>{pair[1]?.name ?? 'Indisponível'}</strong>
            </div>
            {season.available && comparison.isPending && (
              <p role="status" className="comparison-request-message">
                Carregando comparação…
              </p>
            )}
            {season.available && !comparison.isPending && !pair.length && (
              <div role="alert" className="comparison-request-message">
                <p>Comparação indisponível no momento.</p>
                <button
                  className="text-link"
                  type="button"
                  onClick={() => comparison.refetch()}
                >
                  Tentar novamente
                </button>
              </div>
            )}
            {comparisonRows.map((row) => (
              <div className="landing-comparison-row" key={row.metric}>
                <span>
                  {
                    {
                      points: 'Pontos',
                      goals_for: 'Gols marcados',
                      goals_against: 'Gols sofridos',
                      efficiency: 'Aproveitamento (%)',
                    }[row.metric]
                  }
                </span>
                <div>
                  <strong>{format(row.left)}</strong>
                  <span>
                    Δ {row.difference === null ? '—' : format(row.difference)}
                  </span>
                  <strong>{format(row.right)}</strong>
                </div>
                <div className="comparison-bars" aria-hidden="true">
                  <span>
                    <i style={{ width: `${row.leftWidth}%` }} />
                  </span>
                  <span>
                    <i style={{ width: `${row.rightWidth}%` }} />
                  </span>
                </div>
              </div>
            ))}
            <p className="visual-footnote">
              Diferença = Flamengo − clube comparado.
              <br />
              Em gols sofridos, menor é melhor.
            </p>
          </div>
          <div className="story-copy">
            <Kicker>A MESMA RÉGUA PARA TODOS</Kicker>
            <h2 id="comparison-title">
              Flamengo, frente
              <br />a frente <em>com o Brasileirão.</em>
            </h2>
            <p>
              Escolha dois clubes, defina o recorte e encontre as diferenças.
              Indicadores, tendências e comparações que respeitam o contexto.
            </p>
            <div className="story-facts">
              <span>
                <ShieldCheck size={18} />
                Mesma janela de rodadas
              </span>
              <span>
                <GitCompareArrows size={18} />
                Comparação entre quaisquer dois clubes
              </span>
            </div>
            <Link className="button" to={compareUrl}>
              Comparar campanhas <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
        <section className="landing-section engineering-section">
          <div className="section-center">
            <Kicker>DO PLACAR À PERSPECTIVA</Kicker>
            <h2>
              O trabalho por trás
              <br />
              <em>de cada número.</em>
            </h2>
            <p>
              Uma jornada reproduzível, da fonte ao indicador.
              <br />
              Coleta, qualidade e análise conectadas pela mesma base.
            </p>
          </div>
          <DataFlow />
        </section>
        <section id="metodologia" className="landing-section methodology-section">
          <div className="story-copy">
            <Kicker>CLAREZA TAMBÉM É MÉTODO</Kicker>
            <h2>
              Dados com origem.
              <br />
              <em>Análises com limites.</em>
            </h2>
            <p>
              O MengoData é um projeto acadêmico independente de Big Data e Análise de
              Dados. Conheça o recorte, as fórmulas e o que os resultados permitem
              concluir.
            </p>
            <Link className="text-link" to="/dashboard/metodologia">
              Ler a metodologia completa <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="methodology-accordions">
            <details open>
              <summary>De onde vêm os dados?</summary>
              <p>
                Resultados do OpenFootball, sob licença CC0, com revisão e hash fixos.
                Os placares foram conciliados com a tabela detalhada da CBF.
              </p>
              {season.source?.url && (
                <a
                  className="text-link"
                  href={season.source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Consultar a fonte <ArrowUpRight size={13} />
                </a>
              )}
            </details>
            <details>
              <summary>Qual é o recorte da análise?</summary>
              <p>
                Brasileirão Série A masculino de 2025, por rodada oficial. Jogos adiados
                permanecem na rodada de origem. O foco é o desempenho coletivo.
              </p>
            </details>
            <details>
              <summary>O que os números não mostram?</summary>
              <p>
                Placares não descrevem posse, finalizações, xG ou atuação individual. A
                classificação é calculada com os critérios disponíveis; correlação não
                demonstra causalidade.
              </p>
            </details>
            <details>
              <summary>Onde entra o Power BI?</summary>
              <p>
                O relatório usa a mesma base Gold e as mesmas definições do dashboard.
                Os materiais de montagem estão disponíveis; o arquivo nativo ainda
                depende de validação no Desktop.
              </p>
              <Link className="text-link" to="/dashboard/power-bi">
                Conhecer os materiais <ArrowUpRight size={13} />
              </Link>
            </details>
          </div>
        </section>
        <section className="landing-section final-cta">
          <SportsIcon kind="pitch" size={48} />
          <Kicker>O PRÓXIMO ÂNGULO É SEU</Kicker>
          <h2>
            Veja o Flamengo
            <br />
            <em>por outro ângulo.</em>
          </h2>
          <p>Explore a temporada. Compare campanhas. Encontre o contexto.</p>
          <Link className="button" to="/dashboard">
            Abrir dashboard <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <Brand compact />
        <p>
          Projeto acadêmico independente.
          <br />
          Brasileirão Série A masculino · 2025
        </p>
        <div>
          <a href="#metodologia">Fontes e metodologia</a>
          <Link to="/dashboard/power-bi">Power BI</Link>
          <span>Feito de futebol e dados.</span>
        </div>
      </footer>
    </div>
  );
}
