# Flamengo Analytics

Análise Estatística do Desempenho Individual dos Jogadores do Flamengo no **Brasileirão Série A masculino de 2025, temporada completa, rodadas oficiais 1 a 38**. Adiamentos conservam a rodada de origem; atuações por outros clubes são excluídas.

## O que funciona

O monorepo existente foi ampliado com nove páginas React, API analítica, fórmulas JS/Python, importação rastreável, migração PostgreSQL aditiva, seis notebooks executados e preparação para Power BI. Clean Architecture separa domínio, aplicação, adaptadores, infraestrutura e composição. O código próprio não contém comentários.

**Há 38 referências auxiliares reais de partidas OpenFootball CC0 importadas. Não há fonte individual homologada.** A interface mostra referências e estados de indisponibilidade; gols, minutos e demais estatísticas de atletas não são inventados. Rankings, gráficos, comparação e CSV estão preparados e testados com fixtures isoladas, aguardando dados autorizados. O material Power BI ainda não foi validado no Desktop e não inclui PBIX/PBIP.

Páginas: visão geral, jogadores, perfil individual, comparação, ataque, defesa, estatística descritiva, Power BI e metodologia. Sidebar desktop, menu mobile, filtros em URL, busca, posição, minutos predefinidos/personalizados, ordenação/paginação e SVGs esportivos originais/Lucide. Gráficos Recharts são carregados sob demanda somente quando existem valores conhecidos. A revisão visual em navegador foi bloqueada pelo controle de computer-use; os testes DOM não substituem essa revisão.

## Instalar no Windows

Versões verificadas: Node.js 24.22.0, npm 11.19.1, Python 3.14.8 e PostgreSQL 18.6. Execute na raiz, em PowerShell:

```powershell
npm.cmd ci
py -3.14 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r pipeline/requirements.lock.txt
.\.venv\Scripts\python.exe -m pip install --no-deps -e pipeline
```

Preserve uma .venv existente compatível. Não é necessário ativá-la ou mudar a política do PowerShell. PostgreSQL local é necessário para persistência e testes de banco; o dashboard inicia sem ele no estado atual. Não há containers, WSL, Spark ou Hadoop como requisitos.

Preserve seu .env. Se precisar criá-lo:

```powershell
if (!(Test-Path -LiteralPath .env)) {
    Copy-Item -LiteralPath .env.example -Destination .env
}
```

O exemplo usa host 127.0.0.1, API 3001, CORS http://127.0.0.1:5173 e PostgreSQL 5432. Substitua a credencial de exemplo somente por uma de banco dedicado. .env é ignorado pelo Git. A ausência de DATABASE_URL não impede referências e indisponibilidade individual.

## Executar a aplicação

Importe as referências auxiliares autorizadas. O comando sem entrada baixa apenas o arquivo OpenFootball da revisão fixa e verifica o SHA-256 aprovado antes de gravar:

```powershell
npm.cmd run pipeline:references
npm.cmd run powerbi:prepare
```

A importação cria Bronze em data/raw, Silver em data/processed e Gold em data/analytics. Reexecuções do mesmo conteúdo retornam changed=false. Os arquivos gerados são ignorados pelo Git. Para usar uma cópia local já obtida, execute `npm.cmd run pipeline:references -- --input "C:/caminho/arquivo.json"`; estrutura semelhante com hash diferente não recebe aprovação.

Em dois terminais na raiz:

```powershell
npm.cmd run dev:backend
```

```powershell
npm.cmd run dev:frontend
```

Abra **http://127.0.0.1:5173/**. API: **http://127.0.0.1:3001/api/health**. Ambas as entradas iniciaram nessas portas nesta execução. O proxy Vite encaminha /api. Use Ctrl+C nos terminais para encerrar; `npm.cmd run start:backend` inicia sem watch.

Rotas: /, /jogadores, /jogadores/:id, /comparar, /ofensivo, /defensivo, /estatisticas, /power-bi e /metodologia. Perfis exigem UUID de um dataset individual aprovado; não há jogador fictício para abrir em produção.

## PostgreSQL e importação individual

Veja [database/README.md](database/README.md). Em um banco dedicado configurado por DATABASE_URL:

```powershell
npm.cmd run db:check
npm.cmd run db:migrate
```

db:check é somente leitura. db:migrate é explícito; iniciar a aplicação não aplica migrações. 001/002 históricas foram preservadas; 003 acrescenta importações/fatos, constraints, índices e proveniência. A 002 recusa partidas antigas sem apagar ou reclassificar dados. Nenhuma migração foi aplicada ao banco pessoal nesta execução.

A entrada individual futura exige contrato [individual.schema.json](contracts/individual.schema.json), revisão exata de hash/fonte e evidências de permissões nos registros internos. **Não edite flags para contornar a auditoria.** O registro atual não aprova nenhum dataset individual.

```powershell
npm.cmd run pipeline:individual -- "C:/caminho/dataset-autorizado.json"
npm.cmd run db:import
```

Esses comandos estão bloqueados no estado atual. O primeiro preserva o artefato aprovado em Bronze/Silver/Gold; o segundo persiste em transação no banco explicitamente configurado. Com DATABASE_URL, a API lê somente a versão aprovada carregada no PostgreSQL; sem ela, usa a Gold local revisada. A permissão de exibição/API é distinta da permissão de armazenamento e pode bloquear a apresentação mesmo após uma ingestão local permitida.

O manifesto v2 continua apenas um contrato de identificação: `npm.cmd run pipeline:validate -- "C:/caminho/manifesto.json"`. Validade e 38 referências não comprovam cobertura de atletas. Os importadores não aceitam flags HTTP/CLI para aprovar fonte, direitos ou participações.

## API e análises

[OpenAPI](docs/api/openapi.json) e [guia de rotas](docs/api/README.md). Inclui resumo, qualidade, catálogo auxiliar, jogadores/perfis, rankings, análises ofensiva/defensiva/posições/distribuição, comparação e CSV condicionado. Há validação Zod, limites, SQL parametrizado, CORS/Helmet, rate limit e erros sem detalhes sensíveis.

Indisponibilidade legítima retorna 200 com listas vazias/campos nulos. Cobertura parcial é identificada e não libera totais anuais no resumo. Exportação sem direitos retorna 409. Saúde do processo não equivale a saúde do banco ou homologação.

```powershell
npm.cmd run notebooks:execute
npm.cmd run notebooks:check
npm.cmd run api:spec
```

Os seis [notebooks](notebooks/README.md) foram executados com a auditoria real. As análises individuais registram o bloqueio em vez de gerar conclusões fictícias. O runner usa kernel da própria .venv em loopback e encerra seus processos. [Power BI](powerbi/README.md) contém modelo, consultas M, DAX, tema e roteiro das cinco páginas; a preparação atual produz metadados de bloqueio e tabelas vazias, sem redistribuição individual.

## Verificação

```powershell
npm.cmd run verify
```

Agrupa lint, formatação, testes backend/frontend/contratos/Python/PostgreSQL isolado, reexecução dos notebooks, build e smoke HTTP. Comandos individuais: npm test, test:pipeline, test:database, notebooks:check, build e test:smoke, todos pelo npm run quando aplicável. PostgreSQL de teste usa cluster próprio e não usa a DATABASE_URL pessoal.

Resultados efetivamente observados e limitações em [TEST_REPORT.md](docs/TEST_REPORT.md). CI remoto/Linux/WSL e validação visual completa ainda não foram executados.

## Documentação e pendências

[Estado e continuidade](docs/STATUS.md), [arquitetura](docs/ARCHITECTURE.md), [contratos](docs/CONTRACTS.md), [métricas](docs/METRICS.md), [dicionário](docs/DATA_DICTIONARY.md), [fontes](docs/DATA_SOURCES.md), [aprovações](docs/SOURCE_APPROVAL.md), [qualidade](docs/DATA_QUALITY.md), [relatório acadêmico](docs/ACADEMIC_REPORT.md), [decisões](docs/DECISIONS.md) e [matriz de aceite](docs/REQUIREMENTS_MATRIX.md).

O próximo bloqueio externo é obter fonte individual autorizada com participações auditáveis nas 38 partidas, convenções dos indicadores e direitos por canal. Depois será possível responder quem foram os destaques individuais e validar dados no Desktop. Minutas de pedido foram preparadas, sem envio. Não houve commit, push, deploy, conta nova ou contratação. A licença geral do software do projeto ainda precisa ser definida pelo titular.
