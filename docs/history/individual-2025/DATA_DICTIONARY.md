# Dicionário de dados

Universo: Flamengo, Brasileirão Série A masculino/2025, rodadas oficiais 1–38. Não há observações individuais homologadas no produto. O contrato abaixo prepara a entrada de um artefato autorizado, sem inventar campos de fonte inexistentes.

| Campo                                  | Tipo               | Semântica                                                                        |
| -------------------------------------- | ------------------ | -------------------------------------------------------------------------------- |
| competition_id                         | texto              | Identidade interna fixa competition:brasileirao-serie-a-men                      |
| season                                 | inteiro            | 2025, independente da data de realização                                         |
| team_id                                | texto              | Clube da atuação, sempre club:flamengo                                           |
| official_round                         | inteiro            | Rodada oficial 1–38; adiamentos conservam origem                                 |
| player_id / match_id                   | UUID               | Identidades canônicas resolvidas por evidência                                   |
| source_id                              | namespace          | Identifica o provedor, separado de nomes e IDs externos                          |
| external_player_id / external_match_id | texto              | Identidade no namespace da fonte; não usar nome como chave                       |
| official_match_number                  | inteiro            | Número oficial 1–380; não inferir da ordem do arquivo                            |
| collected_at                           | timestamp com fuso | Momento de coleta do artefato; diferente da captura original desconhecida        |
| played_at                              | timestamp com fuso | Realização da partida canônica, sem inventar fuso                                |
| content_sha256                         | texto hexadecimal  | Fingerprint do arquivo exato revisado/importado                                  |
| dataset_version                        | texto              | Revisão lógica apresentada e persistida com a importação                         |
| position                               | enum               | goalkeeper, defender, midfielder, forward ou unknown; posição analítica revisada |
| starter                                | booleano ou null   | Evidência de titularidade; desconhecido não é false                              |

O schema individual exige top-level schema_version=1, scope, source_id, dataset_version, collected_at, players, matches e appearances. Cada aparência representa entrada efetiva de um jogador pelo Flamengo em uma partida; banco de reservas não conta como atuação. Não se deduz participação de minutos positivos, pois a convenção pode arredondar uma entrada tardia para zero. Este contrato não recebe snapshots acumulados ou totais anuais como aparições.

| Componentes por aparência                     | Tipo e unidade                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| minutes                                       | Número não negativo ou null, minutos segundo convenção revisada                 |
| goals / assists                               | Inteiros não negativos ou null, eventos atribuídos ao atleta                    |
| shots / shots_on_target                       | Inteiros não negativos ou null; taxonomia do fornecedor precisa ser homologada  |
| tackles / interceptions / clearances / blocks | Inteiros não negativos ou null, ações distintas                                 |
| passes_completed / passes_attempted           | Inteiros não negativos ou null, componentes compatíveis                         |
| yellow_cards / red_cards                      | Inteiros não negativos ou null; política de segundo amarelo/contexto revisada   |
| xg / xa                                       | Número não negativo ou null; modelo identificado, sem substituição por placares |

Todos os componentes são explícitos no JSON canônico; desconhecidos usam null. Contagens esportivas não aceitam frações. PostgreSQL conserva componentes e origem, sem arredondar taxas. [metrics.json](../contracts/metrics.json) define rótulos/unidades/casas de apresentação; [METRICS.md](METRICS.md) define fórmulas.

Os agregados usam partidas distintas, somas completas e componentes de mesma cobertura. Partidas/titularidades sem aparições verificadas não recebem zero implícito. Taxas inválidas ficam null. Em distribuições, sample_size é o número de valores conhecidos, e pode ser zero como metadado da amostra, sem significar desempenho esportivo zero.

Referências auxiliares usam source_record_id, source_round, played_on, source_time, time_zone, home_team, away_team e score. OpenFootball não fornece UUIDs canônicos ou IDs oficiais conciliados: esses campos permanecem nulos. source_record_id é um ponteiro JSON da revisão fixa, não número oficial. Esses registros não entram na tabela de atuações.

As tabelas data_sources, players, player_source_ids, matches e match_source_ids identificam/provenienciam. analytics_imports versiona hash, origem, coleta e evidência; player_match_statistics tem PK (import_id, player_id, match_id), vínculo com o escopo da partida e clube da atuação. Trocar de clube não troca a identidade do jogador, e não transfere estatísticas de outra equipe para o Flamengo.
