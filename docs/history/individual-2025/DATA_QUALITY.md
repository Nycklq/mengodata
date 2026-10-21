# Qualidade, cobertura e proveniência — auditoria 2025

Auditoria em 19/10/2026. Escopo obrigatório: Flamengo, Série A masculina/2025, rodadas oficiais 1 a 38. [Decisão](SOURCE_APPROVAL.md), [partidas](ROUND_SCOPE.md), [métricas](METRICS.md) e [relatório JSON](evidence/source-audit-2025.json). Na etapa seguinte desta mesma execução, as referências auxiliares OpenFootball autorizadas foram importadas em Bronze/Silver/Gold e integradas à API/visão geral. Os dados individuais candidatos não foram incorporados ao produto ou ao banco.

## Importação auxiliar executada

O comando npm run pipeline:references -- --input .tmp/source-approval-2025/openfootball-2025-br.1.json produziu 38 referências reais; a primeira execução retornou changed=true e a repetição changed=false. Bronze conserva os bytes/hash aprovados; Silver conserva campos normalizados e origem; Gold acrescenta ingested_at sem renovar o recibo em uma repetição idêntica. O SHA-256 permaneceu 0fcc4647256b2e1f58b50f1372b751aeb7e6aacb5b8cd747579dd7ab71303fbb.

A API reconstrói partidas do Bronze verificado, preserva os ponteiros JSON e mantém IDs CBF/fuso nulos. O catálogo não alimenta estatísticas de atletas. Não há linhas individuais em Gold/PostgreSQL de produção. A preparação Power BI atual contém bloqueio e listas vazias. Fórmulas e entrada individual são testadas com sintéticos isolados, sem transformar essas fixtures em resultados esportivos.

## Método e evidência

Downloads de auditoria limitados aos arquivos públicos GitHub, fixados por revisão. Não houve chamada a endpoints Cartola, scraping de partidas ou execução do notebook/helpers de terceiros. As cópias CSV permanecem somente em .tmp/source-approval-2025, ignorado pelo Git. O relatório versionável contém diagnósticos, hashes e as referências auxiliares CC0, sem reproduzir a base individual.

O OpenFootball foi coletado a partir de e6744429ee395bc86f247348c6184bb08d4eb361, com registro de auditoria às 18:46 UTC. O candidato permanece na revisão 0376354699db69991630ded053bde30f7d9c5ca5; o recibo de download registrou 19/10/2026 às 18:47:48 UTC. Esses instantes são da inspeção, não da captura original do Cartola, que permanece desconhecida.

No candidato foram lidos 82 arquivos: 78 CSVs, README principal, README da base, notebook e helper de agregações. A [comparação upstream](evidence/cartola-upstream-comparison.json) verificou os 38 brutos contra caRtola. Código remoto foi apenas inspecionado como texto. A auditoria executável roda sobre arquivos locais, sem rede, e foi repetida com saída idêntica.

## OpenFootball

| Verificação                    | Resultado observado                                                             |
| ------------------------------ | ------------------------------------------------------------------------------- |
| JSON e competição declarada    | Brasileiro Série A 2025, matches com 380 registros                              |
| Seleção do Flamengo            | 38 registros com CR Flamengo como mandante ou visitante                         |
| Rodadas declaradas             | 1..38, sem ausência, duplicata de rodada, par mandante/visitante ou localizador |
| Placar                         | 380 registros; 353 objetos com ft e 27 listas; ambos os formatos tratados       |
| Referências Flamengo           | Datas e placares presentes nos 38 registros                                     |
| Adiamento conhecido            | Sport × Flamengo: rodada 12, data registrada 15/11/2025                         |
| IDs nativos e oficiais         | Ausentes; localizador JSON não é ID oficial                                     |
| Horário e fuso                 | Horário original preservado; fuso não declarado, mantido nulo                   |
| Atletas e métricas individuais | Ausentes                                                                        |
| Conciliação oficial integral   | Pendente; referência auxiliar não vira manifesto oficial                        |

Nenhuma soma de gols individuais, quantidade de atuações ou taxa por 90 foi inferida do placar. Não foi fabricado timestamp UTC a partir de horário sem fuso nem número oficial a partir da posição no array. Os 38 registros são recuperáveis em sources[0].inventory.reference_matches no relatório JSON.

## Arquivos e tipos do candidato

| Conjunto    | Arquivos/linhas | Estrutura observada                                                             |
| ----------- | --------------- | ------------------------------------------------------------------------------- |
| Brutos      | 38 / 28.589     | Rodada 1: 19 colunas; 2..12: 39; 13..38: 38                                     |
| Processados | 38 / 28.589     | Rodada 1: 24 colunas; 2..12: 44; 13..38: 43                                     |
| Consolidado | 1 / 28.589      | 46 colunas; 980 IDs de cadastro Cartola, incluindo técnicos; 20 siglas de clube |
| Resumo      | 1 / 38          | Rodada, Total Jogadores, Jogaram e estatísticas de pontos fantasy               |

A primeira rodada não tem as 20 colunas de scouts. A redução a partir da 13 é a ausência de atletas.minimo_para_valorizar. Todos os 38 processados preservam as colunas originais; a normalização descrita no notebook reproduz os valores do consolidado; as contagens do resumo coincidem. Não foram detectadas duplicatas por atleta/rodada ou divergência rodada versus atletas.rodada_id. Nada disso prova cobertura por partida.

Tipos inferidos de leitura, não schema publicado pelo fornecedor: IDs, rodadas, jogos, posições e ranking são int64; pontuação, preços, percentil e scouts são float64; entrou_em_campo/destaque são bool; nomes, siglas, URLs e classificação são texto. O inventário JSON preserva os 46 nomes e os tipos inferidos, além do hash e contagens dos 76 arquivos por rodada e do resumo.

## Origem e transformação dos campos

| Campos no consolidado                                                                                                      | Origem observada                                                               | Transformação/limitação                                                                   |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Unnamed: 0                                                                                                                 | Índice exportado no CSV bruto                                                  | Artefato de arquivo; não é ID de evento                                                   |
| id_jogador, apelido, foto, posicao_id                                                                                      | atletas.atleta_id, atletas.apelido, atletas.foto, atletas.posicao_id           | Renomeação; IDs Cartola não mapeados a identidades oficiais; fotos têm direitos separados |
| clube_nome, atletas.clube_id                                                                                               | atletas.clube.id.full.name e atletas.clube_id                                  | Clube do snapshot; não prova clube de uma atuação anterior acumulada                      |
| atletas.nome, atletas.apelido_abreviado, atletas.slug, atletas.status_id, atletas.minimo_para_valorizar, atletas.rodada_id | Mesmas colunas no bruto                                                        | Metadados de cadastro/mercado; status não prova entrada em campo                          |
| jogos, entrou_em_campo                                                                                                     | atletas.jogos_num, atletas.entrou_em_campo                                     | Contador e flag de snapshot; sem chave oficial de partida                                 |
| pontuacao, variacao_preco, preco, media_pontos                                                                             | atletas.pontos_num, atletas.variacao_num, atletas.preco_num, atletas.media_num | Fantasy game, não estatísticas neutras de desempenho futebolístico                        |
| G, A, DS, FD, FF, FT, CA, CV, FC, FS, DE, GS, I, PS, DP, SG, V, PC, PP, GC                                                 | Mesmos campos dos brutos quando presentes                                      | Scouts do snapshot; captura original e convenções de 2025 não comprovadas                 |
| posicao_nome                                                                                                               | Mapa de atletas.posicao_id no notebook                                         | Inclui técnico como posição 6                                                             |
| ranking_rodada, percentil_pontuacao, classificacao_desempenho, destaque_rodada                                             | Derivadas da pontuação e da flag no notebook                                   | Regras de fantasy do candidato; não copiadas para o produto                               |
| rodada                                                                                                                     | Nome do arquivo processado                                                     | Rodada de snapshot, sem vínculo oficial por partida                                       |
| clube_sigla                                                                                                                | Mapa/fallback de clube_nome no notebook                                        | FLA→262 observado; fallback não é código CBF                                              |

A identidade dos 38 brutos com o caRtola fortalece a evidência de cópia, sem demonstrar quando ou com qual autorização o Cartola foi capturado. O notebook documenta pesos e rótulos, sem comprovar a definição oficial de cada evento em 2025. Não confundir PC com passes corretos nem I com interceptações. Na implementação, G/A/DS/FD/FF/FT/CA/CV/jogos são adaptados a goals/assists/tackles/saved_shots/shots_off_target/shots_woodwork/yellow_cards/red_cards/appearance_counter; isso nomeia os campos para diagnóstico, sem homologar sua semântica esportiva. Os rótulos e IDs do fornecedor ficam na infraestrutura, fora das regras internas.

## Flamengo, lacunas e transferências

| Verificação                                       | Resultado                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| Linhas FLA/262                                    | 1.578                                                                    |
| Técnicos excluídos da análise de jogadores        | 38 linhas                                                                |
| Linhas de jogadores cadastrados                   | 1.540, correspondentes a 56 IDs                                          |
| IDs com alguma flag entrou_em_campo               | 32                                                                       |
| Flags no subconjunto de jogadores                 | 535; não são atuações oficiais verificadas                               |
| Snapshots sem qualquer flag FLA de jogador        | 1, 12, 36 e 38                                                           |
| Valores nulos FLA: G / A / DS                     | 1.035 / 1.171 / 677                                                      |
| Valores nulos FLA: FD / FF / FT                   | 838 / 855 / 1.326                                                        |
| Valores nulos FLA: CA / CV                        | 1.022 / 1.496                                                            |
| IDs com mais de um clube em toda a base           | 48                                                                       |
| ID FLA com mais de um clube                       | 116034, Victor Hugo: FLA nos snapshots 18..22 e SAN em 23..38            |
| Chaves oficiais de partida e atuações verificadas | Zero vínculos verificados; quantidade de atuações permanece desconhecida |

Os 32 IDs com flags são: Alex Sandro (61987), Danilo (69783), Saúl (80061), Luiz Araújo (82627), Léo Pereira (83528), Jorginho (84735), Varela (84816), Everton (86757), Arrascaeta (87863), Ayrton Lucas (88393), Gerson (89256), Bruno Henrique (90285), Juninho (90307), Erick Pulgar (91473), Pedro (94583), Allan (96652), Emerson Royal (96870), Léo Ortiz (97867), Samuel Lino (98873), Viña (98974), De la Cruz (99228), Michael (99392), Rossi (99552), Carrascal (105436), Plata (109096), Cleiton (114790), Wesley (115239), Evertton Araújo (115914), Matheus Gonçalves (116012), Victor Hugo (116034), Wallace Yan (122573) e João Victor (140492). Trata-se de identificação do arquivo, sem homologar presença, minutagem, clube de cada evento ou a completude do elenco de 2025. Não excluir jogadores sem flag que possam ter atuado nas partidas ausentes.

Entre snapshots consecutivos ordenados por ID, G tem 41 aumentos/445 repetições/zero reduções; A tem 29/324/zero; DS tem 234/598/zero. Esses padrões, os contadores jogos e a persistência entre capturas são compatíveis com acumulados. Não provam a semântica de cada registro, não autorizam somar snapshots e não permitem gerar eventos pela diferença. Não houve valor negativo nos nove campos diagnósticos, o que não comprova consistência esportiva.

Não preencher nulos com zero. A participação e seu denominador esperado são desconhecidos; 38 rótulos de arquivos não representam 38 partidas cobertas por atleta. Nenhuma soma parcial foi apresentada como total da temporada.

## Execução local reproduzível

Com .venv e dependências já instaladas, sobre as cópias locais obtidas pelo canal permitido:

```powershell
npm.cmd run sources:audit -- --openfootball ".tmp/source-approval-2025/openfootball-2025-br.1.json" --cartola-directory ".tmp/source-approval-2025/candidate/Base de dados"
npm.cmd run verify:pipeline
```

A CLI não baixa arquivos nem escreve dados: emite JSON no terminal. Código 0 significa auditoria executada, sem significar homologação; código 2 indica entrada inválida. Caminhos inexistentes, JSON ambíguo, competição/temporada errada, flags inválidas e IDs/rodadas não integrais são recusados. Um hash diferente do aprovado bloqueia usos, mesmo que o arquivo tenha estrutura válida. A finalidade individual continua bloqueada inclusive para o OpenFootball CC0.

Os caminhos .tmp refletem a sessão de auditoria, não são dependências de testes ou arquivos distribuídos. Cada download deve usar as revisões e conferir os hashes registrados, respeitando direitos de acesso. O relatório versionado permite inspecionar os resultados sem obter dados não autorizados. A suíte automatizada usa dados sintéticos, sem rede ou credenciais. Resultados em [TEST_REPORT.md](TEST_REPORT.md).
