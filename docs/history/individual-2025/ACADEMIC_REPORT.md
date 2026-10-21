# Flamengo Analytics — Análise Estatística do Desempenho Individual dos Jogadores do Flamengo no Campeonato Brasileiro Série A de 2025

Texto de trabalho para adaptação às normas da instituição e ABNT. Não inclui autoria, orientador ou resultados individuais presumidos. Data da execução e da consulta documental: 19 de outubro de 2026.

## Problema e objetivos

A pergunta central é: quais jogadores do Flamengo se destacaram em participação, produção ofensiva, contribuição defensiva e eficiência no Campeonato Brasileiro Série A masculino de 2025? O objetivo é construir um processo reproduzível capaz de responder com rastreabilidade, preservando diferenças de posição, tempo em campo e disponibilidade dos indicadores.

Objetivos específicos: identificar partidas e atuações elegíveis; verificar proveniência e direitos; preparar dados por jogador/partida; calcular indicadores comparáveis; apresentar exploração web e BI; documentar limitações; validar regras com testes automatizados. Não se pretende inferir causalidade, medir valor universal de um atleta ou substituir análise tática.

## Delimitação e desenho metodológico

Pesquisa aplicada, com desenvolvimento de software e análise descritiva condicionada a dados observacionais verificados. O universo é Flamengo, futebol masculino profissional, Série A de 2025, temporada completa, rodadas oficiais 1 a 38. Adiamentos mantêm rodada de origem. Atuações por outros clubes, competições ou temporadas ficam excluídas, inclusive em casos de transferência.

A unidade de observação desejada é jogador por partida em que efetivamente entrou em campo pelo Flamengo. Cadastro de elenco, presença no banco, calendário, snapshot de fantasy e total acumulado não comprovam essa unidade. Um manifesto estruturalmente completo também não demonstra cobertura individual.

## Fontes e verificação

A auditoria examinou OpenFootball, o candidato jhonatasjgr/brasileirao-2025 e sua relação com caRtola, referências oficiais CBF, FBref/Sports Reference e documentação de APIs comerciais. Revisões, URLs, hashes, termos e limitações estão em [DATA_SOURCES.md](DATA_SOURCES.md) e [SOURCE_APPROVAL.md](SOURCE_APPROVAL.md). O acesso a páginas públicas não foi tratado como permissão irrestrita de redistribuição.

OpenFootball forneceu 380 referências de partidas da competição, das quais 38 do Flamengo, com rodada, data civil, equipes e placar. A licença CC0 examinada permite o uso desse conjunto auxiliar; a fonte não fornece estatísticas individuais, IDs oficiais conciliados ou fuso. O projeto não fabricou identificadores nem transformou placares de equipe em gols de atletas.

O candidato contém 78 CSVs, com 28.589 linhas no consolidado e 46 colunas. Foram identificadas 1.540 linhas de jogadores cadastrados como Flamengo, com 56 IDs e 535 flags de entrada em campo distribuídas entre 32 IDs. Essas flags não representam atuações oficiais verificadas. Os snapshots 1, 12, 36 e 38 não apresentam flags de jogador FLA; minutos, titularidades e vínculos de partida estão ausentes ou não comprovados. Os 38 brutos coincidem com a revisão upstream examinada. A ausência de licença do repositório e os direitos originais Cartola não foram resolvidos. Essas constatações impedem somar scouts acumulados ou publicar indicadores individuais. Evidência em [DATA_QUALITY.md](DATA_QUALITY.md).

## Preparação e arquitetura

O fluxo autorizado preserva bytes e hash na Bronze; normaliza formato e mantém rodada na Silver; publica catálogo auxiliar separado na Gold. Reexecução idêntica não duplica registros ou altera recibo. Uma entrada individual futura exige schema canônico, hash revisado, identidades, conciliação oficial, participações auditadas e permissões específicas de cada canal.

Clean Architecture separa regras estatísticas/elegibilidade, casos de uso e conectores de arquivo/rede/PostgreSQL. Backend, frontend e Python compartilham contratos sem impor dependências entre linguagens. PostgreSQL mantém componentes e proveniência; a API calcula pelo núcleo; React apresenta; o material Power BI reproduz fórmulas com tratamento explícito de ausência. A validação no motor Power BI ainda está pendente.

## Indicadores e análise

Participação: partidas distintas, titularidades e minutos. Ataque: gols, assistências, G+A, finalizações e taxas por 90. Defesa: desarmes, interceptações, cortes e bloqueios quando definidos e disponíveis. Eficiência: produção × 90 ÷ minutos, gols ÷ finalizações × 100 e passes certos ÷ tentados × 100. xG/xA exigem identificação do modelo e cobertura compatível.

Somas e razões preservam ausência: se qualquer componente necessário é desconhecido, o agregado correspondente permanece indisponível. Razões são calculadas a partir dos componentes somados; médias simples de percentuais de partida não são utilizadas. Denominador zero não produz taxa zero. Arredondamento é de apresentação.

Distribuições usam valores conhecidos; mediana e quartis adotam interpolação linear em (n−1)p. A regra descritiva de outliers é externa a [Q1−1,5×AIQ, Q3+1,5×AIQ]. Limiar de minutos, posição e cobertura delimitam a população de comparação. Ausências são excluídas da amostra e não substituídas por zero. Não se atribui significado causal aos extremos.

## Achados comprovados e resultados indisponíveis

O achado metodológico é a diferença entre cobertura de calendário, arquivos por rodada e cobertura individual auditada. Há 38 referências auxiliares reais integradas, mas nenhuma fonte individual homologada. Não é possível responder de forma verificável quem foram os destaques da temporada com os artefatos autorizados atuais.

O resultado tecnológico inclui a plataforma web com nove páginas, API, regras estatísticas testadas, importação condicionada, persistência transacional e notebooks executados. Os testes verificam comportamento do software, não comprovam que dados sintéticos correspondam à temporada real. Não foram produzidos rankings reais, gráficos individuais ou conclusões de superioridade esportiva.

## Limitações e reprodutibilidade

Limitações principais: autorização individual insuficiente, ausência de observações por partida, mapeamento oficial incompleto e convenções métricas não homologadas. Também não houve validação do relatório no Power BI Desktop, revisão visual completa da aplicação, execução remota do CI ou confirmação do banco pessoal. Essas etapas não foram declaradas concluídas.

Instalação, execução e testes estão no [README](../README.md) e [TEST_REPORT.md](TEST_REPORT.md). Os seis notebooks preservam saídas executadas de indisponibilidade e auditoria, sem dados de demonstração em produção. Locks, revisões, checksums e contratos permitem repetir verificações. A publicação futura depende de direitos suficientes e revisão do titular do projeto.

## Referências para normalização bibliográfica

- OPENFOOTBALL. football.json: conjunto brasileiro 2025 e licença CC0, revisão e6744429ee395bc86f247348c6184bb08d4eb361. [Dados](https://github.com/openfootball/football.json/blob/e6744429ee395bc86f247348c6184bb08d4eb361/2025/br.1.json) e [licença](https://github.com/openfootball/football.json/blob/e6744429ee395bc86f247348c6184bb08d4eb361/LICENSE.md). Consulta: 19 out. 2026.
- JHONATASJGR. brasileirao-2025, revisão 0376354699db69991630ded053bde30f7d9c5ca5. [Repositório](https://github.com/jhonatasjgr/brasileirao-2025/tree/0376354699db69991630ded053bde30f7d9c5ca5). Consulta: 19 out. 2026. Uso individual não homologado.
- CBF. Documentação da competição e referências de partidas de 2025. URLs e limitações de consulta preservadas em [ROUND_SCOPE.md](ROUND_SCOPE.md).
- GLOBO. Termo de uso Cartola, seção 9.1; página consultada com referência a 2024, sem afirmar aplicabilidade contratual a 2025. [Termo](https://ajuda.globo/cartola/termos-e-politicas/faq/termo-de-uso.ghtml). Consulta: 19 out. 2026.
- MICROSOFT. Documentação de [DIVIDE](https://learn.microsoft.com/en-us/dax/divide-function-dax), [PERCENTILEX.INC](https://learn.microsoft.com/en-us/dax/percentilex-inc-function-dax) e [Table.FromRecords](https://learn.microsoft.com/en-us/powerquery-m/table-fromrecords). Consulta: 19 out. 2026.

Os documentos internos de evidência complementam as referências e registram incertezas. Não foram inventados artigos, autores acadêmicos, DOI ou resultados empíricos para preencher a bibliografia.
