# Power BI — material coletivo montável

Não há PBIX/PBIP gerado ou validado. O inventário local não mostrou Power BI Desktop. M/DAX/modelo são materiais sujeitos à compilação e conferência no Desktop; nenhuma publicação foi feita.

## Preparar e montar

1. Execute pipeline:collective e powerbi:prepare. data/powerbi recebe TeamMatches (760), Clubs (20), Matches (380), Standings (760), Rounds (38), Seasons (1) e Provenance (1).
2. No Desktop, crie Consulta Nula chamada Fonte. Cole queries/Collective.m no Editor Avançado e ajuste Pasta.
3. Crie consultas de referência: = Fonte[TeamMatches], = Fonte[Clubs], = Fonte[Matches], = Fonte[Rounds], = Fonte[Seasons], = Fonte[Standings], = Fonte[Provenance], = Fonte[ClubeComparado]. Desative carregamento da Fonte.
4. Confira tipos/contagens. Locale en-US lê decimais e datas ISO; UTF-8 conserva acentos. Ajuste separadores DAX se o idioma do Desktop exigir.
5. Crie as seis relações 1:N de model.json, direção única dimensão → fato. Matches relaciona-se por match_id; não adicione relações ambíguas de mandante/visitante com Clubs. Provenance e ClubeComparado são desconectadas.
6. Importe theme.json em Exibir → Temas e adicione cada expressão de measures.dax como medida separada. Porcentagens já estão em escala 0–100: formato numérico com sufixo %, sem multiplicar novamente.
7. Use slicers de Rounds[official_round], TeamMatches[venue] e Clubs[name]. Na página focal filtre Flamengo. Para comparar use ClubeComparado[name] e medidas dedicadas.
8. Monte as páginas e confira os números abaixo antes de salvar PBIX legítimo.

| Página               | Visuais                                                    |
| -------------------- | ---------------------------------------------------------- |
| Temporada            | KPIs de pontos/gols/saldo/aproveitamento e linha acumulada |
| Comparação           | barras dos 20 clubes e Flamengo/adversário                 |
| Ataque e defesa      | gols/médias/saldo/clean sheets                             |
| Casa e fora          | pontos, jogos e aproveitamento por venue                   |
| Evolução e qualidade | rodada, cobertura, fonte e hash                            |

## Conferência

Flamengo/rodadas 1–38/ambos mandos: 38 jogos, 79 pontos, 23/10/5, gols 78/27, saldo 51, 18 clean sheets e 69,2982456%. Mandante: 19 jogos, 47 pontos, gols 46/8; visitante: 19, 32, gols 32/19. Palmeiras: 76 pontos. Matches: 380; gols totais: 959.

TeamMatches tem dois registros por partida. Gols do campeonato devem usar Matches ou um lado, evitando dupla contagem. Standings contém snapshots: nunca somar rodadas acumuladas. Posição calculada usa última rodada selecionada e universo completo sem mando; não é ranking oficial ou casa/fora. Para acumulados filtrados por mando use medidas sobre TeamMatches.

Comparação mantém filtros de rodada/mando; as medidas ainda precisam de validação no motor DAX. Sequências existem na Gold, mas sua recompilação dinâmica no Desktop não foi validada. Vazio é BLANK, sem zero falso. Sem publicação/embed/envio autorizado. Material individual anterior em docs/history/individual-2025/powerbi.
