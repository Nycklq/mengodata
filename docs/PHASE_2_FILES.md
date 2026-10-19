# Inventário efetivo

O nome deste arquivo foi preservado para manter links anteriores. A entrega atual amplia a fundação da Fase 2; o histórico de 2026 não é norma operacional.

| Área                                                                 | Arquivos e responsabilidades                                                                   |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Raiz                                                                 | Workspaces npm, locks, ESLint/Prettier, .env.example, scripts e CI                             |
| packages/domain/src                                                  | scope.js e metrics.js                                                                          |
| contracts                                                            | Escopo; manifesto/metadados v2; aprovação de fontes/datasets; indicadores e schema individual  |
| backend/src/domain                                                   | project-metadata, analytics e dataset-approval                                                 |
| backend/src/application                                              | Metadados, consultas analíticas e ingestão por portas                                          |
| backend/src/interfaces/http                                          | Aplicação Express e rotas analíticas                                                           |
| backend/src/infrastructure/persistence                               | Arquivos revisados, PostgreSQL, migrações e diagnóstico                                        |
| backend/src/main                                                     | Composição e CLIs de operação                                                                  |
| frontend/src/app                                                     | Entrada, Dashboard, roteamento, estado de viewport e CSS                                       |
| frontend/src/features/analytics                                      | Domínio, caso de uso, gateway e apresentação de todas as rotas analíticas                      |
| frontend/src/features/project-status                                 | Fatia anterior preservada e testada                                                            |
| pipeline/src/flamengo_pipeline                                       | Domínio, aplicação, adaptadores, infraestrutura e composição de auditoria/ingestão/research/BI |
| database/migrations                                                  | 001/002 preservadas e 003 aditiva de importações/fatos                                         |
| tests, backend/tests, frontend/tests, pipeline/tests, database/tests | Fórmulas, regras, contratos, interfaces, arquitetura, importação e SQL isolado                 |
| notebooks                                                            | Seis notebooks executados, sem estatísticas individuais fictícias                              |
| powerbi                                                              | model.json, theme.json, measures.dax, queries/ e instruções                                    |
| docs/api                                                             | OpenAPI gerado e guia de recursos                                                              |
| docs                                                                 | Evidências de fontes, arquitetura, semântica, qualidade, metodologia acadêmica e aceite        |
| data                                                                 | Estágios gerados localmente; nenhum dataset individual aprovado                                |

Não foram criadas pastas vazias para simular entregas. Artefatos locais ignorados incluem .venv, node_modules, dist, .tmp e dados gerados. Evidências auditáveis e notebooks executados ficam no repositório; CSVs candidatos não são publicados. Estado e comandos em STATUS.md e README.md.
