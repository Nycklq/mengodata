# Preparação de produção — MengoData

Preparada em 22/10/2026 para GitHub Free, Neon Free, Render Free e Vercel Hobby. Nenhuma conta, projeto remoto, banco externo, commit, push ou publicação foi criado/executado nesta tarefa. Os passos de provisionamento e comandos Neon abaixo são instruções para a próxima etapa, não operações realizadas aqui.

## O que foi preparado

- API aceita `HOST=0.0.0.0` e a `PORT` fornecida pelo Render; os padrões locais continuam `127.0.0.1:3001`.
- Produção exige `DATABASE_URL` e origem CORS HTTPS exata, sem credenciais, caminho, consulta ou fragmento. Produção não lê o `.env` local nem usa fallback de banco ausente para arquivo.
- PostgreSQL remoto usa TLS com certificado verificado e channel binding quando oferecido. A URI não pode desabilitar TLS ou sobrescrever host/porta por parâmetros. Local mantém o comportamento anterior do driver.
- `VITE_API_URL` fornece somente a origem pública da API no build de produção. Desenvolvimento continua em `/api` com proxy local; não há alteração de componentes, estilos, gráficos ou dados.
- `vercel.json` define instalação/build na raiz do monorepo, saída `frontend/dist` e fallback SPA para `/index.html`.
- `render.yaml` define serviço Node gratuito, região Oregon, health check e deploy automático desligado. Não há banco Render, disco pago, container, job ou comando de pré-deploy.
- A Gold JSON existente, com 1.041.505 bytes, foi liberada no `.gitignore` para inclusão futura no Git. Seus bytes, IDs, versão, cobertura e coleta foram preservados. A Bronze fixa e os contratos continuam no repositório. Parquet/CSV permanecem regeneráveis e ignorados.

O arquivo `data/analytics/collective.json` precisa entrar no futuro commit junto dos arquivos desta preparação. `npm run data:check` exige Node 24 e valida essa publicação contra a Bronze/contratos existentes. O build do Render usa somente dependências Node de produção; Python permanece no fluxo local/acadêmico, fora do runtime da API. Não há migração ou importação no startup ou no build.

## 1. GitHub

| Campo              | Valor                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Plano              | GitHub Free                                                                                              |
| Proprietário       | Conta pessoal que será conectada à Vercel Hobby                                                          |
| Repositório        | Monorepo completo, preservando `backend`, `frontend`, `packages`, `contracts`, Bronze e Gold operacional |
| Branch de produção | A branch escolhida pelo usuário; usar a mesma no Render e na Vercel                                      |
| Workflow           | `.github/workflows/quality.yml`, Node.js 24 e Python 3.14 para as verificações acadêmicas                |

Revisar o diff antes de qualquer commit futuro. `.env`, ambientes, clusters, caches e `dist` continuam ignorados. Não incluir a URI Neon, senhas, tokens ou cópias de arquivos privados. Nenhuma mudança de versão de biblioteca foi necessária. GitHub Free oferece repositórios públicos e privados; os limites de Actions dependem da visibilidade/plano. [Documentação GitHub](https://docs.github.com/en/get-started/learning-about-github/githubs-plans).

## 2. Neon PostgreSQL

| Campo              | Valor a selecionar                                                                  |
| ------------------ | ----------------------------------------------------------------------------------- |
| Plano              | Free                                                                                |
| Project name       | `mengodata` ou outro nome disponível                                                |
| Cloud provider     | AWS                                                                                 |
| Region             | US West (Oregon), `aws-us-west-2`, para ficar próxima do Render em Oregon           |
| Branch             | A branch principal criada pelo Neon para este projeto                               |
| Database           | `mengo_data`, criada neste projeto novo                                             |
| Role               | A role fornecida pelo Neon com permissão para criar schema/importar nesta base nova |
| PostgreSQL version | Versão estável padrão oferecida pelo Neon                                           |

Em **Connect**, selecione a branch, database e role corretas. Copie duas URIs privadas: a conexão **Direct**, com pooling desligado, para migração/importação; e a conexão **Pooled**, com pooling ligado e host contendo `-pooler`, para `DATABASE_URL` no Render. Use TLS na URI, preferindo `sslmode=verify-full`; a configuração do projeto mantém verificação de certificado também quando a URI fornecida usa `sslmode=require`. A autenticação channel binding é habilitada no driver quando o servidor a oferece. [Pooling Neon](https://neon.com/docs/connect/connection-pooling), [TLS e channel binding no pg](https://node-postgres.com/features/ssl).

Na raiz do projeto, em PowerShell, leia a URI Direct sem colocá-la no histórico:

```powershell
$neonSecureUri = Read-Host 'Cole a URI Direct do Neon' -AsSecureString
$env:NEON_DATABASE_URL = [System.Net.NetworkCredential]::new('', $neonSecureUri).Password
try {
    npm.cmd run db:neon:check
    if ($LASTEXITCODE -ne 0) { throw 'Falha no diagnóstico Neon' }
    npm.cmd run db:neon:migrate
    if ($LASTEXITCODE -ne 0) { throw 'Falha na migração Neon' }
    npm.cmd run db:neon:import
    if ($LASTEXITCODE -ne 0) { throw 'Falha na importação Neon' }
    npm.cmd run db:neon:verify
    if ($LASTEXITCODE -ne 0) { throw 'Falha na verificação Neon' }
} finally {
    Remove-Item Env:NEON_DATABASE_URL -ErrorAction SilentlyContinue
    $neonSecureUri.Dispose()
}
```

Esses comandos não leem `.env` nem usam `DATABASE_URL` como alternativa. Exigem `NEON_DATABASE_URL`, host Direct sob `.neon.tech`, credenciais e database explícitas; recusam loopback, endpoints Pooled e parâmetros que sobrescrevam o destino. Isso evita selecionar o PostgreSQL local por engano. Não altere o `.env` que já funciona localmente.

`check` abre transação READ ONLY. `migrate` aplica explicitamente somente `database/collective-migrations/004_collective.sql`, usando ledger `collective_migrations`. As migrações históricas 001–003 permanecem intactas. `import` grava o snapshot real por transação/hash, com idempotência; repetir a mesma importação deve retornar `changed=false`. `verify` usa SELECT e exige o snapshot PostgreSQL igual à Gold aprovada, confirmando 380 partidas, 760 fatos, 20 clubes e 38 rodadas. A operação administrativa `grant-mengo-data.sql`, específica do banco local existente, não faz parte deste procedimento.

## 3. Render

Criar futuramente um **Web Service**, usando os campos de `render.yaml` ou preenchendo o formulário:

| Campo              | Valor                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Plano do workspace | Hobby/gratuito, sem contratar recursos pagos                                              |
| Service type       | Web Service                                                                               |
| Name               | `mengodata-api`, ou nome disponível                                                       |
| Language/Runtime   | Node                                                                                      |
| Region             | Oregon                                                                                    |
| Branch             | A mesma branch de produção escolhida no GitHub                                            |
| Root Directory     | Deixar vazio: raiz do repositório                                                         |
| Build Command      | `npm ci --omit=dev --workspace backend --workspace packages/domain && npm run data:check` |
| Start Command      | `npm run start:backend`                                                                   |
| Instance Type      | Free                                                                                      |
| Health Check Path  | `/api/health`                                                                             |
| Auto-Deploy        | Off / Manual                                                                              |
| Pre-Deploy Command | Vazio                                                                                     |

Variáveis em **Environment**:

| Chave              | Valor                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| `NODE_VERSION`     | `24`                                                                                                        |
| `NODE_ENV`         | `production`                                                                                                |
| `HOST`             | `0.0.0.0`                                                                                                   |
| `LOG_LEVEL`        | `info`                                                                                                      |
| `TRUST_PROXY_HOPS` | `1` para acesso direto pelo proxy do Render                                                                 |
| `DATABASE_URL`     | URI privada **Pooled** copiada do Neon, da base recém-migrada/importada                                     |
| `CORS_ORIGIN`      | Origem HTTPS exata de produção da Vercel, sem caminho, `/api`, parâmetros ou fragmento                      |
| `PORT`             | Usar o valor fornecido pelo Render; não é necessário cadastrar manualmente. O padrão da plataforma é 10000. |

Os nomes e URLs efetivos serão fornecidos pelas plataformas. Os valores em `backend.env.example` são fictícios e não devem ser usados como destinos reais. Quando a Vercel fornecer o domínio definitivo, conferir `CORS_ORIGIN` no Render; se houver mudança de domínio, atualizar essa variável e aplicar a configuração no serviço. Não liberar `*` ou todos os previews. O host `0.0.0.0` é bind interno; a URL pública usa o hostname HTTPS do Render, sem `:10000`.

O limite de confiança de proxy é configurável de 0 a 5 saltos; local usa 0. A configuração inicial 1 considera o acesso browser → Render, sem proxy adicional controlado pelo projeto. Testes recusam usar um prefixo X-Forwarded-For forjado para burlar esse limite. A cadeia real de proxies ainda deve ser conferida na primeira validação remota, principalmente se depois for adicionado outro CDN/proxy. [Express atrás de proxies](https://expressjs.com/en/guide/behind-proxies/).

`/api/health` confirma o processo. Depois da publicação autorizada, conferir também `/api/metadata` e `/api/summary`: a cobertura deve ser 380 e Flamengo deve ter 79 pontos, 78 gols pró e 27 contra. Health sozinho não comprova a importação do Neon.

O plano Free não oferece shell, one-off job, disco persistente nem pre-deploy; por isso as operações Neon ficam nos quatro comandos explícitos executados da máquina local. O serviço pode dormir após 15 minutos sem tráfego e levar cerca de um minuto para despertar. Os arquivos necessários são entregues pelo Git/build; não dependem de escrita persistente no servidor. [Render Free](https://render.com/docs/free), [pre-deploy](https://render.com/docs/deploys), [porta e bind](https://render.com/docs/web-services), [Node.js](https://render.com/docs/node-version).

## 4. Vercel

| Campo                 | Valor                                             |
| --------------------- | ------------------------------------------------- |
| Plano                 | Hobby, conta pessoal, uso acadêmico não comercial |
| Import Git Repository | O mesmo monorepo GitHub                           |
| Project name          | `mengodata` ou outro nome disponível              |
| Production Branch     | A mesma branch escolhida no GitHub/Render         |
| Framework Preset      | Vite                                              |
| Root Directory        | `.`: raiz do repositório, não `frontend`          |
| Node.js Version       | `24.x`                                            |
| Install Command       | `npm ci`                                          |
| Build Command         | `npm run build`                                   |
| Output Directory      | `frontend/dist`                                   |

Em **Environment Variables**, cadastrar para **Production**:

| Chave          | Valor                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | Origem HTTPS pública real do Render, como a URL exibida no serviço; sem `/api`, caminho ou porta interna |

Essa URL é pública e será incluída no JavaScript. Não cadastrar `DATABASE_URL`, `NEON_DATABASE_URL`, senhas ou tokens na Vercel nem em variáveis `VITE_*`. `frontend/.env.example` fica vazio para preservar o proxy durante o desenvolvimento. O build na Vercel recusa `VITE_API_URL` ausente ou inválida. Mudanças nessa variável exigem novo build do frontend. Preview é opcional e só deve apontar para uma API que autorize explicitamente sua origem; a configuração entregue mantém uma origem de produção exata.

`vercel.json` já inclui o fallback oficial `/(.*)` → `/index.html`, permitindo recarregar e abrir diretamente `/dashboard`, `/dashboard/comparar`, `/dashboard/partidas` e demais rotas React. Imagens, fontes e scripts estáticos continuam nos caminhos do bundle. O frontend chama o Render diretamente; não usa funções serverless, proxy da Vercel nem banco no frontend. [Vite/SPA na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Node 24](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [Hobby](https://vercel.com/docs/plans/hobby).

## Continuidade local e verificação

Sem mudar o `.env` existente:

```powershell
npm.cmd run dev:backend
npm.cmd run dev:frontend
```

São terminais separados. Local continua em `127.0.0.1:5173` e `127.0.0.1:3001`, com proxy `/api`, Gold/SQL existentes, fonte Poppins, logo, temas e foto de desenvolvimento preservados. Produção continua usando o vetor já existente no lugar da fotografia restrita ao desenvolvimento.

```powershell
npm.cmd run data:check
npm.cmd test
npm.cmd run verify:pipeline
npm.cmd run test:database
npm.cmd run lint
npm.cmd run format:check
npm.cmd run build
npm.cmd run test:smoke
npm.cmd run test:browser
```

Os testes de banco usam clusters temporários. O smoke agora força Gold em arquivo, sem acessar o PostgreSQL pessoal; o teste adicional de servidor em modo produção usa outro cluster temporário real, `HOST=0.0.0.0` e porta escolhida pelo teste. O resultado atual é registrado no README e em `docs/evidence/production-preparation.json`.

O commit encontrado no início já não tinha a pasta Power BI. O teste desse material permanece disponível e só é ignorado quando a pasta inteira está ausente; se ela for restaurada parcialmente, o teste continua exigindo seus contratos. Nenhum teste de web/API/dados foi removido ou ignorado para esta preparação.

Nenhum TLS real, conta, URL pública, configuração remota ou CI remoto foi validado nesta etapa. A validação final nas plataformas será necessária depois da publicação autorizada. As migrações foram verificadas em PostgreSQL temporário, não em Neon real nem no banco pessoal.

## Resultados locais desta preparação

| Verificação                   | Resultado observado                                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JavaScript/React/contratos    | 91 backend + 101 frontend + 9 arquitetura/contratos: 201 aprovados; um teste Power BI ignorado por ausência preexistente da pasta.                                                                        |
| Pipeline Python               | 175 aprovados; Ruff lint e formatação de 50 arquivos aprovados.                                                                                                                                           |
| PostgreSQL isolado            | 36 aprovados, incluindo servidor em produção com bind público, origem CORS, dados reais e ausência de migração no startup.                                                                                |
| Chrome                        | 96 aprovados nos quatro tamanhos e dois temas; zero falhas, ignorados ou flaky.                                                                                                                           |
| Instalação de produção        | `npm ci --omit=dev --workspace backend --workspace packages/domain`, offline, em cópia isolada sem `.env`/Python/Vite; nove dependências diretas resolvidas dentro da cópia e `data:check` aprovado.      |
| Build Vercel                  | Cinco verificações aprovadas: recusa de URL ausente, loopback ou `/api` duplicado; URL pública embutida no JavaScript e segredo de backend de fixture ausente do bundle. Build local restaurado ao final. |
| Build local e smoke           | Aprovados, com 380 partidas, 79 pontos e 47/32 por mando; smoke usa Gold em arquivo sem banco pessoal.                                                                                                    |
| ESLint, Prettier e whitespace | Aprovados.                                                                                                                                                                                                |

Total: **508 testes aprovados e um teste opcional ignorado**, sem somar reexecuções ou verificações extras de build. Os comandos foram executados individualmente; o agregado `verify` e os notebooks não foram reexecutados nesta tarefa. `.env`, Gold, Bronze, Silver/Parquet, relatórios, notebooks, contratos, regras e gráficos foram conferidos por hashes. [Evidência e integridade](../docs/evidence/production-preparation.json).

A primeira execução identificou e corrigiu uma falha na rejeição de CORS inválido: a configuração agora retorna código fixo em vez de deixar escapar erro do parser de URL. Outro ensaio encontrou bloqueio transitório do Windows ao remover um cluster temporário; o helper passou a repetir a remoção no mesmo caminho já validado, e a suíte completa posterior passou. O teste do Power BI removido no commit inicial ficou explicitamente opcional apenas quando toda a pasta está ausente, sem recriar o material ou omitir um teste web/API.

## Limites dos planos gratuitos

Os planos escolhidos não contratam instâncias pagas. O Neon Free informa 1 GB de Postgres por projeto, 100 CU-horas e 5 GB de transferência pública por projeto/mês; o compute dorme após cinco minutos de inatividade e pode ser suspenso ao esgotar cotas. O Render Free também tem limites compartilhados de horas, banda e build. A Vercel Hobby é destinada a uso pessoal não comercial. Portanto, esta configuração serve à apresentação acadêmica pública com limites/cold starts, sem promessa de alta disponibilidade ou gratuidade fora das cotas. Conferir o plano selecionado e a utilização nos respectivos painéis. [Neon Free](https://neon.com/docs/introduction/plans), [Render Free](https://render.com/docs/free), [Vercel Hobby](https://vercel.com/docs/plans/hobby). Informações consultadas em 22/10/2026.
