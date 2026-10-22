import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DataNotice, PageTitle, Panel, QueryState } from './AnalyticsUi.jsx';
import { useAnalytics } from './analytics-hooks.js';
import { SportsIcon } from './SportsIcon.jsx';

export function MethodologyPage() {
  const quality = useAnalytics('data-quality');
  return (
    <>
      <PageTitle
        kicker="TRANSPARÊNCIA POR PRINCÍPIO"
        title="Metodologia e fontes"
        description="O significado de cada número começa antes do cálculo."
      />
      <QueryState query={quality}>
        {(document) => (
          <>
            <DataNotice document={document} />
            <div className="two-columns">
              <Panel title="Recorte da pesquisa">
                <dl className="definition-list">
                  <dt>Clube</dt>
                  <dd>Flamengo</dd>
                  <dt>Competição</dt>
                  <dd>Brasileirão Série A masculino</dd>
                  <dt>Temporada</dt>
                  <dd>2025 completa</dd>
                  <dt>Rodadas oficiais</dt>
                  <dd>1 a 38, inclusive jogos adiados</dd>
                  <dt>Unidade de observação</dt>
                  <dd>Jogador por partida pelo Flamengo</dd>
                </dl>
              </Panel>
              <Panel title="Situação das fontes">
                <div className="source-card">
                  <span className="badge neutral">AUXILIAR · CC0</span>
                  <h3>OpenFootball</h3>
                  <p>
                    Referências de partidas e resultados.{' '}
                    {document.references?.matches?.length ?? 'Nenhuma'} referências
                    importadas. Sem scouts individuais ou IDs oficiais conciliados.
                  </p>
                </div>
                <div className="source-card">
                  <span className="badge">BLOQUEADA PARA ESTATÍSTICAS</span>
                  <h3>Snapshots Cartola / CSV candidato</h3>
                  <p>
                    Acumulados por rodada, lacunas de cobertura, ausência de minutos e
                    direitos de uso não comprovados para este projeto.
                  </p>
                </div>
              </Panel>
            </div>
          </>
        )}
      </QueryState>
      <Panel title="Regras de cálculo">
        <div className="formula-grid">
          {[
            ['Participação direta', 'gols + assistências'],
            ['Produção por 90 minutos', 'produção ÷ minutos × 90'],
            ['Conversão de finalizações', 'gols ÷ finalizações × 100'],
            ['Acerto de passes', 'passes certos ÷ tentados × 100'],
          ].map(([label, formula]) => (
            <div key={label}>
              <h3>{label}</h3>
              <code>{formula}</code>
            </div>
          ))}
        </div>
        <p className="panel-footnote">
          Divisão por zero, denominador ausente ou componente desconhecido produzem
          valor indisponível. Razões agregadas usam a soma dos componentes, nunca a
          média das razões de cada partida.
        </p>
      </Panel>
      <div className="two-columns">
        <Panel title="Cobertura e identidade">
          <p className="prose">
            IDs canônicos identificam jogador e partida. Fonte, hash, data de coleta,
            clube, competição, temporada e rodada oficial são preservados. Aparições em
            outros clubes ficam fora do recorte. Totais anuais exigem verificação das 38
            rodadas.
          </p>
        </Panel>
        <Panel title="Limites de interpretação">
          <p className="prose">
            Volume e eficiência respondem a perguntas diferentes. Posição, minutos e
            função tática afetam comparações. xG e xA dependem do modelo do fornecedor e
            só aparecem quando sua definição e disponibilidade forem verificadas.
          </p>
        </Panel>
      </div>
      <Panel title="Rastreabilidade">
        <p className="prose">
          Consulte docs/SOURCE_APPROVAL.md, docs/DATA_QUALITY.md, docs/METRICS.md e
          docs/ACADEMIC_REPORT.md para evidências, decisões e limitações. As referências
          de partidas não liberam automaticamente métricas individuais ou exportação.
        </p>
      </Panel>
    </>
  );
}
export function NotFoundPage() {
  return (
    <>
      <PageTitle
        kicker="PÁGINA NÃO ENCONTRADA"
        title="Fora de campo"
        description="Este endereço não corresponde a uma página do projeto."
      />
      <Link className="button" to="/">
        Voltar à visão geral <ArrowRight size={17} />
      </Link>
    </>
  );
}
