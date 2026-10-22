# Matriz de aceite — MengoData

Atualização posterior: gráficos e cards conferidos em Chrome real com CSS, 32 testes da matriz 375/768/1024/1440 claro/escuro e quatro no localhost/PostgreSQL. A restrição CSS que reduzia os viewports a zero foi removida. [Diagnóstico e PNGs](CHART_RENDERING_FIX.md). Essa evidência substitui a antiga pendência específica de revisão dos gráficos/cards, preservando os demais limites da auditoria geral.

| Requisito        | Evidência/estado                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Preservação      | Repositório existente, camadas, módulos legados e migrações preservados                                                               |
| Identidade       | MengoData, Poppins local, logo fornecida byte a byte, paleta exigida e tokens                                                         |
| Landing pública  | `/`, seções completas, prévias reais, CTA para `/dashboard`, sem autenticação                                                         |
| Tema             | Sistema, persistência, inicialização e navegação testados em DOM; pintura pendente                                                    |
| Rotas            | Nove páginas analíticas, oito aliases com query/hash preservados                                                                      |
| Casa e fora      | SQL/API 47/32 e 19/19; Recharts real com eixo zero e duas barras em quatro dimensões e dois temas                                     |
| Comparação       | Dois clubes distintos, troca/reset/filtros, 14 indicadores, diferenças e evolução                                                     |
| Recorte          | 380 jogos/20 clubes/38 rodadas de 2025; placares reais conciliados                                                                    |
| Pipeline         | Pandas/NumPy, Bronze/Silver/Gold, Parquet/CSV e idempotência executados                                                               |
| Indicadores      | 20 totais e 760 acumulados equivalentes Python/JS; testes SQL isolados                                                                |
| PostgreSQL ativo | SELECT 1 READ ONLY, contagens e sessão backend reais em `mengo_data`; reimportação sem mudanças                                       |
| API              | Endpoints coletivos, validação, comparação, paginação, CSV e smoke real                                                               |
| Análises         | Seis notebooks e seis figuras reexecutados, identidade atualizada                                                                     |
| Power BI         | CSVs/modelo/M/DAX e temas preparados; PBIX/compilação Desktop pendentes                                                               |
| Arquitetura      | Dependências, ciclos, ausência de comentários e lint verificados                                                                      |
| Testes/build     | Resultados observados em TEST_REPORT.md                                                                                               |
| Visual           | Gráficos/cards conferidos em Chrome: quatro larguras, dois temas, 32 testes + quatro operacionais; auditoria geral permanece distinta |
| Acadêmico        | Relatório, fontes, escopo, limitações e roteiro atualizados                                                                           |
| Operações        | Commits locais autorizados por funcionalidade; sem push/publicação/destruição                                                         |

Não declarar revisão visual, auditoria integral de acessibilidade ou Power BI nativo concluídos. O banco ativo já foi conferido por consultas reais e não é uma pendência.
