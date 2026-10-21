# Qualidade dos dados coletivos

Auditoria reexecutada em 21/10/2026 sobre bytes OpenFootball da revisão/hash fixos.

| Controle                                          | Resultado             |
| ------------------------------------------------- | --------------------- |
| Partidas / clubes / rodadas                       | 380 / 20 / 38         |
| Jogos por rodada                                  | dez em todas          |
| Jogos por clube                                   | 38 em todos           |
| Mandos/visitas por clube                          | 19/19                 |
| Partidas do Flamengo                              | 38                    |
| Fatos / acumulados                                | 760 / 760             |
| Duplicatas / placares ausentes / linhas removidas | 0 / 0 / 0             |
| Gols do campeonato                                | 959                   |
| Placares confrontados com CBF                     | 380, sem divergências |
| Rodadas / datas explícitas no PDF                 | 370 / 379             |

Exigidos dois mandos de cada par, um jogo por clube/rodada, clubes conhecidos, placares inteiros não negativos, data ISO e competição/temporada corretas. Booleano não é placar. Duplicatas abortam a publicação; não há descarte silencioso ou correção esportiva manual.

Bronze fiel/imutável e reexecução changed=false com mesmos bytes/coleta. Silver normaliza lista/score.ft, datas e clubes. Gold mantém proveniência recuperável por match_id/hash. IDs UUIDv5 são internos; localizadores preservam a origem.

Dez células de rodada e uma data (jogo CBF 336) não aparecem na extração PDF. Ficam nulas na evidência oficial; a fonte principal conserva seus valores declarados. Não inferir rodada pelo número do jogo, data ou ordem. A conciliação não certifica IDs ou células omitidas.

Sport × Flamengo em 15/11 mantém rodada 12. Acumulados são retrospectivos por rodada; sequências seguem data efetiva. Sem horário/fuso homologado para análises mais finas.

Flamengo: 79 pontos, 23/10/5, gols 78/27, +51, 18 clean sheets. Os 20 totais e 760 acumulados são comparados Python/SQL/API. Sanções e desempates disciplinares não são modelados. Posse, xG, ações e atletas permanecem ausentes. Dados sintéticos só em testes isolados.
