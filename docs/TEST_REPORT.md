# Relatório de verificações — MengoData em 22/10/2026

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
