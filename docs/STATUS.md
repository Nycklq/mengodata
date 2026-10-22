# Estado real — MengoData

Atualizado em 22/10/2026. Projeto existente mantido. Escopo: análise coletiva do Flamengo e dos outros 19 clubes da Série A masculina de 2025, rodadas oficiais 1–38. Commits locais por funcionalidade autorizados pelo usuário; nenhum push, publicação ou operação destrutiva.

## Produto implementado

- Landing pública `/`: navegação em cápsula, hero com estádio em SVG próprio, vitrine do dashboard com dados reais, apresentação editorial, cobertura validada, três recursos navegáveis, seções alternadas, comparação funcional, fluxo de engenharia, metodologia e CTA final. Acesso sem login ou cadastro.
- Identidade MengoData, logo fornecida byte a byte, Poppins local 400/500/600/700 e itálico 500, `font-display: swap`, paleta #C3271D/#000000/#FFFFFF e neutros. Aviso legal da fonte preservado. Escudo em superfície branca nos dois temas.
- Temas claro/escuro aplicados a toda a interface: gráficos, tabelas, tooltips, menus, campos, carregamento e erros. Preferência inicial do sistema, armazenamento local, aplicação antes da montagem e sincronização entre abas.
- Dashboard em `/dashboard`, com nove páginas coletivas preservadas. Oito URLs antigas redirecionam mantendo query/hash. Menus acessíveis, foco, Escape, rolagem até âncoras carregadas assincronamente e redução de movimento.
- Mandante/visitante corrigido: escala numérica inclui zero, ambas as barras vêm da API, valores e tabela coerentes. SQL/API confirmaram 47 e 32 pontos, 19 partidas por mando. Teste real do Recharts verifica duas alturas positivas, proporção e base comum em dimensões 375/768/1024/1440 e temas claro/escuro.
- Comparação entre quaisquer dois clubes distintos: seletores, troca, restauração, filtros de rodada/mando e URL compartilhável; 14 indicadores, diferenças, variação válida, sentido das métricas e evolução. Erros de filtro recebem orientação específica. Prévias públicas recusam cobertura parcial ou versões de dados divergentes.

## Dados, banco e análises

Destino real `127.0.0.1:5432/mengo_data`, role `flamengo_app`. O `.env` da raiz é carregado por caminho absoluto; variável herdada prevalece. Credenciais e backups permanecem fora do Git. LOGIN e grants mínimos foram aplicados pelo usuário; as falhas anteriores 28000 e 42501 foram resolvidas.

Nova transação READ ONLY em 22/10/2026 confirmou `SELECT 1`, banco/role/porta, cinco tabelas com 1/1/20/1/380 registros e três views com 760/20/760. Snapshot JSONB igual à Gold local. Reimportação `changed=false`, sem nova migração. A sessão do processo backend 10840 foi observada consultando `collective.imports` em `mengo_data`. [Evidência atual sem credenciais](evidence/mengodata-redesign-verification.json).

Pipeline offline executado com a Bronze fixada: `changed=false`, 380 jogos, 760 fatos, 20 clubes e 38 rodadas. Seis figuras e seis notebooks reexecutados; 20 totais e 760 acumulados equivalentes em Python/JS. Tabelas BI regeneradas. Temas claro/escuro BI preparados com Poppins e MengoData. Cálculos, dados, migrações históricas, pacotes internos e cluster alternativo preservados.

## Validação e pendências reais

Resultados atuais em [TEST_REPORT.md](TEST_REPORT.md). Build e smoke passaram; smoke exercita API real, dez entradas SPA e oito aliases. Lint, testes de arquitetura e ausência de comentários são verificações independentes da revisão visual.

1. Revisão visual em navegador: IAB indisponível; Chrome foi encontrado pelo controle nativo, mas a captura foi interrompida por não confirmar a URL atual. Nenhuma captura React aprovada. Não contornar o bloqueio. Executar o checklist de 375/768/1024/1440 px em [DESIGN_REVIEW.md](DESIGN_REVIEW.md).
2. Power BI: não há PBIX/PBIP validado. Desktop não estava disponível no inventário observado e a automação foi encerrada. Montar, compilar M/DAX e conferir os números seguindo [powerbi/README.md](../powerbi/README.md).
3. Direitos da marca: uso da logo foi solicitado pelo usuário; não há autorização de publicação documentada. CC0 dos resultados não se aplica ao escudo. [Assets](ASSETS.md).
4. CI remoto não executado. Sem auditoria integral WCAG ou medição de desempenho em navegador. Classificação calculada não certifica desempates disciplinares; não há dados de posse, xG ou atletas.

## Executar e continuar

Com o PostgreSQL local ativo e `.env` atual: `npm.cmd run db:check`; `npm.cmd run db:import` somente como operação explícita. Em terminais separados, `npm.cmd run dev:backend` e `npm.cmd run dev:frontend`. Landing http://127.0.0.1:5173/; dashboard http://127.0.0.1:5173/dashboard. Não usar `db:local:configure` para esse destino: ele seleciona o cluster alternativo.

Reprodução completa e offline no [README](../README.md). Próximo trabalho: revisão visual e Power BI Desktop, preservando a configuração atual, o escopo e os commits. [Inventário](DELIVERY_FILES.md), [arquitetura](ARCHITECTURE.md), [roteiro](PRESENTATION.md).
