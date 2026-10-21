# API coletiva REST

Servidor local http://127.0.0.1:3001. [OpenAPI 3.1](openapi.json). Série A masculina/2025/rodadas 1–38. Sem rotas individuais no servidor ativo.

| GET                                   | Resposta                                          |
| ------------------------------------- | ------------------------------------------------- |
| /api/health                           | saúde do processo, sem certificar banco           |
| /api/metadata                         | prontidão efetiva, cobertura, fonte/hash e escopo |
| /api/data-quality                     | controles de cobertura                            |
| /api/clubs                            | 20 clubes canônicos                               |
| /api/summary e /api/dashboard/summary | KPIs focais, casa/fora e 20 clubes                |
| /api/matches                          | partidas paginadas e filtradas                    |
| /api/standings                        | classificação calculada acumulada                 |
| /api/evolution                        | pontos/gols/saldo e posição por rodada            |
| /api/compare                          | dois clubes distintos, mesma janela/mando         |
| /api/analytics/offensive              | gols pró e médias dos clubes                      |
| /api/analytics/defensive              | gols contra, saldo e clean sheets                 |
| /api/statistics                       | descritiva/distribuições de clube × partida       |
| /api/exports/matches                  | CSV de todo o recorte sem paginação               |

from_round=1 e to_round=38 inclusivos, venue=home/away e club_id. Compare aceita opponent_id (padrão Palmeiras, focal Flamengo). Partidas/CSV aceitam opponent_id e result=W/D/L relativos a club_id e exigindo clube. page=1/page_size=20, máximo 100. Classificação/ofensiva/defensiva ranqueiam o universo, sem limitar a club_id.

Exemplo: /api/matches?club_id=club%3Aflamengo&opponent_id=club%3Asport&from_round=12&to_round=12&venue=away mantém rodada 12 e data 2025-11-15.

Evolução acumula desde from_round. Posição refere-se ao universo completo até a rodada (sem mando), calculada. Correlação season_statistics é da temporada completa, independente dos filtros; as distribuições selecionadas respeitam recorte.

400 para query desconhecida, rodada inválida, janela invertida, clube inexistente ou comparação igual. Ausência de publicação: 200/data=null; CSV indisponível: 409; erro interno sanitizado: 500; rate limit: 429. CSV UTF-8/BOM com aspas e proteção de fórmulas. CORS explícito, Helmet e cancelamento no gateway.
