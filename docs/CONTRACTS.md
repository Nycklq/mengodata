# Contratos ativos

scope.json fixa competição/2025/rodadas 1–38; team_id identifica o clube focal, sem excluir os 19 adversários. clubs.json define nomes e IDs dos 20 clubes. collective-source.json homologa resultados/placares por revisão/hash/licença/permissão.

Envelope: schema_version=1, scope, availability=available/unavailable, reason, coverage, dataset_version, source, ranking_note e data. Metadata v2 admite prontidão coletiva e analysis_unit=club_match. Dados ausentes geram data=null, não desempenho zero.

Janela from_round/to_round inclusiva entre 1 e 38, início ≤ fim; venue=home/away; IDs canônicos. result=W/D/L é relativo ao clube e exige club_id. Paginação limitada a 100 por página. CSV exporta todo o recorte e ignora paginação. Compare exige clubes distintos.

INVALID_QUERY/UNKNOWN_CLUB=400; ausência legítima=200 com null; exportação indisponível=409; erro interno sanitizado=500; limite por IP=429. Sem aprovação por flags HTTP/CLI. OpenAPI e docs/api/README.md descrevem rotas e dados.

individual.schema.json, manifest.schema.json, source-approval.json e fórmulas individuais são contratos legados preservados, sem rotas individuais no servidor ativo.
