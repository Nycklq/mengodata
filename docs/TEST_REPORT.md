# Relatório de verificações — MengoData em 22/10/2026

## Correção de gráficos e ilustrações — verificação posterior

O diagnóstico em Chrome reproduziu viewport Recharts com largura zero por uma regra CSS de max-width. O teste novo falhou antes da correção e passou depois. A escala zero implementada anteriormente foi preservada, mas os testes jsdom anteriores não certificavam o CSS real. [Causa e capturas](CHART_RENDERING_FIX.md).

| Verificação                    | Resultado observado nesta correção                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Backend                        | 46 testes aprovados                                                                                        |
| Frontend/jsdom                 | 88 aprovados, incluindo cinco casos novos de legenda, rodada única e SVGs                                  |
| Python                         | 175 aprovados; Ruff e formatação passaram                                                                  |
| Arquitetura/contratos          | 10 aprovados; camadas, ciclos e código sem comentários                                                     |
| PostgreSQL temporário          | 35 aprovados em execução sequencial completa                                                               |
| Total das cinco suítes         | 354 aprovados                                                                                              |
| Chrome com CSS real            | 32 aprovados: quatro testes em oito combinações de largura/tema                                            |
| Chrome no localhost/PostgreSQL | Quatro adicionais aprovados, somente GETs                                                                  |
| Total de execuções aprovadas   | 390, incluindo a matriz e a repetição operacional                                                          |
| ESLint e Prettier              | Aprovados, sem avisos de código                                                                            |
| Build e smoke HTTP             | Aprovados, 2679 módulos; dez entradas SPA e oito aliases                                                   |
| Banco ativo                    | READ ONLY: 380 jogos, 20 clubes, 38 rodadas, 760 fatos/760 acumulados; 20 clubes SQL/API equivalentes      |
| Evidência visual               | 22 PNGs atuais e uma captura anterior preservados; amostras inspecionadas nos quatro tamanhos e dois temas |

Comandos: `npm.cmd test`, `npm.cmd run verify:pipeline`, `node --test --test-concurrency=1 database/tests/*.test.js`, `npm.cmd run test:browser`, além de lint, format:check, build e test:smoke. Os comandos foram executados individualmente; não se atribui esta rodada ao agregado `verify`.

A primeira execução PostgreSQL ocorreu em paralelo com suítes/Chrome e atingiu o timeout de 60 s na inicialização de um cluster temporário. A repetição completa, com arquivos em sequência, passou os 35 casos em cerca de 215 s. Não foram removidos testes nem alterados timeouts. Na primeira matriz visual, o tamanho do card 02 em 768 px ficou abaixo do critério; a proporção foi corrigida e a matriz completa repetida terminou 32/32, sem flaky, sem ignorados e sem erros/avisos no console da página.

O harness padrão reutiliza serviços reais e Gold validada em API isolada, sem PostgreSQL existente. A execução no localhost e a consulta READ ONLY separada comprovam a integração operacional. Não foram alterados backend de produção, dados, fórmulas, esquema ou permissões. Avisos do runner sobre NO_COLOR/FORCE_COLOR não são mensagens do console da página. CI remoto não executado.

[Matriz e medições](evidence/chart-browser-verification.json), [SQL/API](evidence/chart-database-verification.json). Registros anteriores permanecem abaixo como histórico. A pendência antiga de inspeção dos gráficos/cards foi superada; auditoria integral WCAG, outros navegadores e Power BI Desktop continuam fora dessa validação.

## Redesign MengoData — resultado atual

Executado no Windows/PowerShell, Node.js 24, Python 3.14.8/.venv e PostgreSQL 18. As etapas foram executadas individualmente; não se atribui esta rodada ao comando agregado `verify`. Registros anteriores são preservados nas seções seguintes.

| Verificação                     | Comando/execução                                                              | Resultado observado                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Backend/HTTP                    | `npm.cmd test`                                                                | 46 aprovados                                                                                                |
| Frontend/DOM e Recharts real    | `npm.cmd test`; nova execução da suíte frontend após ajuste final de legendas | 83 aprovados                                                                                                |
| Arquitetura/contratos/artefatos | `npm.cmd test`                                                                | 10 aprovados, incluindo camadas, ciclos e ausência de comentários                                           |
| Python                          | `npm.cmd run verify:pipeline`                                                 | 175 aprovados; Ruff e formatação aprovados                                                                  |
| PostgreSQL isolado              | `npm.cmd run test:database`                                                   | 35 aprovados, zero ignorados; clusters temporários encerrados                                               |
| Total das cinco suítes          | Soma dos resultados acima                                                     | **349 aprovados**, zero falhas no resultado final                                                           |
| Pipeline real offline           | `pipeline:collective -- --input <Bronze fixada>`                              | `changed=false`, 380 jogos, 760 fatos, 20 clubes, 38 rodadas                                                |
| Análises e equivalência         | `collective:analyze`, `collective:parity`                                     | Seis figuras; 20 totais e 760 acumulados equivalentes Python/JS                                             |
| Notebooks                       | `npm.cmd run notebooks:execute`                                               | Seis executados sem erro de célula, títulos MengoData                                                       |
| Power BI                        | `npm.cmd run powerbi:prepare`                                                 | CSVs 760/20/760/380/38/1/1; temas claro/escuro preparados; Desktop não validado                             |
| Dependências Python             | `.venv/Scripts/python.exe -m pip check`                                       | Nenhuma dependência quebrada                                                                                |
| OpenAPI                         | `npm.cmd run api:spec`                                                        | Título MengoData; contrato validado nos testes de artefatos                                                 |
| Build                           | `npm.cmd run build`                                                           | Aprovado, 2678 módulos; Poppins local em WOFF2/WOFF; sem aviso de chunk grande                              |
| Smoke HTTP/Vite                 | `npm.cmd run test:smoke`                                                      | Aprovado: dez entradas SPA, oito aliases, API real, 380 jogos/79 pontos e 47/32 por mando                   |
| SQL operacional                 | Node.js/pg, `BEGIN READ ONLY`                                                 | SELECT 1, banco/role/porta corretos; contagens 1/1/20/1/380 e 760/20/760                                    |
| Snapshot PostgreSQL             | Comparação profunda JSONB/Gold                                                | Igualdade confirmada; nenhuma mudança nos dados                                                             |
| Importação operacional          | `npm.cmd run db:import`                                                       | `changed=false`, 380 partidas, mesmo hash                                                                   |
| SQL/API                         | Summary/compare/filtro e pg_stat_activity                                     | 47/32 e 19/19; rodadas 10–20: 15/13 pontos; Flamengo/Palmeiras: 79/76; backend 10840 consultando mengo_data |
| Logo                            | SHA-256 da referência e do asset público                                      | Cópia byte a byte idêntica; hash em ASSETS.md                                                               |

ESLint sem avisos e Prettier aprovados na verificação final. `git diff --check` sem erros; avisos de normalização LF/CRLF apenas. `.env`, `.local` e `.tmp` confirmados como ignorados pelo Git.

As seis figuras regeneradas foram inspecionadas como PNGs locais. Símbolos das legendas de linhas/barras foram corrigidos para corresponder às séries; rótulos de mando e correlação foram traduzidos, a paleta acadêmica foi alinhada e nomes próximos receberam espaçamento. Nenhum cálculo ou valor foi alterado. Essa inspeção estática não certifica o React no navegador.

Casos novos exercitados: landing e CTA, rotas canônicas e redirecionamento com query/hash, cobertura parcial/escopo inválido recusados, versão de comparação divergente bloqueada, prévia indisponível com retry, menu e Escape, tema do sistema/armazenamento bloqueado/persistência/abas/navegação, mensagens sanitizadas de filtros. Os testes preexistentes de comparação, troca/reset, sentido dos indicadores e filtros continuam aprovados.

O teste de regressão usa **Recharts real**, sem substituir seu componente por mock. ResizeObserver e dimensões são controlados no jsdom: 375/768/1024/1440 e dois temas. Verifica duas barras positivas, proporção 47/32, base comum, rótulos e valores filtrados reais; cobre zero/negativos/vazio. O domínio antigo tornaria a barra de 32 invisível e falharia nesse teste. Isso não é revisão da pintura CSS no navegador.

Limite de UI: IAB indisponível. O controle nativo encontrou o Chrome e interrompeu a captura por não confirmar a URL atual. Não houve contorno, screenshot React aprovada ou auditoria integral de acessibilidade. [Checklist manual](DESIGN_REVIEW.md). Power BI segue sem PBIX/PBIP validado e sem compilação de M/DAX. Kernels emitiram o aviso já conhecido de TCP sem criptografia, mantidos em loopback e encerrados pelo runner. CI remoto não executado.

[Evidência PostgreSQL/HTTP atual sem credenciais](evidence/mengodata-redesign-verification.json). Testes de banco usam clusters isolados; somente o diagnóstico READ ONLY e a reimportação operacional autorizada acessaram `mengo_data`. Não houve migração, redefinição de senha ou alteração de outro banco. Commits locais por funcionalidade autorizados; nenhum push/publicação.

## Configuração PostgreSQL final

| Verificação                                 | Resultado observado                                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Carregamento do `.env` e erros sanitizados  | 46 testes backend aprovados, incluindo cinco novos testes                                                    |
| PostgreSQL em clusters temporários isolados | 35 aprovados, incluindo dois testes de grants mínimos/proteção de destino                                    |
| Arquitetura/contratos/artefatos             | Dez aprovados; sem comentários novos e sem violação de camadas                                               |
| Node.js → banco existente                   | SELECT 1 real em READ ONLY, `current_database()=mengo_data`, role flamengo_app, porta 5432                   |
| Falhas identificadas                        | 28000: role sem LOGIN; depois 42501: falta de USAGE e SELECT/INSERT                                          |
| Correção administrativa                     | LOGIN habilitado e script restrito ao MengoData executado pelo usuário no pgAdmin                            |
| Importação explícita                        | `npm.cmd run db:import`: changed=true, 380 partidas/38 rodadas                                               |
| Reimportação explícita                      | `npm.cmd run db:import`: changed=false, sem duplicação                                                       |
| Contagens SQL reais                         | Tabelas 1/1/20/1/380; views 760/20/760                                                                       |
| Equivalência SQL/Gold                       | Todos os 20 totais e 760 acumulados conferidos                                                               |
| API ativa em 3001                           | Metadata, summary, matches, standings e evolution: HTTP 200, 380 partidas e Flamengo 79 pontos               |
| Origem da consulta backend                  | pg_stat_activity identificou o PID Node 25588 consultando collective.imports em mengo_data como flamengo_app |
| Diagnóstico CLI final                       | `npm.cmd run db:check`: status ok, read_only=true                                                            |

Os testes automatizados não operam o banco existente: usam clusters temporários. A importação no MengoData é execução operacional explicitamente autorizada. Não houve migração ou recriação do schema, alteração de outro banco, redefinição de senha ou publicação. [Relatório detalhado](POSTGRESQL_MENGO_DATA.md) e [evidência sem credenciais](evidence/mengo-data-verification.json).

Frontend, pipeline e notebooks não foram alterados nesta correção; seus resultados da etapa anterior estão preservados abaixo, sem alegar nova execução dessas suítes. ESLint e Prettier passaram novamente; `git diff --check` não encontrou erros de whitespace. `.env` e backup permanecem ignorados pelo Git.

## Registro da finalização visual anterior

Windows/PowerShell, Node.js 24, Python 3.14.8/.venv e PostgreSQL 18 local. As etapas foram executadas individualmente; não se atribui esta execução ao comando agregado `verify`.

| Verificação                     | Comando                                                      | Resultado observado em 22/10                                                   |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Backend/HTTP                    | `npm.cmd run test --workspace backend`                       | 41 aprovados                                                                   |
| Frontend/DOM/domínio            | `npm.cmd run test --workspace frontend`                      | 46 aprovados                                                                   |
| Arquitetura/contratos/artefatos | `node --test tests/*.test.js`                                | 10 aprovados; dependências internas e código sem comentários                   |
| Python                          | `npm.cmd run verify:pipeline`                                | 175 aprovados; Ruff/lint/formatação aprovados                                  |
| PostgreSQL isolado              | `npm.cmd run test:database`                                  | 33 aprovados; clusters encerrados                                              |
| Total de testes                 | Soma das cinco suítes                                        | **305 aprovados**, zero falhas/ignorados no resultado final das suítes         |
| ESLint                          | `npm.cmd run lint`                                           | Aprovado sem avisos após os ajustes finais                                     |
| Prettier                        | `npm.cmd run format:check`                                   | Aprovado                                                                       |
| Build                           | `npm.cmd run build`                                          | Aprovado, 2662 módulos e sem aviso de chunk grande                             |
| Notebooks                       | `notebooks:execute` e `notebooks:check`                      | Seis executados sem erro de célula                                             |
| Dependências Python             | `pip check`                                                  | Sem dependência quebrada                                                       |
| Pipeline offline                | `pipeline:collective -- --input <Bronze fixada>`             | 380 jogos/760 fatos/20 clubes/38 rodadas; `changed=false`                      |
| Análises/BI                     | `collective:analyze`, `collective:parity`, `powerbi:prepare` | Seis figuras; 20 totais/760 acumulados equivalentes; tabelas BI regeneradas    |
| Banco dedicado                  | `db:local:setup`, `db:check`, `db:migrate`, `db:import`      | Criado e conferido em READ ONLY; somente 004 aplicada; 380 partidas importadas |
| Idempotência permanente         | segunda execução de `db:import`                              | `changed=false`; uma versão preservada                                         |
| SQL permanente                  | Transação READ ONLY                                          | 380 jogos/20 clubes/38 rodadas, limites 1 e 38, temporada 2025                 |
| Smoke HTTP/Vite                 | `npm.cmd run test:smoke`                                     | Aprovado após restauração autorizada; 380 partidas/79 pontos/nove páginas      |
| Logo                            | SHA-256 da origem e do asset                                 | Cópia byte a byte idêntica                                                     |
| Whitespace/segredos locais      | `git diff --check`, `git check-ignore`                       | Sem erro de whitespace; `.env` e `.local` ignorados                            |

Uma repetição do smoke detectou mudança de DATABASE_URL e falhou em metadata (500). O usuário escolheu explicitamente restaurar o cluster exclusivo, preservando o arquivo alterado. Cópia byte a byte em `.local/postgres/env-backup-before-restoration-1792673449500.env`; nenhum dado do banco externo foi alterado. Depois, `db:check` passou em READ ONLY, `db:import` retornou `changed=false` e o smoke passou. A falha intermediária foi resolvida.

## Casos novos e limites atuais

Comparação de clubes arbitrários na mesma janela/mando, evolução final equivalente aos totais, troca de lados, seleção de clube já escolhido, restauração e leitura da URL. Sentido das métricas, igualdade sem vencedor, base zero, ausências e saldo negativo. Mesclagem por rodada com lacunas nulas, ajuste dos limites, indicador de evolução e tamanho de página. O teste novo encontrou e corrigiu a posição do resumo, antes calculada num universo de um único clube.

Menu compacto: foco inicial, ciclo Tab/Shift+Tab, Escape, devolução de foco e restauração do scroll. PostgreSQL local: recusa de configuração externa e de cluster sem marcador, SCRAM, ausência de migração automática, persistência após reinício e restauração explícita de configuração com backup. Os três testes novos usam outro diretório sob `.tmp`; nenhum opera o cluster permanente.

Inventário de UI vazio e abertura do navegador integrado retornando `Browser is not available: iab`. Não houve revisão visual desktop/mobile; DOM substitui o motor gráfico e não comprova pintura/layout. Checklist em [DESIGN_REVIEW.md](DESIGN_REVIEW.md). Power BI segue sem compilação Desktop/PBIX/PBIP. A conciliação CBF reutiliza a evidência existente, sem nova coleta externa. Os kernels emitiram aviso de TCP sem criptografia; o runner mantém loopback e encerra os kernels. CI remoto não executado.

## Registro histórico da entrega de 21/10/2026

Executado em 21/10/2026 no Windows 11/PowerShell, Node.js 24, Python 3.14.8/.venv e PostgreSQL local em clusters temporários isolados. Sem uso de banco pessoal e sem métricas de cobertura percentual inventadas.

| Verificação                              | Comando                               | Resultado observado                                            |
| ---------------------------------------- | ------------------------------------- | -------------------------------------------------------------- |
| Backend/HTTP                             | npm run test --workspace backend      | 40 aprovados                                                   |
| React/DOM                                | npm run test --workspace frontend     | 35 aprovados                                                   |
| Arquitetura/contratos/fórmulas/artefatos | node --test tests/*.test.js           | 10 aprovados                                                   |
| Python final                             | npm run verify:pipeline               | 175 aprovados; Ruff/lint/formatação aprovados                  |
| PostgreSQL real                          | npm run test:database                 | 30 aprovados; clusters encerrados                              |
| Total final de testes                    | soma das suítes                       | **290 aprovados**, zero falhas/ignorados                       |
| ESLint                                   | npm run lint                          | aprovado sem avisos                                            |
| Prettier                                 | npm run format:check                  | aprovado                                                       |
| Notebooks                                | notebooks:execute e notebooks:check   | seis executados, sem erro de célula                            |
| Build                                    | npm run build                         | aprovado, 2658 módulos, sem aviso de chunk grande              |
| Smoke HTTP/Vite                          | npm run test:smoke                    | aprovado, 380 jogos/79 pontos/nove páginas SPA                 |
| Dependências Python                      | pip check                             | nenhuma dependência quebrada                                   |
| OpenAPI                                  | npm run api:spec                      | gerado e validado por testes de artefatos                      |
| Pipeline real                            | pipeline:collective, online e offline | 380 jogos; repetição changed=false                             |
| Conciliação oficial                      | collective:audit                      | 380 placares sem divergência; 370 rodadas/379 datas explícitas |
| Análise/BI                               | collective:analyze e powerbi:prepare  | seis figuras e tabelas 760/20/380/760/38/1/1                   |
| Licença                                  | hash da cópia CC0 obtida              | igual ao registro aprovado                                     |
| Diagnóstico pessoal                      | npm run db:check                      | DATABASE_URL_REQUIRED; sem conexão pessoal                     |
| Whitespace                               | git diff --check                      | código 0; avisos LF/CRLF apenas                                |

verify terminou com código 0 incluindo todas as etapas, com 174 testes Python naquele momento (289 no total). Depois foi acrescentado o caso de adiamento atravessando o ano civil, sem alterar o recorte por datas: a suíte Python final passou com 175. As verificações pertinentes foram repetidas após esse ajuste e a inclusão de proveniência no CSV: 14 testes coletivos HTTP, verify:pipeline, ESLint, Prettier e smoke, todos aprovados. Não se atribui ao primeiro verify um teste que ainda não existia.

## Casos efetivamente exercitados

Fonte real de 380 jogos e SHA-256; clubes canônicos, mandos/visitas, rodada 1/38, um jogo por clube/rodada, duplicatas, placares nulos/negativos/booleanos, outra competição/temporada, datas inválidas e rejeição antes da publicação. Adiamento Sport × Flamengo mantém rodada 12 em 15/11/2025; teste de domínio preserva temporada/rodada mesmo com data no ano civil seguinte.

Idempotência com comparação de bytes Bronze/Silver/Gold/Parquet, hashes, reimportação SQL sem duplicação, transações/rollback e preservação de tabela legada populada. Migrações históricas continuam testadas em isolamento; 004 não altera essas tabelas. Constraints e SQL parametrizado.

Totais dos 20 clubes conciliados Python/JavaScript/SQL; 760 acumulados conciliados; quartis/descritiva, sequências, taxas, clean sheets e empates residuais sem inventar posições oficiais. Janelas equivalentes, mando, adversário, resultado, paginação, parâmetros inválidos, escopo ampliado recusado e CSV mantendo filtros/proveniência. Ausência legítima permanece null.

DOM: nove páginas, navegação coletiva sem jogadores, paginação, filtro vazio, CSV, comparação e indisponibilidade. Testes dos componentes individuais foram preservados isoladamente. A suíte coletiva usa resultados reais; o motor gráfico é substituído apenas nos testes DOM, que não certificam pintura/layout.

## Limites observados

Controle de UI interrompeu o Chrome por não confirmar a URL atual. Sem captura visual completa, validação desktop/mobile ou auditoria de acessibilidade. Figuras PNG foram inspecionadas localmente; isso não valida o React no navegador.

Power BI Desktop não apareceu no inventário: M/DAX não foram compilados, nenhum PBIX/PBIP foi gerado/validado e não houve embed/publicação. CI remoto não executado. Banco permanente não configurado por ausência de DATABASE_URL. Não houve acesso a bancos pessoais.

O kernel Jupyter emitiu aviso de transporte TCP sem criptografia; foi limitado a loopback pelo runner e encerrado ao final. As células executaram sem erro. Não se mediu desempenho em escala ou processamento distribuído.
