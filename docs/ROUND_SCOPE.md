# Recorte verificável por partida e rodada

Pesquisa em 19/10/2026. Universo fixo: Flamengo, futebol masculino profissional, Campeonato Brasileiro Série A, temporada 2026, rodadas oficiais 1 a 19.

## O que foi demonstrado

O [documento de tabela da CBF](https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/Tabela_Detalhada_Brasileirao_Serie_A_2026_b805cc622f.pdf), embora tenha “Detalhada” no endereço, apresenta o título “Tabela Básica / Edição 2026”. Foram lidas e conferidas visualmente as páginas 1 a 5, que abrangem as partidas do Flamengo nas rodadas 1 a 19 e o início do returno. O rodapé informa atualização em 14/01/2026; não é prova do calendário atualizado nem de realização dos jogos.

A relação abaixo é um índice documental para a futura conferência, sem resultados ou estatísticas individuais. O número oficial de jogo não é um ID global nem o identificador de evento do site. Cada referência deve ser qualificada por CBF, Série A e 2026.

| Rodada | Número de jogo CBF | Adversário | Mando do Flamengo |
| --- | --- | --- | --- |
| 1 | 003 | São Paulo | Fora |
| 2 | 011 | Internacional | Casa |
| 3 | 029 | Vitória | Fora |
| 4 | 031 | Mirassol | Casa |
| 5 | 041 | Cruzeiro | Casa |
| 6 | 052 | Botafogo | Fora |
| 7 | 061 | Remo | Casa |
| 8 | 074 | Corinthians | Fora |
| 9 | 085 | Red Bull Bragantino | Fora |
| 10 | 091 | Santos | Casa |
| 11 | 101 | Fluminense | Fora |
| 12 | 111 | Bahia | Casa |
| 13 | 126 | Atlético-MG | Fora |
| 14 | 131 | Vasco da Gama | Casa |
| 15 | 147 | Grêmio | Fora |
| 16 | 158 | Athletico-PR | Fora |
| 17 | 161 | Palmeiras | Casa |
| 18 | 171 | Coritiba | Casa |
| 19 | 190 | Chapecoense | Fora |

Essas 19 referências não equivalem a 19 partidas coletadas ou a cobertura estatística completa. Ainda falta validar os estados atuais e o vínculo com cada fornecedor. A futura relação canônica será homologada com documentação atualizada e acesso permitido.

## Casos reais para orientar a validação

A [CBF anunciou Flamengo × Mirassol para 02/09/2026 como jogo adiado da 4ª rodada](https://www.cbf.com.br/futebol-brasileiro/noticias/campeonato-brasileiro-serie-a/a/fla-e-mirassol-se-enfrentam-nesta-quarta-em-jogo-adiado-da-4-rodada). Essa classificação foi encontrada em conteúdo indexado; a abertura direta falhou. É uma partida elegível pela rodada, condicionada à validação dos registros, mesmo ocorrendo depois de jogos do returno.

A [página oficial de Chapecoense × Flamengo](https://www.cbf.com.br/futebol-brasileiro/jogos/campeonato-brasileiro/serie-a/2026/chapecoense-x-flamengo/832079?view=documentos) identifica rodada 19 e jogo 190 em 22/07/2026. Já [Flamengo × São Paulo](https://www.cbf.com.br/futebol-brasileiro/jogos/campeonato-brasileiro/serie-a/2026/flamengo-x-sao-paulo/832080?view=documentos), em 26/07/2026, é rodada 20 e jogo 191, portanto excluído. Essas páginas também foram verificadas por conteúdo indexado, com falhas na abertura direta. Não confundir `832079`/`832080`, IDs nos endereços, com os números oficiais `190`/`191`.

A [súmula da rodada 1 disponibilizada pela FERJ](https://www.ferj360.com.br/carioca/uploads/yvbup3yqlbks0sog44.pdf), vinculada à [página da partida na federação](https://www.fferj.com.br/partidas/3662), confirma Série A/2026, rodada 1 e jogo 3. As três páginas foram lidas e inspecionadas visualmente. A amostra não homologa as outras 18 súmulas.

## Protocolo previsto de homologação

1. Conferir competição, temporada, identidade do clube e rodada com a referência oficial. Data de realização é atributo, não critério substituto.
2. Criar o vínculo entre número oficial, documento oficial e ID de partida do fornecedor. Preservar o namespace da fonte. Não construir IDs por suposição nem por sequência numérica.
3. Exigir as 19 rodadas identificadas, uma partida do Flamengo em cada uma, sem duplicatas. Registrar separadamente adiamento, cancelamento, suspensão, realização e ausência de dados. Cancelamentos ou alterações oficiais exigem revisão documentada do conjunto esperado.
4. Validar `player_id`, `match_id` e `team_id` da atuação. Elenco atual ou vínculo atual do atleta não substitui o clube no registro daquela partida.
5. Conciliar IDs entre fontes por evidência explícita. Adversário, mando e data ajudam a conferir; correspondência ambígua por nome ou data entra em quarentena.
6. Auditar presença e semântica de cada métrica em cada partida e atuação. Um endpoint bem-sucedido ou a lista de jogos não prova cobertura dos atletas.
7. Liberar apenas observações válidas, com origem, coleta e versão preservadas. Não completar partidas ou métricas faltantes com zeros.

## Metadados mínimos propostos

| Grupo | Conteúdo necessário |
| --- | --- |
| Partida | ID interno, fonte e ID externo, número oficial CBF, competição, temporada, rodada oficial, participantes e mando |
| Calendário | Data originalmente prevista quando disponível, realização efetiva, status e evidência de remarcação |
| Atuação | ID do atleta na fonte, clube naquela partida, presença em campo, titularidade e posição disponível |
| Proveniência | URL/recurso, instante UTC de coleta, versão/hash do original, execução de importação e autorização aplicável |
| Cobertura | Estado por partida/métrica, razão de ausência, rejeição, conflito e decisão de resolução |

Nenhum desses contratos está implementado. Um campo obrigatório ausente impede a promoção analítica; os originais permitidos podem permanecer na Bronze para investigação.
