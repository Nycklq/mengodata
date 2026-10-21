# Semântica coletiva

Série A masculina/2025/rodadas 1–38, 20 clubes. Grão: clube × partida (760); gols totais por jogo usam 380 partidas.

| Campo | Fórmula / unidade |
| --- | --- |
| played | contagem de jogos elegíveis |
| wins/draws/losses | comparação dos gols pró/contra, em jogos |
| goals_for/goals_against | soma dos placares correspondentes, em gols |
| goal_difference | gols pró − gols contra |
| points | 3 × vitórias + empates |
| efficiency | 100 × pontos / (3 × jogos), escala 0–100 |
| goals_for_average/goals_against_average | gols / jogos |
| clean_sheets | jogos com zero gols sofridos |
| winning_streak/unbeaten_streak | maior sequência de vitórias/sem derrota, por data efetiva |
| position | posição calculada, empates residuais compartilhados |

Acumulados seguem rodada oficial e são retrospectivos; não representam a tabela conhecida em cada data. Sequências seguem data efetiva e match_id como estabilizador; com filtro de mando, são sequências dentro do subconjunto de mandos/visitas. Comparação usa a mesma janela e mando nos dois clubes. Taxas dividem somas compatíveis; vazio produz null/BLANK, sem zeros inventados.

Ranking: pontos, vitórias, saldo e gols pró decrescentes. Empates residuais compartilham posição competitiva (1/1/3); ID só estabiliza exibição. Art. 15 do REC/2025 inclui ainda confronto direto de 180 minutos quando cabível, menos vermelhos, menos amarelos e sorteio. Esses critérios e sanções não são integralmente reproduzidos: sempre classificar como calculada. [Fontes](DATA_SOURCES.md).

Média/mediana/quartis lineares na posição (N−1)p, mínimo/máximo, desvio e variância populacionais (ddof=0). A API distribui gols por clube × partida; o histograma acadêmico usa gols totais por partida. Correlação de Pearson gols pró × pontos dos 20 clubes é exploratória, da temporada completa e independente dos filtros. Não implica causalidade; há dependência matemática entre variáveis derivadas do placar.

Dupla precisão, sem arredondamento intermediário. SQL numeric comparado a Python/JS com tolerância <1e-10. UI até duas casas. DAX já usa porcentagem 0–100; formatar como número com sufixo %, sem multiplicar novamente. Não inferir posse, finalizações, passes, cartões, xG ou atletas.
