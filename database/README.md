# PostgreSQL local no Windows 11

A migração histórica 001_identity.sql cria identidades e proveniência; a 002_scope_2025.sql aplica o escopo atual, sem inserir dados esportivos. Executor em backend/src/infrastructure/persistence; composição em backend/src/main/migrate.js.

## Desenvolvimento

Instale PostgreSQL 18 pelo instalador nativo, incluindo o servidor e os utilitários psql, pg_isready, initdb e pg_ctl. Preserve instalações existentes: não reinicialize diretórios de dados, não reinstale serviços sobre outro cluster e não altere bancos pessoais. Registre a porta escolhida; .env.example usa 127.0.0.1:5432. Uma instalação com outra porta deve ser indicada em DATABASE_URL.

No PowerShell, os binários podem ser chamados pelo caminho completo, sem alterar o PATH global:

```powershell
$env:PG_BIN = 'C:/Program Files/PostgreSQL/18/bin'
& "$env:PG_BIN/pg_isready.exe" -h 127.0.0.1 -p 5432 -t 3
```

pg_isready verifica disponibilidade do servidor, sem comprovar autenticação, esquema ou permissões. Se o serviço estiver parado, inicie o serviço PostgreSQL instalado pelo aplicativo Serviços do Windows. Não mude configuração ou porta de outro projeto.

### Banco dedicado opcional

Se ainda não houver banco destinado ao projeto, crie um novo banco vazio com um administrador local. Os comandos desta seção são instruções para execução explícita pelo usuário; não foram executados no serviço existente nesta alteração. Escolha outros nomes se estes já existirem, sem excluir ou redefinir os existentes:

```powershell
& "$env:PG_BIN/psql.exe" -h 127.0.0.1 -p 5432 -U postgres -d postgres -W
```

No terminal interativo do psql:

```text
CREATE ROLE flamengo LOGIN;
\password flamengo
CREATE DATABASE flamengo_analytics OWNER flamengo;
\q
```

A senha é solicitada interativamente. O usuário da aplicação não precisa ser superusuário. Preserve o .env existente ou copie .env.example se ele ainda não existir. Configure nele DATABASE_URL com o usuário, a senha, a porta e o banco dedicado. Codifique caracteres reservados da senha para URL; não versione credenciais. POSTGRES_USER, POSTGRES_DB e POSTGRES_PASSWORD não são necessários.

### Diagnóstico sem escrita

```powershell
npm.cmd run db:check
```

O comando carrega o .env da raiz e respeita variáveis do processo. Abre uma conexão pelo pool existente, executa SELECT em transação READ ONLY e encerra com ROLLBACK. Sucesso: {"status":"ok","read_only":true}. Não consulta dados esportivos, não cria tabelas e não aplica migrações. Código 1 com DATABASE_URL_REQUIRED significa configuração ausente; DATABASE_CHECK_FAILED requer conferir serviço, endereço, autenticação e permissões. As mensagens não imprimem URL, senha ou detalhes internos do servidor.

### Migrações explícitas

Somente em banco dedicado vazio, com permissão para criar tabelas, aplique o esquema:

```powershell
npm.cmd run db:migrate
```

Somente esse comando aplica o esquema ao banco configurado. Iniciar API/frontend ou executar db:check não executa migrações. Não há sementes ou reversão destrutiva. A nova importação individual é um comando separado, condicionado a aprovação de fonte/artefato/direitos; está bloqueada no estado atual. Containers não são necessários nem estão configurados.

## Modelo criado

| Tabela            | Grão                                                                       |
| ----------------- | -------------------------------------------------------------------------- |
| data_sources      | Fonte e declaração de aprovação; referência exigida quando aprovada        |
| players           | UUID de jogador, nome não único                                            |
| player_source_ids | Identidade externa no namespace da fonte                                   |
| matches           | Partida com referência oficial, rodada, participantes, status e realização |
| match_source_ids  | Identidade externa, evidência, coleta e hash                               |
| schema_migrations | Nome, hash e instante de aplicação                                         |

Após as duas migrações, partidas aceitam só a competição, 2025, Flamengo e rodadas 1 a 38. Data pode ser posterior, pois não decide o recorte. Participantes distintos, referência oficial e rodada são únicos no universo do Flamengo. Vínculos usam chaves estrangeiras. Estatísticas/atuações serão definidas após homologação.

A 001 é imutável e conserva a restrição antiga como histórico. A 002 exige matches vazio sob lock; se encontrar partidas, falha com SCOPE_MIGRATION_REQUIRES_EMPTY_MATCHES e reverte sua transação. Não apaga, reclassifica ou exporta dados antigos. Preserve o banco anterior e configure outro banco dedicado vazio para 2025 quando necessário. Nenhuma migração nesta alteração foi aplicada ao serviço pessoal. Os testes exercitam upgrade vazio e recusa com dados antigos, incluindo preservação do checksum/histórico.

Migrações são ordenadas, transacionais e serializadas por advisory lock. Reaplicar não duplica histórico; alteração do SQL aplicado ou histórico incompatível é recusada. Mudanças exigem novo arquivo numerado. Falhas revertem DDL e histórico.

## Testes isolados

```powershell
npm.cmd run test:database
```

O teste encontra binários na instalação PostgreSQL do Windows ou por pg_config --bindir no Linux. Para indicar instalação:

```powershell
$env:PG_BIN = 'C:/Program Files/PostgreSQL/18/bin'
npm.cmd run test:database
```

No Linux: PG_BIN=/caminho/bin npm run test:database, como usuário comum; initdb não aceita root.

O helper cria cluster em .tmp/postgres-test-_, usuário de teste, senha aleatória, SCRAM, loopback e porta livre. Não consulta DATABASE_URL, não usa credenciais do serviço existente e não conecta ao banco pessoal. Ao final fecha conexões, encerra o servidor e remove seu diretório após conferir o caminho. Dados sintéticos ficam em transações revertidas nesse cluster. Cópias SQL de testes de falha podem permanecer em .tmp/migration-test-_, ignorado pelo Git.

Sem binários, o comando falha explicitamente. Nesta entrega a integração foi executada com PostgreSQL 18.6. Não foi criado banco permanente de desenvolvimento ou produção.
