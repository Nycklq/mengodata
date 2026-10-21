# Estado real — migração coletiva

Atualizado em 21/10/2026. Escopo ativo único: desempenho coletivo do Flamengo comparado aos outros 19 clubes, Série A masculina/2025/rodadas oficiais 1–38. Projeto existente aproveitado; sem commits, push, publicação ou contratação.

## Executado e pronto localmente

- OpenFootball CC0, revisão fixa, SHA-256 de dados e licença conferidos. 380 jogos/38 rodadas/20 clubes/38 jogos Flamengo; 19 mandos e 19 visitas por clube.
- Conciliação de 380 confrontos/placares com tabela CBF, sem divergências. 370 rodadas e 379 datas explícitas comparadas; células omitidas não são inferidas.
- Pipeline Pandas/NumPy Bronze/Silver/Gold, Parquet/CSV, partição temporada/competição e Gold JSON. Reexecução changed=false mantendo bytes/coleta.
- 760 fatos clube × partida, 20 totais e 760 acumulados; pontos, resultados, gols, saldo, aproveitamento, médias, clean sheets, sequências e descritiva.
- Migração PostgreSQL aditiva em esquema/ledger próprios; 380 partidas reais importadas em cluster isolado, idempotência/rollback e equivalência Python/SQL/API comprovados.
- API coletiva com filtros, paginação, comparação e CSV rastreável. Servidor ativo não expõe rotas de jogadores; diagnóstico/migrações são explícitos.
- Nove páginas React integradas, gráficos Recharts, SVGs existentes preservados e estados de carregamento/erro/vazio/ausência. Identidade minimalista preto/vermelho/branco mantida.
- Seis notebooks executados e seis figuras Matplotlib/Seaborn reais em reports/collective, com relatório/CSV e evidência de equivalência.
- Materiais BI: CSVs reais, modelo dimensional, M, DAX, tema, instruções e valores de conferência.
- Documentação operacional, fontes, métricas, qualidade, contratos, relatório acadêmico e roteiro de oito minutos. Histórico anterior em history/individual-2025 e history/2026, sem autoridade operacional.

## Verificações observadas

verify terminou com código 0: 40 backend + 35 frontend + 10 raiz + 174 Python + 30 PostgreSQL = 289 testes, notebooks:check, lint/formatação, build e smoke. Depois foi acrescentado teste de adiamento atravessando ano civil: verify:pipeline passou com 175 testes, e os testes coletivos de API/CSV, lint/formatação e smoke foram repetidos com sucesso. Total final das suítes: **290 testes aprovados**, sem ignorados. Detalhes em TEST_REPORT.md.

## Limitações e próximo passo concreto

Não havia .env/DATABASE_URL configurada. Banco pessoal não foi acessado ou alterado. Para persistência permanente, o titular deve conferir um banco dedicado, definir DATABASE_URL e executar db:check, db:migrate e db:import. A aplicação funciona agora com a Gold local validada.

O inventário não mostrou Power BI Desktop; não existe PBIX/PBIP validado. Montar/compilar/conferir no Desktop seguindo powerbi/README.md. O controle de UI encerrou a tentativa de revisão do Chrome porque não confirmou a URL com confiança; nenhuma nova ação de UI foi feita depois disso. Revisão visual desktop/mobile e acessibilidade completa continuam pendentes. Testes DOM/build/HTTP não a certificam.

CI remoto não executado. Classificação calculada não reproduz todos os desempates/sanções; não há dados de ações ou atletas. 380 jogos são volume pequeno e demonstram conceitos Big Data, não processamento massivo.

## Reprodução e continuidade

Na raiz: pipeline:collective → collective:analyze → collective:parity → powerbi:prepare → notebooks:execute → verify. Reprodução offline usa Bronze fixada; comandos completos no README. Abrir dev:backend e dev:frontend em terminais separados, http://127.0.0.1:5173/. Não reiniciar projeto ou voltar ao requisito individual.

[Arquivos da entrega](DELIVERY_FILES.md), [roteiro](PRESENTATION.md), [resultados](../reports/collective/README.md).
