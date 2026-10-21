# Matriz de aceite coletiva

| Requisito               | Evidência/estado                                                                  |
| ----------------------- | --------------------------------------------------------------------------------- |
| Preservação             | shell/infra reaproveitados, legado e migrações mantidos                           |
| Recorte e dados         | 380 jogos/20 clubes/38 rodadas; todos os placares conferidos                      |
| Pipeline                | Pandas/Parquet/CSV, Bronze/Silver/Gold e idempotência executados                  |
| Indicadores             | 20 totais e 760 acumulados comparados Python/JS/SQL                               |
| PostgreSQL              | migração aditiva, views, checks, importação/rollback em cluster isolado           |
| Banco pessoal           | DATABASE_URL ausente; não acessado/alterado                                       |
| API                     | metadados, qualidade, jogos, KPIs, ranking, evolução, comparação, descritiva, CSV |
| React                   | nove páginas coletivas integradas, filtros/tabelas/gráficos/estados/SVGs          |
| Análises                | seis notebooks executados e seis figuras reais                                    |
| Power BI                | modelo/M/DAX/tema/CSVs; PBIX/validação Desktop pendentes                          |
| Arquitetura/comentários | AST/imports/ciclos/tokenização e lint                                             |
| Testes/build/smoke      | evidências atuais em TEST_REPORT.md                                               |
| Visual                  | revisão desktop/mobile bloqueada por controle de URL                              |
| Acadêmico               | relatório, fontes, limitações e roteiro de oito minutos                           |

Pendências não são declaradas concluídas: banco dedicado, revisão visual e Power BI Desktop. Sem publicação ou commits.
