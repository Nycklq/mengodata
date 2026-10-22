# Arquivos da entrega local

## Redesign MengoData — implementação atual

Inventário por funcionalidade; a lista exata de cada etapa está em `git show --stat <commit>` e o conjunto pode ser conferido com `git diff --name-only 1a5f0f0 HEAD` após os commits finais.

| Grupo                | Arquivos/diretórios principais                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Entradas verificadas | `PROMPT_MESTRE_MENGODATA_LANDING_REDESIGN_FINAL.md`, três imagens em `referencias/`                                                                                                  |
| Composição/rotas     | `frontend/src/app/Application.jsx`, `Dashboard.jsx`, `main.jsx`, `use-page-navigation.js`, `frontend/index.html`                                                                     |
| Design/fontes        | `frontend/src/app/design-system.css`, `frontend/package.json`, `package-lock.json`, `frontend/public/brand/`, `frontend/public/theme-init.js`                                        |
| Aparência            | `frontend/src/features/appearance/domain/`, `application/`, `infrastructure/`, `presentation/`                                                                                       |
| Identidade/landing   | `frontend/src/features/identity/presentation/Brand.jsx`, `features/landing/domain/season-preview.js`, `features/landing/presentation/`                                               |
| Dashboard/gráficos   | `CollectivePages.jsx`, `CollectiveDocumentation.jsx`, `CollectivePlot.jsx`, `ComparisonPage.jsx`, `AnalyticsUi.jsx` em `features/analytics/presentation/`                            |
| Transporte           | `frontend/src/features/analytics/infrastructure/http-analytics-gateway.js`                                                                                                           |
| Testes novos         | `frontend/tests/appearance.test.jsx`, `landing.test.jsx`, `collective-plot.test.jsx`, `gateway-errors.test.js`; `scripts/smoke.mjs`                                                  |
| Banco real           | `docs/evidence/mengodata-redesign-verification.json`, `docs/POSTGRESQL_MENGO_DATA.md`; nenhuma migração nova                                                                         |
| Acadêmico            | seis notebooks, seis figuras em `reports/collective/`, `pipeline/.../collective_research.py`, `pipeline/.../run_notebooks.py`                                                        |
| API/BI               | `scripts/generate-openapi.mjs`, `docs/api/openapi.json`, `powerbi/theme.json`, `theme-dark.json`, README BI, `tests/artifacts.test.js`                                               |
| Documentação         | README, AGENTS, contexto, STATUS, ARCHITECTURE, TEST_REPORT, DESIGN_REVIEW, ASSETS, DECISIONS, PRESENTATION, REQUIREMENTS_MATRIX, relatório acadêmico, guias de notebooks/resultados |

O logo antigo e CSS legados permanecem preservados. Os dois PNGs de nomes trocados na raiz são entradas do usuário, não assets de produção; ficaram fora dos commits. `.env`, `.local` e `.tmp` continuam ignorados. Os inventários seguintes descrevem etapas anteriores.

## Configuração MengoData

- `.env` local ajustado para o banco existente em 5432 e configuração anterior preservada em backup ignorado; `.env.example` atualizado sem credenciais reais.
- `backend/src/infrastructure/persistence/database-error.js` e `postgres-pool.js`: diagnóstico sanitizado e identificação da sessão.
- `backend/src/main/check-database.js` e `import-collective.js`: erros de autorização, autenticação e schema distinguíveis no CLI.
- `backend/tests/database-error.test.js`, `environment.test.js` e `database/tests/collective.test.js`: sigilo dos erros, carregamento de configuração e grants em clusters isolados.
- `database/operations/grant-mengo-data.sql`: permissões mínimas com proteção contra banco errado.
- `docs/POSTGRESQL_MENGO_DATA.md` e `docs/evidence/mengo-data-verification.json`: consultas reais, contagens, equivalência e rastreamento da API.
- README, guia de banco, STATUS, TEST_REPORT, ARCHITECTURE, DECISIONS, contexto operacional e roteiro atualizados para o destino ativo.

## Refinamento de 22/10/2026

- Marca: `frontend/public/flamengo-logo.png` e `frontend/index.html`.
- Shell e design: `frontend/src/app/Dashboard.jsx`, `main.jsx`, `use-compact-navigation.js` e `refinements.css`; `styles.css` preservado.
- Domínio/filtros: `frontend/src/features/analytics/domain/comparison.js` e `collective.js`.
- Apresentação: `ComparisonPage.jsx`, `CollectiveUi.jsx`, `CollectivePages.jsx`, `CollectivePlot.jsx`, `CollectiveDocumentation.jsx`, `analytics-hooks.js` e `format-value.js`.
- Backend: `backend/src/application/get-collective.js`, `backend/src/infrastructure/persistence/local-postgres.js` e `backend/src/main/local-database.js`.
- Testes: `frontend/tests/comparison.test.js`, `collective.test.jsx`, `setup.js`, `backend/tests/collective.test.js`, `database/tests/local-postgres.test.js` e exclusão de estado local em `tests/architecture.test.js`.
- Operação: `package.json`, `.gitignore`, `.prettierignore`, `eslint.config.js`; credenciais e cluster ficam exclusivamente no `.env`/`.local` ignorados, fora dos arquivos de entrega.
- Documentação: README, STATUS, TEST_REPORT, ARCHITECTURE, PRESENTATION, DESIGN_REVIEW, DECISIONS, METRICS, guias PostgreSQL/Power BI e este inventário. Tema BI e saídas de notebooks/análises foram atualizados.

Os caminhos de apresentação acima pertencem a `frontend/src/features/analytics/presentation/`. Inventário anterior preservado abaixo.

## Base coletiva anterior

Inventário da árvore de trabalho, sem commit. O Prompt Definitivo já era entrada não versionada do usuário e foi excluído desta atribuição de criação. Arquivos individuais movidos para history são preservação, não remoção da evidência histórica.

Os principais pontos de entrada são pipeline/src/flamengo_pipeline/main/import_collective.py, backend/src/main/server.js, frontend/src/app/Dashboard.jsx, database/collective-migrations/004_collective.sql, notebooks e powerbi. Caminhos completos abaixo.

- .github/workflows/quality.yml
- .gitignore
- .prettierignore
- AGENTS.md
- PROMPT_MESTRE_CODEX_FLAMENGO_ANALYTICS_2025_FINAL.md
- README.md
- backend/src/application/get-collective.js
- backend/src/domain/collective.js
- backend/src/infrastructure/persistence/collective-files.js
- backend/src/infrastructure/persistence/migrate.js
- backend/src/infrastructure/persistence/postgres-collective.js
- backend/src/interfaces/http/collective-routes.js
- backend/src/interfaces/http/create-app.js
- backend/src/main/import-collective.js
- backend/src/main/migrate.js
- backend/src/main/server.js
- backend/tests/collective.test.js
- contracts/clubs.json
- contracts/collective-source.json
- contracts/project-metadata.schema.json
- data/README.md
- data/raw/collective/LICENSE.md
- data/raw/collective/season=2025/competition=brasileirao-serie-a-men/0fcc4647256b2e1f58b50f1372b751aeb7e6aacb5b8cd747579dd7ab71303fbb.json
- data/raw/collective/season=2025/competition=brasileirao-serie-a-men/0fcc4647256b2e1f58b50f1372b751aeb7e6aacb5b8cd747579dd7ab71303fbb.metadata.json
- database/README.md
- database/collective-migrations/004_collective.sql
- database/tests/collective.test.js
- docs/ACADEMIC_REPORT.md
- docs/ARCHITECTURE.md
- docs/CONTRACTS.md
- docs/DATA_DICTIONARY.md
- docs/DATA_QUALITY.md
- docs/DATA_SOURCES.md
- docs/DECISIONS.md
- docs/DELIVERY_FILES.md
- docs/FLAMENGO_ANALYTICS_CONTEXT.md
- docs/METRICS.md
- docs/PHASE_2_FILES.md
- docs/PRESENTATION.md
- docs/REQUIREMENTS_MATRIX.md
- docs/ROUND_SCOPE.md
- docs/SOURCE_APPROVAL.md
- docs/SOURCE_AUDIT_2025.md
- docs/SOURCE_PERMISSION_REQUEST.md
- docs/STATUS.md
- docs/TEST_REPORT.md
- docs/api/README.md
- docs/api/openapi.json
- docs/evidence/collective-cbf-audit.json
- docs/history/individual-2025/ACADEMIC_REPORT.md
- docs/history/individual-2025/ARCHITECTURE.md
- docs/history/individual-2025/CONTRACTS.md
- docs/history/individual-2025/DATA_DICTIONARY.md
- docs/history/individual-2025/DATA_QUALITY.md
- docs/history/individual-2025/DATA_SOURCES.md
- docs/history/individual-2025/DECISIONS.md
- docs/history/individual-2025/FLAMENGO_ANALYTICS_CONTEXT.md
- docs/history/individual-2025/METRICS.md
- docs/history/individual-2025/PHASE_2_FILES.md
- docs/history/individual-2025/README.md
- docs/history/individual-2025/REQUIREMENTS_MATRIX.md
- docs/history/individual-2025/ROUND_SCOPE.md
- docs/history/individual-2025/SOURCE_APPROVAL.md
- docs/history/individual-2025/SOURCE_AUDIT_2025.md
- docs/history/individual-2025/SOURCE_PERMISSION_REQUEST.md
- docs/history/individual-2025/STATUS.md
- docs/history/individual-2025/TEST_REPORT.md
- docs/history/individual-2025/notebooks/01_entendimento.ipynb
- docs/history/individual-2025/notebooks/02_qualidade.ipynb
- docs/history/individual-2025/notebooks/03_ataque.ipynb
- docs/history/individual-2025/notebooks/04_defesa.ipynb
- docs/history/individual-2025/notebooks/05_comparacao.ipynb
- docs/history/individual-2025/notebooks/06_estatistica.ipynb
- docs/history/individual-2025/openapi.json
- docs/history/individual-2025/powerbi/README.md
- docs/history/individual-2025/powerbi/measures.dax
- docs/history/individual-2025/powerbi/model.json
- docs/history/individual-2025/powerbi/queries/Dimensions.m
- docs/history/individual-2025/powerbi/queries/Individual.m
- docs/history/individual-2025/powerbi/theme.json
- frontend/src/app/Dashboard.jsx
- frontend/src/app/LegacyDashboard.jsx
- frontend/src/app/styles.css
- frontend/src/features/analytics/domain/collective.js
- frontend/src/features/analytics/presentation/CollectiveDocumentation.jsx
- frontend/src/features/analytics/presentation/CollectivePages.jsx
- frontend/src/features/analytics/presentation/CollectivePlot.jsx
- frontend/tests/collective.test.jsx
- frontend/tests/dashboard.test.jsx
- notebooks/01_entendimento.ipynb
- notebooks/02_qualidade.ipynb
- notebooks/03_ataque.ipynb
- notebooks/04_defesa.ipynb
- notebooks/05_comparacao.ipynb
- notebooks/06_estatistica.ipynb
- notebooks/README.md
- package.json
- pipeline/pyproject.toml
- pipeline/requirements.lock.txt
- pipeline/src/flamengo_pipeline/application/import_collective.py
- pipeline/src/flamengo_pipeline/domain/collective.py
- pipeline/src/flamengo_pipeline/infrastructure/collective_files.py
- pipeline/src/flamengo_pipeline/infrastructure/collective_powerbi.py
- pipeline/src/flamengo_pipeline/infrastructure/collective_research.py
- pipeline/src/flamengo_pipeline/infrastructure/official_collective_audit.py
- pipeline/src/flamengo_pipeline/main/analyze_collective.py
- pipeline/src/flamengo_pipeline/main/audit_collective.py
- pipeline/src/flamengo_pipeline/main/export_collective_powerbi.py
- pipeline/src/flamengo_pipeline/main/import_collective.py
- pipeline/src/flamengo_pipeline/main/run_notebooks.py
- pipeline/tests/README.md
- pipeline/tests/test_architecture.py
- pipeline/tests/test_collective.py
- powerbi/README.md
- powerbi/measures.dax
- powerbi/model.json
- powerbi/queries/Collective.m
- powerbi/queries/Dimensions.m
- powerbi/queries/Individual.m
- reports/collective/01_distribuicao.png
- reports/collective/02_evolucao.png
- reports/collective/03_casa_fora.png
- reports/collective/04_clubes.png
- reports/collective/05_ataque_defesa.png
- reports/collective/06_estatistica.png
- reports/collective/README.md
- reports/collective/api-parity.json
- reports/collective/club_totals.csv
- reports/collective/report.json
- scripts/generate-openapi.mjs
- scripts/smoke.mjs
- scripts/validate-collective.mjs
- tests/artifacts.test.js
