# Power BI: montagem reproduzível

Os artefatos são preparação técnica. Nenhum PBIX/PBIP foi produzido, aberto ou validado no Power BI Desktop nesta execução. Não há embed ou publicação externa. As consultas retornam tabelas vazias no estado atual; isso é indisponibilidade, não desempenho zero.

1. Na raiz, execute `npm run powerbi:prepare`. O arquivo `data/analytics/powerbi.json` só recebe linhas quando o artefato individual exato foi homologado e a distribuição no Power BI possui evidência de permissão. No estado atual ele contém metadados de bloqueio e listas vazias.
2. No Desktop, crie um relatório vazio. No Power Query, crie o parâmetro de texto `CaminhoGold` com o caminho absoluto desse JSON local. Crie a consulta `Individual` com [Individual.m](queries/Individual.m) e desabilite seu carregamento como tabela.
3. Crie consultas de referência `Fato = Individual[Fato]`, `DimJogador = Individual[DimJogador]`, `DimPartida = Individual[DimPartida]` e `Metadata = Individual[Metadata]` pelo Editor Avançado, usando `let Resultado = Individual[Fato] in Resultado` e o campo correspondente para as demais.
4. Crie `Dimensions` com [Dimensions.m](queries/Dimensions.m), sem carregamento. Referencie os cinco campos do registro como tabelas, seguindo o mesmo padrão. As dimensões de escopo e posições são metadados próprios, não estatísticas esportivas fabricadas.
5. Configure as seis relações de [model.json](model.json), cardinalidade 1:N, filtro unidirecional. Desative data/hora automática. Não relacione Metadata ou MinimoMinutos. Crie `JogadorA` e `JogadorB` como referências independentes de DimJogador, sem relacionamentos, para os seletores do comparador.
6. Adicione cada expressão de [measures.dax](measures.dax) separadamente em Nova medida. Use formato inteiro nos volumes e duas casas nas taxas. Os indicadores percentuais já multiplicam por 100; use formato numérico, não o formato percentual que multiplica novamente.
7. Importe [theme.json](theme.json). Fundo branco, cartões simples, vermelho apenas como destaque. Não use fotos, escudos oficiais ou dados externos não autorizados.

| Página                  | Visuais e filtros                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Visão Geral             | Cartões Atletas, Gols, Assistências e G+A; ranking de gols; aviso de cobertura               |
| Desempenho Ofensivo     | Barras de gols/assistências; dispersão minutos × G+A; filtro por posição e mínimo de minutos |
| Desempenho Defensivo    | Barras de desarmes/interceptações/cortes/bloqueios, sem substituir ausências por zero        |
| Comparação de Jogadores | Seletores desconectados A e B; gols A/B e diferença; aviso para posições distintas           |
| Eficiência Estatística  | Taxas por 90, conversão, precisão de passes, mediana e quartis; população explícita          |

Filtre visuais de ranking por `Elegível por minutos = 1`. Para mínimo personalizado, crie parâmetro numérico desconectado e substitua apenas a seleção do limiar. A ordenação densa atribui a mesma posição aos empates; a API ordena empates por UUID para paginação estável, sem declarar vantagem estatística.

As medidas anuais ficam em branco sem cobertura completa e quando qualquer parcela necessária é desconhecida. As medidas explicitamente chamadas “observados” permitem inspecionar cobertura parcial sem alegar total da temporada. Denominadores zero geram BLANK. Quantis INC usam interpolação (n−1), conforme Python/JS. Outliers usam Q1−1,5×AIQ e Q3+1,5×AIQ; aplicar a regra só a valores conhecidos.

Validação ainda necessária no Desktop: compilar M/DAX, conferir relações, comparar métricas por atleta com a API e revisar as cinco páginas em 16:9. O JSON, a presença dos campos e o bloqueio de distribuição são testados localmente; isso não equivale à execução do motor Power BI.

Referências técnicas: [temas](https://learn.microsoft.com/en-us/power-bi/create-reports/desktop-report-themes), [DIVIDE](https://learn.microsoft.com/en-us/dax/divide-function-dax), [Power Query Table.FromRecords](https://learn.microsoft.com/en-us/powerquery-m/table-fromrecords).
