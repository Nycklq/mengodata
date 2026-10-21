# PostgreSQL coletivo

Configure DATABASE_URL no .env ignorado pelo Git para um banco dedicado conferido. Não havia conexão pessoal configurada; nenhum banco pessoal foi acessado ou alterado.

db:check abre transação READ ONLY e não cria tabelas. db:migrate executa explicitamente collective-migrations/004_collective.sql com ledger collective_migrations. db:import persiste a Gold validada em transação, com lock e idempotência por hash. API nunca migra no startup.

Esquema collective: competitions, seasons, clubs, imports, matches e views team_matches, club_totals e round_totals. Schema e ledger próprios evitam restrições antigas de partidas somente do Flamengo. migrations/001–003 são imutáveis e não são reaplicadas pelo comando atual. Se collective existir sem ledger compatível, a migração recusa e não sobrescreve.

Versões e proveniência são preservadas por hash, com snapshot Gold, FKs, checks e índices. Sem DELETE de históricos, reclassificação ou seeds fictícios. Consultas parametrizadas.

test:database inicia clusters temporários em .tmp com senha/porta próprias, importa 380 resultados reais e compara Python/SQL/API, rollback, idempotência e preservação legada. Não usa DATABASE_URL pessoal. Encerra clusters e valida caminhos antes de remover pastas temporárias. Testes históricos de 001–003 continuam isolados.
