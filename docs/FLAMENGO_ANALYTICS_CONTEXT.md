PROMPT DE TRANSFERÊNCIA DE CONTEXTO — FLAMENGO ANALYTICS
LEIA TODO ESTE CONTEXTO ANTES DE RESPONDER
REGRAS OBRIGATÓRIAS ADICIONADAS PARA IMPLEMENTAÇÃO COM CODEX:

1. Toda implementação deve obedecer à Clean Architecture, com separação explícita de domínio, casos de uso, adaptadores e infraestrutura, aplicada de forma proporcional ao backend, frontend e pipeline de dados.
2. É proibido criar ou entregar código fora dessa arquitetura como solução provisória. A arquitetura deve estar correta desde a primeira implementação de cada funcionalidade.
3. O código gerado deve ser totalmente livre de comentários. Explicações e decisões ficam nas respostas e nos arquivos Markdown de documentação, não dentro dos arquivos de código.
4. Essas regras têm precedência sobre estruturas de diretórios meramente ilustrativas descritas nas seções históricas deste documento.
   ATUALIZAÇÃO DEFINITIVA — ESCOPO 2026 / PRIMEIRO TURNO
   Esta seção prevalece sobre descrições históricas ou exemplos incompatíveis do planejamento original.

- Objeto: estatísticas individuais dos jogadores do Clube de Regatas do Flamengo.
- Competição: Campeonato Brasileiro Série A, futebol masculino profissional.
- Temporada: 2026.
- Recorte: exclusivamente primeiro turno, rodadas oficiais 1 a 19.
- Fonte única da verdade do recorte: relação verificável das partidas do Flamengo com identificador de partida, temporada, competição e número oficial da rodada. Partidas remarcadas mantêm sua rodada oficial.
- Exclusões: segundo turno (rodadas 20 a 38), Copa do Brasil, Libertadores, estaduais, amistosos, temporadas diferentes e estatísticas de outro clube, mesmo quando o atleta passou por transferência.
- Agregação: calcular estatísticas do primeiro turno a partir de registros compatíveis por partida/rodada, com soma e regras documentadas; nunca reutilizar totais da temporada completa fingindo que são do primeiro turno, nem estimar a diferença sem dados auditáveis.
- Cobertura: verificar se todas as partidas e métricas do recorte estão disponíveis; identificar jogos ausentes/adiados e registrar o status de conclusão da coleta. Não inferir que os dados estão completos a partir do calendário.
- Métricas faltantes: mostrar indisponibilidade ou cobertura parcial de modo explícito, sem números inventados e sem trocar dados ausentes por zero.
- UI, relatórios, exportações e Power BI: informar claramente “Brasileirão Série A 2026 — 1º turno (rodadas 1 a 19)”.
- Arquitetura: Clean Architecture obrigatória em todo código novo, sem atalhos fora das camadas.
- Estilo de código: sem comentários de código, TODO, FIXME ou docstrings explicativas; a documentação externa em Markdown permanece necessária.
- Big Data: arquitetura preparada para expansão de volume quando justificado; não incluir Spark/Hadoop nem processamento distribuído apenas pelo rótulo “Big Data”.
  Critério bloqueante: se nenhuma fonte legalmente utilizável permitir isolar os dados das rodadas 1 a 19 de 2026, documentar a lacuna e não apresentar totais de temporada como dados do primeiro turno.
  Estou transferindo para esta conversa o contexto completo de um projeto que venho planejando com o ChatGPT.

Quero que você considere todas as informações a seguir como o histórico de planejamento do meu projeto.

Não quero recomeçar do zero, redefinir decisões já tomadas ou receber sugestões genéricas que ignorem o que foi estabelecido.

O projeto já foi extensamente planejado em conversas anteriores, incluindo definição de tema, escopo, objetivos, tecnologias, arquitetura, indicadores estatísticos, funcionalidades do dashboard, Power BI, modelagem de dados, testes e documentação.

Leia tudo e utilize estas informações para continuar o desenvolvimento.

1. QUEM SOU EU E COMO GOSTO DE TRABALHAR
   Sou estudante de Engenharia de Software, com foco em desenvolvimento web.

Tenho interesse em:

- React.
- JavaScript.
- Desenvolvimento frontend.
- Desenvolvimento backend.
- Banco de dados.
- Engenharia de Software.
- Análise de Dados.
- Python.
- Business Intelligence.
- Desenvolvimento de projetos profissionais para portfólio.
  Quero desenvolver aplicações reais e compreender como elas funcionam.
  1.1. Minha preferência de aprendizado
  Em projetos que estou desenvolvendo pessoalmente, gosto do método de ensino passo a passo.

Esse método funciona assim:

1. Você explica o conceito.
2. Explica por que ele existe.
3. Mostra quando devemos utilizá-lo.
4. Explica como funciona internamente.
5. Apresenta exemplos pequenos e claros.
6. Propõe uma atividade.
7. Eu penso e tento resolver.
8. Você analisa minha solução.
9. Explica detalhadamente meus acertos e erros.
10. Avançamos somente quando eu compreender a etapa.
    Não gosto de explicações superficiais seguidas de grandes blocos de código sem contextualização.

Prefiro entender os mecanismos internos, o fluxo dos dados, as responsabilidades de cada parte e as decisões arquiteturais.

Entretanto, existe uma decisão importante específica deste projeto:

Inicialmente, eu pretendia desenvolver o Flamengo Analytics em modo tutor, junto com o ChatGPT.

Posteriormente, decidi solicitar um prompt completo para que o Claude pudesse executar o desenvolvimento integral do sistema.

Portanto, distinga dois tipos de solicitação:

Quando eu pedir implementação completa: desenvolva os componentes e funcionalidades necessários, sem me obrigar a escrever tudo manualmente.

Quando eu pedir para aprender ou compreender alguma parte: utilize o método tutor detalhado, permitindo que eu raciocine, implemente e receba correções.

Não confunda essas duas modalidades.
1.2. Ambiente de desenvolvimento
Tenho interesse em trabalhar com:

- Windows 11.
- WSL com Ubuntu.
- Visual Studio Code ou ambiente equivalente.
- Git e GitHub.
- Node.js.
- Python.
- PostgreSQL.
- Docker.
  A documentação deve considerar preferencialmente Windows 11 com WSL Ubuntu.

2. COMO O PROJETO SURGIU
   A ideia original foi criar um projeto de Análise de Dados relacionado ao Flamengo.

Inicialmente, discutimos análises sobre o desempenho geral do time, envolvendo:

- Vitórias.
- Derrotas.
- Empates.
- Gols marcados.
- Gols sofridos.
- Desempenho em casa e fora.
- Aproveitamento.
- Comparações entre temporadas.
  Depois, tomei uma decisão definitiva:

O projeto será focado no desempenho individual dos jogadores do Flamengo, e não principalmente nos resultados gerais da equipe.

Passamos a estudar uma proposta de análise estatística dos atletas e discutimos indicadores individuais.

Foram consideradas diferentes temporadas, incluindo análises históricas.

O planejamento inicial contemplava a temporada inteira, mas a decisão mais recente e definitiva é analisar somente o primeiro turno do Campeonato Brasileiro Série A de 2026, rodadas 1 a 19, nas partidas disputadas pelo Flamengo. A restrição por rodada substitui o recorte anterior de temporada completa.

Essa definição permite um escopo acadêmico controlado, com avaliação rigorosa das estatísticas individuais no intervalo escolhido.

Posteriormente, pedi um roadmap completo e decidi utilizar React, JavaScript e Power BI, além de todas as tecnologias necessárias.

Em seguida, foram produzidas duas especificações extensas:

- Prompt Mestre inicial do Flamengo Analytics.
- Prompt Mestre 2.0, com requisitos mais avançados.
  A presente transferência consolida essas decisões.

3. IDENTIDADE DO PROJETO
   Nome oficial:

FLAMENGO ANALYTICS

Nome completo:

Flamengo Analytics — Plataforma de Inteligência e Análise de Desempenho Esportivo.

Tema acadêmico:

Análise Estatística do Desempenho Individual dos Jogadores do Flamengo no Primeiro Turno do Campeonato Brasileiro Série A de 2026.

Clube analisado:

Clube de Regatas do Flamengo.

Modalidade:

Futebol masculino profissional.

Competição:

Campeonato Brasileiro Série A.

Temporada principal: 2026.
Recorte temporal/competitivo obrigatório:

Primeiro turno, rodadas 1 a 19 do Brasileirão Série A de 2026, consideradas pela rodada oficial de cada partida do Flamengo. Não incluir partidas de outras competições, rodadas 20 a 38 ou dados de outros clubes. Partidas adiadas permanecem vinculadas à rodada original, independentemente da data em que forem realizadas.

Unidade de análise:

Jogadores.

Tipo de projeto:

Análise de Dados, Engenharia de Dados, Desenvolvimento Full Stack e Business Intelligence.

Objetivo de entrega:

Uma plataforma web profissional, um dashboard Power BI, análises estatísticas, documentação técnica e documentação acadêmica.

O projeto deverá ser adequado para apresentação acadêmica e portfólio profissional. 4. PROBLEMA DE PESQUISA
A pergunta central será:

Quais jogadores do Flamengo apresentaram os melhores indicadores de desempenho nas rodadas 1 a 19 do Campeonato Brasileiro Série A de 2026, considerando produção ofensiva, contribuição defensiva, participação nas partidas e eficiência estatística?

A plataforma deverá ajudar a responder essa pergunta utilizando dados reais.

Outras perguntas importantes:

1. Quem marcou mais gols?
2. Quem forneceu mais assistências?
3. Quem participou diretamente de mais gols?
4. Quais jogadores tiveram maior minutagem?
5. Quem apresentou maior eficiência ofensiva?
6. Quais jogadores produziram mais gols por 90 minutos?
7. Quais atletas tiveram maior número de assistências por 90 minutos?
8. Quais foram os principais destaques por posição?
9. Quais jogadores contribuíram defensivamente?
10. Qual é a relação entre tempo em campo e produção ofensiva?
11. Quais estatísticas diferenciam jogadores da mesma posição?
12. Como a interpretação muda quando aplicamos filtros de minutagem mínima?
    As respostas devem ser calculadas usando dados reais, jamais inventadas.
13. OBJETIVOS DO PROJETO
    Objetivo geral
    Desenvolver uma plataforma de análise de dados que permita avaliar estatisticamente o desempenho individual dos jogadores do Flamengo exclusivamente no primeiro turno (rodadas 1 a 19) do Campeonato Brasileiro Série A de 2026 por meio de indicadores, gráficos, dashboards e ferramentas de comparação.
    Objetivos específicos

- Obter uma base confiável de estatísticas individuais.
- Organizar os dados coletados.
- Realizar limpeza e transformação.
- Criar indicadores estatísticos.
- Implementar consultas analíticas.
- Comparar jogadores.
- Identificar artilheiros e líderes de assistências.
- Analisar eficiência por 90 minutos.
- Comparar atletas por posição.
- Analisar desempenho ofensivo e defensivo.
- Criar gráficos interativos.
- Desenvolver um dashboard com React.
- Criar um relatório no Power BI.
- Elaborar análises exploratórias em Python.
- Produzir conclusões fundamentadas.
- Documentar toda a metodologia.
- Disponibilizar um projeto reproduzível.

6. TECNOLOGIAS DEFINIDAS
   O projeto utilizará as seguintes tecnologias, conforme as necessidades de cada camada.
   Frontend

- React.
- JavaScript ES6+.
- Vite.
- Tailwind CSS.
- React Router.
- Recharts.
- TanStack Query.
- Fetch API ou Axios.
- Lucide React.
  Bibliotecas adicionais poderão ser incluídas quando houver justificativa.

Não quero migrar para TypeScript sem necessidade.
Backend

- Node.js.
- Express.js.
- API REST.
- PostgreSQL.
- Biblioteca de acesso ao banco.
- Sistema de migrações.
- Zod.
- Dotenv.
- Helmet.
- CORS.
- Logging estruturado.
  Engenharia de Dados
- Python.
- Pandas.
- NumPy.
- Jupyter Notebook.
- Matplotlib.
- Seaborn.
- SQL.
- CSV e/ou Parquet.
- Pytest.
  Business Intelligence
- Power BI Desktop.
- Power Query.
- DAX.
- Modelagem dimensional.
- Medidas calculadas.
- Gráficos interativos.
- Segmentações.
- Relacionamentos entre tabelas.
  Infraestrutura e qualidade
- Git.
- GitHub.
- Docker.
- Docker Compose.
- ESLint.
- Prettier.
- GitHub Actions.
- Testes automatizados.
- Documentação Markdown.
  Não incluir ferramentas desnecessárias apenas para aumentar artificialmente a complexidade.

7. ARQUITETURA GERAL
   A arquitetura planejada segue este fluxo:

FONTE DE DADOS REAIS
↓
COLETA COM PYTHON
↓
DADOS BRUTOS — BRONZE
↓
TRATAMENTO — SILVER
↓
DADOS ANALÍTICOS — GOLD
↓
POSTGRESQL
↓
API REST NODE.JS
↓
FRONTEND REACT
↓
DASHBOARD INTERATIVO

Paralelamente:

DADOS ANALÍTICOS — GOLD
↓
MODELO DIMENSIONAL
↓
POWER BI
↓
DASHBOARD DE BUSINESS INTELLIGENCE

O React e o Power BI deverão utilizar a mesma base lógica de indicadores, mesmo que possuam apresentações diferentes.

A camada Gold deverá funcionar como fonte confiável para a análise.
7.1. REGRA INEGOCIÁVEL — CLEAN ARCHITECTURE
Toda funcionalidade implementada deve seguir Clean Architecture desde sua primeira versão. Não escreva código que viole essa arquitetura, mesmo para protótipos, atalhos ou entregas parciais.

A organização deve respeitar a Regra de Dependência: detalhes técnicos dependem de contratos e políticas internas, nunca o contrário. O núcleo de negócio não deve importar frameworks, bibliotecas de interface, HTTP ou bancos de dados.
Backend Node.js/Express
Separar responsabilidades em:

- Domínio (domain): entidades, regras e políticas de negócio, invariantes e objetos de valor quando necessários. Não depender de Express, PostgreSQL, bibliotecas de infraestrutura ou controladores.
- Aplicação (application): casos de uso, orquestração de operações, contratos/portas para repositórios e serviços externos, com dependências explícitas.
- Adaptadores de interface (interfaces/adapters): controllers HTTP, validação de entrada, serialização, mapeamento de dados e transformação de erros em respostas HTTP.
- Infraestrutura (infrastructure): implementações de repositórios, PostgreSQL, configurações, bibliotecas externas, acesso a arquivos e integrações.
  Obrigatório:
- Rotas e controllers recebem a requisição, validam e delegam aos casos de uso, sem conter regras de negócio ou SQL.
- Casos de uso dependem de interfaces/contratos, não de implementações concretas de PostgreSQL, Express ou clientes HTTP.
- Repositórios concretos executam a persistência, não definem regras do domínio.
- Injeção de dependências/composição no ponto de entrada da aplicação, sem criar um framework de injeção desnecessário.
- DTOs ou mapeadores quando necessários para impedir que detalhes do banco e do transporte vazem para o domínio.
- Validações de formato na borda do sistema; validações e invariantes de negócio no núcleo apropriado.
- Tratamento consistente de erros sem vazar detalhes de infraestrutura.
  Frontend React/JavaScript
  Respeitar os mesmos princípios com uma adaptação prática ao frontend:
- Domínio: modelos, regras de cálculo e validações independentes de React e da interface.
- Aplicação: casos de uso, operações e contratos necessários ao fluxo da funcionalidade.
- Infraestrutura: clientes HTTP, implementação dos gateways e adaptação dos dados externos.
- Apresentação: páginas, componentes, hooks voltados à interface, estados de visualização, acessibilidade e interação.
  Componentes de interface não devem executar consultas diretamente no banco, concentrar regras analíticas complexas ou misturar renderização com infraestrutura. O uso de TanStack Query, Recharts e outras bibliotecas deve permanecer nas camadas adequadas. Organizar preferencialmente por funcionalidade sem duplicar camadas ou criar abstrações inúteis.
  Engenharia de Dados com Python
  Aplicar as fronteiras de Clean Architecture ao pipeline:
- Acesso à fonte, arquivos, APIs e PostgreSQL nas camadas de infraestrutura/adaptadores.
- Casos de uso de ingestão, transformação, validação, agregação e exportação na aplicação.
- Fórmulas estatísticas, regras de qualidade e políticas analíticas em módulos independentes e testáveis.
- Manter Bronze, Silver e Gold como estágios de dados, não como substitutos das camadas de software.
- O núcleo analítico não deve depender de um coletor específico ou de caminhos fixos de arquivos.
- Os notebooks podem consumir os módulos existentes, sem duplicar regras de cálculo.
  Power BI e integração
  Manter separação entre dados Gold, modelo dimensional, medidas DAX e apresentação visual. Garantir as mesmas definições de indicadores em Python, SQL, API, React e Power BI, com testes de consistência.
  Critérios obrigatórios de implementação

1. Antes de criar ou alterar uma funcionalidade, identificar a regra de negócio, o caso de uso, a interface de entrada e a infraestrutura envolvida.
2. Definir as dependências na direção correta antes de escrever código.
3. Se a estrutura existente violar Clean Architecture, ajustar as fronteiras afetadas sem realizar reescritas desnecessárias ou causar regressões.
4. Não criar apenas pastas com nomes de camadas: respeitar efetivamente as responsabilidades e os imports.
5. Não permitir dependência circular, regras de negócio nos controllers ou detalhes de persistência no domínio.
6. Testar casos de uso e regras de negócio isoladamente, além dos testes de integração nas bordas.
7. Se não for possível implementar corretamente dentro dessa arquitetura, não entregar um atalho fora do padrão. Explicar a limitação e a mudança estrutural necessária.
8. A aplicação de Clean Architecture não autoriza complexidade artificial: evitar classes, interfaces simuladas e abstrações sem uso real, especialmente em JavaScript.
   7.2. REGRA INEGOCIÁVEL — CÓDIGO SEM COMENTÁRIOS
   Não inserir comentários no código gerado, alterado ou entregue.

- Não utilizar comentários de linha, de bloco, comentários JSX, CSS, SQL ou Python.
- Não inserir cabeçalhos explicativos nos arquivos de código, comentários TODO/FIXME, JSDoc explicativo ou docstrings usadas como comentários.
- Utilizar nomes autoexplicativos, funções pequenas, responsabilidades claras e testes para comunicar intenção.
- Explicar decisões técnicas na resposta ao usuário e em arquivos Markdown como README.md, ARCHITECTURE.md e DECISIONS.md.
- Manter a documentação metodológica e acadêmica exigida, inclusive células Markdown dos notebooks; a proibição é de comentários dentro do código, não de documentação separada.
- Antes de finalizar qualquer implementação, revisar os arquivos alterados e remover comentários introduzidos.
- Não remover comentários antigos de partes não relacionadas à tarefa, salvo autorização para limpeza geral; entretanto, não adicionar nenhum novo comentário.

8. COLETA DE DADOS
   Uma decisão muito importante:

O sistema não poderá utilizar números esportivos inventados para representar resultados reais.

As estatísticas precisam ser provenientes de fontes confiáveis e verificáveis.

Fontes inicialmente consideradas:

- FBref.
- Football-Data.org.
- Datasets esportivos públicos.
- GitHub.
- APIs esportivas documentadas.
- Bases acadêmicas ou institucionais.
  O FBref foi sugerido como possível fonte de estatísticas individuais de 2026, mas a coleta só será adequada ao objetivo se permitir isolar comprovadamente as rodadas 1 a 19.

Também discutimos bases históricas do Campeonato Brasileiro.

Entretanto, ainda é necessário validar efetivamente a disponibilidade, as permissões de uso, a cobertura do primeiro turno de 2026 e a granularidade dos dados por partida ou por rodada, sem assumir cobertura comprovada.

\*\*Não considere a fonte confirmada apenas porque ela foi mencionada em uma conversa anterior.

Se a fonte mostrar estatísticas somente da temporada completa, considerá-la inadequada como fonte isolada do primeiro turno, ainda que seja confiável para outros usos.\*\*
8.1. Dados desejados

- Identificador do jogador.
- Nome.
- Posição.
- Clube.
- Temporada.
- Competição.
- Partidas disputadas.
- Titularidades.
- Minutos jogados.
- Gols.
- Assistências.
- Participações em gols.
- Finalizações.
- Finalizações no alvo.
- Passes tentados.
- Passes corretos.
- Precisão de passes.
- Desarmes.
- Interceptações.
- Cortes.
- Bloqueios.
- Cartões amarelos.
- Cartões vermelhos.
- Gols esperados (xG), quando disponíveis.
- Assistências esperadas (xA), quando disponíveis.
  Não presumir que todos esses indicadores estarão disponíveis.
  8.2. Matriz de disponibilidade
  Antes da implementação definitiva dos gráficos, criar uma matriz informando:
- Indicador.
- Fonte.
- Disponibilidade.
- Granularidade.
- Unidade.
- Limitações.
- Permissão de uso.
- Método de coleta.
  8.3. Regras da coleta
- Respeitar termos de uso.
- Não contornar bloqueios.
- Não realizar scraping proibido.
- Não inventar APIs.
- Registrar URLs.
- Registrar datas de coleta.
- Preservar dados originais.
- Criar método reproduzível.
- Não confundir dados agregados com dados por partida.
- Não misturar competições.
- Evitar atribuir ao Flamengo números obtidos por um atleta em outro clube.
  Se uma métrica não puder ser obtida legitimamente, documentar sua indisponibilidade.
  8.4. Filtragem obrigatória do primeiro turno de 2026

1. Verificar uma lista confiável de partidas do Flamengo no Brasileirão Série A 2026, associando cada partida ao número oficial da rodada.
2. Incluir no conjunto analítico somente partidas com competição Série A, temporada 2026, clube Flamengo e rodada entre 1 e 19.
3. Tratar jogos adiados pela rodada oficial, não pela posição cronológica no calendário; não confundir “primeiros 19 jogos disputados” com “rodadas 1 a 19”.
4. Para jogadores que passaram por outros clubes, considerar exclusivamente as aparições pelo Flamengo nessas partidas.
5. Integrar estatísticas individuais a partidas verificadas por identificadores; rejeitar registros ambíguos em vez de adivinhar correspondências pelo nome.
6. Não subtrair totais de temporada sem possuir dados confiáveis de cada subconjunto. Não atribuir disponibilidade por partida a uma fonte que só apresenta agregados anuais.
7. Guardar metadados de procedência, identificador da partida, rodada, data real do jogo, data de coleta e cobertura por métrica.
8. Checar o total de partidas esperadas e observadas, com atenção especial aos jogos adiados, cancelados ou sem cobertura estatística.
9. Implementar testes que garantam a exclusão de rodadas 20 a 38, outras competições, anos diferentes e jogadores atuando por outro clube.
10. Manter relatórios, endpoints, gráficos, notebooks, Power BI e exportações coerentes com o mesmo filtro.
11. PIPELINE DE DADOS
    O pipeline deverá ser desenvolvido em Python.

Utilizar três camadas.
Bronze
Armazenar dados originais sem alterações.
Silver
Executar:

- Limpeza.
- Normalização.
- Conversão de tipos.
- Tratamento de valores ausentes.
- Padronização de posições.
- Padronização de identificadores.
- Remoção de duplicidades indevidas.
- Validação do recorte.
- Identificação de registros inconsistentes.
  Gold
  Gerar conjuntos de dados específicos para:
- Dashboard geral.
- Ranking de gols.
- Ranking de assistências.
- Participações em gols.
- Eficiência por 90 minutos.
- Análise ofensiva.
- Análise defensiva.
- Comparação por posição.
- Comparador de jogadores.
- Power BI.
  O pipeline precisa ser reproduzível e idempotente.

Executá-lo duas vezes não deve duplicar os dados.
9.1. Relatório de qualidade
Criar um documento com:

- Registros originais.
- Registros válidos.
- Registros rejeitados.
- Quantidade de jogadores.
- Campos ausentes.
- Duplicidades.
- Correções realizadas.
- Problemas identificados.
- Cobertura estatística.
- Cobertura das rodadas 1 a 19, com lista de partidas esperadas, coletadas, pendentes e sem dados.
- Verificação explícita de exclusão de jogos do segundo turno e de outras competições.
  Preservar a rastreabilidade até a fonte.

10. BANCO DE DADOS
    Utilizar PostgreSQL.

O modelo deverá ser coerente com a granularidade efetivamente disponível.

Entidades inicialmente consideradas:

- players.
- teams.
- seasons.
- competitions.
- matches.
- player_match_stats.
- player_season_stats.
- data_sources.
- import_runs.
  Granularidade do recorte: preservar identificador de partida, temporada, competição e rodada oficial nas tabelas necessárias. O total por atleta no primeiro turno deve ser derivado de observações vinculadas às partidas elegíveis, respeitando o nível real de detalhe obtido.

Não criar registros fictícios para preencher tabelas.

Se uma fonte oferecer apenas estatísticas agregadas da temporada inteira, não utilizá-las como números do primeiro turno. Buscar outra fonte que permita identificar o desempenho das rodadas 1 a 19; se não existir, registrar a limitação e não exibir a métrica como verificada. Não fabricar eventos individuais.

Implementar:

- Chaves primárias.
- Chaves estrangeiras.
- Restrições.
- Índices.
- Migrações.
- Validações de integridade.
- Scripts de importação.
  Não depender exclusivamente do nome do jogador como chave única.

11. INDICADORES ESTATÍSTICOS
    Este é um dos pontos mais importantes do projeto.

Regra comum: todos os totais, rankings, médias, taxas, denominadores e comparações referem-se apenas às atuações pelo Flamengo nas rodadas 1 a 19 de 2026. Informar cobertura e disponibilidade de cada indicador antes de comparar atletas.
Indicadores básicos

- Número de jogadores.
- Gols.
- Assistências.
- Participações em gols.
- Partidas.
- Titularidades.
- Minutos jogados.
- Cartões.
- Finalizações, quando disponíveis.
- Estatísticas defensivas, quando disponíveis.
  Indicadores de eficiência
  Participações em gols:

G+A = Gols + Assistências.

Gols por 90 minutos:

G90 = (Gols × 90) / Minutos.

Assistências por 90 minutos:

A90 = (Assistências × 90) / Minutos.

Participações em gols por 90 minutos:

GA90 = ((Gols + Assistências) × 90) / Minutos.

Taxa de conversão:

Conversão = (Gols / Finalizações) × 100.

Precisão de passes:

Precisão = (Passes certos / Passes tentados) × 100.

As métricas avançadas só devem ser calculadas se existirem dados apropriados.
11.1. Tratamento de denominadores
Quando o denominador for zero ou estiver ausente, a métrica deverá ser tratada como indisponível.

Não substituir automaticamente valores ausentes por zero.
11.2. Minutagem mínima
Precisamos evitar que um jogador com poucos minutos apareça artificialmente como líder de eficiência.

Implementar filtros como:

- Todos os jogadores.
- Pelo menos 450 minutos.
- Pelo menos 900 minutos.
- Pelo menos 1.500 minutos.
- Valor personalizado, quando viável.
  11.3. Comparações
  Priorizar jogadores da mesma posição.

Se duas posições diferentes forem comparadas, mostrar aviso de contextualização.

Não criar um índice geral de qualidade sem uma metodologia rigorosamente explicada.
11.4. Regras estatísticas

- Distinguir volume e eficiência.
- Evitar médias inadequadas de percentuais.
- Calcular taxas agregadas pelos seus componentes.
- Não misturar campeonatos.
- Não tirar conclusões causais de correlações simples.
- Não inventar xG e xA.
- Informar limitações da amostragem.
- Definir a população utilizada em percentis.
- Considerar diferenças de responsabilidade entre posições.
- Mostrar a unidade de cada métrica.

12. PRODUTO A — DASHBOARD REACT
    O dashboard web será uma parte central do projeto.

Quero uma aplicação profissional, não apenas uma página contendo gráficos isolados.
12.1. Identidade visual
Utilizar cores inspiradas no Flamengo:

- Vermelho: aproximadamente #C8102E.
- Preto: aproximadamente #111111.
- Branco: #FFFFFF.
- Cinzas neutros.
  Fonte preferencial: Inter.

Características visuais:

- Design premium.
- Estética de plataforma esportiva.
- Sidebar.
- Header.
- Cards de indicadores.
- Gráficos profissionais.
- Espaçamento consistente.
- Bordas e sombras discretas.
- Boa tipografia.
- Layout responsivo.
- Microinterações sutis.
- Estados de loading.
- Tratamento de erros.
- Tooltips informativos.
- Acessibilidade.
  Não utilizar logos ou imagens protegidas sem verificar permissões.
  12.2. Design System
  Componentes inicialmente definidos:
- AppShell.
- Sidebar.
- Header.
- PageHeader.
- StatCard.
- PlayerCard.
- PlayerTable.
- RankingChart.
- ChartContainer.
- PlayerSelector.
- PositionFilter.
- MinutesFilter.
- ComparisonChart.
- MetricTooltip.
- LoadingSkeleton.
- EmptyState.
- ErrorState.
- ExportButton.
- SourceBadge.
- Breadcrumbs.
  Não criar abstrações desnecessárias.

Priorizar componentes claros, reutilizáveis e realmente utilizados. 13. PÁGINAS DO SISTEMA
Página 1 — Dashboard Geral
Será a página inicial.

Exibir:

- Total de jogadores analisados.
- Total de gols.
- Total de assistências.
- Participações em gols.
- Principal artilheiro.
- Líder de assistências.
- Ranking de gols.
- Ranking de assistências.
- Ranking de participações em gols.
- Distribuição dos jogadores por posição.
- Distribuição de minutos.
- Eficiência por 90 minutos.
- Principais insights calculados.
  Todas as estatísticas devem vir da camada de dados real.
  Página 2 — Jogadores
  Criar tabela interativa.

Colunas:

- Jogador.
- Posição.
- Partidas.
- Titularidades.
- Minutos.
- Gols.
- Assistências.
- G+A.
- G90.
- A90.
- GA90.
  Funcionalidades:
- Pesquisar por nome.
- Filtrar por posição.
- Ordenar por estatística.
- Paginação.
- Selecionar atleta.
- Exportar CSV.
- Acessar perfil individual.
  Página 3 — Perfil do Jogador
  Apresentar:
- Nome.
- Posição.
- Temporada.
- Competição.
- Partidas.
- Minutos.
- Gols.
- Assistências.
- Participações em gols.
- Estatísticas ofensivas.
- Estatísticas defensivas disponíveis.
- Indicadores por 90.
- Comparação com jogadores da mesma posição.
- Informações sobre fonte e atualização.
  Utilizar fotografias somente quando houver direitos de uso apropriados.
  Página 4 — Comparador de Jogadores
  Permitir selecionar dois atletas.

Comparar:

- Gols.
- Assistências.
- Minutos.
- Partidas.
- G+A.
- G90.
- A90.
- GA90.
- Finalizações.
- Estatísticas defensivas disponíveis.
  Funcionalidades:
- Seletores independentes.
- Troca de jogadores.
- Barras comparativas.
- Diferenças absolutas.
- Diferenças relativas.
- Comparações por posição.
- Filtro de minutagem.
- Radar normalizado, se justificável.
- Aviso sobre comparações inadequadas.
- Compartilhamento por URL, como aprimoramento opcional.
  Página 5 — Análise Ofensiva
  Apresentar:
- Ranking de artilheiros.
- Ranking de assistências.
- Participações em gols.
- Gols por 90.
- Assistências por 90.
- Finalizações.
- Finalizações no alvo.
- Taxas de conversão, se disponíveis.
- Relação entre minutos e produção.
- Gráfico de dispersão.
  Página 6 — Análise Defensiva
  Apresentar, se a fonte permitir:
- Desarmes.
- Interceptações.
- Cortes.
- Bloqueios.
- Duelos.
- Eficiência defensiva por 90 minutos.
- Comparação de defensores.
- Rankings por posição.
  Não apresentar estatísticas defensivas fictícias.
  Página 7 — Análise Estatística
  Área mais técnica do projeto.

Apresentar:

- Histogramas.
- Distribuições.
- Médias.
- Medianas.
- Quartis.
- Gráficos de dispersão.
- Valores extremos.
- Comparações entre posições.
- Relações entre indicadores.
- Interpretações.
  Cada gráfico deverá conter explicação clara.
  Página 8 — Power BI
  Criar área informativa ou integrada ao Power BI.

Exibir:

- Descrição do relatório.
- Acesso ao arquivo.
- Instruções de uso.
- Fonte de dados.
- Última atualização.
  A incorporação do Power BI na aplicação deverá respeitar licenças, URLs válidas e permissões de acesso.
  Página 9 — Metodologia
  Apresentar:
- Introdução.
- Problema de pesquisa.
- Objetivos.
- Fonte de dados.
- Processo de coleta.
- Limpeza.
- Fórmulas.
- Indicadores.
- Limitações.
- Referências.
- Data de atualização.

14. FILTROS AVANÇADOS
    Filtros planejados:

- Jogador.
- Posição.
- Temporada: 2026 (recorte fixo, sem extrapolar para outras temporadas).
- Rodadas oficiais: 1 a 19 (recorte fixo do primeiro turno).
- Minutagem mínima.
- Tipo de métrica.
- Ordenação.
- Top N.
  Requisitos:
- Aplicação real dos filtros.
- Atualização dos gráficos afetados.
- Consistência dos indicadores.
- Botão de limpar filtros.
- Estados de carregamento.
- Tratamento de filtros sem resultados.
- Debounce em buscas.
- Persistência pela URL, quando conveniente.
  Não implementar filtros apenas visuais que não alterem efetivamente os dados.

15. INSIGHTS AUTOMÁTICOS
    O dashboard poderá gerar observações usando regras determinísticas.

Exemplos:

- Jogador com mais gols.
- Jogador com mais assistências.
- Maior número de participações em gols.
- Jogador com maior minutagem.
- Líder de eficiência entre atletas com amostra mínima.
- Destaques por posição.
  Os insights precisam vir dos indicadores calculados.

Não utilizar frases genéricas desconectadas dos dados.

Não inventar justificativas ou explicações causais. 16. API REST
Endpoints inicialmente planejados:

GET /api/health

GET /api/players

GET /api/players/:id

GET /api/players/:id/stats

GET /api/dashboard/summary

GET /api/rankings/goals

GET /api/rankings/assists

GET /api/rankings/contributions

GET /api/analytics/offensive

GET /api/analytics/defensive

GET /api/analytics/positions

GET /api/analytics/distribution

GET /api/compare

GET /api/metadata

GET /api/data-quality

GET /api/exports/players

Essas são propostas de contratos. Ajustar conforme a arquitetura final.

Os endpoints, filtros, exports e caches devem garantir escopo fixo Brasileirão 2026, rodadas 1 a 19, inclusive quando o cliente omitir parâmetros. Não permitir que um filtro inadvertidamente injete partidas fora do recorte. A resposta de metadados deve explicitar temporadas, rodadas e cobertura da fonte.

Requisitos:

- Validação com Zod.
- Paginação.
- Ordenação.
- Filtros.
- Tratamento de erros.
- Consultas parametrizadas.
- Logging.
- Respostas JSON consistentes.
- Documentação OpenAPI.
- Proteção contra SQL injection.
- Limites de requisição.
- CORS adequado.
  A API deverá fornecer valores numéricos não formatados.

O React ficará responsável pela formatação para português brasileiro.

Não há necessidade inicial de autenticação ou cadastro de usuários.

A plataforma será pública e analítica, sem informações pessoais privadas. 17. PRODUTO B — POWER BI
Além da aplicação React, quero um relatório Power BI profissional.

O Power BI não substitui o dashboard web.

Os dois são entregáveis complementares.

O modelo Power BI deve ser filtrado exclusivamente para a Série A 2026, primeiro turno (rodadas 1 a 19), e conservar definições e cobertura compatíveis com a camada Gold. Dados de temporada inteira não devem alimentar visualizações rotuladas como primeiro turno.
17.1. Modelo dimensional
Tabelas dimensionais possíveis:

- DimJogador.
- DimPosicao.
- DimTemporada.
- DimCompeticao.
- DimEquipe.
- DimData, quando aplicável.
  Tabelas fato possíveis:
- FatoEstatisticasJogadorTemporada.
- FatoEstatisticasJogadorPartida, se houver dados por partida.
  A estrutura final deve respeitar a granularidade dos dados.
  17.2. Medidas DAX
  Criar:
- Total de Gols.
- Total de Assistências.
- Total de Minutos.
- Participações em Gols.
- Gols por 90.
- Assistências por 90.
- Participações por 90.
- Taxa de Conversão.
- Precisão de Passes.
- Rankings.
- Medidas comparativas.
  Utilizar DIVIDE para cálculos com denominadores.

Evitar resultados inconsistentes entre Python, SQL, API, React e Power BI.
17.3. Páginas do Power BI
Visão Geral

KPIs, rankings e filtros.

Desempenho Ofensivo

Gols, assistências, produtividade, eficiência e dispersões.

Desempenho Defensivo

Desarmes, interceptações e análises por posição, conforme disponibilidade.

Comparação de Jogadores

Seletores independentes e comparações.

Eficiência Estatística

Indicadores por 90 minutos e filtros de minutagem.
17.4. Recursos do Power BI

- Cards.
- Gráficos de barras.
- Gráficos de dispersão.
- Tabelas.
- Matrizes.
- Segmentadores.
- Tooltips.
- Drill-through quando pertinente.
- Títulos dinâmicos.
- Rankings.
- Filtros cruzados.
- Formatação condicional.
- Tema personalizado.
  17.5. Arquivos Power BI
  Entregar um arquivo nativo funcional, como PBIP ou PBIX, se o ambiente permitir.

Caso contrário, entregar:

- Modelo dimensional.
- Dados Gold.
- Código DAX.
- Consultas Power Query.
- Tema JSON.
- Documentação das medidas.
- Orientações detalhadas de montagem.
- Procedimento de atualização.
  Nunca afirmar que um arquivo Power BI válido foi criado sem realmente tê-lo produzido e verificado.

18. ANÁLISE EXPLORATÓRIA COM PYTHON
    Criar notebooks, como:

01_data_understanding.ipynb

02_data_cleaning.ipynb

03_offensive_analysis.ipynb

04_defensive_analysis.ipynb

05_player_comparison.ipynb

06_statistical_insights.ipynb

Cada notebook deve conter:

- Pergunta.
- Base utilizada.
- Código.
- Transformações.
- Gráficos.
- Resultados.
- Interpretação.
- Limitações.
  Análises desejadas:
- Distribuição de gols.
- Distribuição de assistências.
- Relação entre minutos e produção.
- Comparações por posição.
- Eficiência ofensiva.
- Indicadores defensivos.
- Médias e medianas.
- Distribuições e valores extremos.
- Destaques estatísticos.
  Utilizar apenas análises que a fonte permita.

19. EXPORTAÇÕES
    Funcionalidades desejadas:

Obrigatória:

- Exportar tabelas filtradas para CSV.
  Importantes, quando viáveis:
- Exportação Excel.
- Exportação de gráficos PNG.
- Relatórios PDF.
- Download de dados analíticos permitidos.
  Toda exportação deverá respeitar os filtros selecionados.

Não distribuir dados de terceiros quando a licença não permitir. 20. RESPONSIVIDADE E UX
O projeto precisa funcionar em:

- Desktop.
- Notebook.
- Tablet.
- Smartphone.
  Requisitos:
- Sidebar adaptativa.
- Gráficos responsivos.
- Cards flexíveis.
- Tabelas com rolagem adequada.
- Navegação acessível.
- Foco visível.
- Estados de carregamento.
- Mensagens de erro.
- Empty states.
- Indicadores explicados.
- Contraste apropriado.
- Preferência por movimento reduzido.
  O design deverá priorizar clareza estatística e não apenas aparência.

21. SEGURANÇA
    Implementar:

- Variáveis de ambiente.
- .env.example.
- Não versionar credenciais.
- Validação de entradas.
- Queries parametrizadas.
- Tratamento de erros.
- Helmet.
- CORS.
- Limites de paginação.
- Proteção básica contra abuso.
- Dependências mantidas em versões compatíveis.
- Não expor mensagens internas do banco.
  Não criar autenticação desnecessária.

Não utilizar segredos dentro do frontend. 22. PERFORMANCE
Frontend:

- Lazy loading quando necessário.
- Cache de requisições.
- Evitar renderizações redundantes.
- Componentes reutilizáveis.
- Otimização de tabelas e gráficos.
  Backend:
- Consultas eficientes.
- Paginação.
- Índices.
- Filtros corretos.
- Evitar consultas duplicadas.
  Banco:
- Restrições.
- Índices apropriados.
- Integridade referencial.
  Otimizações devem ser justificadas por necessidades reais.

23. ESTRUTURA DO PROJETO
    Estrutura de referência revisada para atender à Clean Architecture:
    flamengo-analytics/
    ├── AGENTS.md
    ├── frontend/
    │ ├── public/
    │ └── src/
    │ ├── app/
    │ ├── features/
    │ │ └── [funcionalidade]/
    │ │ ├── domain/
    │ │ ├── application/
    │ │ ├── infrastructure/
    │ │ └── presentation/
    │ ├── shared/
    │ └── tests/
    ├── backend/
    │ ├── src/
    │ │ ├── domain/
    │ │ ├── application/
    │ │ │ ├── use-cases/
    │ │ │ └── ports/
    │ │ ├── interfaces/
    │ │ │ └── http/
    │ │ ├── infrastructure/
    │ │ │ ├── persistence/
    │ │ │ └── config/
    │ │ └── main/
    │ ├── migrations/
    │ └── tests/
    ├── pipeline/
    │ ├── domain/
    │ ├── application/
    │ ├── adapters/
    │ ├── infrastructure/
    │ └── tests/
    ├── data/
    │ ├── raw/
    │ ├── processed/
    │ ├── analytics/
    │ └── metadata/
    ├── notebooks/
    ├── database/
    ├── powerbi/
    │ ├── data/
    │ ├── dax/
    │ ├── power-query/
    │ ├── theme/
    │ └── model/
    ├── docs/
    │ ├── FLAMENGO_ANALYTICS_CONTEXT.md
    │ ├── architecture/
    │ ├── methodology/
    │ ├── academic/
    │ ├── api/
    │ └── data-dictionary/
    ├── scripts/
    ├── .github/workflows/
    ├── docker-compose.yml
    ├── .env.example
    ├── .gitignore
    ├── README.md
    └── LICENSE
    Esta estrutura é uma referência de separação de responsabilidades, não uma exigência de criar todos os diretórios antecipadamente. A estrutura concreta deve refletir funcionalidades reais, respeitar as dependências da Clean Architecture e evitar fragmentação excessiva.

O AGENTS.md contém as regras permanentes do agente; docs/FLAMENGO_ANALYTICS_CONTEXT.md contém o escopo e o planejamento integral. Ambos devem ser consultados durante a implementação no Codex. 24. TESTES
Testes do recorte de primeiro turno

- A inclusão depende da rodada oficial (1 a 19), e não da data cronológica.
- Partidas adiadas da rodada 1 a 19 continuam elegíveis quando os dados forem válidos.
- Rodadas 20 a 38 e partidas de competições diferentes são excluídas.
- Estatísticas de atletas por outros clubes são excluídas.
- Fontes somente com números da temporada inteira não são rotuladas como primeiro turno.
- Relatórios, API, Gold, React, CSV e Power BI preservam o mesmo universo observacional.
  Testes do pipeline
- Normalização.
- Conversão de tipos.
- Validação de dados.
- Valores ausentes.
- Duplicidades.
- Regras de negócio.
- Fórmulas.
- Idempotência.
  Testes do backend
- Endpoints.
- Filtros.
- Ordenação.
- Paginação.
- Rankings.
- Comparador.
- Tratamento de erros.
- Exportação.
  Testes do frontend
- Navegação.
- Renderização.
- Pesquisa.
- Filtros.
- Ordenação.
- Comparação.
- Loading.
- Erros.
- Estados vazios.
  Testes de integração
  Verificar consistência entre:
- Python.
- PostgreSQL.
- API.
- React.
- Power BI.
  Utilizar fixtures de teste claramente separadas dos dados reais.

Executar lint, build e testes antes da entrega.

Não declarar sucesso em testes não executados. 25. DOCUMENTAÇÃO TÉCNICA
Arquivos planejados:

README.md

Instalação e execução do projeto.

PROJECT_PLAN.md

Planejamento e etapas.

STATUS.md

Progresso e pendências.

ARCHITECTURE.md

Arquitetura da plataforma.

DATA_DICTIONARY.md

Dicionário dos campos.

METRICS.md

Definição das métricas.

DATA_QUALITY.md

Relatório de qualidade.

DECISIONS.md

Registro de decisões arquiteturais.

TEST_REPORT.md

Resultados reais dos testes.

Documentação OpenAPI

Contratos da API.
README
Incluir:

- Introdução.
- Objetivos.
- Tecnologias.
- Arquitetura.
- Estrutura de pastas.
- Instalação.
- Configuração.
- Banco.
- Migrações.
- Pipeline.
- Backend.
- Frontend.
- Power BI.
- Testes.
- Fontes.
- Licenças.
- Limitações.
- Solução de problemas.
  Os comandos precisam corresponder aos scripts realmente implementados.

26. DOCUMENTAÇÃO ACADÊMICA
    Também quero que o sistema tenha material suficiente para apresentar o projeto academicamente.

Estrutura:

1. Introdução.
2. Problema de pesquisa.
3. Justificativa.
4. Objetivo geral.
5. Objetivos específicos.
6. Fundamentação teórica.
7. Metodologia.
8. Ferramentas e tecnologias.
9. Coleta de dados.
10. Tratamento e preparação.
11. Modelagem.
12. Indicadores estatísticos.
13. Desenvolvimento dos dashboards.
14. Análise de resultados.
15. Discussão.
16. Limitações.
17. Conclusão.
18. Referências.
    A fundamentação teórica poderá abordar:

- Ciência de Dados.
- Estatística Descritiva.
- Business Intelligence.
- Engenharia de Dados.
- Visualização de Dados.
- Dashboards.
- Análise de desempenho esportivo.
  Não inventar referências acadêmicas.

Utilizar referências reais e verificáveis.

Adequar o formato à ABNT quando necessário.

As conclusões devem ser construídas a partir dos resultados verdadeiros. 27. DEVOPS E GITHUB
Configurar quando viável:

- Docker Compose.
- PostgreSQL em contêiner.
- Scripts de inicialização.
- Variáveis de ambiente.
- Git.
- GitHub Actions.
- Lint.
- Testes.
- Build automatizado.
  Utilizar Conventional Commits.

Exemplos:

chore: initialize project structure

feat(data): implement ingestion pipeline

feat(db): create database schema

feat(api): add player statistics endpoints

feat(frontend): create main dashboard

feat(frontend): add player comparison

feat(powerbi): create analytical model

test: add statistical validation

docs: document methodology and results

Não publicar repositórios, realizar push ou contratar serviços sem minha autorização. 28. ROADMAP QUE DEFINIMOS
Originalmente definimos um roadmap simplificado de oito etapas:

Etapa 1 — Planejamento

Definir problema, perguntas, escopo e indicadores.

Etapa 2 — Coleta de dados

Encontrar e obter estatísticas reais.

Etapa 3 — Tratamento

Limpeza, padronização e validação.

Etapa 4 — Indicadores

Criar métricas e cálculos.

Etapa 5 — Análise exploratória

Descobrir padrões e interpretar dados.

Etapa 6 — Dashboard

Criar gráficos e visualizações.

Etapa 7 — Validação

Revisar indicadores e funcionalidades.

Etapa 8 — Documentação e apresentação

Produzir material final.

Depois, o roadmap foi expandido para dez fases de implementação profissional.

A versão mais completa é:

1. Pesquisa e descoberta.
2. Inicialização da arquitetura.
3. Engenharia de dados.
4. Modelagem e persistência.
5. Desenvolvimento da API.
6. Desenvolvimento React.
7. Desenvolvimento Power BI.
8. Análises estatísticas e documentação.
9. Testes e garantia de qualidade.
10. Entrega final.
    Utilize esse segundo roadmap como referência para implementação.
11. PRIORIZAÇÃO
    As funcionalidades foram classificadas em três níveis.
    P0 — Essenciais

- Fonte de dados real.
- Pipeline Python.
- Dados validados.
- PostgreSQL.
- API REST.
- Dashboard principal.
- Ranking.
- Lista de jogadores.
- Comparador básico.
- Indicadores estatísticos.
- Metodologia.
- Relatório Power BI central.
- Testes essenciais.
- README.
  P1 — Importantes
- Comparações por posição.
- Filtros avançados.
- Métricas por 90 minutos.
- Exportação CSV.
- Insights automáticos.
- Análises defensivas.
- Análise exploratória.
- Testes de integração.
  P2 — Opcionais
- Download de gráficos PNG.
- Exportação PDF.
- Compartilhamento por URL.
- Radar normalizado.
- Comparações históricas.
- Power BI integrado à plataforma web.
- Aprimoramentos extras de UX.
  As funcionalidades P2 não devem impedir a conclusão do núcleo funcional.

30. CRITÉRIOS DE CONCLUSÃO
    O projeto somente poderá ser declarado concluído quando os requisitos essenciais estiverem implementados e verificados.
    Dados

- Fonte validada com capacidade comprovada de distinguir rodadas 1 a 19 de 2026.
- Coleta legítima.
- Recorte correto.
- Pipeline reproduzível.
- Indicadores corretos.
- Relatório de qualidade.
  Backend
- Banco configurado.
- Migrações.
- API funcionando.
- Endpoints testados.
- Filtros funcionais.
- Erros tratados.
  Frontend
- React funcionando.
- Dashboard com dados reais.
- Rankings.
- Tabelas.
- Pesquisa.
- Filtros.
- Comparador.
- Perfis.
- Gráficos.
- Layout responsivo.
- Loading e erros.
  Power BI
- Base preparada.
- Modelo definido.
- Medidas implementadas.
- Relatório criado, quando tecnicamente possível.
- Procedimento de atualização.
- Indicadores consistentes.
  Qualidade
- Testes executados.
- Build executado.
- Lint executado.
- Problemas identificados.
- Correções aplicadas.
- Documentação completa.
  Se alguma entrega depender de ferramenta ou permissão indisponível, registrar a limitação com clareza.

31. COMO ESPERO QUE VOCÊ TRABALHE
    Não quero que você ignore o histórico e apresente um projeto completamente diferente.

Já decidimos o tema, o recorte principal, a direção tecnológica e as funcionalidades desejadas.

Ao receber uma tarefa:

1. Considere este contexto.
2. Identifique em qual fase do roadmap estamos.
3. Preserve as decisões anteriores.
4. Verifique as dependências técnicas.
5. Execute o que foi solicitado.
6. Explique decisões relevantes.
7. Não invente resultados.
8. Valide o que implementar.
9. Documente eventuais limitações.
10. Continue a partir do estado real do projeto.
11. Garanta a separação de responsabilidades e a regra de dependências da Clean Architecture em todos os arquivos criados ou alterados.
12. Não produza código com comentários; documente explicações fora do código.
    Quando eu pedir implementação completa, não entregue apenas um planejamento.

Quando eu pedir explicação, ensine detalhadamente.

Se eu enviar um código, arquivo, imagem ou resultado do Claude, analise o material efetivamente enviado antes de concluir o que está implementado. 32. O QUE JÁ FOI FEITO ATÉ AGORA
Esta seção é fundamental para evitar confusões.
Concluído no planejamento

- Definimos o tema.
- Escolhemos o Flamengo.
- Mudamos o foco para jogadores.
- Definimos o Brasileirão Série A de 2026, somente o primeiro turno (rodadas 1 a 19), como recorte definitivo, substituindo o antigo recorte de temporada completa.
- Definimos a pergunta principal da pesquisa.
- Listamos os indicadores desejados.
- Discutimos possíveis fontes.
- Definimos React e JavaScript.
- Escolhemos Python e Pandas para o processamento.
- Incluímos PostgreSQL.
- Incluímos Node.js e Express.
- Definimos o Power BI como segundo produto.
- Estruturamos as páginas do dashboard.
- Definimos filtros e comparações.
- Criamos um roadmap.
- Especificamos a arquitetura de dados.
- Definimos requisitos de qualidade.
- Definimos testes e documentação.
- Elaboramos prompts para o Claude realizar a implementação.
- Refinamos o prompt para uma especificação profissional.
  Ainda não comprovadamente executado neste histórico
- Criação do repositório real.
- Instalação das dependências.
- Validação definitiva da fonte de dados.
- Download efetivo do dataset.
- Implementação do pipeline.
- Criação do PostgreSQL.
- Desenvolvimento da API.
- Desenvolvimento do frontend.
- Construção do relatório Power BI.
- Execução dos notebooks.
- Execução de testes.
- Publicação do projeto.
  Não presuma que essas etapas já foram feitas.

As conversas anteriores forneceram especificações e planejamento, mas não comprovam uma implementação finalizada.

Se eu disponibilizar arquivos desenvolvidos posteriormente, utilize-os para atualizar o estado real do projeto. 33. HISTÓRICO DAS MINHAS DECISÕES
Para evitar que você me faça novamente perguntas já respondidas:

Quero analisar futebol?

Sim.

Qual clube?

Flamengo.

Time inteiro ou jogadores?

O foco principal são os jogadores.

Qual competição?

Campeonato Brasileiro Série A.

Qual temporada inicial?

2026, exclusivamente primeiro turno (rodadas 1 a 19).

Quero dashboard?

Sim.

Qual tecnologia para o dashboard web?

React e JavaScript.

Quero Power BI também?

Sim.

Quero banco de dados?

Sim, PostgreSQL.

Quero backend?

Sim, Node.js e Express.

Quero Python?

Sim, para coleta, limpeza e análise.

Quero gráficos?

Sim, profissionais e interativos.

Quero comparar jogadores?

Sim.

Quero analisar ofensivamente e defensivamente?

Sim, respeitando os dados disponíveis.

Quero documentação?

Sim, técnica e acadêmica.

Quero testes?

Sim.

Quero dados reais?

Obrigatoriamente.

Quero um projeto simples e incompleto?

Não. Quero uma plataforma funcional e profissional, construída por etapas bem planejadas.

Quero aprender como funciona?

Sim. Quando eu solicitar explicações, quero entender os conceitos e mecanismos internos.

Quero que o Claude possa fazer toda a implementação?

Sim. Essa foi uma decisão posterior ao planejamento inicial em modo tutor. 34. INFORMAÇÕES ADICIONAIS SOBRE MEU PERFIL
Tenho outros projetos e estudos relacionados à Engenharia de Software, incluindo desenvolvimento web com React, JavaScript e Tailwind CSS.

Em outro contexto, trabalho em um sistema financeiro chamado Kajufin, anteriormente denominado Zentro.

Esse é um projeto diferente do Flamengo Analytics.

Não misture o domínio financeiro do Kajufin com a análise esportiva do Flamengo.

Minha preferência geral é por organização de código clara, fácil de compreender, sem complexidade ou abstrações desnecessárias.

Também estudo modelagem de sistemas, UML e ferramentas de desenvolvimento.

Essas informações são úteis para adequar explicações e decisões técnicas ao meu nível de aprendizado, mas não alteram o escopo definido para o Flamengo Analytics. 35. INSTRUÇÕES PARA CONTINUAR ESTA CONVERSA
A partir de agora, assuma que recebeu o histórico consolidado do projeto Flamengo Analytics.

Não comece sugerindo outros temas.

Não me pergunte novamente se quero analisar jogadores ou resultados do time.

Não pergunte novamente qual temporada escolhi, salvo se eu solicitar uma mudança.

Não substitua React por outra tecnologia sem justificativa e minha autorização.

Não remova Power BI do escopo.

Não utilize estatísticas fictícias.

Não afirme que o desenvolvimento foi concluído.

Se o objetivo for continuar a implementação, use a arquitetura, os requisitos e o roadmap definidos aqui.

Não implemente funcionalidades fora da Clean Architecture e não inclua comentários no código. Essas duas condições são critérios de aceite obrigatórios.

Se o objetivo for avaliar o trabalho feito pelo Codex ou pelo Claude, compare o código e os artefatos com esta especificação, incluindo aderência à Clean Architecture e ausência de comentários no código.

Se o objetivo for ensinar, utilize o método tutor passo a passo.

Se o objetivo for melhorar o prompt para outra IA, preserve todos os requisitos essenciais e acrescente melhorias concretas, sem descaracterizar o projeto.
FORMATO PREFERIDO DAS RESPOSTAS
Utilize português brasileiro.

Seja técnico, organizado e didático.

Explique decisões arquiteturais de forma objetiva.

Ao apresentar código para aprendizado, explique:

- O que ele faz.
- Por que foi necessário.
- Como funciona internamente.
- Quais dados recebe.
- Quais dados devolve.
- Como se conecta às outras partes.
  Ao implementar uma funcionalidade completa, entregue os arquivos necessários e explique como executar e verificar.

Não utilize respostas vagas como "basta conectar à API" sem implementar ou descrever concretamente a integração solicitada.

Não utilize dados falsos para demonstrar resultados de produção. 36. INSTRUÇÃO FINAL
Você agora possui o contexto consolidado do meu projeto Flamengo Analytics e das decisões tomadas até este momento.

O objetivo é desenvolver uma plataforma profissional de análise estatística individual dos jogadores do Flamengo no primeiro turno (rodadas 1 a 19) do Campeonato Brasileiro Série A de 2026.

O projeto deve incluir:

- Engenharia de dados.
- Python e Pandas.
- PostgreSQL.
- API REST em Node.js.
- React com JavaScript.
- Tailwind CSS.
- Gráficos interativos.
- Indicadores estatísticos.
- Rankings.
- Comparações.
- Perfis individuais.
- Análise ofensiva.
- Análise defensiva.
- Análise exploratória.
- Power BI.
- Exportações.
- Testes.
- Documentação técnica.
- Documentação acadêmica.
- Processo de execução reproduzível.
  Considere todo esse histórico nas próximas mensagens.

Toda implementação futura deve obrigatoriamente respeitar Clean Architecture e entregar código sem comentários.

Não trate o projeto como uma ideia recém-sugerida.

Não reinicie decisões já tomadas.

Não invente progresso.

Não omita funcionalidades previamente definidas.

Ao concluir a leitura, apresente uma confirmação breve de que compreendeu o contexto, resuma o estado atual real do projeto e indique o próximo passo lógico com base no roadmap.

Depois disso, aguarde minha próxima instrução específica para implementar, revisar ou estudar qualquer etapa.

PROJETO: FLAMENGO ANALYTICS — JOGADORES DO FLAMENGO — PRIMEIRO TURNO DO BRASILEIRÃO SÉRIE A 2026 (RODADAS 1 A 19).
