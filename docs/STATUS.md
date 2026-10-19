# Estado do projeto e encerramento da pesquisa da Fase 1

Data de referência: 19/10/2026, America/Sao_Paulo.

## Resultado

A inspeção e a pesquisa solicitadas foram registradas. **A Fase 1 tem uma pendência bloqueante de homologação da fonte; não está liberada a ingestão nem a publicação de estatísticas.** A pesquisa demonstrou maneiras de identificar partidas e rodadas e encontrou estatísticas individuais por partida, mas não comprovou uma base completa, acessível e licenciada para todos os produtos planejados.

O escopo e as tecnologias do contexto foram preservados. Não houve alteração de código de produção, criação de dados fictícios, contratação, cadastro em provedores, envio de mensagens, commit, push ou implantação.

## Inventário observado antes desta tarefa

`rg --files`, inspeção dos arquivos ocultos e comandos Git mostraram somente:

| Artefato | Situação observada |
| --- | --- |
| `AGENTS.md` | Existente e lido integralmente |
| `docs/FLAMENGO_ANALYTICS_CONTEXT.md` | Existente, 1.738 linhas, lido integralmente em trechos |
| `.git/` | Repositório inicializado, branch `main`, sem commits |
| Arquivos rastreados pelo Git | Nenhum; os dois documentos estavam não rastreados |
| Frontend, backend, pipeline e notebooks | Ausentes |
| Dados Bronze/Silver/Gold, schema e migrações | Ausentes |
| Power BI, Power Query e DAX | Ausentes |
| Manifestos de dependências, scripts, lint, build, testes e CI | Ausentes |
| README, licença de software e configuração de execução | Ausentes na inspeção inicial |

Os documentos criados nesta tarefa estão relacionados no [README](../README.md). A estrutura ilustrativa do contexto não corresponde a diretórios implementados.

## Evidência e limites

- A tabela oficial foi consultada até a rodada 19 e contém número de jogo e rodada. Uma súmula oficial disponibilizada pela FERJ foi lida e conferida visualmente nas três páginas.
- O caso real de Flamengo × Mirassol, da 4ª rodada, marcado para setembro, evidencia o risco de filtrar por data. Os detalhes e referências estão em [ROUND_SCOPE.md](ROUND_SCOPE.md).
- FBref expõe registros individuais de 2026 por partida em conteúdo indexado, mas a leitura direta falhou nesta sessão. A cobertura completa não foi auditada e a política de uso não libera automaticamente uma plataforma baseada em coleta.
- Football-data.org documenta partidas, rodada e eventos; a única consulta sem credencial retornou HTTP 403. Não se comprovou cobertura individual de 2026.
- API-Football e Sportmonks documentam estatísticas individuais por partida. Não foram consultadas com token. As permissões e diferenças estão em [DATA_SOURCES.md](DATA_SOURCES.md).
- O catálogo StatsBomb Open Data foi inspecionado e não contém a competição brasileira pretendida. Isso não prova ausência no produto comercial.

## Roadmap mantido

| Fase | Estado real | Dependência de entrada |
| --- | --- | --- |
| 1. Pesquisa e descoberta | Pesquisa documentada; homologação pendente | Resolver os critérios abaixo |
| 2. Inicialização da arquitetura | Não iniciada | Arquitetura proposta registrada; primeiro caso de uso e ambiente definidos |
| 3. Engenharia de dados | Não iniciada | Fonte homologada, credencial autorizada, manifesto e semântica validados |
| 4. Modelagem e persistência | Não iniciada | Granularidade e contrato Silver estabilizados |
| 5. API | Não iniciada | Gold e PostgreSQL validados |
| 6. React | Não iniciada | Contratos da API e cobertura disponíveis |
| 7. Power BI | Não iniciada | Gold, licença para o produto e modelo dimensional definidos |
| 8. Análises e documentação | Não iniciada como análise de resultados | Dados reais validados; documentação evolui desde a Fase 1 |
| 9. Testes e qualidade | Não iniciada como suíte executável | Testes acompanham cada implementação desde a Fase 2 |
| 10. Entrega final | Não iniciada | Requisitos essenciais comprovados; publicação depende de autorização |

## Impedimentos e critérios de resolução

| ID | Impedimento | Evidência exigida para resolver |
| --- | --- | --- |
| B1 | Nenhuma fonte homologada para todos os usos | Termos ou autorização para coletar, armazenar, transformar, exibir e usar em React/Power BI; esclarecer API pública, CSV e redistribuição |
| B2 | Cobertura completa não comprovada | Relação das 19 partidas oficiais, IDs do fornecedor, status e dados de todos os atletas que atuaram; matriz por partida e métrica |
| B3 | Credenciais e acesso ao histórico não disponíveis na pesquisa | Acesso autorizado ao plano que cubra 2026 e consulta real de amostras, sem contratar recursos automaticamente |
| B4 | Semântica ainda depende da fonte | Minutos, assistências, cartões após o jogo, gols contra, desarmes e passes definidos e reconciliados |
| B5 | Ambiente da stack ainda não preparado | Verificar compatibilidade e configurar dependências do projeto, PostgreSQL e execução; nenhuma instalação presumida pelo planejamento |

## Próxima sequência concreta

1. Priorizar a validação da Sportmonks como candidata, devido à documentação por atleta/partida e às condições explícitas de uso dentro de produtos. A escolha é uma recomendação de pesquisa, sem contratação ou homologação automática.
2. Confirmar com documentação contratual os usos de API pública, exportação CSV, arquivo Power BI com dados embutidos, retenção histórica e repositório público. O registro de dúvidas está em DATA_SOURCES.md; nenhum contato foi enviado.
3. Com acesso autorizado, confrontar a lista de partidas do fornecedor com a referência oficial, incluindo a rodada 4 adiada e a exclusão da rodada 20. Auditar amostras de titular, reserva utilizado e atleta sem atuação; depois verificar as 19 partidas.
4. Registrar o aceite por métrica, cobertura e direitos. Não remover indicadores ou trocar o recorte se houver lacunas; informar indisponibilidade ou levar a decisão de escopo ao usuário.
5. Iniciar a Fase 2 com uma fatia pequena: política de elegibilidade no domínio do pipeline, caso de uso de validação do manifesto e testes de recorte. Somente depois conectar uma fonte homologada na Fase 3.

É possível preparar regras internas sem dados de produção em uma futura Fase 2 autorizada. A coleta e a apresentação de resultados permanecem dependentes de B1–B4. Esta tarefa se encerra na documentação da descoberta.
