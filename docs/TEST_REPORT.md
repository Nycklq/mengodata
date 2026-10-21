# Relatório de verificações — migração coletiva

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
