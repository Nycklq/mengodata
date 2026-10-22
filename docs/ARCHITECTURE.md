# Arquitetura coletiva implementada

## Landing, identidade e aparência MengoData

`app/main.jsx` compõe QueryClient, gateway analítico, gateway de aparência, provider e roteador. `Application.jsx` separa a landing pública em `/` das nove páginas em `/dashboard`; aliases legados preservam query/hash. `use-page-navigation.js` trata foco e âncoras que dependem da chegada dos dados. Não há autenticação.

`features/landing/domain/season-preview.js` verifica escopo completo e cobertura antes de liberar a vitrine; comparações exigem a mesma versão da base. `LandingPage.jsx` coordena consultas pelo caso de uso/gateway existente e apresenta os resultados, sem fetch direto, SQL ou cálculo estatístico. `StadiumArt.jsx` e `DataFlow.jsx` são apresentação SVG própria. Marca e navegação compartilham `Brand.jsx` e `ThemeToggle.jsx`.

`features/appearance/domain/theme.js` resolve preferência e sistema; `application/appearance.js` coordena leitura/escrita por porta; `infrastructure/browser-appearance.js` adapta localStorage, matchMedia e documento. Provider e controle pertencem à apresentação. O bootstrap síncrono em `public/theme-init.js` atua na borda de inicialização, antes do CSS/React; o domínio não conhece navegador.

`design-system.css` substitui os imports dos estilos antigos na composição ativa; os arquivos legados permanecem preservados. Tokens semânticos atendem landing, dashboard e gráficos em ambos os temas. Poppins vem de pacote fixado e arquivos locais. Recharts continua sendo a única biblioteca de gráficos web; seu domínio numérico inclui zero e mantém negativos. Testes do renderer real verificam geometria SVG em dimensões controladas, sem simular aprovação visual do navegador.

## Integração MengoData

Destino ativo: `127.0.0.1:5432/mengo_data`, role `flamengo_app`. O schema existente foi aproveitado sem alterar domínio, casos de uso ou migrações. O `.env` da raiz é resolvido por caminho absoluto; variável herdada prevalece. O repositório PostgreSQL continua recebendo o pool por injeção e lendo o snapshot aprovado, sem fallback silencioso.

`infrastructure/persistence/database-error.js` traduz códigos do driver para mensagens fixas sem expor SQL, URLs ou senhas; somente os comandos de composição check/import consomem esse diagnóstico. O pool identifica suas sessões pelo PID Node para conferência local. `database/operations/grant-mengo-data.sql` é uma operação administrativa explícita e transacional, protegida pelo nome do banco, sem execução no startup. Testes isolados comprovam a proteção e os privilégios mínimos.

## Refinamento de 22/10/2026

O redesign reutiliza a composição, os gateways e os casos de uso existentes. `domain/comparison.js` concentra sentido das métricas, diferenças, denominadores, mesclagem por rodada e ajuste dos limites de filtros. `ComparisonPage.jsx` coordena consultas pelo hook existente e apresenta resultados. `CollectiveUi.jsx` reúne os componentes coletivos já existentes, extraídos para uso nas páginas e na comparação, sem dependência circular. O formatador fica em apresentação; nenhum cálculo estatístico foi inserido em componentes.

`infrastructure/persistence/local-postgres.js` controla apenas o cluster operacional próprio, usando executáveis PostgreSQL instalados e arquivos locais. `main/local-database.js` compõe setup/start/stop/status e configure com backup, sempre explícitos; não é chamado pelo servidor. `.local` e `.env` são ignorados pelo Git e pelas ferramentas que percorrem o código. Não há domínio esportivo no provisionamento, migração automática ou reutilização de banco pessoal. Testes usam diretórios/clusters temporários separados.

O resumo da API agora encontra a posição nos totais dos 20 clubes do mesmo recorte. A posição de evolução permanece a reconstrução do campeonato até a rodada oficial, enquanto pontos/gols da curva respeitam a janela e o mando. Não houve alteração do esquema ou das migrações históricas.

## Base preservada

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
