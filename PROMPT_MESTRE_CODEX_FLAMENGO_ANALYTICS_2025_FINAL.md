# PROMPT MESTRE — FINALIZAÇÃO DO FLAMENGO ANALYTICS

> Copie integralmente este texto para uma nova tarefa do Codex no VS Code, com a pasta raiz **Flamengo-Analytics** aberta. Execute no repositório existente; **não reinicie o projeto**.

## PAPEL, MISSÃO E MODO DE EXECUÇÃO

Você é responsável por continuar e levar o projeto **Flamengo Analytics** ao estado mais completo, verificável e reproduzível possível **nesta execução**, implementando efetivamente código, testes, documentação, visualizações, preparação de dados e recursos para Power BI. A solicitação é de **implementação integral, não apenas planejamento**. Trabalhe autonomamente, em sequência lógica e com verificações incrementais. Não interrompa a execução a cada fase para pedir aprovação, exceto quando uma decisão exigir credenciais, licença, acesso pago, publicação externa, perda de dados ou outra ação irreversível. Nesses casos, registre o bloqueio e **continue todas as partes independentes**. Não simule conclusão de itens bloqueados.

**Nunca prometa finalizar tarefas que dependem de dados, licenças ou ferramentas indisponíveis.** A prioridade é entregar um produto real, executável, honesto e com a maior cobertura funcional permitida pelas evidências e recursos existentes.

Responda em **português brasileiro**. Antes de alterar arquivos, examine o estado real do repositório, leia os documentos essenciais e apresente um plano executivo **curto**; em seguida **execute-o**, sem encerrar na etapa de planejamento.

## 1. ESCOPO ACADÊMICO DEFINITIVO

**Título oficial:** Flamengo Analytics — Análise Estatística do Desempenho Individual dos Jogadores do Flamengo no Campeonato Brasileiro Série A de 2025.

- Clube: Clube de Regatas do Flamengo, futebol masculino profissional.
- Competição: Campeonato Brasileiro Série A.
- Temporada: **2025**.
- Período: **temporada completa, rodadas oficiais 1 a 38**.
- Unidade de análise: jogador, com atuação exclusiva pelo Flamengo na competição e período definidos.
- Produtos: plataforma web profissional de análise estatística; pipeline e banco de dados; API REST; análises exploratórias; material de Power BI; documentação técnica e acadêmica; testes automatizados.
- Idioma da interface: **português brasileiro**, com números e datas formatados em `pt-BR`.
- Objetivo: responder com dados verificáveis quem foram os destaques individuais de 2025, em participação, produção ofensiva, contribuição defensiva e eficiência, respeitando a cobertura dos indicadores e as diferenças de posição/minutagem.

**A decisão anterior de usar o primeiro turno de 2026 está CANCELADA.** Não deixe validações, consultas, metadados, telas, scripts, exemplos ativos ou testes operacionais inadvertidamente limitados a 2026 / 19 rodadas. Preserve referências a esse recorte **somente** como histórico explícito de uma decisão substituída. Jogos adiados pertencem à sua **rodada oficial**, nunca ao mero intervalo cronológico. Não atribua ao Flamengo estatísticas de atletas por outros clubes.

## 2. CONTEXTO A LER E ESTADO EXISTENTE A PRESERVAR

Leia e reconcilie, se existirem:

- `AGENTS.md`;
- `docs/FLAMENGO_ANALYTICS_CONTEXT.md`;
- `README.md`, `docs/STATUS.md`, `docs/ARCHITECTURE.md`, `docs/CONTRACTS.md`;
- `docs/ROUND_SCOPE.md`, `docs/METRICS.md`, `docs/DATA_SOURCES.md`, `docs/TEST_REPORT.md`, `docs/PHASE_2_FILES.md`;
- arquivos de configuração do monorepo, scripts, CI, migrações, componentes, rotas, testes e módulos existentes;
- o estado do Git e alterações locais não confirmadas.

Foi **relatado**, mas deve ser conferido no repositório: uma Fase 2 com backend Express, frontend React/Vite, pipeline Python, domínio compartilhado, contratos, banco PostgreSQL, tela de disponibilidade, migrações e aproximadamente 126 testes aprovados antes das alterações posteriores. Isso é contexto, **não evidência atual de execução**. Reaproveite os módulos corretos, preserve mudanças do usuário e não crie implementações paralelas para substituir código funcional.

Se `AGENTS.md` ou documentos ainda determinarem 2026, **corrija os requisitos ativos para 2025/38 rodadas** antes de prosseguir. Registre a migração em documento de decisões. Não destrua histórico útil. Não faça `git reset --hard`, `git clean -fd`, alterações destrutivas no banco existente ou substituições cegas em massa.

## 3. REGRAS INEGOCIÁVEIS DE ENGENHARIA

### Clean Architecture e organização em camadas

- **Clean Architecture é obrigatória** para backend, frontend e pipeline Python, adaptada à natureza de cada módulo. Não basta criar pastas com nomes de camadas: faça com que os **imports, contratos e dependências** obedeçam à regra de dependência para dentro.
- **Domínio:** entidades, invariantes, políticas do recorte, conceitos e regras estatísticas puras; independente de React, Express, drivers SQL, clientes HTTP, bibliotecas de persistência e fornecedores de dados.
- **Aplicação:** casos de uso, portas/interfaces necessárias e coordenação dos fluxos de negócio; sem detalhes de transporte ou armazenamento.
- **Adaptadores:** tradução entre modelos externos e modelos internos, controladores HTTP, mapeadores, gateways e repositórios por interface.
- **Infraestrutura:** implementações concretas de banco, arquivos, chamadas HTTP, fontes esportivas e configuração externa.
- **Composição:** criação e conexão das dependências em `main`, `app` ou equivalente apropriado; evite localizar regras de negócio nas bordas.
- **Frontend:** estrutura modular por funcionalidade, com `domain`, `application`, `infrastructure` e `presentation`; componentes React apresentam estados e eventos; hooks orquestram integração; cálculos estatísticos canônicos não devem ser redefinidos em JSX.
- **Pipeline:** domínio e validação; casos de uso de ingestão e transformação; conectores de fontes/arquivos/banco; Bronze/Silver/Gold como camadas **de dados**, sem confundi-las com camadas de código.
- Uma porta deve existir quando resolver uma dependência concreta, e não como abstração decorativa. Evite classes inúteis, fragmentação excessiva, componentes enormes, serviços de Deus, dependências circulares, repetição de regras e `utils` como depósito de lógica de negócio.
- Garanta verificação automatizada das fronteiras/imports e da orientação das dependências.

### Estrutura de diretórios de referência (adapte à estrutura real, sem duplicar arquivos)

O código existente deve ser preservado e reorganizado **somente quando necessário**. Use esta referência para mapear responsabilidades, sem criar pastas vazias por obrigação:

```text
flamengo-analytics/
├── AGENTS.md
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── interfaces/http/
│   │   ├── infrastructure/
│   │   └── main/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   ├── players/
│   │   │   ├── comparison/
│   │   │   ├── analytics/
│   │   │   ├── power-bi/
│   │   │   └── methodology/
│   │   └── shared/ui/
│   └── tests/
├── pipeline/
│   ├── src/flamengo_pipeline/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── adapters/
│   │   ├── infrastructure/
│   │   └── main/
│   └── tests/
├── packages/domain/
├── contracts/
├── database/{migrations,tests}/
├── data/{raw,processed,analytics,metadata}/
├── notebooks/
├── powerbi/{data,dax,power-query,model,theme}/
├── docs/{architecture,methodology,academic,api,data-dictionary}/
├── scripts/
└── .github/workflows/
```

Dentro de cada funcionalidade React que precisar dessas camadas, organize `domain/`, `application/`, `infrastructure/` e `presentation/`; código compartilhado só deve ir para `shared` se for genuinamente genérico. Mantenha os nomes existentes quando equivalentes e documente divergências justificadas. `packages/domain` não deve duplicar domínios Python/JS desnecessariamente: compartilhe **contratos e semânticas**, não imponha importações entre linguagens.

### Código sem comentários

- **NÃO adicione comentários em código** JavaScript, JSX, CSS, SQL, Python, scripts, testes, configurações nem SVGs; não gere `TODO`, `FIXME`, JSDoc ou docstrings explicativas. Use nomes expressivos e documentação Markdown externa ao código.
- Não remova nem viole avisos legais de copyright/licença obrigatórios de terceiros. Mantenha explicações técnicas nos documentos `.md` e em células **Markdown** dos notebooks.

### Qualidade, segurança e disciplina

- JavaScript e JSX, **não migre para TypeScript**.
- Validação de entradas com Zod na API, consultas SQL parametrizadas, paginação limitada, ordenações permitidas por lista explícita, CORS apropriado, Helmet, proteção básica contra abuso, sanitização de respostas de erro, logging estruturado, gerenciamento seguro de segredos e arquivos `.env.example` atualizados.
- Componentes acessíveis, navegação por teclado, foco visível, estados de erro, ausência de dados, loading e responsividade.
- Não exponha credenciais em código, prints, logs ou frontend. Não use dados inventados como dados de produção.
- Antes de incluir dependência, examine as dependências existentes e justifique a adição. **Não instalar Spark/Hadoop** apenas para rotular o projeto como Big Data; preserve o pipeline apropriado ao volume real.
- Não faça commits, push, deploy, contratação de serviços nem ações em contas externas sem autorização. Respeite recursos locais do usuário e não altere bancos preexistentes sem isolamento.

## 4. FONTES, LICENÇAS E DADOS REAIS: PORTÃO OBRIGATÓRIO

A **homologação de fonte continua pendente** até que haja evidências verificadas. Não trate tabela pública, resultado de busca, licença ausente ou CSV encontrado no GitHub como autorização automática para download, armazenamento, API pública, exportação ou incorporação no Power BI.

Audite, entre outras fontes pertinentes:

- FBref / Sports Reference;
- CBF e súmulas oficiais;
- o repositório candidato `https://github.com/jhonatasjgr/brasileirao-2025`;
- APIs esportivas documentadas, datasets públicos e bases de acesso permitido.

Para cada candidata, documente em `docs/DATA_SOURCES.md` e na matriz de disponibilidade:

1. Nome, URL exata, proveniência original, data da consulta e entidade responsável.
2. Licença/termos vigentes, atribuição, método permitido de acesso, retenção e direitos para **uso local**, **armazenamento**, **transformação**, **distribuição via API**, **CSV** e **Power BI**.
3. Alcance: competição correta, Flamengo, ano de 2025, rodadas 1–38, jogadores, partidas, IDs, granularidade e cobertura.
4. Campos existentes de fato; diferenças entre eventos de partida, estatísticas por partida e totais acumulados/por temporada.
5. Qualidade: registros duplicados, ausências, identidades, jogadores transferidos, equipes, consistência com calendário oficial.
6. Evidências e incertezas; status `aprovada`, `pendente` ou `rejeitada` com justificativa e referência verificável.

**Atenção especial ao dataset candidato do GitHub:** arquivos por rodada não demonstram, por si sós, cobertura íntegra de 38 partidas com minutos e IDs; valores de scout ou pontuação de fantasy não são automaticamente equivalentes às estatísticas tradicionais; números acumulados não devem ser somados entre rodadas. Não execute scraping não autorizado nem contorne restrições técnicas.

**Plano para bloqueios:** se uma fonte não permitir publicação, implemente somente o fluxo permitido (por exemplo, importação local com aviso de direitos, se autorizada), mantendo API/exportação pública desativada para esses dados. Se nenhuma fonte estiver juridicamente e tecnicamente apta, implemente integralmente a arquitetura, a interface e os contratos com **estados reais de indisponibilidade**, dados vazios e testes com fixtures sintéticas isoladas; registre o impedimento e **não simule estatísticas verdadeiras**. Pode oferecer um mecanismo opcional para importar futuramente um dataset autorizado, sem inventar fornecedor ou token. Não alegue homologação sem evidências.

## 5. ENTREGÁVEIS FUNCIONAIS — IMPLEMENTE TUDO QUE FOR VIÁVEL

### A. Monorepo e execução local

- Normalize a estrutura já existente sem recriar o repositório; preserve scripts, lockfiles e CI quando corretos.
- Crie/ajuste scripts reproduzíveis para instalação, desenvolvimento frontend/backend, testes, lint, formatação, build, pipeline, migrações e verificação de saúde.
- `npm run dev:backend` e `npm run dev:frontend` devem iniciar corretamente a partir da raiz, ou documente os comandos exatos usados; configure proxy Vite/API consistente, variáveis de ambiente e tratamento claro de backend indisponível.
- Mantenha `.env.example`, `.gitignore`, README e GitHub Actions. Execute o projeto diretamente no Windows 11 com VS Code, npm, Python em `.venv` e PostgreSQL local. Não reintroduza Docker, Compose, Dev Containers ou outra infraestrutura de containers.
- Trabalhe sem apagar alterações locais do usuário.

### B. Domínio, modelo relacional e integridade

- Modele fontes, importações, competições, temporadas, clubes, partidas, jogadores, vínculos e estatísticas com IDs internos e IDs externos **namespaceados por fonte**; defina claramente a granularidade disponível (jogador/partida ou jogador/temporada), sem fabricar detalhes inexistentes.
- Migrações versionadas e idempotentes quando aplicável; PKs, FKs, checks, unicidade, índices, validações e transações.
- Regras de elegibilidade: série A masculina 2025, Flamengo, rodadas oficiais 1 a 38, preservação de adiamentos, histórico de transferências, exclusão de outras competições/clubes, tratamento de partidas repetidas.
- Distinga manifesto **válido**, manifesto com **38 partidas elegíveis identificadas**, cobertura **estatística individual auditada** e ingestão **autorizada**. Esses estados **não são equivalentes**.
- Mantenha rastreabilidade da origem até a estatística exibida.

### C. Pipeline de engenharia de dados e qualidade

- Python, Pandas, NumPy, SQL e formatos CSV/Parquet quando licenciados. Organização modular e com testes.
- **Bronze:** cópia fiel do material autorizado, preservando metadados, hash, data e origem.
- **Silver:** parsing, limpeza, nomes/IDs normalizados, validação do recorte e da granularidade, tratamento explícito de ausentes, deduplicação, rejeições auditáveis e conferência das partidas/atletas.
- **Gold:** bases analíticas consistentes para resumos, rankings, métricas por 90, grupos por posição, distribuição e comparação de atletas; apenas métricas sustentadas por campos reais.
- CLI ou scripts claros para validar manifesto, inspecionar fonte, importar e gerar relatório de qualidade. Passagens devem ser reexecutáveis e idempotentes; não duplique dados em nova execução.
- Diferencie corretamente **não disponível** (`null`/ausente), **zero confirmado** e **não aplicável**. Não misture fantasy points com gols/desarmes; não crie minutos ou assistências implícitas.
- Gere `docs/DATA_QUALITY.md` com contagens, cobertura por rodada, jogadores, colunas, descartes, taxas de ausência, divergências e auditoria da fonte.

### D. Indicadores e regras de estatística

Implemente conforme campos efetivamente disponíveis:

- Participação: partidas, titularidades, minutos, posição.
- Ataque: gols, assistências, participações em gols `G+A`, finalizações, finalizações no alvo, xG/xA somente se disponíveis e compatíveis.
- Defesa: desarmes, interceptações, cortes, bloqueios e outras métricas somente quando documentadas.
- Eficiência: `gols × 90 / minutos`, `assistências × 90 / minutos`, `(gols + assistências) × 90 / minutos`, conversão `gols / finalizações × 100`, precisão `passes certos / tentados × 100`.
- Nunca divida por zero nem converta ausência em zero. Taxas agregadas devem vir de **somas dos numeradores e denominadores**, não de médias simples de percentuais.
- Filtros de minutos: todos, ≥450, ≥900, ≥1500 e personalizado quando viável.
- Comparação por posição prioritária; se posições diferirem, exiba contextualização. Ranking deve separar volume e eficiência e informar população e critério.
- Define unidades, arredondamento de exibição, fontes e limitações no `docs/METRICS.md` e garanta a mesma semântica em Python, PostgreSQL, API, React e Power BI.

### E. API REST pronta para integração

Adapte contratos ao repositório e implemente endpoints úteis conforme houver suporte de dados, como:

- `GET /api/health` e `/api/metadata`;
- `GET /api/data-quality`;
- `GET /api/dashboard/summary`;
- `GET /api/players` e `/api/players/:id`;
- `GET /api/players/:id/stats`;
- `GET /api/rankings/goals`, `/assists`, `/contributions`;
- `GET /api/analytics/offensive`, `/defensive`, `/positions`, `/distribution`;
- `GET /api/compare`;
- `GET /api/exports/players` (CSV **somente com direitos de exportação confirmados**).

Use portas/casos de uso, DTOs, validação Zod, filtros, paginação, ordenação segura, erros JSON consistentes, documentação OpenAPI e indicação explícita de cobertura/indisponibilidade. Na ausência de dados licenciados, responda com objetos honestos e estado sem cobertura, **não HTTP 500 arbitrário nem números falsos**. Escolha códigos HTTP de acordo com o contrato e documente-os.

### F. Dashboard React — DESIGN MINIMALISTA, ESPORTIVO E PROFISSIONAL

**Este visual é um requisito central.** A tela atual de disponibilidade é apenas um estado inicial e **não é o dashboard definitivo**. Entregue interface original, minimalista, intuitiva e responsiva, inspirada na clareza de produtos de estatísticas esportivas como Sofascore/FotMob, **sem copiar** componentes, identidade, logotipos ou assets proprietários.

**Direção visual:**

- Design system coerente com Flamengo: preto/carvão (`#111111`), vermelho (`#C8102E`), branco e escala de cinzas neutros; uso parcimonioso do vermelho como destaque; espaços em branco/respiração e hierarquia forte.
- Tipografia **Inter** ou fallback equivalente; cards simples com bordas/sombras discretas, alinhamento rigoroso, legibilidade e microinterações sutis; nada de gradientes exagerados, excesso de efeitos, blocos gigantes ou visual poluído.
- Barra lateral com navegação clara no desktop; menu adaptado no mobile; cabeçalho com título, contexto do torneio e indicação honesta de cobertura. Consistência de espaçamento, raio, grid e componentes.
- Tailwind CSS, Lucide React e Recharts (que renderiza gráficos vetoriais), preservando o stack existente. Ícones e ilustrações devem ser **SVGs de verdade** (componentes React ou arquivos vetoriais locais), não emojis como substitutos de interface, não caracteres Unicode simulando ícones e não apenas setas repetidas.
- **Variedade intencional de SVGs esportivos**: bola, chuteira, campo, camisa, apito, troféu, gráfico de performance, alvo, escudo genérico, calendário, defesa, estatísticas, comparação, exportação, filtro e informação. Crie quando necessário SVGs originais simples para estados vazios, orientação e pequenos destaques. Use as setas somente onde houver ação de navegação/ordenação — **não quero uma interface composta quase só de setas e chevrons**.
- Utilize SVGs acessíveis (`aria-hidden` nos decorativos e texto/`aria-label` nos informativos), com tamanhos e strokes consistentes. Evite excesso de SVG decorativo e nunca incorpore marcas/fotos oficiais sem direitos confirmados.
- Para gráficos, prefira barras, linhas, dispersões e distribuições com eixos, legendas, unidades, tooltip e leitura adequada; sem gráficos só para preencher espaço.
- Responsividade desktop/tablet/celular, contraste, foco visível, labels de inputs, controle por teclado e preferência por movimento reduzido.

**Páginas exigidas (com navegação funcionando, sem páginas falsas):**

1. **Visão geral:** total de atletas cobertos, gols, assistências, G+A, artilheiro, líder de assistências, rankings e gráficos adequados à fonte; insights determinísticos.
2. **Jogadores:** tabela ordenável/paginada com pesquisa, posição, minutos, gols, assistências, G+A, taxas por 90 e exportação quando autorizada.
3. **Perfil do jogador:** estatísticas do atleta, posição, minutos, contribuição, gráficos aplicáveis e proveniência.
4. **Comparador:** seleção de 2 atletas, números lado a lado, diferenças, gráficos, filtro de minutos e aviso para comparação entre posições distintas.
5. **Análise ofensiva:** gols, assistências, criação/finalização e eficiência; dispersão minutos × produção se suportada.
6. **Análise defensiva:** desarmes, interceptações e demais indicadores disponíveis, com estados apropriados quando indisponíveis.
7. **Análise estatística:** distribuições, médias, medianas, quartis, valores extremos e interpretações cuidadosas, se houver base para calcular.
8. **Power BI:** página explicando o relatório, a disponibilidade real e como abrir/atualizar o material entregue; incorporar somente quando houver URL, licença e autorização adequadas.
9. **Metodologia e dados:** escopo 2025/38 rodadas, fonte(s), atualizações, fórmulas, cobertura, limitação, atribuições e relatórios de qualidade.

**Estados reais obrigatórios em cada tela:** carregando/skeleton, erro com recuperação, filtro sem resultados, ausência de fonte homologada, métrica indisponível, cobertura parcial e sucesso com dados reais. Antes da homologação, implemente layout final e comportamento completo dos controles aplicáveis, usando estado vazio honesto; **não renderize cards com estatísticas esportivas inventadas ou exemplos rotulados como reais**. É aceitável utilizar valores sintéticos exclusivamente em **testes automatizados e desenvolvimento isolado**, nunca expostos como produção.

**Organização de frontend:** `src/app` para providers/roteamento/estilo global; `src/features/<dominio>/{domain,application,infrastructure,presentation}` conforme necessidade; `src/shared/ui` para componentes realmente genéricos; rotas lazy quando útil; separação de apresentação e busca/cálculo. Use TanStack Query para estados da API e cache coerente, React Router para navegação e CSS/Tailwind consistente.

### G. Power BI — segundo produto obrigatório

- Crie uma estrutura reproduzível `powerbi/` com fonte de dados Gold permitida, modelo dimensional (DimJogador, DimPosicao, DimEquipe, DimTemporada, DimCompeticao e fatos compatíveis com a granularidade real), transformações Power Query, medidas DAX, tema JSON e documentação.
- Medidas: totais, gols, assistências, minutos, G+A, por 90, rankings, comparação e outros indicadores disponíveis; divisão segura com `DIVIDE` e mesma metodologia do Python/API.
- Projete páginas: Visão Geral, Desempenho Ofensivo, Desempenho Defensivo, Comparação de Jogadores e Eficiência Estatística; documente filtros e visuais.
- Se o ambiente permitir produzir e validar arquivo nativo PBIP/PBIX, entregue-o. **Se não permitir, não finja ter criado um PBIX:** entregue todos os artefatos geráveis, transformações, medidas, modelo e instruções executáveis de montagem no Power BI Desktop e marque a limitação.
- Não distribua datasets licenciados de terceiros sem autorização.

### H. Análise exploratória e documentação acadêmica

- Crie notebooks organizados para entendimento, qualidade, ataque, defesa, comparações e achados estatísticos, respeitando as mesmas fontes e o mesmo escopo.
- Use apenas resultados comprovados; análises sem base devem registrar pré-requisitos e indisponibilidade, sem gráficos ou conclusões fictícias.
- Documente pesquisa, pergunta central, objetivos, metodologia, fontes, preparação, fórmulas, limitações, achados comprovados, reprodutibilidade e referências verificáveis; formato acadêmico passível de adaptação às normas ABNT.
- Atualize README, arquitetura, contratos/OpenAPI, fonte e licenças, dicionário de dados, métricas, qualidade, decisões, status, roteiro de execução e relatórios de teste com informações reais.

## 6. ORDEM DE EXECUÇÃO AUTÔNOMA — NÃO PARE APÓS O PLANO

Prossiga nesta ordem, executando o que puder **na mesma tarefa**:

1. **Auditoria inicial:** leia o repositório, identifique arquivos existentes, alterações locais, configurações, testes e riscos; confirme 2025/38 rodadas. Faça plano curto.
2. **Correção de escopo e arquitetura:** normalize `AGENTS.md` e os documentos ativos; elimine dependências operacionais indevidas de 2026; ajuste validação de partidas, manifestos, metadados e testes; mantenha Clean Architecture real.
3. **Fundação da aplicação:** complete configurações, scripts, contratos, migrações seguras, tratamento de erro, composição de dependências, API de metadados e infraestrutura local.
4. **Auditoria das fontes:** avalie datasets e permissões. **Não congele o desenvolvimento** se houver bloqueio; implemente os demais módulos com portas estáveis e estados honestos.
5. **Pipeline real, quando autorizado:** ingestão Bronze, normalização Silver, Gold, consultas, relatório de qualidade e testes de idempotência; caso contrário, conclua adaptadores genéricos e CLI de validação/importação condicionada, sem coleta proibida.
6. **Backend completo:** casos de uso, repositórios, endpoints e documentação OpenAPI, cobertura e erros transparentes.
7. **Frontend completo:** implemente design system, layout, SVGs esportivos, navegação, nove páginas, componentes reutilizáveis, estados, gráficos vinculados a dados realmente existentes, filtros, comparadores e exportações autorizadas.
8. **Power BI e notebooks:** produza os artefatos realmente possíveis e instruções de execução; não afirme entrega nativa inexistente.
9. **Qualidade:** testes unitários, integração, API, frontend, pipeline, banco, arquitetura, fórmulas, casos de ausência, carregamento, responsividade básica e compatibilidade; lint, formatação, build, smoke e execução local.
10. **Documentação e encerramento:** registre resultados reais e pendências; confira ausência de comentários novos, consistência de filtros, fontes e disponibilidade; apresente um relatório final.

**Continuidade em caso de limite de execução:** trate esta solicitação como um backlog único; ao final de cada conjunto de mudanças, atualize `docs/STATUS.md` com arquivos criados, comandos efetivamente executados, próximos itens e impedimentos. Se o ambiente interromper por limite de mensagens/tempo, uma nova execução com "continue a partir do STATUS.md e deste prompt, sem refazer o que já foi concluído" deve conseguir prosseguir de forma segura. Não presuma trabalho concluído apenas porque um arquivo foi criado.

**Critérios para trabalhar sem parar:** não responda com "posso fazer a próxima fase?". Se uma etapa estiver bloqueada, passe à próxima independente, mantendo a documentação honesta. Se uma execução de ferramenta falhar, diagnostique, corrija e tente novamente de modo seguro. Evite refatorações cosméticas sem benefício. Não declare pendências resolvidas sem evidência.

## 7. TESTES E ACEITE

Crie e execute verificações apropriadas para, no mínimo:

- Elegibilidade rodadas 1, 19, 20, 38; rejeição 0/39 e anos 2024/2026; partidas adiadas preservando rodada oficial.
- Flamengo como equipe da atuação, excluindo outras equipes e outras competições.
- Manifestos: estrutura, 38 partidas identificadas, cobertura real, fonte aprovada, duplicidades, IDs e namespaces, lacunas e validade versus prontidão para ingestão.
- Conversão e ausência de campos, denominador zero, taxas por 90, G+A, médias agregadas ponderadas corretamente.
- Ingestão idempotente e rastreável; banco sem registros esportivos fictícios.
- Ordenação, busca, paginação, limites, injeção SQL, validação HTTP, formatos JSON e CSV quando permitido.
- API e UI em condições: dados reais, fonte não aprovada, nenhuma linha, erro de rede, carregando, métrica indisponível e cobertura parcial.
- Frontend: navegação funcional, filtros alterando dados apresentados, tabela, comparador, rótulos acessíveis, ícones SVG, responsividade básica.
- Limites de Clean Architecture e proibição de imports indevidos.
- Lint (ESLint/Ruff), formatação, testes Python/JS/PostgreSQL, build frontend/backend conforme aplicável e smoke de execução local.

Não retire testes existentes apenas para obter verde. Registre comandos exatos, contagens, sucessos, falhas e verificações **não executadas** em `docs/TEST_REPORT.md`. Não invente porcentagem de cobertura. Use fixtures sintéticas **somente em testes**, isoladas do sistema real.

## 8. CRITÉRIOS DE CONCLUSÃO E COMUNICAÇÃO FINAL

Um recurso só pode ser marcado **concluído** se estiver implementado, integrado e verificado. Diferencie claramente:

- **Implementado e testado**;
- **Implementado, mas não verificado por limitação do ambiente**;
- **Preparado tecnicamente, aguardando fonte/licença ou dados**;
- **Não implementado**.

No fim, entregue um relatório conciso, mas completo, com:

1. Estado encontrado e mudanças no repositório.
2. Estrutura efetiva das camadas, dependências, principais módulos e rotas.
3. Páginas criadas, aparência/ícones SVG, navegação, estados e recursos funcionais.
4. Situação das fontes, cobertura real de 2025, direitos de uso, restrições e o que pode ser publicado.
5. API, pipeline, PostgreSQL, métricas, notebooks e Power BI: arquivos **realmente produzidos** e limitações.
6. Tabela de testes executados e resultados, com comandos reproduzíveis.
7. Instruções exatas para instalar e iniciar localmente (inclusive URLs/portas verificadas).
8. Lista curta de bloqueios e ações que dependem do usuário, **somente se necessários**.
9. Matriz de requisitos implementado/testado/pendente e próximo passo essencial.

**OBJETIVO FINAL:** um Flamengo Analytics 2025 com Clean Architecture verdadeira, código sem comentários, excelente interface minimalista de análise esportiva com SVGs variados, módulos organizados, dados honestos, testes e documentação; execute tudo que o ambiente e os direitos permitirem **agora**, sem deixar o trabalho em uma lista genérica de intenções.
