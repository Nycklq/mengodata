# Contrato semântico inicial dos indicadores

Data: 19/10/2026. Definições de planejamento fundamentadas no contexto. Nenhum indicador foi calculado com dados esportivos nesta fase. Disponibilidade por fonte: [DATA_SOURCES.md](DATA_SOURCES.md).

## Universo comum

Toda observação deve pertencer a uma partida validada da Série A masculina de 2026, rodada oficial entre 1 e 19, e a uma atuação pelo Flamengo. Elenco atual, total da temporada e data do calendário não substituem essa validação. Todos os produtos usarão o rótulo “Brasileirão Série A 2026 — 1º turno (rodadas 1 a 19)”.

O conjunto de jogadores analisados será formado pelos atletas com evidência de atuação no recorte, inclusive transferidos. Estar no banco ou no elenco não comprova participação. Uma entrada nos acréscimos pode gerar minutagem arredondada igual a zero; não definir participação somente por `minutos > 0`.

## Definições e fórmulas

Considere G = gols, A = assistências, M = minutos, F = finalizações, PC = passes corretos e PT = passes tentados. Cada componente é agregado somente de observações elegíveis e compatíveis.

| Indicador | Regra proposta | Unidade e condição |
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

Estados propostos: disponível, parcial, indisponível e não aplicável, sempre com motivo. Valor zero só é válido quando a fonte e a cobertura comprovam ausência do evento. Campo omitido ou nulo não comprova zero.

Para o universo da equipe, a cobertura de partidas compara os jogos observados com as 19 referências oficiais, após tratar alterações documentadas. Para uma métrica de jogador, o denominador de cobertura são suas atuações elegíveis esperadas, verificadas com escalações/eventos; não são automaticamente 19. Se nem a participação está completa, o denominador é desconhecido.

Cada agregado deve conservar quantidade de observações esperadas e válidas, IDs das partidas cobertas ou vínculo recuperável, fonte, versão, data de atualização e motivo de ausência. Uma soma parcial não será chamada de total do turno. Taxas só serão disponibilizadas quando numerador e denominador tiverem a mesma cobertura comprovada; resultados parciais, se apresentados, exigem rótulo e universo explícitos, sem misturá-los ao ranking completo.

Somar ignorando valores nulos ou converter BLANK em zero no Power BI pode esconder lacunas. As validações precisam preservar o estado de disponibilidade até as exportações.

## Semântica pendente da homologação

- **Minutos:** definir acréscimos, arredondamento, substituições no intervalo, expulsões e limite operacional da partida. Horários de relógio da súmula não fornecem sozinhos uma minutagem comparável à de outro fornecedor. Não impor limite de 90 sem a convenção escolhida.
- **Assistências:** confirmar gols contra, desvios, pênaltis sofridos e revisões. Não misturar definições de fornecedores.
- **Cartões:** a amostra da rodada 1 registra expulsão após o término. Preservar o vínculo à partida e o contexto; documentar se o indicador conta sanções pós-jogo e a diferença para cartões em campo antes de implementá-lo. Não descartar nem somar automaticamente uma dupla punição.
- **Defesa:** “desarmes vencidos” e “desarmes totais” não são equivalentes. Confirmar separadamente cortes e bloqueios no nível individual.
- **Posição:** diferenciar posição de cadastro e da atuação. Padronização depende da taxonomia da fonte e deve ser rastreável.
- **Conversão, xG e xA:** confirmar escopo dos eventos e modelo; ausência de dado individual não permite repartir uma métrica coletiva entre jogadores.

## Comparação e paridade

Preservar filtros de minutagem previstos: todos, pelo menos 450, 900, 1.500 ou valor personalizado validado. Esses valores são critérios planejados, não conclusões sobre a amostra real. Comparações usam a mesma cobertura, unidade e definição; diferenças entre posições exigem contexto. Nenhum índice geral de qualidade ou inferência causal foi aprovado.

Python gera os componentes e indicadores Gold; PostgreSQL conserva os componentes e versões; API entrega números e metadados; React formata; Power BI utiliza as mesmas definições. Qualquer cálculo necessário em SQL/DAX/JavaScript deve ser conferido contra Python. Contagens terão igualdade exata; tolerância de decimais dependerá da precisão adotada, documentada antes do teste. Arredondamento ocorre na apresentação, sem alterar o componente canônico.

As verificações futuras incluirão mesmos IDs de partidas e atletas, exclusões corretas, contagens, somas, denominadores, estado de ausência e versão, além do valor exibido. Um valor numericamente igual sobre universos diferentes não comprova consistência.
