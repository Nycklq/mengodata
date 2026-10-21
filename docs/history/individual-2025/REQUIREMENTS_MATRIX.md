# Matriz de aceite

Escopo: temporada completa de 2025, Flamengo, Série A masculina, rodadas oficiais 1–38. A conclusão de software não equivale à homologação de fonte ou à conclusão empírica da pesquisa.

| Requisito                          | Implementação                                  | Evidência / pendência                                                           |
| ---------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| Preservar projeto e histórico      | Implementado                                   | Migrações históricas e docs/history preservados; sem reset/commit/push          |
| Clean Architecture                 | Implementado e testado                         | AST/imports/ciclos JS/Python; regras fora de controllers/JSX                    |
| Código sem comentários             | Implementado e testado                         | Parsers e tokenização, incluindo notebooks                                      |
| Recorte 2025/1–38 e adiamentos     | Implementado e testado                         | Elegibilidade, manifesto, SQL, API e contratos                                  |
| Auditoria de fontes/direitos       | Executada, conclusão limitada                  | OpenFootball auxiliar aprovado; individual rejeitado/pendente                   |
| Bronze/Silver/Gold real            | Implementado e executado para referências      | 38 referências reais e idempotência; sem atuações individuais                   |
| Importador individual              | Implementado e testado com sintéticos isolados | Bloqueado no registro real; falta fonte/revisão/participações                   |
| PostgreSQL e proveniência          | Implementado e testado em cluster isolado      | Banco pessoal não migrado ou autenticado pela aplicação                         |
| Fórmulas e estatística             | Implementadas e testadas JS/Python             | Sem cálculo esportivo individual de produção                                    |
| API analítica / CSV                | Implementada e testada                         | Envelope honesto; exportação real bloqueada por direitos                        |
| Nove páginas / navegação / filtros | Implementadas e testadas em DOM                | Revisão visual desktop/mobile pendente                                          |
| SVGs / estados / responsividade    | Implementados; estados/ícones testados         | Sem certificação visual ou auditoria completa de acessibilidade                 |
| Gráficos                           | Componente condicional implementado            | Exibição com dados reais depende de fonte; sem gráficos de preenchimento        |
| Comparação                         | Implementada e testada                         | Dois atletas, filtros, diferenças e aviso de posição; seleção real indisponível |
| Notebooks                          | Seis criados e executados                      | Saídas reais de auditoria e bloqueio, sem conclusões fictícias                  |
| Power BI                           | Material técnico entregue                      | M/DAX/modelo/tema preparados; compilação Desktop e PBIX/PBIP não realizados     |
| Documentação acadêmica             | Produzida                                      | Resposta sobre destaques individuais depende de dados auditados                 |
| CI e execução Windows              | Local executada; workflow atualizado           | CI remoto/Linux/WSL não executados                                              |
| Publicação/implantação             | Não realizada                                  | Fora da autorização; nenhuma distribuição externa executada                     |

Comandos e resultados finais em [TEST_REPORT.md](TEST_REPORT.md). Próximo passo essencial: obter dados individuais autorizados e comprovar identidades, participações e cobertura por métrica nas 38 partidas antes de liberar resultados.
