# Fontes de 2025 — pesquisa e homologação

Consulta: 19/10/2026. Universo: atuações pelo Flamengo, Série A masculina/2025, rodadas oficiais 1 a 38. **OpenFootball aprovado somente para referências auxiliares de partidas e resultados; nenhuma fonte individual está homologada.** A pesquisa de 2026 foi preservada no [histórico](history/2026/DATA_SOURCES.md) e não comprova cobertura atual.

A decisão por finalidade e por direito de uso está em [SOURCE_APPROVAL.md](SOURCE_APPROVAL.md), os diagnósticos em [DATA_QUALITY.md](DATA_QUALITY.md), e a evidência reproduzível em [source-audit-2025.json](evidence/source-audit-2025.json). Aprovação técnica, permissão documental e execução de ingestão são estados distintos. A integração posterior nesta execução usa somente as 38 referências auxiliares OpenFootball CC0, com hash revisado. Nenhuma observação individual foi incorporada ao produto ou banco.

## Evidência e decisão

Observado significa conteúdo efetivamente lido ou resposta obtida. Documentado significa capacidade descrita pelo fornecedor, sem validar Flamengo/2025. Homologação exige direitos, proveniência, correspondência oficial, cobertura por atuação e semântica. Calendário, arquivo de rodada ou resposta HTTP não bastam.

| Fonte | Evidência de 2025 e granularidade | Flamengo, rodada e IDs | Cobertura e limitações | Decisão |
| --- | --- | --- | --- | --- |
| OpenFootball football.json | JSON efetivamente lido: 380 partidas, 38 do Flamengo e placares registrados; licença CC0 presente | round, date, time, team1, team2 e score; sem ID nativo/CBF, fuso ou atletas | Cobertura estrutural 1..38; rodada 12 permanece em novembro; conciliação oficial integral pendente | Aprovado como referência auxiliar, com ingestão/publicação permitidas pela CC0 para esse conjunto; não aprova estatísticas individuais |
| jhonatasjgr/brasileirao-2025 | CSV consolidado e amostras brutas lidos em revisão fixa; snapshots de Cartola | FLA/262, atleta e rodada; sem partida oficial, adversário, data, competição ou coluna temporada | 38 rótulos, técnicos e não participantes; scouts acumulados e nulos; faltam minutos/titularidades | Não homologar na forma atual; auditoria detalhada abaixo |
| henriquepgomide/caRtola | Árvore 2025 com 38 arquivos; amostras 1 e 38 lidas | Mesmos hashes dessas amostras do candidato; não é corroboração independente | MIT existe para software; cadeia de direitos do dado Cartola não comprovada | Não homologado como dataset do produto |
| CBF | Cinco referências anteriores preservadas e nova referência indexada da rodada 22 | Competição/ano/rodada/nº oficial e eventos do site; escalações em páginas indexadas | Aberturas diretas falharam; 38 súmulas e atuações não auditadas | Referência de conciliação; ingestão não liberada |
| FBref / Sports Reference | Calendário c24 de 2025 e logs individuais de Joshua, Allan e Gerson no índice | Atleta × partida, Squad, Matchweek e links de relatório | Conteúdo indexado; abertura direta falhou; conjunto completo não auditado; dados avançados retirados | Candidato técnico, condicionado a permissão e cobertura |
| Football-data.org | Cobertura BSA documentada; consulta de partidas season=2025 sem token retornou 403 | IDs de competição/temporada/partida e matchday documentados | Nenhuma resposta autenticada; estatísticas de equipe não equivalem a jogador × partida | Candidato de metadados/eventos, base individual não comprovada |
| API-Football | Série A na cobertura e estatísticas por fixture documentadas | Atleta/time/fixture e rodadas; IDs reais de 2025 ainda não auditados | Sem token, flags de cobertura ou amostras de 38 jogos | Candidato condicionado a cobertura e autorizações |
| Sportmonks | Oferta Brasileirão e temporadas históricas; estatísticas individuais por fixture documentadas | round_id, fixture, atleta e clube em lineups.details | Sem token; season_id de 2025 e dados do Flamengo não comprovados | Prioridade de avaliação contratual/técnica, sem contratação |
| StatsBomb / Hudl Open Data | Catálogo público lido: 80 entradas, nenhuma Brazil | Catálogo não contém o recorte pretendido | Não atende Série A brasileira de 2025 no catálogo consultado | Inadequado para este recorte; produto comercial não avaliado |

## Repositórios públicos e Cartola

Nesta revisão foram lidos os 78 CSVs disponíveis: 38 brutos, 38 processados, resumo e consolidado; também README da base, notebook, README principal e helper, sem executar código remoto. Os 38 brutos são idênticos aos do caRtola na revisão fixa conferida, conforme [comparação de hashes](evidence/cartola-upstream-comparison.json). A árvore do candidato continua sem instrumento de licença e o endpoint GitHub de licença retornou 404. A relação de campos e tipos está no relatório JSON; a proveniência de extração e os direitos originais do Cartola continuam pendentes.

A [auditoria reproduzível](SOURCE_AUDIT_2025.md) registra revisão, hashes, contagens e limitações do [candidato](https://github.com/jhonatasjgr/brasileirao-2025). O README menciona MIT, mas a árvore completa não contém LICENSE e a API GitHub de licença retornou 404. Isso é divergência documental, não uma licença comprovada. Não foram reutilizados seu código, notebook ou API no produto.

[caRtola](https://github.com/henriquepgomide/caRtola) declara extração do Cartola e contém [licença MIT](https://github.com/henriquepgomide/caRtola/blob/17832580475259b8999649ced88c8694c89372e1/LICENSE). O texto licencia software/documentação; não demonstra que seus autores podem sublicenciar todos os dados ou imagens de terceiros. A [documentação do GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) distingue publicação de repositório e concessão de licença.

O [termo Cartola encontrado](https://ajuda.globo/cartola/termos-e-politicas/faq/termo-de-uso.ghtml) veda extração automatizada e reprodução/armazenamento/distribuição não autorizados. A página ainda se refere a 2024: é evidência de restrição, sem estabelecer qual versão contratual regeu a coleta de 2025. Exigir autorização e cadeia de procedência. Nenhum endpoint Globo foi chamado nesta tarefa. GitHub público e MIT de software não resolvem essa lacuna.

## CBF

As páginas e os números oficiais estão em [ROUND_SCOPE.md](ROUND_SCOPE.md). Calendário/escalação ajudam na identificação; não demonstram passes, desarmes ou minutos homologados de todos os atletas. As súmulas de 2026 da pesquisa anterior não são evidência de métricas de 2025.

Os [termos CBF](https://www.cbf.com.br/termos-de-uso), acessíveis pelo índice, restringem reprodução/alteração de conteúdo sem autorização; abertura direta falhou. Não foi encontrada licença aberta para a base individual necessária. Não automatizar coleta ou distribuir arquivos com base apenas na consulta pública.

Foi localizada a [publicação oficial da tabela básica de 2025](https://www.cbf.com.br/futebol-brasileiro/noticias/competicoes-campeonato-brasileiro-serie-a/a/cbf-divulga-documentos-tecnicos-do-brasileirao-2025), de 12/02/2025, que anuncia as 38 rodadas. A abertura direta falhou; não foram obtidos ou auditados os PDFs anexos. O anúncio de uma tabela básica não comprova datas realizadas, resultados ou escalações. Nenhum ID ausente foi inferido da ordem do JSON ou da sequência dos eventos CBF.

## OpenFootball

Revisão fixa [e6744429ee395bc86f247348c6184bb08d4eb361](https://github.com/openfootball/football.json/tree/e6744429ee395bc86f247348c6184bb08d4eb361), commit declarado em 22/09/2026. Foram lidos [2025/br.1.json](https://github.com/openfootball/football.json/blob/e6744429ee395bc86f247348c6184bb08d4eb361/2025/br.1.json), README e [LICENSE.md](https://github.com/openfootball/football.json/blob/e6744429ee395bc86f247348c6184bb08d4eb361/LICENSE.md). Coleta de auditoria em 19/10/2026, 18:46 UTC; hashes no registro de aprovação.

O README declara dados, schema e scripts sob dedicação ao domínio público e descreve geração a partir de Football.TXT. LICENSE.md contém CC0 1.0 Universal. A [Creative Commons](https://creativecommons.org/publicdomain/zero/1.0/) permite cópia, adaptação e redistribuição dos direitos abrangidos, sem garantir direitos de terceiros, marcas, imagem ou endosso. A aprovação documental limita-se aos metadados desse arquivo; não cobre conteúdos CBF ou Cartola, escudos/fotos ou estatísticas inexistentes.

Os 38 registros do Flamengo foram preservados no inventário de auditoria com localizador JSON, rodada declarada, data, horário original e placar. O localizador /matches/N só identifica a posição nessa revisão fixa: não é ID oficial nem identificador nativo estável. Números oficiais, IDs CBF e fuso permanecem nulos. A cobertura oficial/individual permanece não verificada. Não se produziu manifesto v2 com números ou timestamps inventados.

## FBref

Verificados no índice o [calendário específico Série A/2025](https://fbref.com/en/squads/639950ae/2025/matchlogs/c24/schedule/Flamengo-Scores-and-Fixtures-Serie-A) e logs de [Joshua](https://fbref.com/en/players/04347cef/matchlogs/2025/c24/summary/Joshua-Match-Logs), [Allan](https://fbref.com/en/players/b15e93aa/matchlogs/2025/c24/summary/Allan-Match-Logs) e [Gerson](https://fbref.com/en/players/8827bf46/matchlogs/2025/c24/). Mostram clube, rodada, participação, minutos, gols, assistências, chutes e cartões em amostras. Colunas e amostras não provam preenchimento universal.

A [política de dados](https://sportsreference.net/data_use.html) exige permissão para produtos baseados em coleta e informa restrições de redistribuição. Exportação manual não libera automaticamente API/CSV/Power BI. O [anúncio de 20/01/2026](https://www.sports-reference.com/blog/2026/01/fbref-stathead-data-update/) confirma remoção de dados avançados; mudar para uma temporada histórica não garante que esses campos permaneçam disponíveis. Não houve scraping ou contorno de proteção.

## APIs legítimas

Football-data.org: [cobertura](https://www.football-data.org/coverage), [partidas v4](https://docs.football-data.org/general/v4/match.html), [códigos BSA/2013](https://docs.football-data.org/general/v4/lookup_tables.html) e [termos do cadastro](https://www.football-data.org/client/register). Consulta única https://api.football-data.org/v4/competitions/BSA/matches?season=2025: HTTP 403 sem token. Isso comprova recusa de acesso, não inexistência da temporada. Ranking anual de artilheiros não fornece a base completa de atuações.

API-Football: [guia oficial](https://www.api-football.com/news/post/how-to-get-started-with-api-football-the-complete-beginners-guide), [documentação v3](https://www.api-football.com/documentation-v3), [cobertura](https://www.api-football.com/coverage) e [termos](https://www.api-football.com/terms). Fixtures/players é o grão candidato; players agregado anual não basta. Os termos vedam revenda direta sem permissão e não concedem licença de publicação: direitos adicionais devem ser esclarecidos com os titulares. Não houve autenticação.

Sportmonks: [produto Brasileirão](https://www.sportmonks.com/football-api/brasileirao-api/), [temporadas históricas](https://www.sportmonks.com/glossary/seasons/), [estatísticas por fixture](https://docs.sportmonks.com/v3/tutorials-and-guides/tutorials/statistics/fixture-statistics), [termos](https://www.sportmonks.com/terms-of-service/) e [uso dos dados](https://www.sportmonks.com/integrity-support/). A documentação distingue statistics de equipe de lineups.details individual. A política prevê cache e apresentação dentro de produto e exige aprovação escrita para feed. Não transportar o ID da temporada 2026 para 2025. Nenhuma assinatura ou cobertura individual foi validada.

## Permissões necessárias

P = pendente de comprovação/autorização para este projeto. C = capacidade contratual genérica condicionada a plano e direitos, ainda não aprovada para Flamengo/2025. A matriz se refere ao uso no produto, além da inspeção pontual desta pesquisa.

| Fonte | Coleta | Armazenamento local | Transformação | Publicação de indicadores | API | CSV | Power BI e distribuição |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OpenFootball / referências auxiliares CC0 | Permitido | Permitido | Permitido | Permitido somente para os metadados existentes | Permitido para esses metadados | Permitido para esses metadados | Permitido para esses metadados |
| Candidato GitHub / dados Cartola | P | P | P | P | P | P | P |
| caRtola / dados de terceiros | P | P | P | P | P | P | P |
| CBF | P | P | P | P | P | P | P |
| FBref | P | P | P | P | P | P | P |
| Football-data.org | C | P | P | P | P | P | P |
| API-Football | C | P | P | P | P | P | P |
| Sportmonks | C | C | C | C | P | P | P |
| StatsBomb Open Data | Fora do recorte | Fora do recorte | Fora do recorte | Fora do recorte | Fora do recorte | Fora do recorte | Fora do recorte |

StatsBomb: [catálogo](https://raw.githubusercontent.com/hudl/open-data/master/data/competitions.json) consultado novamente. A licença específica de pesquisa e suas restrições foram lidas na fase anterior; não foi reaberto o PDF nesta execução e isso não homologa qualquer uso de 2025.

## Condições para avançar

Para a base individual, obter evidência escrita de proveniência e usos permitidos, inclusive retenção após cancelamento, atribuição, API pública, CSV e arquivo Power BI com dados importados. Confirmar imagens separadamente. Auditar as 38 partidas, jogadores transferidos, ocorrências tardias e cobertura por métrica. Resolver scouts acumulados, faltas, critérios de assistência/minutagem e revisões. Os pedidos escritos estão preparados em [SOURCE_PERMISSION_REQUEST.md](SOURCE_PERMISSION_REQUEST.md), sem envio.

Alternativas legítimas: autorização do titular para dataset por partida; amostra licenciada de fornecedor com escopo contratual suficiente; ou construção autorizada de uma base mais limitada com indisponibilidades explícitas, sem reduzir os requisitos aprovados. Não houve contratação, cadastro, envio de mensagem ou ingestão individual de produção. O catálogo auxiliar autorizado foi importado separadamente.
