# MengoData

Análise Estatística e Comparativa do Desempenho do Flamengo no Campeonato Brasileiro Série A masculino de 2025. Temporada completa, rodadas oficiais 1–38; comparação com os outros 19 clubes.

## Auditoria antes da publicação

Limpeza segura de 22/10/2026: três arquivos sem uso removidos, página Power BI legada eliminada e duas dependências Tailwind inativas retiradas. Os 19 arquivos do build permaneceram idênticos. Landing, dashboard, dados, cálculos e banco existente preservados. [Relatório de limpeza](#relatório-de-limpeza), [testes executados](#resultados-desta-auditoria) e [integridade verificável](docs/evidence/repository-cleanup-integrity.json).

Durante a conferência final, o usuário removeu os documentos Markdown diretamente em `docs/` e confirmou que deveriam continuar removidos. Não foram recriados. Este README concentra agora instruções, arquitetura, resultados e pendências; `docs/api/`, `docs/evidence/` e `docs/history/` permanecem disponíveis. As exclusões de documentação são registradas separadamente das três remoções de código/assets da limpeza.

Não houve deploy. Ainda faltam configuração SPA/proxy de API na Vercel, ajuste do bind para Render, preparação da Gold no ambiente de hospedagem e validação de TLS/migração/importação no Neon. A configuração local não foi alterada.

## Entrega local

Landing pública e oito páginas analíticas React/Vite/Recharts, API Express, PostgreSQL, pipeline Python/Pandas/NumPy, Bronze/Silver/Gold em Parquet/CSV, seis notebooks executados e seis figuras Matplotlib/Seaborn. A implementação anterior foi aproveitada; os módulos individuais permanecem inativos e com seus testes preservados.

Redesign de 22/10/2026: identidade oficial MengoData, Poppins local em toda a interface, paleta #C3271D/#000000/#FFFFFF e temas claro/escuro completos. Landing inspirada na composição Finexa, estádio em SVG próprio e prévias reais da API. Acesso público direto ao dashboard, sem autenticação. Comparação de quaisquer dois clubes, diferenças, evolução e filtros na URL. [Evidências visuais](docs/evidence/editorial-browser-verification.json).

**380 partidas, 20 clubes, 38 rodadas e 38 partidas do Flamengo importados.** Todos os 380 placares foram confrontados com a tabela detalhada CBF sem divergências. Dez rodadas e uma data não estão explícitas na extração PDF e não foram inferidas. [Auditoria](docs/evidence/collective-cbf-audit.json).

Flamengo: 79 pontos, 23 vitórias, 10 empates, 5 derrotas, 78 gols pró, 27 contra, saldo +51, 18 partidas sem sofrer gol e aproveitamento de 69,30%. Em casa: 47 pontos; fora: 32. A tabela é identificada como **classificação calculada**.

Redesign editorial posterior: oito páginas públicas, Power BI complementar fora da navegação, escudo original sem cartão e refinamento de tipografia, formulários, tabelas e superfícies. Hero com estádio, prévia, três cards e comparação mantidos. [Integridade editorial](docs/evidence/editorial-integrity.json) e [polimento da landing](docs/evidence/landing-polish-browser.json).

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
npm.cmd run notebooks:execute
```

O pipeline baixa a revisão fixa CC0, confere SHA-256 e valida o campeonato inteiro antes de publicar. Reexecução idêntica retorna changed=false e mantém bytes/coleta. Para reprodução offline, use a cópia Bronze:

```powershell
npm.cmd run pipeline:collective -- --input data/raw/collective/season=2025/competition=brasileirao-serie-a-men/0fcc4647256b2e1f58b50f1372b751aeb7e6aacb5b8cd747579dd7ab71303fbb.json
```

Repita a conciliação oficial com npm.cmd run collective:audit. [Gráficos](reports/collective/README.md), [resultados e interpretações](reports/collective/report.json) e [notebooks](notebooks/README.md).

## Abrir a aplicação

Em dois terminais na raiz:

O destino ativo é `127.0.0.1:5432/mengo_data`, atendido pelo PostgreSQL local instalado. Reinicie a API após alterar o `.env`. Os comandos `db:local:*` controlam outro cluster e não são necessários para o MengoData.

```powershell
npm.cmd run dev:backend
```

```powershell
npm.cmd run dev:frontend
```

Abra a landing em http://127.0.0.1:5173/ e use **Explorar dashboard**. Painel: http://127.0.0.1:5173/dashboard. API: http://127.0.0.1:3001/api/health. Dentro de `/dashboard`: `/partidas`, `/classificacao`, `/comparar`, `/ofensivo`, `/defensivo`, `/estatisticas` e `/metodologia`, além da visão geral. Os sete aliases dessas subpáginas preservam query e âncora. `/power-bi` e `/dashboard/power-bi` redirecionam para `/dashboard`. Filtros, paginação, comparação e CSV mantêm o recorte; estados de carregamento, erro, vazio e ausência são explícitos.

O botão de tema está na landing e no painel. O primeiro acesso acompanha o sistema; a escolha explícita é salva em `mengodata-theme`, persiste entre rotas e é aplicada antes da montagem. Fontes são servidas localmente, sem CDN.

Sem DATABASE_URL, a API usa a Gold local verificada contra Bronze. Com a variável, exige a mesma versão no PostgreSQL; versão ausente retorna indisponível, sem fallback silencioso.

## PostgreSQL

O banco ativo é **mengo_data em 127.0.0.1:5432**, role `flamengo_app`. SQL real confirmou 380 partidas/20 clubes/38 rodadas, 760 fatos, 20 totais e 760 acumulados. Importação concluída e reimportação `changed=false` em etapa anterior. Nesta limpeza, o diagnóstico foi somente leitura. [Diagnóstico e evidências](docs/evidence/repository-cleanup-runtime.json).

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

Quatorze indicadores, incluindo jogos, mostram diferença A − B e variação sobre |B|. Base zero/ausência fica indisponível. Menos derrotas/gols sofridos favorecem o clube; jogos e empates não têm vencedor. Δ de aproveitamento usa pontos percentuais. As regras continuam em `frontend/src/features/analytics/domain/comparison.js`, sem alteração nesta limpeza.

## Verificar e apresentar

Execute o pipeline antes dos testes em um checkout novo:

```powershell
npm.cmd run verify
```

ESLint/Prettier, testes JS/React/Python/PostgreSQL isolado, Ruff, notebooks, build, smoke HTTP/Vite e Playwright. [Resultados observados](#resultados-desta-auditoria). `npm.cmd run test:browser` usa Chrome instalado, perfil headless próprio e API isolada com a Gold real, sem acessar bancos existentes. Verifica os gráficos ativos e cards em 375/768/1024/1440 px, claro/escuro, com CSS e screenshots reais. A conferência operacional no localhost com PostgreSQL também passou. [Evidências dos gráficos](docs/evidence/chart-browser-verification.json). Auditoria integral de acessibilidade e outros navegadores permanecem fora dessa validação.

[Power BI complementar](powerbi/README.md): CSVs reais, modelo, M, DAX, tema e guia preservados fora da interface pública. Preparação opcional: `npm.cmd run powerbi:prepare`. Não é requisito da entrega web; não há PBIX/PBIP validado.

[API](docs/api/README.md), [guia de banco](database/README.md), [integridade](docs/evidence/repository-cleanup-integrity.json) e [diagnóstico somente leitura](docs/evidence/repository-cleanup-runtime.json). Nenhum commit, push, deploy, publicação ou contratação nesta intervenção.

## Relatório de limpeza

Foram lidos AGENTS.md e os documentos técnicos existentes antes das exclusões. Imports estáticos/dinâmicos, scripts npm, configurações, CSS/HTML, rotas, assets, testes e notebooks foram cruzados. A análise AST percorreu 108 arquivos JS/JSX/MJS e não encontrou import dinâmico não literal. O estado inicial já tinha alterações de layout/documentação e três prompts excluídos, que foram preservados e não entram na atribuição desta limpeza.

| Arquivo removido pela limpeza       | Justificativa comprovada                                                                                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `frontend/src/app/styles.css`       | Nenhum consumidor em execução, HTML, CSS, scripts, testes ou notebooks; a composição já usa `design-system.css`. O único import Tailwind estava nesse CSS inativo. |
| `frontend/src/app/refinements.css`  | Sem referência de carregamento; substituído anteriormente pelo design atual.                                                                                       |
| `frontend/public/flamengo-logo.png` | Sem uso na aplicação/favicon/testes/scripts; era copiado desnecessariamente ao build. A produção usa `/brand/flamengo.png`, preservado junto do original.          |

Também saíram `PowerBiPage`, imports exclusivos, menu e rota do painel individual legado. Nenhum teste foi excluído: o caso do endereço legado passou a exigir página inexistente e ausência do link BI. Os dois redirecionamentos públicos para `/dashboard` foram mantidos. A classe `report-pages` continua necessária à metodologia coletiva.

**Dependências diretas removidas:** `tailwindcss@4.3.3` e `@tailwindcss/vite@4.3.3`. O plugin Vite estava registrado sem CSS ativo que o consumisse. Os 19 arquivos do build antes/depois ficaram idênticos. npm atualizou manifesto/lock em modo offline, `--package-lock-only` e `--ignore-scripts`, sem apagar pacotes instalados. Saíram 33 entradas do lock, incluindo transitivas e variantes opcionais; zero versões mantidas alteradas, zero entradas acrescentadas. Manifestos da raiz/backend e configuração/lock Python não mudaram.

As demais bibliotecas têm uso em produto, testes, lint, build, scripts ou pesquisa. PyArrow atende ao Parquet do Pandas; ipykernel e jsdom são acionados por configuração; Matplotlib/Seaborn atendem às figuras e notebooks. Não foram criadas camadas vazias, tecnologias substitutas ou comentários de código.

**Preservados por uso ou segurança naquela etapa:** `powerbi/`, módulos individuais isolados com testes úteis, status de projeto testado, SVGs ativos, Poppins/OFL, logo atual, seis notebooks, figuras, relatórios, Bronze/Silver/Gold/CSV/Parquet, contratos, migrações e clusters existentes. As entradas visuais da raiz foram mantidas inicialmente e depois receberam a auditoria específica descrita abaixo, com autorização para excluir capturas e duplicatas sem uso. A foto da torcida tem uso local comprovado e continua ausente do build de produção.

As exclusões de Markdown diretamente em `docs/`, realizadas pelo usuário e confirmadas como intencionais, estão listadas separadamente na evidência de integridade. Não foram revertidas nem tratadas como código morto. O relatório que havia sido criado nesse diretório também não foi recriado; o registro atual está neste README. Textos da metodologia que citam os antigos caminhos documentais continuam como limitação conhecida: não houve edição da apresentação ativa nesta limpeza.

## Arquitetura e contexto operacional

| Área            | Entrada e responsabilidade                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend        | `frontend/index.html` → `src/app/main.jsx` → `Application.jsx`; composição de providers, gateways e roteador na borda.                          |
| Regras frontend | `features/*/domain` e `application`; filtros/regras separados de React, HTTP e armazenamento.                                                   |
| API             | `backend/src/main/server.js`; HTTP em `interfaces/http`, casos de uso em `application`, regras em `domain`.                                     |
| Persistência    | `backend/src/infrastructure/persistence`; repositórios e pool injetados; SQL parametrizado, sem migração no startup.                            |
| Pipeline        | `pipeline/src/flamengo_pipeline/main`; ingestão/análise/auditoria/notebooks/BI compostos por domínio, aplicação e adaptadores de arquivo/fonte. |
| Compartilhado   | `packages/domain/src` e `contracts`; identificadores internos existentes preservados.                                                           |
| Pesquisa        | `notebooks`, `reports/collective`, `powerbi`; artefatos acadêmicos e histórico preservados nos diretórios remanescentes.                        |

Fonte: OpenFootball football.json CC0, revisão/hash fixos em [contrato de fonte](contracts/collective-source.json). Bronze conserva bytes, URL, revisão, licença, hash e coleta. Silver exige 380 confrontos únicos, 38 rodadas de dez jogos, 20 clubes, um jogo por clube/rodada e 19 mandos/19 visitas. Não somar snapshots acumulados como eventos. Não inferir IDs CBF, datas/rodadas ausentes da conciliação, scouts individuais, posse, passes ou xG.

Totais e comparações usam a mesma janela e mando. Acumulados seguem rodada oficial; sequências seguem data efetiva. Pontos 3/1/0; aproveitamento sobre três pontos possíveis por jogo; estatística populacional e quartis lineares. Classificação calculada por pontos, vitórias, saldo e gols pró, com empate residual compartilhado, sem certificar sanções/desempates disciplinares. Correlação exploratória não implica causalidade. Regras e cálculos existentes não foram alterados nesta auditoria.

## Artefatos e segurança

`.gitignore` cobre `node_modules`, `.venv`, caches, `dist`, `.tmp`, `.local`, logs, cobertura e `.env`/variantes. Acrescentados `.coverage.*`, `playwright-report/`, `test-results/`, `.ipynb_checkpoints/` e `*.py[cod]`. Não há artefatos rastreados contradizendo essas exclusões. Ambientes instalados e dados locais não foram apagados.

`.env` privado está ignorado; `.env.example` mantém apenas modelo local e senha fictícia. A varredura de padrões cobriu a árvore atual não ignorada e **608 blobs alcançáveis de 17 commits de todas as refs locais**. O único candidato atual e duas versões históricas são a URL fictícia do teste de sigilo em `backend/tests/http.test.js`. Nenhum segredo real foi identificado nessa busca; não houve exposição de valores, reescrita de histórico ou indicação de rotação baseada na fixture. A pesquisa não certifica ausência de segredos ofuscados, objetos inalcançáveis ou refs remotas ausentes.

O CORS usa origem explícita validada por URL; não foi aberto como curinga. Logs redigem cabeçalhos sensíveis e erros de infraestrutura são sanitizados. `/api/health` verifica o processo; banco e disponibilidade analítica exigem diagnóstico adicional. O banco existente recebeu apenas diagnóstico READ ONLY e requisições analíticas de leitura, sem migração, importação ou alteração do `.env`.

## Resultados desta auditoria

| Comando/verificação                 | Resultado observado                                                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd test`                      | 46 backend + 94 frontend + 10 arquitetura/contratos/artefatos: **150 aprovados**, zero falhas/ignorados.                                            |
| `npm.cmd run verify:pipeline`       | **175 aprovados**; Ruff lint e formatação de 50 arquivos aprovados.                                                                                 |
| `npm.cmd run test:database`         | **35 aprovados**, clusters PostgreSQL temporários isolados; migrações, idempotência, rollback, grants e equivalência SQL/API.                       |
| `npm.cmd run test:browser`          | **96 aprovados**; Chrome headless, quatro larguras e dois temas; zero falhas, ignorados ou flaky no resultado final após retirar Tailwind.          |
| `npm.cmd run notebooks:check`       | Seis notebooks executados, todas as células com execução, nenhuma saída de erro; cópias em `.tmp/executed-notebooks`.                               |
| `npm.cmd run lint` e `format:check` | ESLint e Prettier aprovados.                                                                                                                        |
| `npm.cmd run build`                 | Aprovado; 19 arquivos idênticos após remover o plugin inativo.                                                                                      |
| `npm.cmd run test:smoke`            | Aprovado; 380 partidas, 79 pontos, 47/32 por mando, nove entradas SPA, sete aliases e dois redirecionamentos antigos.                               |
| `npm.cmd run db:check`              | `status=ok`, `read_only=true` no destino local configurado.                                                                                         |
| Diagnóstico READ ONLY               | Snapshot PostgreSQL igual à Gold; contagens 380/760/20/760; 20 totais e 760 acumulados comparados ao serviço JS.                                    |
| Arquitetura/comentários             | Suítes JS/Python aprovadas; dependências para o núcleo e sem ciclos/comentários novos.                                                              |
| Integridade                         | Código analítico, contratos, dados, figuras, notebooks e migrações com hashes conferidos; documentação editada/excluída identificada separadamente. |

As quatro suítes somam **456 aprovações**, sem somar reexecuções, notebooks ou diagnósticos extras. JS e Python foram repetidos depois da exclusão intencional da documentação. Não houve teste útil removido. A matriz real cobriu landing, acesso ao dashboard, oito páginas, Poppins, escudo, temas persistentes, menu móvel, gráficos, proporções, legenda/tooltip, comparação/troca/restauração, filtros, âncoras, teclado e redução de movimento. Não registrou erros de página/console/API. Capturas de hero desktop claro, hero mobile escuro, dashboard mobile escuro e comparação desktop foram inspecionadas; arquivos integrais em `.tmp/browser-tests`, ignorados pelo Git.

Uma execução inicial do navegador foi interrompida antes do resultado completo e não entrou na contagem. O diagnóstico auxiliar inicialmente exigiu igualdade estrita de ponto flutuante; passou usando `1e-10`, a tolerância já adotada no projeto, sem mudar cálculo ou dado. O notebook atualizou um timestamp no relatório de paridade; a comparação de hashes detectou isso e o relatório foi restaurado aos bytes iniciais previamente conferidos com o Git. Nenhum resultado acadêmico permaneceu alterado.

Os notebooks emitiram o aviso conhecido de TCP sem criptografia, com kernel restrito a loopback e encerrado ao final. O runner Playwright emitiu aviso `NO_COLOR/FORCE_COLOR`, sem erro no console da aplicação. Não foram executados CI remoto, Power BI Desktop, serviços externos, leitores de tela, zoom nativo ou auditoria integral WCAG. `git diff --check` passou com aviso preexistente de normalização CRLF/LF no contexto antes de sua exclusão pelo usuário.

## Preparação para hospedagem futura

A estrutura foi auditada; a publicação automática ainda depende das configurações abaixo. Não houve conexão a contas de hospedagem, criação de projetos, migração externa ou deploy.

| Plataforma | Estado e pendência                                                                                                                                                                                                                                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub     | Workspaces, locks, Bronze fixa e workflow `quality.yml` existentes. Revisar alterações anteriores e entradas/evidências selecionadas, conferir tamanho da entrega e executar CI remoto quando autorizado.                                                                                                                          |
| Vercel     | Build na raiz: `npm ci` e `npm run build`; saída `frontend/dist`. Falta fallback SPA e encaminhamento de `/api/*` à futura API antes do fallback HTML. O gateway usa `/api` relativo; o proxy local Vite não acompanha o build. Não há `vercel.json` operacional.                                                                  |
| Render     | Start na raiz: `npm run start:backend`; `PORT` já é configurável. `HOST` aceita apenas loopback e ainda rejeita `0.0.0.0`, exigido pelo serviço web. Corrigir essa borda em etapa própria, mantendo o padrão local. Raiz deve incluir `packages/domain`, contratos e dados. Rever CORS e rate limit/proxy conforme topologia real. |
| Neon       | Adaptador `pg` aceita `DATABASE_URL` sem host local fixo. Falta provisionar destino autorizado, validar TLS/certificado com URI/driver fixado, aplicar migração coletiva e importar explicitamente em banco novo apropriado; conferir cobertura e paridade. Não presumir aplicável o grant específico de `mengo_data`.             |

Mesmo com PostgreSQL, a API consulta a Gold local para validar o snapshot. `data/analytics/collective.json` não está versionado: precisa ser gerado/distribuído com Bronze e contratos. Um checkout limpo com apenas dependências Node não entrega a API analítica pronta. Definir geração com Python 3.14/dependências fixadas ou artefato auditado e validar a implantação limpa na etapa futura.

| Variável       | Uso                                                                       |
| -------------- | ------------------------------------------------------------------------- |
| `HOST`         | Bind local da API, atualmente `127.0.0.1` ou `localhost`.                 |
| `PORT`         | Porta entre 1 e 65535; padrão local 3001.                                 |
| `CORS_ORIGIN`  | Uma URL de origem permitida.                                              |
| `LOG_LEVEL`    | Nível Pino.                                                               |
| `DATABASE_URL` | Segredo somente no backend/CLIs; variável herdada prevalece sobre `.env`. |
| `PG_BIN`       | Opcional para executáveis PostgreSQL locais.                              |

Não existe `VITE_API_URL` implementada. Nunca colocar `DATABASE_URL` em variável `VITE_*`. Não executar `db:local:configure` para preparar hospedagem. API não faz migrações no startup; `db:migrate` e `db:import` continuam operações explícitas para um destino autorizado. A configuração local que funciona foi mantida.

Requisitos públicos conferidos em 22/10/2026: [Render Web Services](https://render.com/docs/web-services), [Render Monorepo](https://render.com/docs/monorepo-support), [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [rewrites Vercel](https://vercel.com/docs/routing/rewrites), [Node no Neon](https://neon.com/docs/guides/node) e [TLS node-postgres](https://node-postgres.com/features/ssl). A aplicação desses requisitos ao repositório é conclusão desta auditoria, sem implantação externa.

Logo: produção em `frontend/public/brand/flamengo.png`, original em `referencias/flamengo_logo.png`, SHA-256 `73b7260449100cd4e28838e27188b56fb1f92134419265ee17d4fd8fe51fbee7`. O uso foi solicitado pelo usuário, mas não há licença aberta/autorização de publicação documentada para a marca. CC0 dos placares não se aplica ao escudo. A foto da torcida também não tem licença comprovada e permanece somente em desenvolvimento; o build conserva o vetor próprio. Poppins é local e sua licença está preservada em `frontend/public/brand/Poppins-OFL.txt`.

## Auditoria dos recursos visuais

Em 22/10/2026, foram inspecionados conteúdo real, formato, dimensões, SHA-256 e pixels das nove imagens da raiz, das referências e das cópias utilizadas pela aplicação. A busca cruzou imports estáticos/dinâmicos, caminhos React/HTML, CSS e propriedades CSS dinâmicas, testes, scripts, notebooks e documentação. Nenhuma imagem da raiz era carregada pela aplicação. Nomes/extensões estavam trocados; a decisão considerou o conteúdo real e os consumidores.

| Recurso preservado                                                      | Uso comprovado                                                                                                                                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `frontend/public/brand/flamengo.png`                                    | Marca na landing/dashboard, comparação, estados da interface, favicon, seletores CSS e testes; também indicada no guia Power BI.                                                     |
| `frontend/src/features/landing/presentation/assets/torcida-estadio.jpg` | Fundo de “O projeto”, por `ProjectAtmosphere.jsx` e `--crowd-photo` no CSS. O comportamento existente usa a foto em desenvolvimento e vetor no build, sem alteração nesta auditoria. |
| `referencias/flamengo_logo.png`                                         | Original da logo documentado neste README; cópia idêntica à marca ativa, preservada para proveniência.                                                                               |
| SVGs em componentes, Poppins/OFL, figuras e `docs/evidence/`            | Apresentação ativa, documentação e evidências acadêmicas, fora do escopo de capturas descartáveis da raiz.                                                                           |

**Onze imagens removidas, sendo nove da raiz e duas de `referencias/`: 6.976.187 bytes, aproximadamente 6,65 MiB.**

| Imagem removida                                    | Conteúdo real e motivo                                                                                                                  |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `01-hero-estadio-versao-anterior.png`              | JPEG da torcida, idêntico à cópia utilizada nos assets da landing. Apenas a duplicata da raiz foi eliminada.                            |
| `02-card-comparacao-inclinado.png`                 | Screenshot antigo do hero; sem uso em execução e com pixels idênticos ao screenshot chamado `flamengo-logo-original (1).png`.           |
| `04-torcida-estadio-foto.jpg`                      | PNG de uma captura antiga da seção “O projeto”; não é a foto de fundo e não possui consumidor ativo.                                    |
| `flamengo-logo-original (1).png`                   | Screenshot antigo do hero, não a logo original; duplicado visual da captura acima.                                                      |
| `flamengo_logo.png`                                | Referência Finexa, não a logo; idêntica à referência antiga em `referencias/`, sem uso pela aplicação ou documentação atual.            |
| `grafico_mandante_visitante_atual.png`             | Logo verdadeira, idêntica às cópias preservadas em `public/brand` e `referencias/`; apenas a duplicata com nome incorreto foi removida. |
| `landing-comparacao-atual (1).png`                 | Screenshot antigo dos cards; sem import, caminho dinâmico, CSS ou referência documental atual que exija o arquivo.                      |
| `landing-hero-atual (1).png`                       | Recorte pequeno da marca com caixa branca; não é o hero nem a logo ativa.                                                               |
| `logo-com-moldura-atual (1).png`                   | Screenshot antigo da comparação; não é asset da marca nem consumidor de runtime/documentação atual.                                     |
| `referencias/grafico_mandante_visitante_atual.png` | Captura de depuração antiga, sem consumidor; evidências posteriores dos gráficos foram preservadas em `docs/evidence/`.                 |
| `referencias/landing_finexa_referencia.png`        | Referência antiga de design, duplicada na raiz; não é asset público nem figura acadêmica necessária.                                    |

Menções no prompt anterior e no JSON de proveniência da foto são registros históricos, não carregamento dos arquivos da raiz. Esses registros foram preservados; o novo inventário relaciona os nomes antigos às cópias ativas. O prompt foi movido sem alterar seus bytes para [docs/history/visual-design/landing-polish-prompt.md](docs/history/visual-design/landing-polish-prompt.md), acompanhado de contextualização histórica. Nenhuma imagem usada precisou ser movida: os caminhos existentes já separam a marca pública dos assets locais da apresentação, sem alterar domínio, aplicação ou infraestrutura.

[Inventário e verificação desta etapa](docs/evidence/visual-assets-audit.json). Código React/CSS, configurações, dependências, API, PostgreSQL, pipeline, dados e gráficos não foram alterados. Não houve commit, push ou deploy.

| Validação após a limpeza visual       | Resultado observado                                                                                                                  |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Frontend/Vitest                       | 94 testes aprovados em dez arquivos.                                                                                                 |
| Arquitetura e ausência de comentários | Dois testes aprovados.                                                                                                               |
| Chrome/Playwright                     | 96 testes aprovados em 375/768/1024/1440 px, claro/escuro; zero falhas, ignorados ou flaky.                                          |
| ESLint e Prettier                     | Aprovados.                                                                                                                           |
| Build                                 | Aprovado, com os 19 arquivos idênticos byte a byte aos anteriores à remoção das imagens.                                             |
| HTTP dos assets ativos                | Logo e foto retornaram 200, tipos PNG/JPEG corretos e bytes iguais aos arquivos preservados.                                         |
| Integridade                           | 156 arquivos de código/contratos/configuração, 49 arquivos de dados/pesquisa e 90 imagens documentais preservados com hashes iguais. |

São **192 testes aprovados nesta etapa**, sem somar os resultados anteriores. Foram inspecionadas capturas reais da seção “O projeto” no celular e do hero escuro no desktop; a foto sutil e a marca continuam carregando. Capturas e logs integrais ficam em `.tmp`, ignorados pelo Git. A suíte de navegador usa serviços locais isolados e Gold real; nenhum banco existente foi acessado. Testes backend, PostgreSQL e Python não foram repetidos nesta limpeza exclusivamente visual, pois seus arquivos e dados permaneceram iguais. A validação de navegador não equivale a uma auditoria integral de acessibilidade ou de todos os motores de navegador.
