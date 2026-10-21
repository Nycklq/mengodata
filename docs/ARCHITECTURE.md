# Arquitetura coletiva implementada

O shell React, estilos, SVGs, gateways, providers, Express, pool, migrador e infraestrutura Python foram reaproveitados. O servidor e Dashboard ativos usam o domínio coletivo. A análise individual permanece isolada, sem rotas ativas.

| Camada                  | Implementação                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| Domínio Python          | domain/collective.py: recorte, normalização, fatos, agregação, sequências, quartis e ranking            |
| Aplicação Python        | import_collective.py: coordena leitura, aprovação e publicação por portas                               |
| Infra Python            | collective_files.py: IO/Parquet/CSV; collective_research.py: figuras; official_collective_audit.py: PDF |
| Composição Python       | main/import_collective, analyze_collective, audit_collective e export_collective_powerbi                |
| Domínio API             | domain/collective.js: seleção, somas, sequências, ranking e descritiva                                  |
| Aplicação API           | get-collective.js: consultas por repositório injetado                                                   |
| HTTP                    | collective-routes.js: Zod, paginação, CSV e códigos de resposta                                         |
| Infra API               | collective-files.js: integridade contra Bronze; postgres-collective.js: leitura/escrita parametrizadas  |
| Composição API          | server.js, migrate.js, import-collective.js; sem migração no startup                                    |
| Domínio React           | collective.js: filtros, rótulos e contrato de exportação                                                |
| Aplicação/gateway React | load-analytics.js e http-analytics-gateway.js reutilizados                                              |
| Apresentação            | CollectivePages, CollectiveDocumentation, CollectivePlot e Dashboard                                    |

Pandas/NumPy expressam cálculo tabular sem IO no núcleo Python. Domínio/aplicação não importam HTTP, SQL, filesystem ou conectores. Portas são funções/objetos necessários, sem camadas vazias. Componentes apresentam valores; regras analíticas ficam fora do JSX. Testes AST/imports/ciclos/tokenização verificam dependências e código sem comentários.

Fluxo: fonte fixa CC0 → Bronze fiel → Silver validada → Gold por clube/rodada → Parquet/CSV/JSON → PostgreSQL opcional → API → React. Notebooks e BI usam a mesma Gold. Partição: season=2025/competition=brasileirao-serie-a-men. JSON atende Node sem driver Parquet; CSV atende Power Query.

Esquema collective com FKs/checks/índices/transações/advisory lock e hash único. Views team_matches, club_totals e round_totals calculam dos placares. Snapshot Gold e proveniência são guardados por importação. Migração 004 e ledger próprios preservam 001–003 e tabelas antigas. Sem DATABASE_URL, Gold local validada; com a variável, mesma versão no banco, sem fallback silencioso. Testes usam cluster temporário isolado.
