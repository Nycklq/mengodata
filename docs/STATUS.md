# Estado real — finalização do produto

Atualizado em 22/10/2026. Escopo ativo único: desempenho coletivo do Flamengo comparado aos outros 19 clubes, Série A masculina/2025/rodadas oficiais 1–38. Projeto existente aproveitado; sem commits, push, publicação ou contratação.

## Configuração MengoData concluída

A conexão ativa é `127.0.0.1:5432/mengo_data`, role `flamengo_app`. `.env` ajustado com backup; LOGIN e grants mínimos aplicados pelo usuário no pgAdmin. SELECT 1 e contagens reais aprovados: 380 partidas, 20 clubes, 760 fatos, 20 totais e 760 acumulados. Importação `changed=true`, repetição `changed=false`. API ativa em 3001 e sessão real identificada nesse banco em `pg_stat_activity`. O cluster alternativo permanece preservado e não é usado pela API. [Diagnóstico e evidências](POSTGRESQL_MENGO_DATA.md).

## Executado e pronto localmente

- OpenFootball CC0, revisão fixa, SHA-256 de dados e licença conferidos. 380 jogos/38 rodadas/20 clubes/38 jogos Flamengo; 19 mandos e 19 visitas por clube.
- Conciliação de 380 confrontos/placares com tabela CBF, sem divergências. 370 rodadas e 379 datas explícitas comparadas; células omitidas não são inferidas.
- Pipeline Pandas/NumPy Bronze/Silver/Gold, Parquet/CSV, partição temporada/competição e Gold JSON. Reexecução changed=false mantendo bytes/coleta.
- 760 fatos clube × partida, 20 totais e 760 acumulados; pontos, resultados, gols, saldo, aproveitamento, médias, clean sheets, sequências e descritiva.
- Migração PostgreSQL aditiva em esquema/ledger próprios; 380 partidas reais importadas em cluster isolado, idempotência/rollback e equivalência Python/SQL/API comprovados.
- API coletiva com filtros, paginação, comparação e CSV rastreável. Servidor ativo não expõe rotas de jogadores; diagnóstico/migrações são explícitos.
- Nove páginas React refinadas: logo enviada aplicada sem edição à marca, abertura e favicon; sidebar escura, conteúdo claro, cards, tipografia, tabelas e estados de carregamento consistentes. Estilos anteriores e módulos inativos preservados.
- Comparação entre quaisquer dois clubes: dois seletores, troca, restauração, persistência na URL, mesma janela/mando, 14 indicadores, diferenças absolutas/relativas, destaques e evolução com cinco indicadores. Base zero e ausências não recebem zeros falsos. Detalhamento casa/fora mantém os filtros.
- Gráficos de ataque/defesa com barras horizontais e altura para os 20 nomes; evolução com áreas leves, tooltip e legendas padronizados; posição com 1º no topo. Tabelas com região de rolagem acessível e partidas com 10/20/50/100 itens por página.
- Menu compacto até 960 px com Escape, ciclo de foco e retorno ao botão; foco no conteúdo ao navegar e redução de movimento respeitada. Seletores mantêm rodada inicial ≤ final. Filtros separados por recurso evitam parâmetros incompatíveis.
- Corrigida a posição no resumo dos clubes: calculada entre os 20 clubes do mesmo recorte, em vez de um universo de um único clube.
- PostgreSQL ativo no banco `mengo_data` do serviço local em 5432; schema existente preservado, sem nova migração. Diagnóstico READ ONLY, importação e equivalência SQL/Gold dos 20 totais e 760 acumulados aprovados. Cluster anterior em `.local/postgres` preservado como alternativa.
- Comandos `db:local:setup/start/stop/status/configure` preservados para o cluster alternativo. Não fazem parte da inicialização do MengoData. Não há migração automática no startup, troca silenciosa de banco ou dependência nova de containers.
- Seis notebooks executados e seis figuras Matplotlib/Seaborn reais em reports/collective, com relatório/CSV e evidência de equivalência.
- Materiais BI: CSVs reais, modelo dimensional, M, DAX, tema, instruções e valores de conferência.
- Documentação operacional, fontes, métricas, qualidade, contratos, relatório acadêmico e roteiro de oito minutos. Histórico anterior em history/individual-2025 e history/2026, sem autoridade operacional.

## Verificações observadas

Suítes e verificações reexecutadas em 22/10/2026, incluindo comparação, integração, persistência após reinício e foco do menu. Pipeline offline `changed=false`, seis figuras e seis notebooks reexecutados, materiais BI regenerados e equivalência de 20 totais/760 acumulados confirmada. Contagens finais e comandos observados em [TEST_REPORT.md](TEST_REPORT.md).

## Limitações e próximo passo concreto

O MengoData usa o serviço PostgreSQL instalado, em 5432. Reinicie a API após alterar DATABASE_URL. Não execute `db:local:configure` para esse destino: o comando troca a configuração para o cluster alternativo. Em outro checkout, siga o README. Gold local continua disponível quando não há DATABASE_URL; não é fallback de uma conexão configurada que falhou.

Não existe PBIX/PBIP validado. Montar/compilar/conferir no Power BI Desktop seguindo powerbi/README.md. Nesta sessão, o inventário de UI retornou vazio e a abertura de IAB falhou com `Browser is not available: iab`. Revisão visual desktop/mobile e acessibilidade completa continuam pendentes; DOM/build/HTTP não as certificam. Checklist em [DESIGN_REVIEW.md](DESIGN_REVIEW.md).

CI remoto não executado. Classificação calculada não reproduz todos os desempates/sanções; não há dados de ações ou atletas. 380 jogos são volume pequeno e demonstram conceitos Big Data, não processamento massivo.

## Reprodução e continuidade

Na raiz: pipeline:collective → collective:analyze → collective:parity → powerbi:prepare → notebooks:execute → verify. Reprodução offline usa Bronze fixada; comandos completos no README. Abrir dev:backend e dev:frontend em terminais separados, http://127.0.0.1:5173/. Não reiniciar projeto ou voltar ao requisito individual.

[Arquivos da entrega](DELIVERY_FILES.md), [roteiro](PRESENTATION.md), [resultados](../reports/collective/README.md).
