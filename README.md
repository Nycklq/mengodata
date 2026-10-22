# MengoData

Análise Estatística e Comparativa do Desempenho do Flamengo no Campeonato Brasileiro Série A masculino de 2025. Temporada completa, rodadas oficiais 1–38; comparação com os outros 19 clubes.

## Entrega local

Landing pública e nove páginas analíticas React/Vite/Recharts, API Express, PostgreSQL, pipeline Python/Pandas/NumPy, Bronze/Silver/Gold em Parquet/CSV, seis notebooks executados e seis figuras Matplotlib/Seaborn. A implementação anterior foi aproveitada; os módulos individuais permanecem inativos e com seus testes preservados.

Redesign de 22/10/2026: identidade oficial MengoData, Poppins local em toda a interface, paleta #C3271D/#000000/#FFFFFF e temas claro/escuro completos. Landing inspirada na composição Finexa, estádio em SVG próprio e prévias reais da API. Acesso público direto ao dashboard, sem autenticação. Comparação de quaisquer dois clubes, diferenças, evolução e filtros na URL. [Design e revisão manual](docs/DESIGN_REVIEW.md), [assets e licenças](docs/ASSETS.md).

**380 partidas, 20 clubes, 38 rodadas e 38 partidas do Flamengo importados.** Todos os 380 placares foram confrontados com a tabela detalhada CBF sem divergências. Dez rodadas e uma data não estão explícitas na extração PDF e não foram inferidas. [Auditoria](docs/evidence/collective-cbf-audit.json).

Flamengo: 79 pontos, 23 vitórias, 10 empates, 5 derrotas, 78 gols pró, 27 contra, saldo +51, 18 partidas sem sofrer gol e aproveitamento de 69,30%. Em casa: 47 pontos; fora: 32. A tabela é identificada como **classificação calculada**.

## Instalação Windows 11

Node.js 24, Python 3.14 e PostgreSQL local. Preserve uma .venv existente compatível. Na raiz, PowerShell:

```powershell
npm.cmd ci
if (-not (Test-Path .venv)) { py -3.14 -m venv .venv }
.\.venv\Scripts\python.exe -m pip install -r pipeline/requirements.lock.txt
.\.venv\Scripts\python.exe -m pip install --no-deps -e pipeline
```

Sem containers, Spark ou Hadoop. O volume é pequeno; o projeto demonstra conceitos do ecossistema Big Data.

## Reproduzir

```powershell
npm.cmd run pipeline:collective
npm.cmd run collective:analyze
npm.cmd run collective:parity
npm.cmd run powerbi:prepare
npm.cmd run notebooks:execute
```

O pipeline baixa a revisão fixa CC0, confere SHA-256 e valida o campeonato inteiro antes de publicar. Reexecução idêntica retorna changed=false e mantém bytes/coleta. Para reprodução offline, use a cópia Bronze:

```powershell
npm.cmd run pipeline:collective -- --input data/raw/collective/season=2025/competition=brasileirao-serie-a-men/0fcc4647256b2e1f58b50f1372b751aeb7e6aacb5b8cd747579dd7ab71303fbb.json
```

Repita a conciliação oficial com npm.cmd run collective:audit. [Gráficos](reports/collective/README.md), [resultados](reports/collective/report.json), [notebooks](notebooks/README.md) e [relatório acadêmico](docs/ACADEMIC_REPORT.md).

## Abrir a aplicação

Em dois terminais na raiz:

O destino ativo é `127.0.0.1:5432/mengo_data`, atendido pelo PostgreSQL local instalado. Reinicie a API após alterar o `.env`. Os comandos `db:local:*` controlam outro cluster e não são necessários para o MengoData.

```powershell
npm.cmd run dev:backend
```

```powershell
npm.cmd run dev:frontend
```

Abra a landing em http://127.0.0.1:5173/ e use **Explorar dashboard**. Painel: http://127.0.0.1:5173/dashboard. API: http://127.0.0.1:3001/api/health. Dentro de `/dashboard`: `/partidas`, `/classificacao`, `/comparar`, `/ofensivo`, `/defensivo`, `/estatisticas`, `/power-bi` e `/metodologia`. Os oito endereços antigos redirecionam preservando query e âncora. Filtros, paginação, comparação e CSV mantêm o recorte; estados de carregamento, erro, vazio e ausência são explícitos.

O botão de tema está na landing e no painel. O primeiro acesso acompanha o sistema; a escolha explícita é salva em `mengodata-theme`, persiste entre rotas e é aplicada antes da montagem. Fontes são servidas localmente, sem CDN.

Sem DATABASE_URL, a API usa a Gold local verificada contra Bronze. Com a variável, exige a mesma versão no PostgreSQL; versão ausente retorna indisponível, sem fallback silencioso.

## PostgreSQL

O banco ativo é **mengo_data em 127.0.0.1:5432**, role `flamengo_app`. SQL real confirmou 380 partidas/20 clubes/38 rodadas, 760 fatos, 20 totais e 760 acumulados. Importação concluída e reimportação `changed=false`. A sessão do backend foi identificada em `pg_stat_activity` consultando esse banco. [Diagnóstico e evidências](docs/POSTGRESQL_MENGO_DATA.md).

O `.env` local não é versionado. O exemplo contém uma senha fictícia que deve ser substituída localmente. O backend resolve o arquivo na raiz mesmo quando iniciado no workspace backend; DATABASE_URL herdada do terminal prevalece sobre o arquivo. A configuração anterior foi preservada em backup ignorado pelo Git.

Para o banco existente, diagnóstico somente leitura e importação explícita:

```powershell
npm.cmd run db:check
npm.cmd run db:import
```

A falha tinha duas causas de autorização: role sem LOGIN (28000), depois ausência de permissões no schema/tabelas (42501). O usuário habilitou LOGIN e executou `database/operations/grant-mengo-data.sql` no pgAdmin. O script aborta fora de `mengo_data` e concede apenas USAGE, SELECT e INSERT necessários. Não houve migração, recriação de tabelas ou alteração de outros bancos nesta configuração.

As oito relações existentes são cinco tabelas e três views. A API nunca migra ao iniciar. Migrações históricas permanecem intactas e só devem ser aplicadas explicitamente em ambiente apropriado. [Guia](database/README.md).

O cluster anterior em `.local/postgres` permanece preservado como alternativa; não é o destino ativo. `db:local:configure` troca o destino para essa alternativa, portanto não o execute para iniciar o MengoData. Testes de banco usam clusters temporários isolados.

## Comparação

Em `/dashboard/comparar`, selecione os clubes A e B, rodadas e mando. A troca inverte os lados; Restaurar comparação volta a Flamengo/Palmeiras e temporada completa. O endereço conserva a seleção. Evolução alterna pontos, gols pró/contra, saldo e aproveitamento; casa/fora detalha o mesmo recorte.

Quatorze indicadores, incluindo jogos, mostram diferença A − B e variação sobre |B|. Base zero/ausência fica indisponível. Menos derrotas/gols sofridos favorecem o clube; jogos e empates não têm vencedor. Δ de aproveitamento usa pontos percentuais. [Semântica](docs/METRICS.md).

## Verificar e apresentar

Execute o pipeline antes dos testes em um checkout novo:

```powershell
npm.cmd run verify
```

ESLint/Prettier, testes JS/React/Python/PostgreSQL isolado, Ruff, notebooks, build, smoke HTTP/Vite e Playwright. [Resultados observados](docs/TEST_REPORT.md). `npm.cmd run test:browser` usa Chrome instalado, perfil headless próprio e API isolada com a Gold real, sem acessar bancos existentes. Verifica os gráficos ativos e cards em 375/768/1024/1440 px, claro/escuro, com CSS e screenshots reais. A conferência operacional no localhost com PostgreSQL também passou. [Causa do colapso CSS, capturas e reprodução](docs/CHART_RENDERING_FIX.md). Auditoria integral de acessibilidade e outros navegadores permanecem fora dessa validação.

[Power BI](powerbi/README.md): CSVs reais, modelo, M, DAX, tema e guia. Não há PBIX/PBIP validado. [Roteiro acadêmico de oito minutos](docs/PRESENTATION.md).

[Estado](docs/STATUS.md), [arquitetura](docs/ARCHITECTURE.md), [métricas](docs/METRICS.md), [fontes](docs/DATA_SOURCES.md), [qualidade](docs/DATA_QUALITY.md), [API](docs/api/README.md), [inventário](docs/DELIVERY_FILES.md). Commits locais por funcionalidade autorizados pelo usuário; sem push, publicação ou contratação.
