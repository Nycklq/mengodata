# Pesquisa e validação de fontes

Consulta: 19/10/2026. Escopo: estatísticas individuais pelo Flamengo na Série A masculina de 2026, rodadas oficiais 1 a 19. **Nenhuma fonte está homologada para alimentar a plataforma.** Este documento distingue evidência de existência, capacidade documentada, cobertura auditada e permissão de uso.

## Método e níveis de evidência

Foram pesquisadas páginas dos próprios fornecedores e entidades, documentação técnica, termos, catálogo público e uma amostra oficial. Não foram usados blogs de terceiros como comprovação técnica. Não houve scraping em escala, contorno de bloqueios, autenticação com credenciais, contratação ou contato com fornecedores.

- **Observado:** conteúdo efetivamente lido em arquivo/página ou retornado por uma consulta. Quando apenas conteúdo indexado ficou acessível, isso é identificado.
- **Documentado:** capacidade descrita pelo fornecedor, ainda sem validar a resposta para Flamengo/2026.
- **Não comprovado:** cobertura, semântica ou direito sem evidência suficiente nesta pesquisa.
- **Homologado:** exigiria comprovar acesso, direitos, recorte, cobertura e semântica. Nenhuma linha alcançou esse estado.

Os termos foram avaliados para orientar a escolha da fonte; não se presume que acesso público ou assinatura autorizem todos os usos. Estatísticas, fotografias, escudos, banco bruto, resultados derivados, API pública e exportações precisam de avaliação própria.

## Comparação das fontes

| Fonte | Disponibilidade e cobertura de 2026 | Granularidade e rodada | Coleta possível | Direitos e conclusão |
| --- | --- | --- | --- | --- |
| CBF; súmula disponibilizada pela FERJ | Tabela oficial lida; uma súmula de 2026 inspecionada. Demais súmulas não auditadas | Número de jogo e rodada oficial; atletas e eventos na amostra | Consulta documental; automação/importação dependem de permissão | Termos CBF restritivos; espelho FERJ não concede licença adicional. Referência de conferência, sem liberação de ingestão |
| FBref / Sports Reference | Logs individuais de 2026 observados em conteúdo indexado; universo completo não auditado | Atleta × partida, clube, competição e Matchweek | Consulta/exportação somente nos limites autorizados | Política exige permissão para produtos baseados em coleta. Dados avançados sofreram retirada. Não aprovado |
| Football-data.org | Série A brasileira consta na cobertura; resposta de partidas 2026 sem chave retornou 403 | Partida, `matchday`, competição/temporada; eventos e escalações conforme acesso | API v4 autenticada | Uso condicionado a cadastro, plano e atribuição; exportação e redistribuição precisam ser esclarecidas. Candidata a metadados e eventos, não comprovada para a base individual |
| API-Football / API-Sports | Série A brasileira consta na cobertura; flags e respostas de 2026 não verificadas com token | Fixtures com rodada e estatísticas individuais por fixture documentadas | API v3 com chave | Acesso à API não concede por si licença de publicação. Candidata técnica condicionada a direitos e amostras |
| Sportmonks | Página do produto identifica temporada 2026; dados de atletas do Flamengo não consultados | Fixture, `round_id`, atleta e clube em `lineups.details` documentados | API v3 com token e plano adequado | Uso dentro de produto é previsto; feed e revenda exigem autorização. Prioridade para próxima validação, sem contratação |
| StatsBomb Open Data / Hudl | Catálogo público inspecionado: sem a competição brasileira pretendida | JSON por competição/temporada, partida, escalação e evento | Arquivos públicos do repositório | Acordo específico de pesquisa, com restrições. Não atende o recorte no catálogo consultado |

## CBF e FERJ

A evidência de partidas, os documentos e o caso adiado estão em [ROUND_SCOPE.md](ROUND_SCOPE.md). A súmula contém registros CBF dos atletas, relação titular/reserva, gols, cartões e substituições. Não apresenta assistências, finalizações, passes, desarmes, interceptações, cortes, bloqueios, xG ou xA. Minutos individuais exigiriam derivação e convenção auditada; não são um campo pronto da amostra.

Os [termos da CBF](https://www.cbf.com.br/termos-de-uso), versão indicada 1.0 de 15/07/2022, incluem restrições à cópia, reprodução e alteração do conteúdo e à utilização de material protegido sem autorização. O conteúdo foi acessível via índice de pesquisa; a abertura direta falhou. Consulta Python adicional falhou na validação de certificado, sem desativar TLS. Decisão conservadora do projeto: não automatizar nem distribuir esse conteúdo sem esclarecer os direitos. Não foi identificada licença aberta para o dataset desejado.

A [página da FERJ](https://www.fferj.com.br/partidas/3662) vincula a súmula hospedada no domínio `ferj360.com.br`. A disponibilização institucional reforça a procedência da amostra, mas não comprova autorização para redistribuição. Não houve verificação criptográfica das assinaturas mencionadas no PDF.

## FBref / Sports Reference

Foram encontrados [logs de Samuel Lino na Série A de 2026](https://fbref.com/en/players/2a295d33/matchlogs/2026/c24/summary/Samuel-Lino-Match-Logs) e o [calendário do Flamengo de 2026](https://fbref.com/en/squads/639950ae/2026/matchlogs/all_comps/schedule/Flamengo-Scores-and-Fixtures-All-Competitions). Conteúdo indexado mostra rodada, clube, minutos, gols, assistências, finalizações e cartões por partida. A abertura direta não funcionou; não houve download de tabela nem auditoria de todos os jogadores. Cabeçalho de coluna não prova preenchimento integral. IDs de partida dos links ainda precisam ser inspecionados e conciliados com a CBF.

A [Sports Reference anunciou em 20/01/2026 a retirada dos dados avançados](https://www.sports-reference.com/blog/2026/01/fbref-stathead-data-update/), conforme conteúdo também acessível no [arquivo oficial do blog](https://www.sports-reference.com/blog/category/general/). Não assumir a antiga cobertura de xG, xA ou passes em 2026.

A [política de uso de dados](https://sportsreference.net/data_use.html), consultada por conteúdo indexado, condiciona produtos baseados em coleta à permissão e informa limitações de redistribuição. Os [termos oficiais](https://www.sports-reference.com/termsofuse.html) complementam essa política. Exportação manual disponível no site não equivale a autorização para API, CSV público ou relatório com base embutida. Fonte não aprovada sem autorização adequada.

## Football-data.org

A [cobertura oficial](https://www.football-data.org/coverage) inclui a Série A brasileira. A [tabela oficial de códigos](https://docs.football-data.org/general/v4/lookup_tables.html) identifica `BSA`, competição `2013`; não confundir com `SA`, da Itália. A [documentação de partidas](https://docs.football-data.org/general/v4/match.html) descreve IDs, competição, temporada, rodada, clubes e eventos. Estatísticas sob os clubes são da equipe, não de cada jogador.

A [documentação de competições](https://docs.football-data.org/general/v4/competition.html) permite consultar partidas por temporada/rodada. O ranking de artilheiros, inclusive quando filtrável por rodada, não fornece a base completa de atuações necessária ao projeto. Não usar esse ranking como substituto de atleta × partida.

Foi feita uma única chamada sem token a `https://api.football-data.org/v4/competitions/BSA/matches?season=2026`: **HTTP 403**, com mensagem de recurso restrito. Isso comprova apenas a recusa sem credencial, não ausência da temporada. Nenhuma resposta autenticada foi testada.

Os [termos publicados no cadastro](https://www.football-data.org/client/register), datados de 01/06/2018, condicionam uso a cadastro/plano, chave individual por aplicação, uso adequado e atribuição visível. Não estabelecem nessa leitura autorização clara para redistribuir uma base aberta; confirmar API pública, CSV, Power BI e retenção. Não houve cadastro.

## API-Football / API-Sports

A [cobertura](https://www.api-football.com/coverage) lista Brazil/Serie A. Ícones da tabela não foram usados para afirmar cobertura de métricas. O [guia oficial](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide) e a [referência v3](https://www.api-football.com/documentation-v3) descrevem `/leagues`, `/fixtures/rounds`, `/fixtures` e `/fixtures/players`. O último liga atletas e estatísticas a uma partida; `/players` agregado da temporada não substitui esse recurso. O guia documenta minutos, gols, assistências, chutes, passes, ações defensivas e cartões. Campos opcionais ou nulos exigem auditoria; não presumir passes completos a partir de uma precisão arredondada.

Nenhuma chave foi usada. Permanecem pendentes: IDs reais da competição/clube/temporada, flags de cobertura para 2026, respostas das 19 partidas e semântica dos campos.

Os [termos, atualizados em 21/05/2025](https://www.api-football.com/terms), proíbem revenda direta sem permissão e afirmam que o serviço não concede licença para publicação; eventuais direitos de terceiros devem ser obtidos pelo usuário. Logo, um plano pago não resolve automaticamente os direitos do projeto. Sem liberação de publicação nesta fase.

## Sportmonks

A [página oficial do Brasileirão](https://www.sportmonks.com/football-api/brasileirao-api/) identifica a temporada 2026 como `26763` e oferece exemplo de calendário. O texto comercial ainda menciona calendário de abril a dezembro, incompatível com o início em janeiro constatado nos documentos oficiais de 2026. Portanto, essa página é evidência da oferta do produto, sem autoridade para redefinir o recorte ou confirmar completude.

O [tutorial técnico de estatísticas](https://docs.sportmonks.com/v3/tutorials-and-guides/tutorials/statistics/fixture-statistics) distingue estatísticas de equipe em `statistics` de estatísticas individuais em `lineups.details.type`; os exemplos vinculam fixture, atleta e clube. `round_id` deve ser resolvido para a rodada e confrontado com a referência oficial. Exemplos de outras ligas não comprovam preenchimento no Flamengo/2026.

Os [termos](https://www.sportmonks.com/terms-of-service/) permitem construir produtos com os dados e vedam revenda sem aprovação. A [página de integridade e uso](https://www.sportmonks.com/integrity-support/) explicita armazenamento, apresentação e distribuição dentro do produto, condicionando redistribuição como feed à aprovação escrita. A API pública planejada e os downloads exigem esclarecer essa fronteira. Não há token, assinatura ou aprovação obtida nesta tarefa. Priorizar uma avaliação autenticada e contratual; não considerar a fonte homologada.

## StatsBomb Open Data / Hudl

O [repositório oficial](https://github.com/hudl/open-data) descreve dados por partida e eventos. O [catálogo consultado](https://raw.githubusercontent.com/statsbomb/open-data/master/data/competitions.json) teve 80 entradas e nenhuma com país Brazil; não foi localizada a Série A brasileira de 2026. A verificação limitou-se ao catálogo público, sem consulta ao produto comercial.

O [acordo de uso](https://github.com/hudl/open-data/blob/master/LICENSE.pdf), lido nas cinco páginas, indica atualização em 08/09/2023. Prevê pesquisa e divulgação de análises com atribuição/logo, restringe exploração comercial e fornecimento do dado a terceiros. Não é uma licença permissiva genérica como MIT ou CC0. Mesmo que tivesse o recorte, seria necessário compatibilizar distribuição e usos do projeto. Não usar jogos de outras competições como substituição.

GitHub é hospedagem, não garantia de origem ou licença. Nenhum outro repositório, dataset Kaggle ou base acadêmica foi homologado. A pesquisa não demonstra inexistência universal de alternativas abertas.

## Matriz inicial de indicadores

Legenda: **A** = observado na amostra oficial; **I** = observado em conteúdo indexado do FBref; **D** = capacidade técnica genérica documentada, sem validar 2026; **R** = possível derivação sujeita a dados/semântica; **NC** = não comprovado; **—** = ausente da amostra consultada. Nenhuma marca representa liberação para produção. StatsBomb não entra nas colunas porque não cobre o recorte no catálogo.

| Indicador / unidade | CBF/FERJ | FBref | Football-data.org | API-Football | Sportmonks |
| --- | --- | --- | --- | --- | --- |
| Identidade do atleta / ID e nome | A | I | D | D | D |
| Posição / categoria | NC | I | D | D | D |
| Clube da atuação, competição e temporada / IDs | A | I | D | D | D |
| Partida e rodada / ID e inteiro | A | I; ID a conferir | D | D | D |
| Aparições / partidas com atuação | R | R | R | R | R |
| Titularidades / partidas | A | I | D | D | D |
| Minutos / minuto | R | I | R | D | D |
| Gols / contagem | A | I | D | D | D |
| Assistências / contagem | — | I | D | D | D |
| G+A, G90, A90, GA90 / contagem ou por 90 min | R, depende de assistências | R | R | R | R |
| Finalizações e no alvo / contagem individual | — | I | NC; exemplo é de equipe | D | D, tipos a auditar |
| Passes tentados e corretos / contagem individual | — | NC | NC | D; confirmar componentes | D; confirmar tipos |
| Precisão de passes / percentual | — | NC | NC | R | R |
| Desarmes / contagem | — | NC; TklW não é sinônimo automático | NC | D | D |
| Interceptações / contagem | — | I | NC | D | D |
| Cortes e bloqueios / contagem individual | — | NC | NC | NC | D; confirmar nível individual |
| Amarelos e vermelhos / contagem | A | I | D | D | D |
| xG e xA / expectativa de gols/assistências | — | NC após retirada | NC | NC no nível individual do recorte | NC no nível individual do recorte |
| Conversão / percentual | R, faltam finalizações | R | NC | R | R |

Todas as métricas derivadas dependem também de cobertura compatível do numerador e denominador. Coluna inexistente, campo nulo e não participação são situações diferentes. Não interpretar NC como zero nem como prova de que o fornecedor jamais oferece o campo.

## Perguntas de homologação ainda sem resposta

1. O plano permite recuperar as 19 partidas, inclusive a rodada 4 remarcada, e todos os atletas que atuaram pelo Flamengo, inclusive transferidos?
2. Quais métricas têm cobertura por atleta × partida em cada jogo? Há correções posteriores, campos nulos ou definições especiais?
3. São permitidos Bronze local, PostgreSQL, cálculos Gold, publicação de indicadores, API JSON pública e CSV filtrado? A API do projeto é considerada feed de redistribuição?
4. São permitidos relatório Power BI com dados importados, compartilhamento do arquivo e publicação acadêmica? Quais exigências de atribuição existem?
5. É permitido disponibilizar dados brutos ou derivados no GitHub? Quais limites de cache, retenção após cancelamento, atualização e exclusão se aplicam?
6. Quais permissões adicionais se aplicam a fotografias, escudos e competições? A autorização cobre o propósito acadêmico e o portfólio público planejados?

Nenhuma mensagem foi enviada. Não foram assumidos preços ou orçamento; eventual contratação depende de autorização explícita.

## Registro de acessibilidade e reprodução

Páginas da CBF e do FBref tiveram falhas de abertura pela ferramenta web; as evidências indexadas foram identificadas acima. Os PDFs institucionais foram obtidos por HTTPS normal e conferidos localmente. A documentação interativa v3 do API-Football não forneceu texto extraível; o guia oficial fundamenta as capacidades descritas. As APIs comerciais não foram testadas com autenticação. Falha de acesso não prova ausência de dados.

Os originais de inspeção ficaram em diretório temporário fora do repositório, sem criação de Bronze ou redistribuição dos arquivos. Estes hashes identificam exatamente as versões consultadas:

| Recurso | SHA-256 |
| --- | --- |
| Tabela CBF vinculada em ROUND_SCOPE.md | `4b46b5e5b9eb80ca96d35f59c225525fd400edc89f7a2f9f66a4fcaa9e90660e` |
| Súmula CBF/FERJ vinculada em ROUND_SCOPE.md | `5ad8a9e1f25a78b057f02811578dcf7417dfddee1c7e7618cc791d72c7db9d5b` |
| Catálogo StatsBomb no endereço consultado | `e6cd42f5d8956d6aa30fb917ce8d4c3b3df1879a93f02f8feba820930a6971fa` |
| Acordo StatsBomb obtido de `raw.githubusercontent.com/hudl/open-data/master/LICENSE.pdf` | `a5462e69aeb71a39268b760b110c5c2190a2e0cee3015ba976f66bd71f6c2bb4` |

Uma futura coleta deverá registrar também instante UTC, autorização aplicável e revisão estável do fornecedor; os hashes desta pesquisa não substituem esse processo.
