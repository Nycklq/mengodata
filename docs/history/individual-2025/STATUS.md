# Estado real — desenvolvimento integrado de 2025

Atualizado em 19/10/2026. Flamengo, Brasileirão Série A masculino, temporada completa de 2025, rodadas oficiais 1 a 38. O projeto existente foi ampliado, sem reinicialização, commits ou publicação.

| Módulo             | Implementado                                                                                                                  | Verificação / limite                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Núcleo JS/Python   | Agregação, G+A, taxas por 90, razões ponderadas, nulos, quartis e outliers                                                    | Fixtures matemáticas compartilhadas; sem cálculo individual de produção         |
| Pipeline           | Auditoria, manifesto v2, importação auxiliar Bronze/Silver/Gold, entrada individual condicionada a revisão de hash/permissões | 38 referências reais importadas; reexecução changed=false; individual bloqueado |
| Backend            | Resumo, jogadores/perfil, rankings, ataque/defesa, posições, distribuição, comparação, CSV condicionado, rate limit           | Testes HTTP e casos de uso; nenhum atleta real liberado                         |
| PostgreSQL         | Migração aditiva 003, fatos, proveniência, constraints, transações, repositórios de escrita e leitura                         | 25 testes passaram em cluster isolado; banco pessoal não migrado                |
| Frontend           | Nove páginas, roteamento, filtros, busca, ordenação, paginação, comparador, estados e SVGs originais/Lucide                   | 24 testes passaram; revisão visual bloqueada pela ferramenta                    |
| Notebooks          | Seis arquivos executados com auditoria real e bloqueios explícitos                                                            | Análises esportivas e gráficos individuais dependem de fonte                    |
| Power BI           | Modelo, M, DAX, tema, exportador com direito específico e instruções                                                          | Preparação vazia executada; motor Desktop/PBIX/PBIP não validado                |
| API / documentação | OpenAPI gerado, execução, dicionário, metodologia acadêmica e matriz de aceite                                                | Verificação consolidada aprovada; detalhes em TEST_REPORT.md                    |

Resultado consolidado: **242 testes aprovados** (backend 26, frontend 24, raiz JS 10, Python 157, PostgreSQL 25), lint/formatação, seis notebooks, build e smoke aprovados. Relatório e limites em [TEST_REPORT.md](TEST_REPORT.md).

## Dados e bloqueios

OpenFootball está autorizado somente como referência auxiliar CC0, na revisão e hash de [source-approval.json](../contracts/source-approval.json). A importação real preservou os bytes em data/raw, normalizou em data/processed e gerou data/analytics/references.json. A API e a visão geral consomem esses resultados sem atribuí-los a atletas. Não há IDs CBF ou fuso inventados, nem manifesto oficial completo homologado.

A fonte individual permanece sem aprovação. O candidato Cartola contém snapshots acumulados, lacunas e direitos não comprovados; não foi incorporado ao produto. [dataset-approvals.json](../contracts/dataset-approvals.json) não possui datasets aprovados. Sem revisão de conteúdo, granularidade, cobertura, participações e permissões, a entrada individual falha antes de gravar. Exportação CSV e distribuição Power BI têm permissões próprias.

## Ambiente preservado

Backend e Vite iniciaram localmente em 127.0.0.1:3001 e 127.0.0.1:5173. A API inicia sem banco para referências e indisponibilidade. Com DATABASE_URL, a leitura individual depende da importação aprovada no PostgreSQL. Nenhuma migração automática ocorre no startup.

As migrações 001/002 e o histórico de 2026 foram preservados. A migração 003 apenas adiciona estrutura. Integrações usam cluster temporário com porta própria; não foram criadas credenciais ou bancos pessoais. Não há containers, Spark ou Hadoop.

A revisão visual foi tentada com computer-use. O navegador integrado não estava disponível e o controle nativo encerrou por não identificar a URL com confiança para aplicar suas regras. Não foram realizados novos comandos de UI após o bloqueio. DOM, navegação, SVGs e estados têm testes, mas isso não certifica layout desktop/mobile ou acessibilidade completa.

## Continuidade

Verificações e documentação desta ampliação foram concluídas dentro dos limites registrados. O próximo passo externo essencial será obter um artefato individual autorizado e auditar participações/identidades por partida nas 38 rodadas. Só então atualizar os registros revisados, executar o importador, conciliar métricas e validar o relatório no Power BI Desktop. Minutas não enviadas: [SOURCE_PERMISSION_REQUEST.md](SOURCE_PERMISSION_REQUEST.md).
