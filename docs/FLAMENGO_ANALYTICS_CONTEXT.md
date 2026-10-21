# Contexto operacional — Flamengo Analytics

Atualização autorizada em 21/10/2026. O Prompt Definitivo de Big Data substitui o requisito individual e o recorte de 2026. O contexto integral anterior está preservado em history/individual-2025 e history/2026; não é norma operacional.

## Objeto e pesquisa

Desempenho coletivo do Flamengo comparado aos outros 19 clubes da Série A masculina/2025, rodadas oficiais 1–38. Unidade: partida e clube × partida. Como os resultados, a produção de gols, a defesa e o mando diferenciam a campanha do Flamengo?

Excluir outras temporadas e competições. Jogos adiados mantêm a rodada de origem. Não substituir rodada por data. Estatísticas individuais, posse, passes, finalizações, cartões e xG não estão disponíveis e não recebem zeros falsos.

## Coleta e qualidade

OpenFootball football.json CC0, revisão/hash fixos em collective-source.json. Bronze conserva bytes originais, URL, revisão, licença, hash e coleta. Silver exige 380 confrontos únicos, 38 rodadas de dez jogos, 20 clubes, um jogo por clube/rodada e 19 mandos/19 visitas. Duplicatas abortam, sem remoção silenciosa.

Conciliação independente com tabela detalhada CBF de 08/12/2025: 380 placares coincidentes, 370 rodadas e 379 datas explícitas comparadas. Campos ausentes no PDF não são inferidos. A fonte não fornece IDs CBF nem fuso; UUIDs internos e localizadores externos ficam separados.

## Modelagem e indicadores

760 fatos clube × partida; Gold por clube, rodada e temporada; 760 acumulados. Jogos, vitórias/empates/derrotas, pontos 3/1/0, gols pró/contra, saldo, aproveitamento, médias, clean sheets e maiores sequências. Comparações usam a mesma janela e mando. Acumulados seguem rodada oficial; sequências seguem data efetiva.

Classificação calculada por pontos, vitórias, saldo e gols pró; empates residuais compartilham posição. Não certificar critérios disciplinares ou sanções. Estatística populacional, quartis lineares e correlação exploratória sem causalidade.

## Arquitetura e ambiente

Clean Architecture obrigatória: domínio e aplicação independentes de HTTP, SQL, arquivos e serviços externos. Backend separa regras, casos de uso, controllers, repositórios e composição. React separa domínio/filtros, caso de uso, gateway e apresentação. Pandas/NumPy são bibliotecas de cálculo do núcleo Python; arquivos/Parquet/rede/figuras ficam nas bordas. Bronze/Silver/Gold não substituem camadas de software. Código sem comentários; explicações em Markdown.

Windows 11, VS Code, Node/npm, React/Vite, .venv, PostgreSQL local e materiais Power BI. Sem containers/cluster obrigatório. DATABASE_URL no .env local; diagnóstico somente leitura; migrações explícitas. Esquema coletivo aditivo, migrações históricas imutáveis e testes em cluster isolado. API não migra no startup.

## Roadmap vigente e estado

1. Diagnóstico e especificação: escopo coletivo e histórico preservado.
2. Coleta: 380 jogos reais importados e conciliados.
3. Tratamento: Pandas/Parquet e idempotência.
4. Indicadores: Python/JS/SQL comparados.
5. Análises: seis notebooks e seis figuras reais.
6. Produtos: API e nove páginas React integradas.
7. Power BI: artefatos montáveis; validação Desktop pendente.
8. Qualidade: evidências em TEST_REPORT.md.
9. Documentação: relatório e roteiro acadêmico.
10. Pendências locais: configurar banco dedicado, revisar desktop/mobile e montar/validar Power BI nativo.

380 partidas são volume pequeno. O trabalho demonstra ETL, camadas, partição, Parquet, qualidade, rastreabilidade e idempotência; não processamento massivo ou ganho de escala medido. Futuras temporadas exigem nova validação e autorização.

Sem commits, push, publicação, contratação ou alteração em banco pessoal sem autorização explícita. STATUS.md define o estado executável; contexto não substitui evidências. Conferir arquitetura, ausência de comentários, recorte e testes antes de finalizar.
