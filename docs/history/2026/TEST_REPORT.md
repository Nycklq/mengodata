# Relatório de verificações — Fase 2

Data: 19/10/2026. Executado no Windows, Node.js 24.22.0, Python 3.14.8 e PostgreSQL 18.6. Os resultados não representam homologação de fonte ou cobertura estatística.

## Resultados observados

| Comando ou verificação             | Resultado                                                                                                   |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| npm run lint                       | ESLint aprovado, sem erros ou avisos                                                                        |
| npm run lint:pipeline              | Ruff aprovado                                                                                               |
| npm run format:check               | Prettier aprovado nos arquivos abrangidos                                                                   |
| npm run format:pipeline:check      | 15 arquivos Python formatados                                                                               |
| Backend                            | 9 testes aprovados                                                                                          |
| Frontend                           | 7 testes aprovados                                                                                          |
| Arquitetura e contratos JavaScript | 4 testes aprovados                                                                                          |
| Pipeline e arquitetura Python      | 92 testes aprovados                                                                                         |
| PostgreSQL real isolado            | 14 testes aprovados                                                                                         |
| Total                              | 126 testes aprovados, sem falhas, cancelamentos ou testes ignorados                                         |
| npm run build                      | Aprovado; 161 módulos transformados e artefatos em frontend/dist, ignorados pelo Git                        |
| pip check                          | Nenhuma dependência quebrada encontrada                                                                     |
| npm audit --omit=dev               | Nenhuma vulnerabilidade reportada na consulta das dependências de produção                                  |
| Smoke HTTP local                   | API pelo ponto de entrada real, Vite servindo HTML/JSX e proxy de metadados aprovados; processos encerrados |
| Conferência documental             | 72 arquivos versionáveis e 94 links locais válidos; documentos normativos preservados                       |

Os comandos equivalentes com npm.cmd foram usados no PowerShell. Nenhuma política de execução foi alterada. npm run verify terminou com código 0. Depois foi ampliado o teste para cobrir explicitamente fonte rejeitada; a suíte Python foi repetida e passou em 92 testes, com Ruff e formatação aprovados. Não houve mudança funcional posterior.

## Casos cobertos

- Todas as rodadas 1 a 19 e exclusão de 20 a 38; ano, competição e clube divergentes; tipos inválidos.
- Mando, data posterior da rodada adiada e clube da atuação.
- Manifesto incompleto, identidade/referência/rodada/ID externo duplicados, fonte desconhecida, escopo divergente e cronologia da coleta.
- Fonte pendente/rejeitada, declaração aprovada sem evidência e diferença entre completude e prontidão.
- JSON ambíguo, campos ausentes, estatística indevida no manifesto, UUID/evidência/timestamp inválidos e CLI fora da raiz.
- Erros de entrada e schema da CLI, com saída estável sem traceback.
- HTTP health/metadados, tentativa de ampliar escopo, rotas ausentes, falha sem vazamento e cabeçalhos.
- Frontend com loading, indisponibilidade, erro/nova tentativa, gateway, cancelamento e resposta incompatível.
- Resposta backend passando por schema e gateway/caso de uso frontend; escopo Python confrontado ao JSON comum.
- Imports para o núcleo, ciclos JavaScript e ausência de comentários/docstrings.
- Migração sem sementes, reaplicação idempotente, recorte SQL, identidades, unicidade/FKs, alteração de migração aplicada e rollback de DDL/histórico.

## Limites

Fixtures e identidades são exclusivamente sintéticas e identificadas nos testes. Não existem fixtures esportivas na aplicação, Bronze, Silver ou Gold.

O cluster temporário tem autenticação e porta próprias e foi encerrado. O banco pessoal em 5432 não foi usado. Docker Compose e banco permanente não foram executados/criados.

A validação repetida é determinística e não grava observações. Não há ingestão para testar idempotência de dados reais nem indicadores para conferir paridade Python/Gold/PostgreSQL/API/React/DAX. Esses requisitos continuam nas próximas fases.

Frontend foi conferido por componentes/gateway, build e smoke HTTP. Não houve revisão visual em navegador ou teste completo de usuário. O workflow foi somente configurado; GitHub, Linux e WSL não foram executados aqui. O workflow atual não inclui integração PostgreSQL.

## Ajustes encontrados

A instalação editável foi repetida após criar src. A primeira passagem encontrou formatação Python e filtro AST que selecionava incorretamente pastas; ambos foram corrigidos e os testes passaram. Prettier não infere parser para chamada explícita de .env; o arquivo é conferido por leitura. A escrita de documentação pelo pipe PowerShell também foi corrigida para preservar UTF-8, e os arquivos foram revalidados.

Na Fase 1 houve somente verificações documentais. Este relatório registra a implementação atual, sem alterar as evidências históricas da pesquisa.
