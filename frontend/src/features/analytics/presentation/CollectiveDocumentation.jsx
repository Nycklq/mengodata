import { PageTitle, Panel, QueryState } from './AnalyticsUi.jsx';
import { useAnalytics } from './analytics-hooks.js';
import { Cards, Ready } from './CollectiveUi.jsx';
import { Link } from 'react-router-dom';
import { SportsIcon } from './SportsIcon.jsx';

export function NotFoundPage() {
  return (
    <div className="state">
      <SportsIcon kind="whistle" />
      <h1>Página não encontrada</h1>
      <p>Escolha uma nova perspectiva para continuar.</p>
      <Link className="button" to="/dashboard">
        Abrir dashboard
      </Link>
      <Link className="text-link" to="/">
        Voltar à página inicial
      </Link>
    </div>
  );
}

export function MethodologyPage() {
  const quality = useAnalytics('data-quality');
  return (
    <>
      <PageTitle
        kicker="DO ARQUIVO AO INDICADOR"
        title="Metodologia e fontes"
        description="Brasileirão Série A masculino 2025 · rodadas oficiais 1 a 38 · análise coletiva."
      />
      <QueryState query={quality}>
        {(document) => (
          <>
            <div
              className={`notice ${document.coverage?.status === 'verified' ? 'success' : ''}`}
            >
              <div>
                <strong>
                  Cobertura{' '}
                  {document.coverage?.status === 'verified'
                    ? 'verificada'
                    : 'indisponível'}
                </strong>
                <p>
                  {document.coverage?.matches ?? '—'} partidas;{' '}
                  {document.coverage?.clubs ?? '—'} clubes. Validação por partida e
                  rodada oficial antes de liberar totais da temporada.
                </p>
              </div>
            </div>
            <Panel title="Origem e rastreabilidade">
              <p className="prose">
                OpenFootball football.json, licença CC0-1.0.{' '}
                <a className="text-link" href={document.source?.url}>
                  Consultar arquivo original
                </a>
                . Revisão {document.source?.revision}. Coleta:{' '}
                {document.source?.collected_at}. A fonte não fornece IDs CBF nem fuso
                horário; identificadores internos são UUIDs determinísticos dos
                confrontos, separados dos localizadores externos.
              </p>
              <p className="prose">
                SHA-256: <span className="checksum">{document.dataset_version}</span>. O
                recorte é validado por rodada oficial declarada na fonte. A conciliação
                com a tabela CBF e suas limitações estão em docs/DATA_QUALITY.md.
              </p>
            </Panel>
          </>
        )}
      </QueryState>
      <div className="two-columns">
        <Panel title="Pipeline reproduzível">
          <ol className="report-pages">
            <li>Bronze: JSON original imutável, hash e proveniência.</li>
            <li>Silver: clubes canônicos, placares tipados, validação de 380 jogos.</li>
            <li>Gold: 760 registros clube × partida, totais e 760 acumulados.</li>
            <li>Parquet/CSV → PostgreSQL → API → React e Power BI.</li>
          </ol>
        </Panel>
        <Panel title="Fórmulas e limites">
          <p className="prose">
            Pontos = 3 × vitórias + empates. Aproveitamento = pontos ÷ (3 × jogos) ×
            100. Saldo = gols pró − gols contra. Médias usam os componentes somados e o
            número de jogos do mesmo recorte. Jogos sem gols sofridos são contados a
            partir do placar.
          </p>
          <p className="prose">
            Sequências usam a data de realização; acumulados usam a rodada oficial.
            Classificação calculada não reproduz cartões ou sorteio. Posse, passes, xG,
            finalizações e estatísticas individuais estão indisponíveis.
          </p>
        </Panel>
      </div>
      <Panel title="Big Data com dimensão honesta">
        <p className="prose">
          380 partidas são um volume pequeno. Este trabalho demonstra ETL, camadas
          Bronze/Silver/Gold, particionamento, armazenamento colunar, qualidade,
          rastreabilidade e idempotência. Não representa processamento massivo em
          produção. Pandas e PostgreSQL atendem ao volume sem cluster distribuído.
        </p>
      </Panel>
      <Panel title="Como interpretar a comparação">
        <p className="prose">
          Os dois clubes usam a mesma janela de rodadas e o mesmo mando. O número de
          jogos explicita o denominador e pode variar em recortes parciais. Pontos,
          vitórias, gols pró, saldo, aproveitamento e jogos sem sofrer gol favorecem
          valores maiores; derrotas e gols contra favorecem valores menores. Empates são
          descritivos. Destaques indicam o melhor valor observado, sem inferência causal
          ou teste de significância.
        </p>
        <p className="prose">
          Diferença absoluta = A − B. Variação relativa = (A − B) ÷ |B| × 100. Base zero
          ou indicador ausente permanece indisponível. A diferença de aproveitamento é
          expressa em pontos percentuais; barras de comparação representam magnitudes,
          com o sinal preservado nos valores.
        </p>
      </Panel>
    </>
  );
}

export function PowerBiPage() {
  const summary = useAnalytics('summary');
  return (
    <>
      <PageTitle
        kicker="BUSINESS INTELLIGENCE"
        title="Power BI"
        description="Modelo coletivo com a mesma semântica da API e do Python."
      />
      <div className="notice">
        <div>
          <strong>Materiais de montagem disponíveis</strong>
          <p>
            Não há PBIX/PBIP validado. A abertura, montagem e conferência no Power BI
            Desktop permanecem uma etapa manual documentada.
          </p>
        </div>
      </div>
      <Ready query={summary}>
        {(document) => (
          <Cards
            row={document.data.club}
            metrics={['played', 'points', 'goals_for', 'goals_against']}
          />
        )}
      </Ready>
      <div className="two-columns">
        <Panel title="Arquivos no diretório powerbi/">
          <ol className="report-pages">
            <li>model.json: fatos, dimensões e relações.</li>
            <li>queries/Collective.m: importação das tabelas reais.</li>
            <li>measures.dax: pontos, gols e aproveitamento.</li>
            <li>theme.json: identidade visual preservada.</li>
            <li>README.md: montagem e valores para conferência.</li>
          </ol>
        </Panel>
        <Panel title="Páginas do relatório">
          <ol className="report-pages">
            <li>Temporada e campanha do Flamengo.</li>
            <li>Comparação dos 20 clubes.</li>
            <li>Análise ofensiva e defensiva.</li>
            <li>Mandante versus visitante.</li>
            <li>Evolução e qualidade dos dados.</li>
          </ol>
          <p className="prose">
            Exporte os dados com npm run powerbi:prepare. Configure o caminho local no
            Power Query, crie as relações e importe o tema. Os detalhes estão no guia do
            repositório.
          </p>
        </Panel>
      </div>
    </>
  );
}
