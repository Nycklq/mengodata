# PROMPT MESTRE — MENGODATA | LANDING PAGE, REDESIGN E FINALIZAÇÃO

Você está trabalhando no repositório EXISTENTE do projeto, anteriormente chamado Flamengo Analytics. O novo nome público e definitivo é **MengoData**.

**Objetivo acadêmico:** plataforma pública de análise estatística e comparativa do desempenho coletivo do Flamengo no Campeonato Brasileiro Série A masculino de 2025, com as 38 rodadas, 380 partidas e comparação com os 20 clubes. O projeto faz parte da disciplina de Big Data e Análise de Dados, usando Python, Pandas, NumPy, Matplotlib, Seaborn, Parquet, pipeline Bronze/Silver/Gold, PostgreSQL, Node.js/Express, React e materiais de Power BI.

**IMPORTANTE:** não reinicie o repositório, não descarte o trabalho existente, não volte à análise individual de atletas e não invente números. Existem implementação, testes, documentação e mudanças possivelmente ainda não commitadas. Primeiro leia `AGENTS.md`, `README.md`, `docs/STATUS.md`, `docs/ARCHITECTURE.md`, `docs/TEST_REPORT.md`, `docs/REQUIREMENTS_MATRIX.md` e os arquivos reais do frontend, backend, pipeline, banco e Power BI. Confira `git status` sem fazer commits. Preserve as mudanças em andamento e evite sobrescrever trabalho ainda não concluído.

## 1. IMAGENS ANEXADAS: REFERÊNCIAS OBRIGATÓRIAS

O usuário enviará três imagens junto desta tarefa; identifique-as pelo conteúdo, não apenas pelo nome:

1. **Landing page de referência Finexa:** screenshot de um site financeiro premium com fundo preto, hero cinematográfico com imagem de fundo, navegação em cápsula, tipografia grande, uma visualização do produto sobre o hero, blocos editoriais, cards visuais, seções alternadas com imagens e gráficos e bastante respiro. Use como REFERÊNCIA VISUAL PRINCIPAL. Reproduza fielmente sua direção de arte, ritmo e composição, adaptando TODO o conteúdo e a narrativa para o Flamengo, futebol, dados e MengoData. Não copie marcas, textos financeiros, mockups de pagamentos, logotipos de terceiros, avaliações ou números promocionais.
2. **Logo PNG transparente do Flamengo:** utilize a imagem fornecida pelo usuário como identidade visual do MengoData. Preserve a proporção e a transparência, sem redesenhar ou distorcer o escudo. Copie-a para um caminho coerente em `frontend/public/brand/` (ou estrutura equivalente já adotada), com nome claro. Verifique a legibilidade em temas claro e escuro: a parte inferior do escudo é preta e desapareceria num fundo preto; utilize um tratamento de superfície/contêiner claro, moldura discreta ou fundo contrastante para manter o escudo completo visível. Não aplique inversão que deturpe as cores originais. Defina `alt` acessível.
3. **Screenshot do gráfico atual «Dentro e fora de casa»:** evidencia um problema visual: a barra de **Mandante** aparece, mas a de **Visitante** está ausente, embora a tabela apresente pontuação do visitante. Corrija o gráfico de verdade, e não somente sua aparência.

Se as imagens não estiverem acessíveis no workspace, verifique anexos e informe o caminho necessário, sem inventar que foram incorporadas; continue as partes independentes. Não inclua o screenshot da marca financeira como asset do aplicativo final. Antes de publicar a aplicação, registre a necessidade de verificar as permissões de uso público do escudo e das fotografias esportivas.

## 2. IDENTIDADE VISUAL OBRIGATÓRIA

Nome visível da aplicação: **MengoData** (com essa grafia). Subtítulo possível: **Inteligência esportiva em dados**. Título acadêmico pode permanecer mais descritivo: “MengoData — Análise Estatística e Comparativa do Desempenho do Flamengo no Campeonato Brasileiro Série A de 2025”.

Paleta-base informada pelo usuário (referências aproximadas, usar exatamente os códigos hex escolhidos):
- Vermelho rubro: `#C3271D`.
- Preto: `#000000`.
- Branco: `#FFFFFF`.

Crie tokens semânticos para background, superfície, texto, borda, texto secundário, hover, foco, destaque, gráfico e estado interativo, com neutros derivados dessas cores. Não use neon, verdes fluorescentes ou amarelos dominantes da landing de referência. Use o vermelho com intenção, não em cada superfície.

**Fonte Poppins em TODO o site, obrigatoriamente:** landing, dashboard, sidebar, cabeçalhos, parágrafos, botões, selects, tabelas, legendas, SVGs com texto, tooltips, modais e gráficos. Carregue pesos adequados (por exemplo 400/500/600/700), configure `font-display: swap` e fallback acessível. Não misture Inter, Roboto ou outras fontes na interface; considere apenas o fallback se Poppins falhar. Cuide da legibilidade de números tabulares.

Implemente **modo claro e escuro verdadeiros**, ambos completos, com os mesmos componentes e dados:
- Claro: base branca/cinza quase branco, texto preto/cinza escuro, vermelho para destaques, bordas discretas.
- Escuro: fundo preto/quase preto, superfícies carvão, texto branco/cinza claro, vermelho rubro para interação e gráficos.
- Tema selecionável por controle acessível na landing e no dashboard; respeite inicialmente a preferência do sistema, salve a escolha localmente, evite flash de tema errado na inicialização, mantenha a preferência ao trocar de rota.
- Todos os cards, legendas, gráficos, tooltips, tabelas, grids, skeletons, popovers, ícones e estados de erro devem ser legíveis em AMBOS os modos.

## 3. LANDING PAGE PÚBLICA — FIEL À COMPOSIÇÃO DA REFERÊNCIA

Crie `/` como landing page pública do MengoData e `/dashboard` como entrada do painel analítico. Se a aplicação já usar outras rotas, mantenha links e histórico funcionais; preserve as rotas internas e, quando necessário, faça redirects não destrutivos. O header principal da landing deve ter CTA destacado **“Explorar dashboard”** que navega de verdade ao painel.

**Não implementar login, cadastro, autenticação, botão entrar, botão assinar, sistema de usuários, senha, recuperação de conta ou plano pago.** Remova/oculte quaisquer affordances dessas ações herdadas do layout de referência. O acesso aos dados analíticos é público, mas preserve segurança da API, validação, limites e proteção do banco; não exponha credenciais.

Use a REFERÊNCIA FINEXA como direção visual prioritária: contraste premium, hero amplo com sobreposição de imagem esportiva, menu em cápsula central, composição editorial assimétrica, tipografia marcante, imagens em painéis sofisticados, cards arredondados e seções com hierarquia respirada. Traduza a composição para análise futebolística sem criar uma cópia literal da marca Finexa.

Landing sugerida, adaptável ao código e assets existentes:

### A. Navbar
- Logo do escudo e wordmark **MengoData** à esquerda, navegáveis para `/`.
- Navegação enxuta com âncoras reais: Projeto, Indicadores, Comparações, Metodologia (e Dashboard, se fizer sentido).
- Alternância claro/escuro e CTA **Explorar dashboard** à direita.
- No mobile, menu acessível com foco correto e sem overlays quebrados.
- Navbar sticky discreta, sem ocupar espaço excessivo.

### B. Hero cinematográfico
- Grande seção de destaque visual, seguindo o enquadramento da referência: imagem de estádio/gramado/atmosfera esportiva com overlays e gradientes para dar leitura ao texto; se não houver imagem licenciada, crie uma composição visual com CSS e SVGs próprios baseada em campo, arquibancada, linhas de jogo e gráficos. Não capture nem use imagem não autorizada.
- Headline forte, por exemplo **“O jogo muda. Os dados revelam.”** e apoio sobre o Flamengo no Brasileirão 2025. Texto original do MengoData, sem promessas de IA inexistente.
- Botão principal **Explorar dashboard** (funcional) e secundário **Entender a análise** (âncora de metodologia).
- No centro ou lateral, uma vitrine visual do produto usando elementos REAIS do dashboard (mini gráfico, cartões reais, prévia legível), em vez de inventar uma interface de aplicativo financeiro ou mockup mobile incoerente.
- Elementos SVG sutis ligados a futebol: mini campo, bola estilizada, trajetória, escudo, gráfico, linhas e marcadores. Evite tela cheia de setas e ícones repetidos.

### C. Seção de apresentação editorial
- Bloco de texto grande com partes em ênfase: o que o MengoData faz, como transforma placares em informação e como compara clubes. Alternância de preto/branco semelhante à referência.
- Três indicadores reais (ex.: 38 rodadas, 380 jogos, 20 clubes) carregados de fonte validada ou da configuração de cobertura auditada; se a cobertura real não estiver disponível, mostrar “indisponível” de modo apropriado, nunca inventar.

### D. Seção de recursos em cards
- Três cards visuais no ritmo da referência para “Evolução por rodada”, “Comparação entre clubes” e “Desempenho dentro e fora de casa”.
- Preview com dados reais e SVGs, navegação para os locais correspondentes do dashboard; não apenas cards decorativos.

### E. Seções alternadas de storytelling
- Seção com texto editorial de um lado e prévia real de gráfico do outro: “Mais do que a tabela”.
- Seção dedicada à comparação “Flamengo frente a frente com o Brasileirão”, com dois seletores funcionais ou CTA para `/dashboard/comparar` (ou rota já existente).
- Seção sobre engenharia de dados: OpenFootball → Python/Pandas → Bronze/Silver/Gold e Parquet → PostgreSQL/API → React/Power BI, com fluxograma SVG limpo.
- Bloco de metodologia/qualidade com fonte, escopo e restrições dos dados. Nenhum depoimento, parceiro, marca apoiadora, quantidade de usuários ou alegação de IA sem comprovação.

### F. CTA final e footer
- Chamada final com **Abrir dashboard** e acesso à metodologia.
- Rodapé conciso com nome do projeto, contexto acadêmico, dados e referências, sem marcas de terceiros não autorizadas.

Faça o site parecer um produto final cuidadosamente desenhado, fiel ao nível de acabamento da referência enviada. Produza estética sofisticada e minimalista, não um template genérico de cards.

## 4. DASHBOARD — REDESIGN COESO COM A LANDING

O dashboard existente deve adotar o mesmo design system, a fonte Poppins e tokens de cor, sem perder as funcionalidades já implementadas. Preserve as páginas relevantes e o escopo COLETIVO:
- Visão geral.
- Clubes e classificação / partidas.
- Comparar clubes.
- Análise ofensiva (gols marcados).
- Análise defensiva (gols sofridos e jogos sem sofrer gols).
- Estatística descritiva e tendências.
- Power BI.
- Metodologia.
- Outras páginas coletivas já existentes que façam sentido manter.

Sidebar profissional com escudo em tamanho correto, navegação clara, estado ativo, versão mobile com drawer; breadcrumb/header discreto; grids flexíveis e densidade visual equilibrada. Evite blocos gigantes vazios e gráficos esmagados. Use SVGs pertinentes e variados em títulos, ilustrações e estados vazios. Ícones podem ser Lucide, mas não substituem a linguagem visual esportiva.

### Gráficos modernos
- Reutilize a biblioteca existente (por exemplo, Recharts), sem adicionar uma segunda biblioteca redundante.
- Use linhas, barras, área e distribuições quando estatisticamente adequadas; contraste, grades sutis, legendas, tooltips úteis, unidade, contexto da rodada e formatação pt-BR.
- Não use escalas truncadas de modo enganoso; sobretudo em barras, escala a partir de zero.
- Animações discretas e com `prefers-reduced-motion`; não sacrificar performance ou legibilidade.
- Loading skeleton, estados de erro e vazios elegantes.

### CORREÇÃO OBRIGATÓRIA — “DENTRO E FORA DE CASA”
No screenshot anexado, a tabela exibe Mandante (19 jogos, 47 pontos) e Visitante (19 jogos, 32 pontos), mas somente a barra Mandante aparece. Corrija a causa real no componente de dados/renderização: mapeamento das categorias, acesso às chaves, domínio do eixo, tamanho do contêiner, barras condicionais, tooltip e CSS. Apresente AMBAS as barras visíveis, alinhadas, com a mesma escala partindo de zero e rótulos “Mandante” e “Visitante”.

Os valores da imagem são referência de depuração, não licença para hardcode: a visualização DEVE ler os valores recalculados da API conforme filtros e período selecionados. A tabela e o gráfico têm de estar coerentes em 19+19 jogos no recorte integral, quando confirmado pela base. Compare os números 47 e 32 com a API/SQL. Crie teste que falharia se qualquer categoria válida desaparecesse, incluindo modo claro, escuro e layout mobile.

### COMPARAÇÃO ENTRE CLUBES
- Área dedicada com dois seletores acessíveis, escolha padrão Flamengo versus outro clube, opção de comparar quaisquer dois clubes distintos (se sustentado pelos contratos), troca de lados, filtros de rodada e reset.
- Compare pontos, vitórias, empates, derrotas, aproveitamento, gols pró/contra, saldo, médias, desempenho mandante/visitante e tendências, usando somente dados reais.
- Exiba barras ou séries com escalas corretas, números e diferenças absolutas. Diferença percentual só quando o denominador permitir; “menor é melhor” para gols sofridos deve ser tratado semanticamente, sem declarar empate/ganhador erroneamente.
- Alterar seletores e filtros deve atualizar tabelas, gráficos e URL compartilhável quando a infraestrutura atual permitir; não criar campos apenas decorativos.

## 5. BANCO, API E INTEGRAÇÃO — NÃO ESCONDER PENDÊNCIAS

O usuário criou o banco PostgreSQL local `mengo_data` e o schema `collective`; a role `flamengo_app` teve `LOGIN` habilitado. Anteriormente as tabelas estavam vazias e `db:import` falhava por conexão; NÃO suponha que esses problemas já foram solucionados. Inspecione estado real do banco e do `.env` antes de qualquer operação, sem revelar senhas.

- Preserve scripts, migrações e schemas existentes; não altere bancos de outros projetos.
- Confirme se `DATABASE_URL` carrega de fato para o processo Node e aponta ao banco `mengo_data`, se a role possui permissões adequadas e se uma conexão com `SELECT 1` funciona.
- Se o schema já existe e a conexão estiver autorizada, use os comandos de importação já implementados para persistir as 380 partidas, 20 clubes e indicadores Gold, confirmando idempotência e consultas. Faça operações não destrutivas e transacionais.
- Valide `/api/health`, consultas coletivas, gráficos e comparações de ponta a ponta com dados reais. Não exponha erros internos, senhas ou dados sensíveis no frontend.
- Se a credencial ou permissão exigir intervenção humana, descreva o bloqueio exatamente, sem solicitar senha em chat; continue as melhorias independentes.
- Remova estados hardcoded e substitua por contratos reais; se indisponível, sinalize a ausência.

## 6. FINALIZAR ENTREGÁVEIS ACADÊMICOS EXISTENTES

- Preserve e execute o pipeline real Pandas/NumPy Bronze/Silver/Gold, Parquet/CSV e suas validações, sem introduzir Hadoop/PySpark obrigatórios.
- Verifique os notebooks e figuras Matplotlib/Seaborn existentes; revise legendas e documentação para o novo nome MengoData, sem adulterar análises.
- Preserve materiais Power BI (modelo dimensional, Power Query, DAX, tema, CSVs). Conclua PBIX/PBIP somente se o Desktop estiver acessível e o arquivo puder ser validado; caso contrário, documente o passo a passo manual e não afirme entrega de arquivo inexistente.
- Atualize identidade e documentação (README, STATUS, ARCHITECTURE, PRESENTATION, TEST_REPORT, manual de execução, páginas Metodologia e Power BI). Renomeie referências públicas a “Flamengo Analytics” para “MengoData”, mas NÃO renomeie automaticamente pacote Python, nomes internos, diretórios, migrations, variáveis ou banco se isso quebrar compatibilidade. Registre decisões de migração, preservando histórico.

## 7. REGRAS DE IMPLEMENTAÇÃO E QUALIDADE

- **Clean Architecture obrigatória:** domínio → aplicação → portas/adaptadores → infraestrutura e apresentação; não colocar SQL, fetch e regras estatísticas dentro de componentes React.
- **Código SEM comentários** (JS, JSX, CSS, Python, SQL etc.); usar nomes claros e documentação Markdown. Não remover avisos legais obrigatórios.
- JavaScript/React conforme stack existente; não migrar tudo para TypeScript nem adicionar frameworks sem justificativa.
- Acessibilidade real: keyboard, foco visível, `aria-label`, contraste, alt da logo, menus responsivos, toque mobile.
- Performance: carregamento de imagem responsivo, lazy loading onde útil, gráficos sem rerender excessivo, fontes otimizada; animações suaves e pequenas.
- Responsividade a testar: 375, 768, 1024 e 1440 px, incluindo hero, navbar, sidebar, comparação, gráficos e tabela mandante/visitante.
- Não usar fotografias, escudos de clubes rivais ou marcas de terceiros sem direitos de uso; para logos de outros times, usar tipografia ou ícones neutros quando necessário.
- Não criar login, cadastro, autenticação, sistema de usuários, planos, checkout ou qualquer conteúdo financeiro.
- Não inventar resultados, usuários, depoimentos ou alegações de IA.
- Não fazer commit, push, publicar site, comprar domínio, gastar recursos pagos nem executar comandos destrutivos sem permissão.

## 8. VALIDAÇÃO E CRITÉRIOS DE ACEITE

Execute os testes existentes e amplie onde necessário. Confirme:

1. Landing `/` carregando com logo correta, nome MengoData, Poppins, seções completas e CTA que abre `/dashboard`.
2. Nenhum botão/rota/fluxo de login ou cadastro.
3. Tema claro e escuro funcionando e persistindo tanto na landing quanto no dashboard.
4. Desktop, tablet e mobile sem layout quebrado; caso não consiga operar o navegador, registre o bloqueio e forneça checklist detalhado, não declare revisão visual concluída.
5. Gráfico “Dentro e fora de casa” exibindo BOTH Mandante e Visitante sob a mesma escala, com valores vindos de dados reais.
6. Comparação entre clubes funcional com dois seletores, filtros, gráficos e tratamento dos estados inválidos.
7. Integração PostgreSQL `mengo_data` → API → React comprovada quando o ambiente permitir; banco não destruído.
8. Pipeline e métricas preservados, sem regressões estatísticas.
9. Lint, testes frontend/backend/Python/banco, arquitetura, build e smoke executados de verdade, com resultados relatados.
10. Documentação e roteiro acadêmico atualizados para MengoData e o escopo coletivo de 2025.

Faça uma auditoria visual comparando o resultado com a imagem de referência Finexa: hero, hierarquia, navegação cápsula, alternância de seções, visual premium e clareza tipográfica. Corrija diferenças injustificadas sem copiar elementos financeiros e sem inventar conteúdo. A logo deve aparecer nítida em ambos os temas.

## 9. ENTREGA FINAL E CONTINUIDADE

Implemente as mudanças locais, não apenas um plano. Preserve o estado existente e priorize: (1) landing + logo + Poppins + identidade visual, (2) correção do gráfico Visitante, (3) tema claro/escuro, (4) comparação e refinamento do dashboard, (5) integração PostgreSQL, (6) testes/documentação/Power BI.

Ao concluir, apresente o inventário dos arquivos alterados, links/rotas locais, como executar, comprovação de dados reais, status de banco e Power BI, resultados de testes, capturas visuais quando possíveis e lista objetiva de pendências reais. Atualize `docs/STATUS.md` com andamento e próximos passos para que outra sessão possa continuar sem refazer trabalho caso haja limite de uso.

**Execute a melhoria completa do MengoData sobre o repositório real, respeitando rigorosamente as três imagens anexadas e as regras acima.**
