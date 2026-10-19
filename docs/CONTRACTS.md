# Contratos e identificação — versão 2

Atualização: 19/10/2026. Universo vigente: Flamengo, Série A masculina de 2025, temporada completa, rodadas oficiais 1 a 38. Não há manifesto oficial homologado; existe catálogo auxiliar OpenFootball na evidência de auditoria.

## Evolução do contrato

Manifesto e metadados usam schema_version=2 e URNs terminadas em :2. A versão 1 é recusada, inclusive se alguém apenas mudar a temporada do documento. A mudança de universo e a separação dos estados do relatório justificam a quebra explícita. Não existe conversão automática de partidas, IDs ou estatísticas de 2026 para 2025.

[scope.json](../contracts/scope.json) é a definição neutra compartilhada pelo núcleo JavaScript. A constante Python é confrontada com esse JSON por teste. A API e o React não aceitam seleção de outra temporada ou ampliação/redução do universo.

## Identidades

| Identidade       | Modelo                                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| Competição       | competition:brasileirao-serie-a-men, interno; não é código de fornecedor     |
| Flamengo         | club:flamengo, interno, no futebol masculino profissional                    |
| Temporada        | Inteiro 2025; não inferido de played_at                                      |
| Rodada           | Oficial 1..38; não rodada de mercado Cartola                                 |
| Partida          | UUID interno; referência oficial competição + temporada + número de jogo CBF |
| Partida na fonte | source_id + external_match_id                                                |
| Jogador          | UUID interno; display_name descritivo, não único                             |
| Jogador na fonte | source_id + external_player_id; associação por evidência                     |
| Fonte            | Namespace estável, nome, aprovação declarada e referência                    |

Números de jogo CBF (1..380), IDs de evento do site e IDs de fornecedores são identidades distintas. Nenhuma correspondência real foi cadastrada. Nome, camisa, elenco atual ou data isolada não bastam para resolver identidades. Transferências não autorizam incorporar atuações de outro clube.

## Entrada do manifesto

[manifest.schema.json](../contracts/manifest.schema.json) usa JSON Schema 2020-12 e propriedades fechadas. Exige schema_version, scope, sources e matches. Cada fonte contém source_id, name, approval_status e approval_reference. Aprovação pode ser pending, approved ou rejected; approved exige referência HTTPS no domínio.

Cada partida contém UUID, competição, temporada, rodada oficial, número oficial, mandante, visitante, status, played_at ou nulo, fonte, ID externo, evidência HTTPS e collected_at com fuso. Status: scheduled, postponed, suspended, cancelled, finished. Finished exige data, e coleta não pode preceder realização.

O leitor rejeita chaves JSON repetidas, campos desconhecidos, IDs vazios, UUID inválido, evidência sem HTTPS e timestamp sem fuso. O transporte admite até 76 registros para diagnosticar duplicatas e inclusões indevidas; esse limite de proteção não redefine as 38 partidas esperadas. Rodada 39 é rejeitada pelo transporte e pelo domínio. Campos estatísticos, totais anuais e scouts não fazem parte deste contrato.

## Regras do domínio

- Exigir competição, temporada e clube fixos, com rodada oficial 1..38. Rodadas 1, 19, 20 e 38 pertencem ao universo.
- Flamengo pode ser mandante ou visitante; equipes devem ser distintas.
- Data, adiamento e posição cronológica não substituem a rodada ou temporada declarada.
- A atuação pertence ao recorte apenas pelo Flamengo naquela partida.
- Rejeitar duplicatas por UUID, referência oficial, rodada e par fonte/ID externo.
- Exigir uma referência elegível para cada uma das 38 rodadas; não inventar jogos para lacunas.
- Rejeitar fonte desconhecida e divergência de escopo. Fonte não aprovada e partida não concluída bloqueiam prontidão de identificação.

O validador não acessa URLs ou comprova a verdade das declarações. Correspondência com partidas reais e direitos de uso exigem auditoria documental.

## Resultado e bloqueio da ingestão

| Campo                | Semântica                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| valid                | Ausência de erros de domínio, inclusive lacunas                                                |
| complete             | 38 rodadas identificadas com consistência; não significa estatísticas completas                |
| identification_ready | Referências válidas/completas, fontes declaradas aprovadas com evidência e partidas concluídas |
| statistics_coverage  | unverified: este manifesto não contém observações ou provas de cobertura individual            |
| ingestion_ready      | false neste contrato; referências e aprovação declarada não bastam                             |
| identified_matches   | Quantidade recebida, inclusive registros duplicados/inválidos                                  |
| missing_rounds       | Rodadas sem referência elegível                                                                |
| errors / warnings    | code/path com localização do diagnóstico                                                       |

Mesmo um manifesto completo com fontes declaradas aprovadas recebe statistics_coverage_unverified. Assim, o software distingue identificação pronta, cobertura ainda não comprovada e ingestão bloqueada. Uma futura extensão exigirá prova auditada de cobertura por atuação/métrica e autorização aplicável; nenhuma flag fornecida livremente pelo cliente poderá substituir essa prova.

CLI: código 0 para valid, 1 para erro de domínio/completude e 2 para entrada inválida. Código 0 não libera ingestão. Validação repetida não grava dados e é determinística; a importação auxiliar e a entrada individual condicionada agora possuem testes próprios de idempotência; isso não altera a semântica deste validador.

## Registro de auditoria de fontes

[source-approval.json](../contracts/source-approval.json) tem schema_version=1 independente do manifesto v2. É configuração local revisada, não payload público: identifica escopo, revisão e hash do artefato, finalidade aprovada e permissão por uso com evidência. O leitor recusa escopo divergente, IDs de fonte duplicados e hash de formato inválido. As decisões negam por padrão fonte desconhecida, revisão/artefato diferente, finalidade não aprovada, ausência de aprovação técnica ou de permissão documental para o canal.

O catálogo em [source-audit-2025.json](evidence/source-audit-2025.json) contém rodada declarada, data civil, horário sem fuso confirmado, placar e localizador JSON na revisão fixa. Ele não inventa número oficial, ID CBF, UUID canônico ou timestamp UTC. Seus campos oficiais/fuso são nulos; não é manifesto v2 nem prova de atuações. A autorização de match_reference não se estende a official_manifest, player_match ou player_snapshot. A CLI não oferece parâmetro para alterar aprovações.

## HTTP e React

[project-metadata.schema.json](../contracts/project-metadata.schema.json) descreve GET /api/metadata: schema_version=2, escopo fixo, rótulo “Brasileirão Série A 2025 — temporada completa (rodadas 1 a 38)”, source_status=pending, data_status=unavailable, dataset_version=null e coverage=null. Parâmetros de consulta geram 400/INVALID_QUERY. As rotas analíticas foram adicionadas com envelope independente v1, documentado em [api/README.md](api/README.md) e [OpenAPI](api/openapi.json).

O controller recebe getMetadata. O gateway Fetch implementa getMetadata(signal), valida transporte com Zod e encaminha cancelamento. loadProjectStatus valida o universo pelo domínio. React recebe esse fluxo por injeção. Dados incompatíveis, inclusive v1, geram erro; indisponibilidade não vira zero.

Erros inesperados: 500/INTERNAL_ERROR; rota ausente: 404/NOT_FOUND. Health confirma somente processo ativo. Contrato backend→schema→gateway→aplicação frontend e paridade Python↔JSON são exercitados por testes. A paridade matemática JS/Python usa fixture neutra e a persistência conserva componentes. A validação no motor DAX permanece pendente.

## Artefato individual e revisão

[individual.schema.json](../contracts/individual.schema.json) define o novo arquivo canônico v1, separado do manifesto v2: source_id, dataset_version, collected_at, scope, players com IDs internos/externos, matches com referências oficiais e appearances por jogador/partida. Componentes desconhecidos são null explícito. A estrutura é derivada do Zod e sua igualdade é conferida por teste para o leitor Python.

[dataset-approvals.json](../contracts/dataset-approvals.json) tem lista vazia no estado real. Uma revisão futura deve registrar sha256, source_id, data_kind=player_match, status=approved, evidence HTTPS, permissions por uso e verificações coverage_verified, official_mapping_verified e participation_verified. O registro de fonte também precisa aprovar essa finalidade e o mesmo hash. Nenhuma flag livre de transporte substitui auditoria documental.

O domínio recusa duplicatas, vínculos divergentes e atribuição a outro clube. Cobertura completa exige as 38 rodadas e revisão de participações; do contrário, o dataset autorizado continua parcial. A entrada local exige acquisition/postgres_storage/academic_analysis; apresentação exige também react_display/rest_api; CSV e Power BI exigem seus direitos próprios.

A migração 003 registra versões/hash/origem e fatos com PK por importação, jogador e partida. IDs de fonte conflitantes abortam a transação. Sem DATABASE_URL, a API usa apenas Gold local homologada; com ela, exige a mesma versão carregada no PostgreSQL. Consulte [dicionário](DATA_DICTIONARY.md) e [arquitetura](ARCHITECTURE.md).
