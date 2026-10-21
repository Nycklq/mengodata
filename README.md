# Flamengo Analytics

Análise Estatística e Comparativa do Desempenho do Flamengo no Campeonato Brasileiro Série A masculino de 2025. Temporada completa, rodadas oficiais 1–38; comparação com os outros 19 clubes.

## Entrega local

Pipeline Python/Pandas/NumPy, Bronze/Silver/Gold em Parquet/CSV, seis notebooks executados, seis figuras Matplotlib/Seaborn, PostgreSQL, API Express e nove páginas React/Vite/Tailwind/Recharts. A implementação anterior foi aproveitada; os módulos individuais permanecem inativos e com seus testes preservados.

**380 partidas, 20 clubes, 38 rodadas e 38 partidas do Flamengo importados.** Todos os 380 placares foram confrontados com a tabela detalhada CBF sem divergências. Dez rodadas e uma data não estão explícitas na extração PDF e não foram inferidas. [Auditoria](docs/evidence/collective-cbf-audit.json).

Flamengo: 79 pontos, 23 vitórias, 10 empates, 5 derrotas, 78 gols pró, 27 contra, saldo +51, 18 partidas sem sofrer gol e aproveitamento de 69,30%. Em casa: 47 pontos; fora: 32. A tabela é identificada como **classificação calculada**.

## Instalação Windows 11

Node.js 24, Python 3.14 e PostgreSQL local. Preserve uma .venv existente compatível. Na raiz, PowerShell:

```powershell
npm.cmd ci
py -3.14 -m venv .venv
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

```powershell
npm.cmd run dev:backend
```

```powershell
npm.cmd run dev:frontend
```

Abra http://127.0.0.1:5173/. API: http://127.0.0.1:3001/api/health. Rotas: /, /partidas, /classificacao, /comparar, /ofensivo, /defensivo, /estatisticas, /power-bi e /metodologia. Filtros, paginação, comparação e CSV mantêm o recorte; estados de carregamento, erro, vazio e ausência são explícitos.

Sem DATABASE_URL, a API usa a Gold local verificada contra Bronze. Com a variável, exige a mesma versão no PostgreSQL; versão ausente retorna indisponível, sem fallback silencioso.

## PostgreSQL

Não havia .env/DATABASE_URL configurada nesta entrega. Os testes importaram dados reais em clusters temporários isolados, encerrados ao final. Nenhum banco pessoal foi acessado ou alterado.

Configure DATABASE_URL no .env local de um banco dedicado previamente conferido. Credenciais não são versionadas. Diagnóstico somente leitura e migrações explícitas:

```powershell
npm.cmd run db:check
npm.cmd run db:migrate
npm.cmd run db:import
```

A migração 004 cria o esquema collective com ledger próprio; não executa ou altera 001–003 nem reclassifica tabelas antigas. A API nunca migra ao iniciar. [Guia](database/README.md).

## Verificar e apresentar

Execute o pipeline antes dos testes em um checkout novo:

```powershell
npm.cmd run verify
```

ESLint/Prettier, testes JS/React/Python/PostgreSQL isolado, Ruff, notebooks, build e smoke HTTP/Vite. [Resultados observados](docs/TEST_REPORT.md). A revisão visual desktop/mobile foi bloqueada pelo controle de UI; DOM não a substitui.

[Power BI](powerbi/README.md): CSVs reais, modelo, M, DAX, tema e guia. Não há PBIX/PBIP validado. [Roteiro acadêmico de oito minutos](docs/PRESENTATION.md).

[Estado](docs/STATUS.md), [arquitetura](docs/ARCHITECTURE.md), [métricas](docs/METRICS.md), [fontes](docs/DATA_SOURCES.md), [qualidade](docs/DATA_QUALITY.md), [API](docs/api/README.md). Sem commits, push, publicação ou contratação.
