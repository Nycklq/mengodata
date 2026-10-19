# Auditoria do candidato brasileirão-2025

Consulta: 19/10/2026. Repositório: [jhonatasjgr/brasileirao-2025](https://github.com/jhonatasjgr/brasileirao-2025), revisão [0376354699db69991630ded053bde30f7d9c5ca5](https://github.com/jhonatasjgr/brasileirao-2025/tree/0376354699db69991630ded053bde30f7d9c5ca5), commit declarado em 29/01/2026. **Não homologado.** A inspeção não alimenta Bronze, banco, API ou React.

## Método

A API pública GitHub retornou a árvore recursiva completa, sem truncamento, e license=null. GET /repos/jhonatasjgr/brasileirao-2025/license retornou novamente 404. A auditoria foi ampliada para os 78 CSVs disponíveis, README da base, notebook, README principal e helper de agregações. Nenhum código do candidato foi executado; Pandas local leu somente CSVs para diagnóstico. As cópias desta revisão estão ignoradas em .tmp/source-approval-2025 e não integram o dataset do produto.

| Arquivo na revisão fixa                                   | Bytes   | SHA-256                                                          |
| --------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| Base de dados/README.md                                   | 7429    | 2e67d6c0aa7210df3faedb08f2df317a61eb1414625f8ba264c824cbb8996018 |
| Base de dados/notebook_extracao_dados.ipynb               | 32990   | 052c8afcb86089de3cbbc910f971ad611055e1476506a6f4aae1f1c374e18d46 |
| Base de dados/cartola_api_completo.csv                    | 8097948 | dfd72de56dc5f3cf84187400bf36a8744a945299982ccd45926db22403c781b1 |
| Base de dados/cartola/rodada-1.csv                        | 124475  | 4d3a53ca10d7c420c02f4459d862a8b88127b9798cfe1698308219d89f5b108b |
| Base de dados/cartola/rodada-38.csv                       | 205151  | e6c92093a66fd57a22cc40386bafdf68500158d87d6f5c32f245e3e72a11e785 |
| Base de dados/cartola_processado/rodada-38_processado.csv | 230085  | 11aa88895275944d164bca0b657bb2cf012059bf46eca1c6c8c5075777e33313 |
| backend/src/helpers/aggregations.js                       | 10050   | 7edc96466b9b425696e503b93b43bba190215ffaf2e2fe66fe67fed2e4397087 |

A revisão fixa permite recuperar cada arquivo no [diretório da base](https://github.com/jhonatasjgr/brasileirao-2025/tree/0376354699db69991630ded053bde30f7d9c5ca5/Base%20de%20dados). Os 38 brutos e 38 processados foram lidos integralmente nesta revisão; hashes, contagens e comparações estão em [source-audit-2025.json](evidence/source-audit-2025.json). Originais e processados somam, cada conjunto, 28.589 linhas. As colunas originais foram preservadas em todos os processados e os valores normalizados coincidem com o consolidado. As 38 contagens do resumo também coincidem. Isso valida a transformação de snapshots, sem validar atuações.

## Diagnósticos efetivamente calculados

O consolidado contém 28.589 linhas, 46 colunas, 980 IDs de atleta e 20 siglas de clube. Há rótulos 1..38, sem divergência entre rodada e atletas.rodada_id. Não foram encontradas duplicatas por id_jogador/rodada nem nulos em id_jogador/rodada/atletas.clube_id. Isso não comprova ausência de duplicação de eventos acumulados.

FLA corresponde a atletas.clube_id=262 nos registros observados. São 1.578 linhas e 57 IDs vinculados a FLA: 38 linhas de técnico (posicao_id=6) e 1.540 linhas de 56 IDs nas demais posições. Há 535 flags entrou_em_campo=true distribuídas por 32 desses 56 IDs; **não são 535 atuações oficiais comprovadas nem uma lista completa dos jogadores que atuaram**. Existem atletas cadastrados que nunca têm essa flag no conjunto observado.

| Diagnóstico sobre linhas FLA sem técnicos                | Resultado        |
| -------------------------------------------------------- | ---------------- |
| Rótulos sem qualquer entrou_em_campo=true                | 1, 12, 36 e 38   |
| Nulos em G                                               | 1035             |
| Nulos em A                                               | 1171             |
| Nulos em FD / FF / FT                                    | 838 / 855 / 1326 |
| Nulos em DS                                              | 677              |
| Nulos em CA / CV                                         | 1022 / 1496      |
| IDs FLA com registros em mais de um clube no consolidado | 1                |
| IDs em mais de um clube em toda a base                   | 48               |

A referência oficial confirma que houve partida na rodada 1 e na 38; as flags vazias nesses snapshots não comprovam cobertura dessas partidas. Não converter nulos em zero nem contar todas as linhas como jogos.

## Grão, acumulados e agregação

Não há match_id, adversário, data de partida, número oficial CBF, competição explícita, collected_at ou coluna temporada no consolidado. O ano vem do contexto do repositório/caminhos, sem prova de cada linha. O notebook concatena snapshots e extrai rodada do nome do arquivo. Isso não equivale a jogador × partida, especialmente com remarcações.

Ordenando as linhas FLA sem técnicos por ID/rodada e calculando diferenças de valores não nulos consecutivos, G teve 41 diferenças positivas, 445 iguais e nenhuma negativa; A teve 29 positivas, 324 iguais e nenhuma negativa; DS teve 234 positivas, 598 iguais e nenhuma negativa. jogos também nunca diminuiu no subconjunto. Esses padrões e a persistência de scouts entre snapshots são fortes evidências de acumulados. A semântica exata e a origem de cada captura permanecem pendentes: não usar soma de snapshots nem diferenças para inventar eventos por partida.

Os helpers do candidato somam G/A/DS entre linhas, convertem valores ausentes em zero e usam quantidade de linhas como jogos. Essas escolhas não atendem o contrato deste projeto. Não foram copiadas ou executadas. Último clube do jogador também não resolve a separação dos acumulados em transferências.

## Indicadores

| Campo/capacidade                                                   | Avaliação                                                                        |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Atleta, sigla, clube ID e posição de cadastro                      | Observados; mapping com CBF não auditado; técnico deve ser excluído              |
| entrou_em_campo                                                    | Observado em snapshot; não prova universo de atuações oficiais                   |
| jogos                                                              | Campo acumulado; não somar entre rodadas                                         |
| G / A / DS / CA / CV                                               | Presentes, nulos e sinais de acumulado; não liberados como eventos por jogo      |
| FD / FF / FT                                                       | Taxonomia Cartola; não equivalem automaticamente a todas as finalizações/no alvo |
| PC                                                                 | Pênalti cometido na documentação do candidato; não passes corretos               |
| I                                                                  | Impedimento; não interceptação                                                   |
| Titularidades e minutos                                            | Campos não encontrados                                                           |
| Passes tentados/corretos, interceptações, cortes, bloqueios, xG/xA | Campos não encontrados no consolidado                                            |
| G+A, taxas por 90, conversão e precisão de passes                  | Indisponíveis para cálculo verificado nesta base                                 |

O README da base descreve temporada, normalizações e derivadas que não estão no consolidado inspecionado. Cabeçalho/documentação não substitui inspeção dos arquivos. Não aproveitar rankings/pontuação fantasy como avaliação estatística geral de desempenho.

## Proveniência e permissões

O README principal menciona MIT e aponta um LICENSE inexistente na árvore auditada. Falta instrumento verificável e cadeia de direitos da fonte Cartola/Globo. O [termo oficial localizado](https://ajuda.globo/cartola/termos-e-politicas/faq/termo-de-uso.ghtml) contém restrições e refere-se a 2024; não foi comprovada autorização aplicável à coleta de 2025.

No [caRtola](https://github.com/henriquepgomide/caRtola/tree/17832580475259b8999649ced88c8694c89372e1), os 38 CSVs brutos de 2025 foram comparados e são idênticos aos do candidato. A [evidência por arquivo](evidence/cartola-upstream-comparison.json) identifica caminho, revisão e hash. Isso demonstra identidade das cópias, sem provar coleta autorizada. A licença MIT existe nesse upstream e não comprova direitos de terceiros sobre os dados originais do Cartola.

Não há comprovação suficiente para coleta de produção, Bronze local, transformação, publicação de indicadores, API, CSV ou Power BI distribuível. Não se conclui que qualquer consulta seja ilegal; conclui-se que a homologação exigida pelo projeto não foi satisfeita.

## Reprodução dos diagnósticos

A implementação em camadas agora reproduz a auditoria completa sem rede: npm.cmd run sources:audit. O comando completo, as limitações e os resultados estão em [DATA_QUALITY.md](DATA_QUALITY.md). O exemplo abaixo preserva os diagnósticos centrais da inspeção anterior; o novo relatório amplia sua cobertura aos 78 CSVs.

Para reinspecionar a mesma revisão, use os links fixos e confira SHA-256. Após obter acesso permitido à cópia auditada, este código local reproduz as contagens centrais, sem conexão de rede ou escrita de dados:

```python
from pathlib import Path
import pandas as pd

path = Path(".tmp/source-approval-2025/candidate/Base de dados/cartola_api_completo.csv")
data = pd.read_csv(path)
flamengo = data.loc[data["clube_sigla"].eq("FLA")]
players = flamengo.loc[flamengo["posicao_id"].ne(6)]
print(data.shape, data["id_jogador"].nunique(), data["clube_sigla"].nunique())
print(data.duplicated(["id_jogador", "rodada"]).sum())
print(len(flamengo), len(players), players["id_jogador"].nunique())
print(players.groupby("rodada")["entrou_em_campo"].sum())
print(players[["G", "A", "FD", "FF", "FT", "DS", "CA", "CV"]].isna().sum())
ordered = players.sort_values(["id_jogador", "rodada"])
for field in ["G", "A", "DS", "jogos"]:
    differences = ordered.groupby("id_jogador")[field].diff()
    print(field, differences.gt(0).sum(), differences.eq(0).sum(), differences.lt(0).sum())
```

Não há dataset de terceiro versionado nem aprovação embutida neste diagnóstico. Para reconsiderar o candidato, exigir licença efetiva, origem das capturas, chaves de partida, correções dos acumulados e conciliação autorizada das 38 partidas. Na forma auditada, ele não pode alimentar as análises prometidas.
