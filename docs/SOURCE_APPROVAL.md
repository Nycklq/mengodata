# Decisão de fontes e permissões

Revisão: 19/10/2026. Flamengo, Série A masculina de 2025, rodadas oficiais 1 a 38. Esta decisão separa a adequação técnica, os usos documentalmente permitidos e a execução efetiva. **O projeto não está homologado para análises individuais.**

## Decisão objetiva

| Fonte e finalidade                                                           | Aprovação técnica                                                                            | Ingestão autorizada                                                                     | Publicação autorizada                                                 |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| OpenFootball, referência auxiliar de partidas e placares da revisão auditada | Aprovada nesse escopo; 38 referências consistentes no arquivo                                | Permitida documentalmente pela CC0 para esses metadados; nenhuma persistência executada | Permitida pela CC0 para esses metadados; nenhuma publicação executada |
| OpenFootball, manifesto oficial CBF                                          | Pendente: IDs oficiais e conciliação das 38 referências não concluídos                       | Não liberada como manifesto canônico                                                    | Não apresentar o catálogo como homologação oficial                    |
| OpenFootball, estatísticas individuais                                       | Inadequada: não contém atletas ou scouts                                                     | Não                                                                                     | Não                                                                   |
| jhonatasjgr/brasileirao-2025 e caRtola, dados individuais                    | Reprovada na forma auditada: snapshots, ausência de vínculo por partida, minutos e cobertura | Não; autorização original também pendente                                               | Não; autorização original também pendente                             |
| CBF, dados e documentos do site                                              | Referências pontuais; base individual completa não auditada                                  | Pendente de autorização e cobertura                                                     | Pendente de autorização                                               |
| Sportmonks e API-Football, base individual licenciada                        | Candidatos; documentação não comprova Flamengo/2025                                          | Pendente de amostra, contrato e direitos suficientes                                    | Pendente de autorização específica por canal                          |

Não há indicador individual liberado para cálculo de temporada, comparação, ranking ou taxa por 90 minutos. A matriz de disponibilidade está em [METRICS.md](METRICS.md). O OpenFootball permite organizar as 38 referências auxiliares, suas datas e seus placares, sem atribuir gols a atletas ou inferir escalações.

## Evidências da decisão

OpenFootball: [revisão fixa](https://github.com/openfootball/football.json/tree/e6744429ee395bc86f247348c6184bb08d4eb361), [dados](https://github.com/openfootball/football.json/blob/e6744429ee395bc86f247348c6184bb08d4eb361/2025/br.1.json), [README](https://github.com/openfootball/football.json/blob/e6744429ee395bc86f247348c6184bb08d4eb361/README.md) e [CC0](https://github.com/openfootball/football.json/blob/e6744429ee395bc86f247348c6184bb08d4eb361/LICENSE.md) efetivamente lidos. SHA-256 dos dados: 0fcc4647256b2e1f58b50f1372b751aeb7e6aacb5b8cd747579dd7ab71303fbb; licença: 36ffd9dc085d529a7e60e1276d73ae5a030b020313e6c5408593a6ae2af39673.

O README dedica expressamente schema, dados e scripts ao domínio público. A CC0 abrange os direitos do declarante e permite reutilização, transformação e distribuição, inclusive por meios digitais. Não garante direitos de terceiros, marcas, imagem ou endosso. A [explicação oficial da Creative Commons](https://creativecommons.org/publicdomain/zero/1.0/) confirma esses limites. A decisão não transforma licença do OpenFootball em autorização sobre Cartola, CBF ou imagens externas.

Candidato: revisão 0376354699db69991630ded053bde30f7d9c5ca5, consolidado SHA-256 dfd72de56dc5f3cf84187400bf36a8744a945299982ccd45926db22403c781b1. A árvore completa não contém licença e a consulta pública /license retornou 404. Os 38 brutos coincidem com [caRtola na revisão 17832580475259b8999649ced88c8694c89372e1](https://github.com/henriquepgomide/caRtola/tree/17832580475259b8999649ced88c8694c89372e1), que possui MIT para software. Identidade de cópias e licença de software não comprovam autorização do titular dos dados originais.

O [termo Cartola efetivamente encontrado](https://ajuda.globo/cartola/termos-e-politicas/faq/termo-de-uso.ghtml), seção 9.1, restringe meios automatizados, extração e reprodução não autorizada. Ele ainda se refere à temporada 2024; não se presume ser a versão contratual da coleta de 2025. Os [termos CBF](https://www.cbf.com.br/termos-de-uso), versão declarada 1.0/2022, também não fornecem licença aberta para copiar sua base. Não se conclui a ilicitude de qualquer consulta; falta a autorização documental exigida para os usos do projeto.

## Permissões por operação

P = pendente, portanto não autorizada para execução no produto. A = permitida documentalmente apenas para o conjunto OpenFootball de referências auxiliares. Capacidade comercial anunciada por fornecedor não equivale a contrato celebrado.

| Operação                                 | OpenFootball, referência auxiliar | Cartola/candidato/caRtola | CBF | Sportmonks/API-Football |
| ---------------------------------------- | --------------------------------- | ------------------------- | --- | ----------------------- |
| Obtenção dos dados pelo canal permitido  | A                                 | P                         | P   | P                       |
| Armazenamento PostgreSQL                 | A                                 | P                         | P   | P                       |
| Transformação e análise acadêmica        | A                                 | P                         | P   | P                       |
| Exibição no React                        | A                                 | P                         | P   | P                       |
| API REST pública                         | A                                 | P                         | P   | P                       |
| Exportação CSV                           | A                                 | P                         | P   | P                       |
| Uso e distribuição de Power BI com dados | A                                 | P                         | P   | P                       |
| Publicação de dados no GitHub            | A                                 | P                         | P   | P                       |

Os A não incluem qualquer observação individual, conteúdo copiado da CBF, escudo ou fotografia. GitHub, implantação, publicação e escrita em bancos existentes continuam sujeitos à autorização do usuário, não concedida nesta tarefa. A permissão de licença não é ordem para executar essas operações.

## Alternativas verificadas

[Sportmonks](https://www.sportmonks.com/football-api/brasileirao-api/) anuncia cobertura do Brasileirão; a página consultada demonstra 2026, sem provar a temporada 2025 requerida. A [política de uso](https://www.sportmonks.com/integrity-support/) descreve armazenamento e apresentação dentro do produto e exige aprovação escrita para redistribuir o feed. Solicitar a cobertura histórica por atleta/partida, lineups.details, convenções e usos de API/CSV/Power BI/GitHub. Não foram usados token, teste gratuito, cadastro ou contratação.

[API-Football](https://www.api-football.com/terms) informa dados de parceiros, restringe revenda direta e atribui ao usuário a verificação dos direitos necessários à publicação. Exigir amostra fixture/player das 38 partidas e autorização contratual suficiente. A existência de endpoint ou plano não homologa campos, cobertura e direitos. Nenhum endpoint autenticado foi consultado.

## Bloqueio implementado

[source-approval.json](../contracts/source-approval.json) registra a revisão, o hash, a finalidade técnica e a evidência de cada uso. A auditoria offline aceita somente a finalidade expressamente aprovada; exige aprovação técnica, correspondência de fonte/hash e permissão HTTPS para a operação. Falta de evidência, fonte desconhecida, artefato alterado ou operação não listada bloqueiam a autorização.

O catálogo auxiliar não libera official_manifest, player_match ou player_snapshot. Permissão de armazenamento não implica API ou exportação. O registro não é editável por parâmetro da CLI ou HTTP; alterações exigem nova auditoria no repositório. Não é possível ao software verificar sozinho a veracidade jurídica dos documentos: o registro representa a decisão documentada, limitada aos fatos examinados.

O manifesto v2 e seus validadores continuam preservados: sem provas de cobertura individual, statistics_coverage=unverified e ingestion_ready=false. A auditoria offline não escreve no banco nem ingere scouts. A implementação posterior desta execução adicionou o importador auxiliar autorizado e integrou suas 38 referências à API/React; os scouts continuam bloqueados. A API e o React continuam informando indisponibilidade individual.

## Fase 3 e pendências

A parte de referências auxiliares da Fase 3 foi implementada e executada: conector OpenFootball com revisão fixa, rastreabilidade, Bronze/Silver/Gold e tratamento dos dois formatos de placar. A ingestão definitiva de atuações individuais permanece bloqueada. Antes de persistir um manifesto canônico, obter os 38 vínculos oficiais, verificar datas/adiamentos e preservar IDs e fusos sem inferência.

São pendências críticas: autorização do titular dos dados individuais; fonte jogador × partida; presença, minutos e titularidade verificáveis; taxonomias; cobertura por métrica nas 38 partidas e transferências. Os [pedidos escritos](SOURCE_PERMISSION_REQUEST.md) estão preparados, sem envio.

Podem continuar independentemente: testes sintéticos de regras, desenho dos contratos de observações e ausência de dados, paridade de fórmulas JS/Python por fixtures compartilhadas, rastreabilidade, auditoria offline e conciliação documental pelo acesso permitido. A homologação integral, a Gold estatística, os rankings e o relatório Power BI com dados individuais não estão liberados.
