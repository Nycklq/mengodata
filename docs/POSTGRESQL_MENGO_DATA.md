# PostgreSQL MengoData — integração concluída em 22/10/2026

## Destino solicitado

Banco `mengo_data`, host `127.0.0.1`, porta `5432`. A nova solicitação substitui o destino operacional anterior `flamengo_analytics` na porta 59547. O cluster anterior deve ser preservado, sem operações de migração ou importação nele durante este diagnóstico.

## Evidências executadas

O backend usa `dotenv.config` com caminho absoluto para o `.env` na raiz, resolvido a partir de `backend/src/infrastructure/config/environment.js`. Não depende do diretório corrente e não usa `override`: uma variável DATABASE_URL herdada do processo prevalece sobre o arquivo. Nos processos inspecionados não havia DATABASE_URL herdada.

O `.env` encontrado ainda apontava para `flamengo_analytics`, porta 59547, role `flamengo_local`. As duas cópias locais do arquivo anterior apontavam para `mengo_data`, porta 5432, role `flamengo_app`. Nenhuma senha ou URL com credenciais foi impressa.

Tentativa real pelo driver Node.js `pg`, restringindo o destino a `127.0.0.1:5432/mengo_data`: o servidor retornou SQLSTATE **28000**, informando que a role `flamengo_app` não tem permissão para entrar. A falha ocorre na abertura da conexão, antes de executar SQL de importação. Isso difere de senha rejeitada (28P01) e de permissão em tabela (42501).

Uma tentativa usando a configuração padrão do cliente administrativo não encontrou senha disponível e terminou em `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`. Não houve autenticação administrativa, alteração de roles, alteração de autenticação do servidor ou modificação de outros bancos pelo agente.

Após a habilitação de LOGIN feita pelo usuário, uma transação real READ ONLY confirmou `SELECT 1 = 1`, `current_database() = mengo_data`, `current_user = flamengo_app`, porta 5432 e `transaction_read_only = on`. O catálogo confirmou `rolcanlogin=true`, `rolsuper=false`, `rolcreatedb=false`.

As oito relações são cinco tabelas (`competitions`, `seasons`, `clubs`, `imports`, `matches`) e três views (`team_matches`, `club_totals`, `round_totals`), todas pertencentes a `postgres`. `flamengo_app` não possuía USAGE no schema nem SELECT/INSERT nas relações. `npm.cmd run db:import` reproduziu a falha real SQLSTATE **42501**, agora acompanhada de `DATABASE_PERMISSION_DENIED`.

## Ajuste no código

`infrastructure/persistence/database-error.js` traduz somente códigos conhecidos para descrições fixas. `db:check` e `db:import` preservam o código público anterior e acrescentam diagnóstico sanitizado. Mensagem original, detalhe SQL, consulta e URL não são encaminhados. O pool identifica suas sessões como `flamengo-analytics:<PID Node>`, permitindo conferir o processo backend em `pg_stat_activity`. Domínio, casos de uso, schema e migrações permanecem inalterados.

## Configuração corrigida

O usuário habilitou LOGIN de `flamengo_app` e executou `database/operations/grant-mengo-data.sql` no pgAdmin. O script aborta fora de `mengo_data` e concede somente USAGE no schema, SELECT nas oito relações e INSERT nas cinco tabelas. Nova consulta confirmou os privilégios e ausência de UPDATE/DELETE. A role continua sem superusuário e sem CREATEDB.

O `.env` aponta para `127.0.0.1:5432/mengo_data`, usando a configuração anterior preservada, sem imprimir a senha. A configuração do cluster alternativo está em `.local/postgres/env-backup-before-mengo-data-1792674235148.env`. Nenhuma senha foi redefinida, pg_hba.conf não foi alterado e o cluster anterior não foi modificado.

## Importação e consultas reais

Antes da importação, SELECTs confirmaram zero registros nas cinco tabelas e três views. Tipos e ordem das colunas foram conferidos com o repositório existente. Não foi necessário migrar ou recriar o schema.

`npm.cmd run db:import` terminou com `changed=true`, 380 partidas e 38 rodadas. A segunda execução terminou com `changed=false`. Uma transação READ ONLY posterior confirmou:

| Relação                 | Tipo   | Registros |
| ----------------------- | ------ | --------- |
| collective.competitions | tabela | 1         |
| collective.seasons      | tabela | 1         |
| collective.clubs        | tabela | 20        |
| collective.imports      | tabela | 1         |
| collective.matches      | tabela | 380       |
| collective.team_matches | view   | 760       |
| collective.club_totals  | view   | 20        |
| collective.round_totals | view   | 760       |

Recorte confirmado: uma competição, temporada 2025, rodadas oficiais 1–38 com dez jogos cada, 380 IDs únicos, 38 partidas e 19 mandos/19 visitas por clube. Todos os 20 totais SQL e 760 acumulados coincidem com a Gold. O snapshot JSONB contém 760 fatos, 20 totais e 760 acumulados. Sport × Flamengo mantém rodada 12 e data 15/11/2025. Flamengo: 79 pontos, 78 gols pró, 27 contra, saldo 51 e 18 jogos sem sofrer gol.

## Backend comprovado no MengoData

O backend foi iniciado normalmente na porta 3001, com o `.env` ajustado. GETs reais de metadata, summary, matches, standings e evolution retornaram HTTP 200: disponibilidade available, 380 partidas, 20 clubes na tabela, 38 pontos na série e 79 pontos do Flamengo.

No próprio `mengo_data`, uma consulta READ ONLY em `pg_stat_activity` localizou a sessão `flamengo-analytics:25588` do processo Node.js 25588, conectada como `flamengo_app` e executando `SELECT gold FROM collective.imports WHERE content_sha256 = $1 AND coverage_verified`. Isso confirma o uso do PostgreSQL solicitado, além da consulta simples de conectividade.

Evidência estruturada sem credenciais: [mengo-data-verification.json](evidence/mengo-data-verification.json). O backend ficou em execução na porta 3001.

## Verificações automatizadas

46 testes backend, 35 testes PostgreSQL em clusters isolados e dez testes de arquitetura/contratos/artefatos aprovados. O script de grants foi testado tanto no banco correto quanto em outro banco: aborta no destino errado, preserva dados/permissões, permite importar e ler os dados reais e não concede UPDATE/DELETE/CREATE nem muda a role. Os testes de configuração comprovam resolução do `.env` fora da raiz e precedência da variável herdada; diagnósticos não ecoam segredos.
