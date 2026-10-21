# PROMPT DEFINITIVO — FLAMENGO ANALYTICS 2025

## PAPEL E OBJETIVO

Você é responsável por continuar, migrar e finalizar o repositório local existente **Flamengo Analytics** como projeto acadêmico para a disciplina de **Big Data e Análise de Dados**.

**Não comece do zero. Não produza apenas um plano: faça as alterações locais permitidas, integre as funcionalidades e valide o resultado.** Examine primeiro o estado real do repositório, pois relatórios anteriores não substituem verificação dos arquivos.

**Título oficial:** Flamengo Analytics — Análise Estatística e Comparativa do Desempenho do Flamengo no Campeonato Brasileiro Série A de 2025.

**Escopo definitivo:** desempenho **coletivo** do Flamengo no Brasileirão masculino Série A de 2025, durante as rodadas oficiais 1 a 38, com comparação entre o Flamengo e os outros 19 clubes. **Remova a análise individual de jogadores como requisito e fluxo principal.** Não misture jogadores, partidas de outras competições ou temporadas com o novo domínio.

## 1. LEITURA E DIAGNÓSTICO

Leia o `AGENTS.md`, o documento de contexto do projeto, o `README.md`, os arquivos de `docs/`, os contratos, migrações, testes, código do backend/frontend/pipeline, notebooks e artefatos do Power BI. Identifique o que já foi implementado, o que funciona, o que está inacabado e o que ainda pressupõe estatísticas individuais, 2026 ou apenas 19 rodadas. Registre as diferenças e migre com cuidado. Preserve o histórico das decisões anteriores sem deixar instruções contraditórias no escopo ativo. Atualize `AGENTS.md` e a documentação de contexto para que todas as instruções atuais apontem para 2025, 38 rodadas e análises coletivas. Não faça substituições cegas nem remova código sem entender suas dependências.

## 2. REGRAS INEGOCIÁVEIS

1. **Clean Architecture real e organização em camadas**: domínio independente, casos de uso/aplicação, portas/contratos, adaptadores/interfaces e infraestrutura; composição de dependências nas camadas externas. No frontend, separar apresentação, aplicação, domínio e acesso a dados conforme apropriado. No pipeline Python, manter transformação e validações independentes de leitura/escrita. Dependências apontam para dentro. Não criar camadas artificiais ou código duplicado.
2. **Código sem comentários**: não inserir comentários de linha, bloco, JSX, CSS, SQL ou docstrings explicativas. Usar nomes claros; documentar escolhas em Markdown. Preservar avisos de licença legalmente exigidos.
3. **Dados reais, gratuitos e rastreáveis**: nunca inventar partidas, placares, classificações, valores ou métricas na aplicação. Dados sintéticos só em testes isolados. Não afirmar que testes ou relatórios foram executados sem evidência.
4. **Sem Docker obrigatório, sem Hadoop obrigatório, sem PySpark obrigatório**. Priorizar execução local no Windows 11 com VS Code, Node, Python e PostgreSQL. PySpark pode permanecer opcional apenas se já houver justificativa, não sendo requisito de entrega.
5. **Preservar tecnologias existentes**: React + Vite + JavaScript + Tailwind/Recharts quando presentes, Node.js + Express, PostgreSQL, Python + Pandas + NumPy, Matplotlib, Seaborn e Power BI. Não migrar para TypeScript nem trocar frameworks sem autorização.
6. Não efetuar commits, push, publicação, compras, cadastros externos, limpeza destrutiva ou mudanças em bancos pessoais sem autorização. Verificar o banco de destino antes das migrações.

## 3. DADOS E PROVENIÊNCIA

Priorize a fonte aberta `https://github.com/openfootball/football.json/blob/master/2025/br.1.json` e confirme a licença aplicável no repositório. A base foi anteriormente identificada com 380 partidas, 38 rodadas, 20 clubes e 38 partidas do Flamengo; **audite novamente esses números sobre o arquivo efetivamente importado**, sem assumir que já está íntegro no banco.

Validar:

- Exatamente 38 rodadas oficiais, 10 partidas por rodada e 380 jogos únicos, caso a fonte corresponda ao calendário final completo.
- Exatamente 20 clubes, cada um com 38 jogos, e o Flamengo com 38 jogos, sujeitos à confirmação documental.
- Rodada oficial preservada em partidas adiadas; datas não substituem número da rodada.
- Identificação consistente de mandante, visitante, data, placar e competição.
- Ausência de jogos duplicados, equipes inexistentes, partidas sem placar ou combinações impossíveis.
- Nomes e IDs canônicos dos clubes; IDs internos diferentes de IDs externos.
- Confrontar amostra e totais com referência oficial confiável, documentando divergências.
- Registrar URL, licença, data de obtenção, checksum/hash, cobertura e transformações.

Resultados de futebol só permitem inferir métricas derivadas de **jogo, resultado e placar**. Não inventar posse, finalizações, escanteios, cartões, xG, desarmes, assistências ou desempenho individual. Se a validação falhar, sinalizar claramente no sistema, não inserir números fictícios.

## 4. BIG DATA E ENGENHARIA DE DADOS

Implementar e demonstrar um pipeline **reproduzível, idempotente e testado**, com camadas lógicas:

- **Bronze:** cópia fiel dos JSON/arquivos originais e seus metadados de proveniência.
- **Silver:** limpeza, tipagem, normalização de equipes, rodadas, datas, identificação dos jogos, validações e deduplicação auditável.
- **Gold:** datasets analíticos por partida, rodada e clube; resultados agregados; classificação acumulada e recortes Flamengo versus demais times.

Usar **Pandas** para transformações, **NumPy** quando pertinente e **Parquet** para armazenamento analítico (justificar outras opções). Demonstrar particionamento lógico por temporada/competição quando útil, controle de qualidade e integridade, rastreabilidade, execução incremental ou idempotente e etapas ETL/ELT. Não simular ganho de escala fabricando resultados futebolísticos. Reconhecer expressamente que 380 partidas representam volume pequeno e que o projeto demonstra **conceitos e tecnologias do ecossistema Big Data**, não processamento massivo em produção. Não exigir cluster Spark ou HDFS.

Se oportuno, documentar como a arquitetura suportaria futuras temporadas, mas não ampliar o escopo de dados sem validação e autorização.

## 5. MODELO DE DADOS E API

Adaptar/reutilizar migrações PostgreSQL e entidades: competições, temporadas, clubes, partidas, fontes/importações e tabelas ou visões Gold adequadas. Aplicar constraints, FK, índices, transações e migrações seguras. Não apagar dados preexistentes do usuário. Separar tabelas auxiliares, ingestão e dados publicados.

Implementar/ajustar API REST consumindo apenas dados validados:

- saúde, status, metadados e qualidade de cobertura;
- partidas por rodada, clube, mandante/visitante;
- visão geral do Flamengo;
- classificação por rodada e ao final da temporada;
- evolução de pontos, gols e saldo do Flamengo;
- comparação Flamengo versus qualquer clube da Série A;
- indicadores ofensivos/defensivos baseados em placares;
- estatística descritiva e distribuições;
- exportação CSV de dados permitidos, mantendo filtros;
- documentação de contratos e validação de parâmetros.

Garantir paginação quando aplicável, consultas parametrizadas, códigos de erro corretos e consistência numérica entre Python, PostgreSQL e API.

## 6. MÉTRICAS CORRETAS

Calcular por clube e por rodada: jogos, vitórias, empates, derrotas, gols pró, gols contra, saldo, pontos (3/1/0, verificando exceções oficiais), aproveitamento = pontos/(3 × jogos) × 100, média de gols feitos/sofridos, vitórias consecutivas, invencibilidade e clean sheets a partir dos placares. Separar mandante e visitante, por rodada e acumulado. Comparar Flamengo e demais clubes com a mesma janela.

Classificação deve considerar critérios oficiais de desempate de 2025, pesquisados e documentados; **não inventar posições oficiais** se critérios adicionais ou penalidades não estiverem representados nos dados. Em caso de impossibilidade de replicação integral, nomear como `classificação calculada` com ressalva e não como classificação oficial.

Adicionar estatística descritiva pertinente: médias, medianas, quartis, dispersão, distribuições, séries temporais, correlações exploratórias com limitações e comparação casa/fora. Não atribuir causalidade a correlação.

## 7. FRONTEND — DESIGN MINIMALISTA E FUNCIONAL

Manter o visual já existente, com estética esportiva profissional, fundo claro ou variação escura consistente, preto/vermelho/branco inspirados no Flamengo, tipografia legível, grid responsivo, boa acessibilidade, estados de carregamento, erro e vazio.

Trocar **jogadores** e **comparação individual** por páginas completas e integradas:

1. **Visão geral:** KPIs do Flamengo, desempenho na temporada, evolução por rodada e destaques verificáveis.
2. **Partidas:** calendário/resultados 38 rodadas, filtros por mandante/visitante/resultado/adversário.
3. **Classificação:** 20 clubes, tabela por rodada, evolução de posição quando calculável.
4. **Comparar clubes:** Flamengo versus clube selecionado, indicadores, gráficos e filtros equivalentes.
5. **Análise ofensiva:** gols, médias e evolução por clube e mandante/visitante.
6. **Análise defensiva:** gols sofridos, saldo, partidas sem sofrer gol e evolução.
7. **Estatísticas:** distribuições, variabilidade, gráficos e análise descritiva com interpretações contextualizadas.
8. **Power BI:** relatório funcional se possível; caso o ambiente não permita gerar PBIX/PBIP legítimo, entregar os artefatos montáveis e instruções claras, sem afirmar que o nativo existe.
9. **Metodologia:** fontes, licença, recorte, processamento Bronze/Silver/Gold, fórmulas, limitações e qualidade.

As páginas devem funcionar, não apenas exibir cartões vazios. Preferir componentes reutilizáveis e visualização clara de dados, sem excesso de animações. Criar **SVGs próprios e variados** (campo de futebol, bola, troféu, placar, mapa de passes apenas como decoração se não houver dados de passe, ícones contextuais), não apenas setas; não usar escudos ou imagens protegidas sem licença apropriada. SVGs decorativos não podem insinuar estatísticas inexistentes. Gráficos interativos podem usar Recharts; gráficos acadêmicos estáticos com Matplotlib e Seaborn.

## 8. ANÁLISE DE DADOS COM PYTHON

Atualizar notebooks executáveis e scripts reproduzíveis com **Pandas, Matplotlib e Seaborn**, incluindo:

- Exploração da fonte e dicionário dos campos;
- Limpeza/normalização e relatório de qualidade;
- Distribuição de gols e resultados por partida/rodada;
- Evolução de pontuação e gols do Flamengo;
- Mandante versus visitante;
- Comparação do Flamengo com todos os outros clubes;
- Análises estatísticas descritivas e interpretações;
- Comparação entre resultados Python e indicadores da API/SQL.

Gerar figuras/relatórios reais com fonte, recorte, legenda, unidades e interpretação, sem figuras sintéticas em artefatos finais. Fazer notebooks executáveis na ordem e documentar seus resultados e limitações.

## 9. POWER BI

Preservar e adaptar o modelo dimensional, Power Query, DAX, medidas, tema visual e documentos para **clube/partida/rodada/temporada**, removendo dimensões e medidas de jogador do escopo ativo. Preparar visões de temporada, comparação de clubes, ofensiva/defensiva, casa/fora e evolução por rodada. Mesma semântica estatística da API. Se Power BI Desktop estiver acessível, gerar e validar o relatório nativo; caso não esteja, documentar exatamente o que falta para construí-lo no Desktop. Não declarar PBIX/PBIP validado sem abrir/testar.

## 10. QUALIDADE, TESTES E DOCUMENTAÇÃO

Atualizar os testes existentes sem apagar verificações úteis; criar testes de domínio, casos de uso, pipeline, API, frontend, contratos, migrações, idempotência, filtros, classificação, ordenação, equipes, rodadas 1 e 38, jogos adiados, totalizações e ausência de dados fictícios. Executar efetivamente testes JS/Python/PostgreSQL quando possível, lint (ESLint/Ruff), formatação, builds e smoke tests. Relatar números executados, falhas e bloqueios honestamente; não repetir números antigos de testes como prova atual.

Atualizar: `AGENTS.md`, contexto, `README.md`, `docs/STATUS.md`, `docs/ARCHITECTURE.md`, `docs/METRICS.md`, `docs/ROUND_SCOPE.md`, `docs/DATA_SOURCES.md`, `docs/DATA_QUALITY.md`, contratos, relatórios de testes e requisitos; incluir material de apresentação acadêmica de 5–10 minutos. Retirar instruções ativas contraditórias sobre estatísticas individuais de jogadores ou temporada 2026, mantendo decisões históricas com identificação de que foram substituídas.

## 11. SEQUÊNCIA DE EXECUÇÃO

Trabalhe em sequência sem pedir confirmações desnecessárias:

1. Inspecionar repositório e realizar diagnóstico.
2. Alinhar especificações, `AGENTS.md` e contratos ao novo escopo.
3. Auditar e importar dados reais do OpenFootball com rastreabilidade.
4. Migrar domínio, regras e testes para clubes/partidas.
5. Implementar pipeline Bronze/Silver/Gold e indicadores Gold.
6. Persistir no PostgreSQL e integrar API.
7. Transformar páginas existentes em dashboard coletivo funcional.
8. Executar análises Pandas/Matplotlib/Seaborn e atualizar Power BI.
9. Executar testes, revisar visual responsivo e atualizar documentação.
10. Registrar entrega e pendências verificáveis.

Se limite de contexto ou execução impedir a conclusão, registre **com precisão** em `docs/STATUS.md` o que foi feito, comandos, estado real dos dados, pendências e próximo passo, sem recomeçar.

## 12. CRITÉRIOS DE ACEITE

- Escopo ativo único: Flamengo e comparação com os 19 clubes, Brasileirão Série A masculino 2025, rodadas 1–38, **sem estatísticas individuais de atletas**.
- Fonte legalmente utilizável e 380 partidas/38 do Flamengo conferidas e rastreadas, se essa cobertura for confirmada.
- Pipeline real Bronze/Silver/Gold em Python com Pandas/Parquet e resultados idempotentes.
- PostgreSQL, API e React consumindo os mesmos dados Gold reais.
- Dashboards, tabelas, gráficos e filtros funcionais; estatísticas sem invenção.
- Análises reproduzíveis com Matplotlib e Seaborn, conclusões fundamentadas.
- Materiais de Power BI consistentes, com transparência sobre arquivo nativo.
- Clean Architecture efetiva, código sem comentários, documentação atualizada.
- Testes, lint, build e smoke executados e registrados.

**Entregue no final:** arquivos criados/modificados, estrutura em camadas, quantidade real de partidas importadas, indicadores implementados, capturas ou caminhos para visualizar os gráficos, relatórios estatísticos, estado do Power BI, comandos locais para reproduzir, resultados concretos dos testes, limitações e roteiro de apresentação para a disciplina.

**Não faça apenas o planejamento. Implemente o que for tecnicamente possível e seguro no repositório existente.**
