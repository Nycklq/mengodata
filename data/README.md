# Dados coletivos

raw/collective/season=2025/competition=brasileirao-serie-a-men contém Bronze original e metadata da revisão fixa, permitindo reprodução offline. pipeline:collective gera Silver e Gold Parquet/CSV e analytics/collective.json.

380 partidas → 760 fatos clube × partida e 760 acumulados. Não somar snapshots. JSON integra API; Parquet armazena analítica; CSV integra BI. powerbi:prepare gera data/powerbi. Arquivos references.json/powerbi.json anteriores são legados e não são lidos pelo servidor ativo. Sem credenciais aqui. Proveniência e licença em docs/DATA_SOURCES.md.
