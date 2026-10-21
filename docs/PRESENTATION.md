# Roteiro acadêmico — oito minutos

| Tempo     | Demonstração e fala                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:45 | Pergunta: como a campanha coletiva do Flamengo se compara aos 19 clubes? Delimite Série A masculina/2025, 38 rodadas e placares.        |
| 0:45–1:45 | Mostre CC0, hash e cobertura: 380 partidas, 760 fatos e conciliação de todos os placares com a CBF. Declare as lacunas de extração PDF. |
| 1:45–2:45 | Explique Bronze → Silver → Gold, Parquet, partição e changed=false. Reconheça volume pequeno e justifique Pandas/PostgreSQL.            |
| 2:45–4:00 | Dashboard: 79 pontos, 78 gols pró, 27 contra, +51. Mostre evolução e casa/fora: 47 versus 32 pontos.                                    |
| 4:00–5:00 | Partidas: Sport, rodada 12, data 15/11/2025; explique adiamento. Exporte CSV. Altere rodada na classificação calculada.                 |
| 5:00–6:00 | Compare Flamengo/Palmeiras na mesma janela e mando. Mostre ataque/defesa e declare ausência de posse/xG/ações.                          |
| 6:00–7:00 | Notebook/gráficos: 959 gols, média 2,5237, mediana 2. Interprete correlação 0,8927 sem causalidade.                                     |
| 7:00–8:00 | Arquitetura, testes e equivalência Python/SQL/API. Apresente materiais BI e a pendência Desktop. Conclua com resultados e limites.      |

Antes da aula: execute pipeline:collective, collective:analyze, powerbi:prepare e verify; inicie backend/frontend. Abra gráficos e notebooks previamente e use Bronze offline para não depender de download ao vivo. Para cinco minutos, reduza arquitetura e use dois gráficos; para dez, demonstre testes/filtros/modelo BI.

Perguntas prováveis: a base não é massiva, mas aplica conceitos Big Data com volume honesto. O foco autorizado é coletivo. A classificação é calculada por critérios disponíveis. Rodada oficial prevalece sobre data. PBIX não foi validado; foram entregues artefatos montáveis e valores de conferência.
