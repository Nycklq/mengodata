# Contrato semântico dos indicadores

Data: 19/10/2026. Fórmulas implementadas no núcleo JS/Python e testadas com fixture neutra. Nenhum indicador individual foi calculado com dados esportivos de produção. A auditoria examinou disponibilidade de campos, não liberou agregações. [Fontes](DATA_SOURCES.md), [qualidade](DATA_QUALITY.md) e [aprovações](SOURCE_APPROVAL.md).

## Matriz auditada de disponibilidade

As classificações descrevem a existência e a adequação dos campos nas cópias examinadas. Parcialmente disponível não significa cálculo ou publicação autorizados. A cobertura individual esperada permanece desconhecida sem a relação completa de atuações. Nenhum dos scouts abaixo está verificado por atleta × partida.

| Indicador | Fonte | Campo original | Granularidade | Cobertura observada | Transformação admissível agora | Confiabilidade | Restrição de uso | Classificação |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Referências de jogos e placares | OpenFootball | round, date, team1, team2, score ou score.ft | Partida de equipe | 38 registros Flamengo; conciliação CBF integral pendente | Normalizar lista/ft e preservar rodada declarada; sem atribuição a atleta | Verificada no arquivo como referência auxiliar | CC0 somente para esses metadados | Verificada |
| Gols do jogador | Candidato/Cartola | G | Atleta × snapshot, com sinais de acumulado | 505 valores não nulos em 1.540 linhas FLA sem técnicos; não são 505 atuações | Nenhuma soma ou diferença para criar eventos | Sem vínculo oficial e definição/captura verificadas | Direitos originais pendentes; bloqueado no produto | Parcialmente disponível |
| Assistências | Candidato/Cartola | A | Atleta × snapshot | 369 valores não nulos; cobertura por atuação desconhecida | Nenhuma agregação; confirmar conceito e revisões | Semântica pendente | Direitos pendentes; bloqueado | Parcialmente disponível |
| Minutos | Fontes examinadas | Ausente | Não fornecida | Nenhuma base individual de minutos | Nenhuma; não deduzir por jogos × 90 | Sem evidência | Buscar fonte autorizada | Indisponível |
| Partidas do jogador | Candidato/Cartola | atletas.jogos_num → jogos; atletas.entrou_em_campo → entrou_em_campo | Contador acumulado e flag de snapshot | 535 flags em 32 IDs; snapshots 1/12/36/38 sem flags FLA | Não contar linhas nem somar contador; exigir atuações distintas | Não comprova partidas oficiais | Direitos pendentes; bloqueado | Parcialmente disponível |
| Titularidades | Fontes examinadas | Ausente | Não fornecida | Sem escalação completa por atuação | Não inferir de posição, status ou pontos | Sem evidência | Buscar fonte autorizada | Indisponível |
| Finalizações | Candidato/Cartola | FD, FF, FT | Scouts de snapshot | 702 / 685 / 214 valores não nulos respectivamente; sem cobertura por partida | Não assumir FD+FF+FT como todas as finalizações | Taxonomia e acumulados pendentes | Direitos pendentes; bloqueado | Parcialmente disponível |
| Finalizações no alvo | Candidato/Cartola | FD e G, sem campo homologado de total no alvo | Snapshot | Composição e correspondência de eventos não confirmadas | Não montar total a partir de rótulos incompletos | Não verificada | Direitos pendentes; bloqueado | Pendente de confirmação |
| Desarmes | Candidato/Cartola | DS | Atleta × snapshot | 863 valores não nulos, com persistência/acúmulo | Não somar snapshots nem equiparar vencidos/totais | Definição de evento e cobertura pendentes | Direitos pendentes; bloqueado | Parcialmente disponível |
| Interceptações | Fontes examinadas | Ausente; I no candidato significa impedimento | Não fornecida | Nenhuma cobertura individual | Não renomear I como interceptações | Sem evidência | Buscar fonte autorizada | Indisponível |
| Passes tentados/corretos | Fontes examinadas | Ausentes; PC no notebook é pênalti cometido | Não fornecida | Nenhuma cobertura dos dois componentes | Não tratar PC como passes corretos | Sem evidência | Buscar fonte autorizada | Indisponível |
| Precisão de passes | Fontes examinadas | Sem tentados/corretos | Não calculável | Denominador e numerador ausentes | Nenhuma | Sem evidência | Buscar fonte autorizada | Indisponível |
| G+A | Candidato/Cartola | G e A | Componentes em snapshots | Sem cobertura comum por atuação | Fórmula preservada; cálculo bloqueado | Componentes não homologados | Direitos pendentes; bloqueado | Pendente de confirmação |
| G90, A90, GA90 | Fontes examinadas | G/A sem eventos homologados; minutos ausentes | Não calculável | Sem denominador compatível | Não estimar minutos ou fabricar zeros | Sem evidência suficiente | Buscar fonte autorizada | Indisponível |
| Conversão | Fontes examinadas | G e finalizações sem conjunto homologado | Não calculável | Numerador/denominador não conciliados | Não calcular taxa sobre snapshots acumulados | Sem evidência suficiente | Bloqueado | Indisponível |
| Cartões | Candidato/Cartola | CA, CV | Atleta × snapshot | 518 / 44 valores não nulos respectivamente | Não somar acumulados; confirmar contexto de eventos | Sem vínculo e política de segundo amarelo verificados | Direitos pendentes; bloqueado | Parcialmente disponível |
| Cortes, bloqueios, xG e xA | Fontes examinadas | Ausentes | Não fornecida | Nenhuma cobertura individual | Não inferir de scouts ou valores de equipe | Sem evidência | Buscar fonte autorizada | Indisponível |

Os números da matriz contam células preenchidas do arquivo, sem tratar ausência como zero e sem representar partidas ou totais esportivos. Foram calculados como 1.540 menos os nulos auditados e registrados em [DATA_QUALITY.md](DATA_QUALITY.md). A origem física e a derivação de todas as colunas estão documentadas ali. Sportmonks e API-Football continuam candidatos: capacidades anunciadas não preenchem esta matriz sem amostra legítima de 2025.

## Universo comum

Toda observação deve pertencer a uma partida validada da Série A masculina de 2025, rodada oficial entre 1 e 38, e a uma atuação pelo Flamengo. Elenco atual, último clube do jogador e data do calendário não substituem essa validação. Todos os produtos usarão o rótulo “Brasileirão Série A 2025 — temporada completa (rodadas 1 a 38)”. Agregados anuais podem apoiar conciliação quando clube e competição forem comprovados, mas não substituem a base por atuação nem permitem inventar detalhes de partidas.

O conjunto de jogadores analisados será formado pelos atletas com evidência de atuação no recorte, inclusive transferidos. Estar no banco ou no elenco não comprova participação. Uma entrada nos acréscimos pode gerar minutagem arredondada igual a zero; não definir participação somente por `minutos > 0`.

## Definições e fórmulas

Considere G = gols, A = assistências, M = minutos, F = finalizações, PC = passes corretos e PT = passes tentados. Cada componente é agregado somente de observações elegíveis e compatíveis.

| Indicador | Regra implementada, condicionada à homologação | Unidade e condição |
| --- | --- | --- |
| Jogadores analisados | Contagem de IDs distintos com atuação comprovada | Atletas; cobertura do universo informada |
| Partidas do jogador | Contagem distinta de partidas em que entrou em campo | Partidas; não contar apenas convocação/banco |
| Titularidades | Contagem distinta de atuações iniciadas como titular | Partidas; deve haver evidência de escalação |
| Minutos | Soma da minutagem segundo convenção homologada | Minutos; convenção do fornecedor registrada |
| Gols | Soma de gols atribuídos ao atleta | Gols; gols contra tratados separadamente |
| Assistências | Soma segundo definição documentada da fonte | Assistências; sem inferência a partir do placar |
| Participações em gols | G + A | Participações; ambos os componentes disponíveis |
| G90 | 90 × G / M | Gols por 90 minutos |
| A90 | 90 × A / M | Assistências por 90 minutos |
| GA90 | 90 × (G + A) / M | Participações por 90 minutos |
| Conversão | 100 × G / F | Percentual; confirmar compatibilidade da definição de gol/finalização |
| Precisão de passes | 100 × PC / PT | Percentual; exige os dois componentes |
| Finalizações e no alvo | Soma das respectivas contagens individuais | Finalizações; definir inclusão de pênaltis/bloqueios pela fonte |
| Desarmes, interceptações, cortes e bloqueios | Soma de cada evento definido separadamente | Ações; não fundir taxonomias diferentes |
| Cartões amarelos e vermelhos | Contagens distintas segundo política de eventos | Cartões; distinguir segundo amarelo, vermelho direto e contexto |
| xG e xA | Soma de valores individuais fornecidos por modelo identificado | Expectativas; somente com cobertura e definição verificadas |

Percentuais e taxas do agregado devem ser calculados pelos componentes somados, nunca pela média simples de percentuais ou taxas de partidas. O total de participações G+A por jogadores não representa quantidade de gols da equipe. Gols contra a favor podem explicar diferença entre soma dos gols individuais e placar; não impor igualdade incorreta.

Sem denominador ou com denominador zero, a taxa é indisponível. Gols confirmados iguais a zero e minutos válidos positivos podem produzir G90 igual a zero; isso difere de ausência de observação. Não reconstituir passes corretos multiplicando tentativas por uma precisão arredondada.

## Ausências e cobertura

O envelope implementa available, partial e unavailable com motivo. Não aplicável continua dependendo da convenção documentada da fonte; não é convertido em zero. Valor zero só é válido quando a fonte e a cobertura comprovam ausência do evento. Campo omitido ou nulo não comprova zero.

Para o universo da equipe, a cobertura de partidas compara os jogos observados com as 38 referências oficiais, após tratar alterações documentadas. Para uma métrica de jogador, o denominador de cobertura são suas atuações elegíveis esperadas, verificadas com escalações/eventos; não são automaticamente 38. Se nem a participação está completa, o denominador é desconhecido.

Cada agregado deve conservar quantidade de observações esperadas e válidas, IDs das partidas cobertas ou vínculo recuperável, fonte, versão, data de atualização e motivo de ausência. Uma soma parcial não será chamada de total da temporada. Taxas só serão disponibilizadas quando numerador e denominador tiverem a mesma cobertura comprovada; resultados parciais, se apresentados, exigem rótulo e universo explícitos, sem misturá-los ao ranking completo.

Somar ignorando valores nulos ou converter BLANK em zero no Power BI pode esconder lacunas. As validações precisam preservar o estado de disponibilidade até as exportações.

## Semântica pendente da homologação

- **Minutos:** definir acréscimos, arredondamento, substituições no intervalo, expulsões e limite operacional da partida. Horários de relógio da súmula não fornecem sozinhos uma minutagem comparável à de outro fornecedor. Não impor limite de 90 sem a convenção escolhida.
- **Assistências:** confirmar gols contra, desvios, pênaltis sofridos e revisões. Não misturar definições de fornecedores.
- **Cartões:** preservar vínculo à partida e contexto; documentar se o indicador conta sanções pós-jogo e a diferença para cartões em campo antes de implementá-lo. A amostra de 2026 está somente no histórico e não comprova eventos de 2025. Não descartar nem somar automaticamente uma dupla punição.
- **Defesa:** “desarmes vencidos” e “desarmes totais” não são equivalentes. Confirmar separadamente cortes e bloqueios no nível individual.
- **Posição:** diferenciar posição de cadastro e da atuação. Padronização depende da taxonomia da fonte e deve ser rastreável.
- **Conversão, xG e xA:** confirmar escopo dos eventos e modelo; ausência de dado individual não permite repartir uma métrica coletiva entre jogadores.

## Distribuição e apresentação

Quartis e mediana usam interpolação linear na posição (n−1)p. Outliers são valores fora de Q1−1,5×AIQ e Q3+1,5×AIQ. Apenas números conhecidos entram na amostra; n=0 é metadado de amostra vazia, não estatística esportiva zero. Não há teste inferencial ou conclusão causal.

[metrics.json](../contracts/metrics.json) registra rótulos, unidades e precisão. Contagens são exibidas como inteiros; taxas, percentuais, xG e xA usam até duas casas, sem arredondamento nos componentes. Percentuais já estão em escala 0–100 e não devem receber nova multiplicação no Power BI. Ordenação deixa nulos por último e empates estáveis por UUID; isso não declara vantagem entre empatados.

Uma soma só é conhecida quando todas as parcelas das aparições selecionadas são conhecidas. Titularidades exigem todos os flags starter conhecidos. Sem aparições, partidas/titularidades permanecem indisponíveis. A API separa a contagem de linhas conhecidas dos totais da temporada e bloqueia o resumo anual sob cobertura parcial.

## Comparação e paridade

Preservar filtros de minutagem previstos: todos, pelo menos 450, 900, 1.500 ou valor personalizado validado. Esses limites estão implementados na API e nos filtros React, incluindo personalizado; não são conclusões sobre a amostra real. Comparações usam a mesma cobertura, unidade e definição; diferenças entre posições exigem contexto. Nenhum índice geral de qualidade ou inferência causal foi aprovado.

Python gera os componentes e indicadores Gold; PostgreSQL conserva os componentes e versões; API entrega números e metadados; React formata; Power BI utiliza as mesmas definições. Qualquer cálculo necessário em SQL/DAX/JavaScript deve ser conferido contra Python. Contagens terão igualdade exata; tolerância de decimais dependerá da precisão adotada, documentada antes do teste. Arredondamento ocorre na apresentação, sem alterar o componente canônico.

Os testes implementados cobrem escopo, componentes, denominadores, nulos e fórmulas. A conciliação com observações reais e o motor Power BI permanece pendente de fonte e ferramenta. Um valor numericamente igual sobre universos diferentes não comprova consistência.
