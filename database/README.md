# PostgreSQL coletivo

Destino ativo: `127.0.0.1:5432/mengo_data`, role `flamengo_app`, configurado no `.env` ignorado pelo Git. Consultas reais confirmaram 380 partidas/20 clubes/38 rodadas de 2025, 760 fatos, 20 totais e 760 acumulados. Importação e reimportação idempotente concluídas. [Evidências](../docs/POSTGRESQL_MENGO_DATA.md).

## Permissões no MengoData

O usuário habilitou LOGIN da role no pgAdmin e executou `operations/grant-mengo-data.sql`. A transação aborta em qualquer banco diferente de `mengo_data`. Concede USAGE em collective, SELECT nas cinco tabelas/três views e INSERT nas cinco tabelas. Não concede UPDATE, DELETE, CREATE, superusuário ou permissões sobre outro banco.

O schema existente foi inspecionado e aproveitado; nenhuma migração ou recriação foi necessária. Execute `npm.cmd run db:check` e `npm.cmd run db:import`. Migrações exigem uma sessão apropriada de administração e nunca são feitas pela API ou pelo importador. A role de execução possui somente os privilégios necessários ao uso/importação.

O backend resolve `.env` na raiz por caminho absoluto. DATABASE_URL herdada do processo tem precedência. Depois de alterar a conexão, reinicie a API. Seus pools são identificados como `flamengo-analytics:<PID Node>` em `pg_stat_activity`. A API ativa na porta 3001 foi comprovada consultando o MengoData.

## Cluster alternativo preservado

Os comandos desta seção operam o banco anterior `flamengo_analytics` em `.local/postgres`, preservado sem alteração durante a configuração do MengoData. Não são necessários para o destino ativo. `db:local:configure` substitui o `.env` por essa alternativa; não deve ser usado para iniciar o MengoData.

Em checkout novo, com PostgreSQL instalado, `npm.cmd run db:local:setup` cria o cluster e `flamengo_analytics`, configura SCRAM, escolhe porta própria, inicia em loopback e grava DATABASE_URL com senha aleatória no `.env`. Recusa `.env`, DATABASE_URL ou diretório `.local/postgres` existentes, sem sobrescrever. Para executáveis fora da instalação padrão, defina PG_BIN.

Setup não migra nem importa. Execute separadamente `npm.cmd run db:check`, `npm.cmd run db:migrate` e `npm.cmd run db:import`. Nesta máquina já passaram; segunda importação `changed=false`.

`db:local:start`, `db:local:stop` e `db:local:status` operam somente o diretório com marcador de propriedade e caminho esperados. Parar mantém dados. Após reiniciar o Windows, inicie o cluster antes da API. Sem autostart, serviço do Windows ou containers. Não copie `.env`/cluster para entrega pública, nem apague a pasta para repetir setup. Falha de criação preserva o diretório para diagnóstico, sem limpeza destrutiva automática.

O cluster mantém sua configuração em `.local/postgres/connection.env`, também ignorada. Quando quiser restaurar essa conexão, `npm.cmd run db:local:configure` valida o destino e copia o `.env` atual para `env-backup-<instante>.env` antes de restaurá-lo. É uma operação explícita; não roda ao iniciar a API. Em 22/10/2026 o usuário autorizou essa restauração. Cópia do arquivo anterior: `.local/postgres/env-backup-before-restoration-1792673449500.env`.

## Persistência e testes

db:check abre transação READ ONLY e não cria tabelas. db:migrate executa explicitamente collective-migrations/004_collective.sql com ledger collective_migrations. db:import persiste a Gold validada em transação, com lock e idempotência por hash. API nunca migra no startup.

Esquema collective: competitions, seasons, clubs, imports, matches e views team_matches, club_totals e round_totals. Schema e ledger próprios evitam restrições antigas de partidas somente do Flamengo. migrations/001–003 são imutáveis e não são reaplicadas pelo comando atual. Se collective existir sem ledger compatível, a migração recusa e não sobrescreve.

Versões e proveniência são preservadas por hash, com snapshot Gold, FKs, checks e índices. Sem DELETE de históricos, reclassificação ou seeds fictícios. Consultas parametrizadas.

test:database inicia clusters temporários em .tmp com senha/porta próprias, importa 380 resultados reais e compara Python/SQL/API, rollback, idempotência e preservação legada. Não usa DATABASE_URL pessoal. Encerra clusters e valida caminhos antes de remover pastas temporárias. Testes históricos de 001–003 continuam isolados.

A suíte local adicional cria outro diretório sob `.tmp`, confirma recusa de configuração externa, marcador próprio, SCRAM, ausência de migração automática e persistência após reinício. Não opera o cluster permanente.
