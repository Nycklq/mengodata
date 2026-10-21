# Fontes e proveniência

## Fonte principal

[OpenFootball football.json](https://github.com/openfootball/football.json/blob/e6744429ee395bc86f247348c6184bb08d4eb361/2025/br.1.json), revisão e6744429ee395bc86f247348c6184bb08d4eb361. [CC0-1.0](https://github.com/openfootball/football.json/blob/e6744429ee395bc86f247348c6184bb08d4eb361/LICENSE.md) conferida no repositório. A licença não libera escudos, marcas ou fotografias de terceiros.

SHA-256 importado: 0fcc4647256b2e1f58b50f1372b751aeb7e6aacb5b8cd747579dd7ab71303fbb. Coleta UTC, URL, revisão, licença e hash acompanham Bronze/Gold/API/CSV/BI. Registro ativo: contracts/collective-source.json. O antigo source-approval.json permanece limitado ao módulo legado.

Grão: partida, nome do torneio, rodada, data, mandante/visitante e placar final. score em lista ou score.ft é normalizado. Sem IDs nativos ou fuso verificável: source_locator preserva o índice, external_match_id fica null, e UUID interno não é ID CBF.

## Referência independente

[Tabela detalhada CBF, atualização 08/12/2025](https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/BSA_25_Tabela_detalhada_08_12_d88b469845.pdf), hash 116658276f3efd4e85ef04f5dbce2c87cb5f2c12d38da0582ab37faffa26f7db. Extração pypdf: 380 confrontos/placares coincidentes, 370 rodadas e 379 datas explícitas comparadas. Células omitidas não foram inferidas. Evidência em evidence/collective-cbf-audit.json. PDF usado para conferência, sem redistribuí-lo como base CC0.

[Tabela final CBF/2025](https://www.cbf.com.br/futebol-brasileiro/tabelas/campeonato-brasileiro/serie-a/2025?doc=Regulamento): Flamengo 79 pontos, 38 jogos, 23/10/5, 78/27, saldo 51; Palmeiras 76, Cruzeiro 70 e Mirassol 67 conferem. A CBF arredonda aproveitamento na exibição; o projeto calcula 69,2982456% e mostra 69,30%.

[CBF: documentos técnicos de 2025](https://www.cbf.com.br/futebol-brasileiro/noticias/competicoes-campeonato-brasileiro-serie-a/a/cbf-divulga-documentos-tecnicos-do-brasileirao-2025). REC da CBF consultado em [cópia documental](https://www.srgoool.com.br/downloads.php?id_anexo=1540), arts. 14–15, página 10: pontos corridos; desempates por vitórias, saldo, gols pró, confronto direto quando cabível, vermelhos, amarelos e sorteio. A URL antiga Oracle retornou 404 e algumas aberturas do portal retornaram 502; o ranking é calculado, sem certificar critérios adicionais ou sanções.

Não houve coleta individual nova, compra, autenticação ou envio de pedidos. O histórico de candidatos individuais não bloqueia a pesquisa coletiva.
