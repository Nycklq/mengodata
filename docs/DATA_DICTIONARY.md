# Dicionário coletivo

| Dataset           | Grão/chave               | Campos                                                                                                                                      |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Bronze            | arquivo por SHA-256      | bytes e metadata URL/revisão/licença/coleta/hash                                                                                            |
| Silver matches    | match_id                 | competition_id, season, official_round, date, home_id/away_id, nomes, gols, source_locator, external_match_id null, source_id, collected_at |
| Gold team_matches | match_id + club_id       | opponent_id, venue home/away, gols pró/contra, resultado W/D/L, contagens, saldo, pontos, clean_sheets                                      |
| Gold club_totals  | club_id                  | agregados, médias, aproveitamento, sequências, position e tied                                                                              |
| Gold standings    | club_id + official_round | acumulados até a rodada, sem somar snapshots                                                                                                |
| Clubs             | club_id                  | name canônico e source_name original                                                                                                        |
| Statistics        | população declarada      | n, média, mediana, quartis, dispersão, extremos e correlação                                                                                |

Competição canônica competition:brasileirao-serie-a-men, temporada 2025. date é data declarada, sem fuso inferido. UUID não é número CBF; source_name não é ID oficial. Partição season=2025/competition=brasileirao-serie-a-men; Gold JSON atende API, Parquet armazena analítica e CSV integra BI. [Fórmulas](METRICS.md).
