AGENTS.md — MengoData
Identidade e recorte obrigatório
- Projeto: MengoData, análise coletiva do Flamengo comparada aos outros 19 clubes. Nome público atualizado por autorização explícita; pacotes e diretórios internos preservam os identificadores existentes.
- Campeonato: Brasileiro Série A masculino, temporada completa de 2025 (rodadas oficiais 1 a 38).
- Abrangência: resultados e placares dos 20 clubes nesse recorte. Excluir rodadas fora de 1 a 38, outras competições e temporadas. Estatísticas individuais não são requisito nem fluxo principal; módulos legados permanecem isolados e inativos.
- Jogos adiados pertencem à rodada oficial de origem; não substituir o recorte por intervalo de datas ou ordem cronológica dos jogos.
- A decisão anterior de primeiro turno de 2026 foi cancelada pelo usuário. O histórico em docs/history/2026 não é norma operacional.
- Antes de implementar algo que envolva escopo, métricas ou fonte, consulte README.md, principalmente as seções de arquitetura/contexto operacional, reprodução e testes. Os Markdown diretamente em docs/ foram removidos pelo usuário em 22/10/2026, com confirmação explícita para mantê-los removidos.
- O documento é planejamento, não evidência de implementação. Inspecione o repositório antes de declarar que algo já existe.
Clean Architecture — regra inegociável
- Nunca implementar código novo fora de Clean Architecture, nem provisoriamente. Fazer as dependências apontarem para o núcleo de negócio.
- Backend: separar domínio, aplicação/casos de uso/portas, adaptadores HTTP e infraestrutura PostgreSQL; composição e injeção de dependências nas bordas. Domínio e casos de uso não importam Express, drivers SQL ou serviços externos.
- Frontend: separar domínio e regras analíticas, fluxos/casos de uso, gateways HTTP e apresentação React. Componentes não concentram regras de negócio, SQL ou infraestrutura.
- Pipeline Python: separar regras estatísticas e validação, casos de uso de ingestão/transformação e conectores de fonte/arquivo/banco. Bronze/Silver/Gold são estágios de dados, não substituem a arquitetura de software.
- Controllers devem validar o transporte e delegar; repositórios concretos persistem; regras e cálculos permanecem em módulos internos testáveis.
- Contratos, DTOs, portas e mapeadores só quando efetivamente necessários. Evitar camadas vazias, abstrações artificiais, dependências circulares e reescritas sem justificativa.
- Se houver impedimento arquitetural, descrevê-lo e corrigir a estrutura afetada: não produzir atalho arquitetural incompatível.
Código sem comentários — regra inegociável
- Não inserir comentários em JS, JSX, CSS, Python, SQL, scripts, testes ou arquivos de configuração.
- Não adicionar TODO, FIXME, JSDoc, docstrings explicativas ou comentários de cabeçalho em código. Usar nomes claros e testes expressivos.
- Explicações, justificativas e decisões pertencem às respostas e à documentação Markdown (incluindo células Markdown de notebooks), não ao código.
- Não apagar indiscriminadamente comentários preexistentes em arquivos não relacionados à tarefa.
Qualidade e fidelidade dos dados
- Usar somente dados reais, com origem, cobertura, granularidade e direitos de uso verificados. Nunca inventar números, fontes, URLs, APIs, testes executados ou resultados.
- Comprovar a cobertura das rodadas 1 a 38 de 2025 antes de calcular e exibir totais da temporada. Arquivos de rodada, calendário e scouts acumulados não comprovam cobertura por partida. Não somar snapshots acumulados como eventos independentes.
- Preservar IDs de partidas, rodada oficial, clubes, competição, temporada, fonte e data de coleta. Verificar partidas remarcadas; IDs internos não se apresentam como IDs oficiais.
- Métricas indisponíveis devem aparecer como indisponíveis, não receber zeros falsos. Relatar cobertura parcial e diferenças de granularidade.
- Manter a mesma semântica de indicadores em Python, Gold, PostgreSQL, API, React e Power BI.
- Validar entradas, usar consultas SQL parametrizadas, tratamento consistente de erros e configurações seguras.
- Testar regras de recorte, fórmulas, idempotência, casos de uso, integrações e endpoints. Executar testes, lint e build quando disponíveis e reportar resultados observados.
- Não instalar ferramentas de Big Data em escala (como Spark ou Hadoop) sem justificativa técnica relacionada a volume ou processamento.
Forma de trabalhar
- Ambiente de desenvolvimento: Windows 11 e VS Code, com Node.js/npm, React/Vite, Python em .venv, PostgreSQL local e Power BI Desktop. Não reintroduzir Docker, Compose, Dev Containers ou outra infraestrutura de containers como dependência do projeto.
- Configurar PostgreSQL por DATABASE_URL no .env local, sem credenciais versionadas. Diagnóstico de conexão deve ser somente leitura; migrações são explícitas e nunca executadas ao iniciar a API. Testes de banco usam cluster temporário isolado, sem acessar bancos existentes.
- Responder em português brasileiro, tecnicamente e com clareza.
- Seguir o roadmap descrito no contexto, verificando as dependências e o estado real do projeto antes de agir.
- Se solicitado a implementar, entregar arquivos funcionais, testes apropriados e instruções de execução, sem encerrar apenas com um plano. Se solicitado ensino, explicar de modo gradual e permitir que o usuário implemente.
- Em tarefas complexas, apresentar sequência resumida de fases e preservar progresso/documentação de decisões sem criar arquivos vazios.
- Não fazer commits, git push, publicar repositórios, implantar serviços, comprar produtos nem contratar recursos sem autorização explícita.
- Preservar migrações históricas e bancos existentes. Mudanças de escopo exigem migração aditiva, sem apagar ou reclassificar partidas antigas.
- Antes de finalizar, conferir arquitetura, ausência de comentários novos, filtragem da temporada completa de 2025 e testes pertinentes. Reportar limitações e pendências de forma transparente.
