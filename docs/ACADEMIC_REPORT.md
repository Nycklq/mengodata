# Relatório acadêmico

**Flamengo Analytics — Análise Estatística e Comparativa do Desempenho do Flamengo no Campeonato Brasileiro Série A de 2025.** Disciplina: Big Data e Análise de Dados.

## Pergunta e método

Como o desempenho coletivo do Flamengo se compara aos outros 19 clubes em resultados, ataque, defesa e mando? Estudo descritivo da temporada completa, rodadas oficiais 1–38: 380 partidas e 760 observações clube × partida.

OpenFootball CC0, revisão/hash fixos e conciliação dos 380 placares com a CBF. ETL reproduzível com Bronze/Silver/Gold, partição, Parquet, PostgreSQL, API, React e materiais Power BI. Pandas/NumPy calculam; Matplotlib/Seaborn produzem figuras.

## Resultados calculados

Flamengo: 79 pontos em 38 jogos, 23 vitórias, 10 empates, 5 derrotas, gols 78/27 e saldo 51. Aproveitamento 69,2982%, médias 2,0526 feitos e 0,7105 sofridos por jogo. Foram 18 partidas sem sofrer gol, maior sequência de três vitórias e de 12 jogos sem derrota, pela data efetiva.

Maior total de gols pró e menor total de gols contra da base. Palmeiras soma 76 pontos; Cruzeiro, 70; Mirassol, 67. Em casa, Flamengo teve 47 pontos (14 vitórias, cinco empates, gols 46/8); fora, 32 (nove vitórias, cinco empates, cinco derrotas, gols 32/19).

O campeonato teve 959 gols: média 2,5237 por partida, mediana 2, Q1=1, Q3=3 e desvio populacional 1,5448. Correlação exploratória gols pró × pontos dos 20 clubes: 0,8927, sem inferência causal ou generalização. As variáveis têm dependências matemáticas.

## Big Data e limites

380 partidas são volume pequeno. Demonstram-se proveniência, validação, idempotência, ETL, camadas, partição, formato colunar, integração e consistência semântica. Não se afirma processamento massivo, benchmark de escala ou necessidade de Spark/Hadoop. Não se fabricou volume.

Placares não descrevem posse, chances, passes, pressão ou atletas. Classificação calculada não reproduz todos os desempates ou sanções. Dez rodadas e uma data não são explícitas na extração oficial; não foram inferidas. Acumulados por rodada são reconstruções retrospectivas.

Python/SQL/API têm testes de consistência. M/DAX precisam ser montados e conferidos no Desktop; não há PBIX/PBIP validado. Revisão visual desktop/mobile bloqueada pelo controle de URL. [Figuras](../reports/collective/README.md), [resultados](../reports/collective/report.json), [testes](TEST_REPORT.md), [fontes](DATA_SOURCES.md) e [roteiro](PRESENTATION.md).
