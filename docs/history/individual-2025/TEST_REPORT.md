# Relatório de verificações — desenvolvimento integrado

Executado em 19/10/2026, Windows/PowerShell, Node.js 24.22.0, npm 11.19.1, Python 3.14.8 e PostgreSQL 18.6. Escopo obrigatório: Flamengo, Série A masculina/2025, rodadas oficiais 1–38. Testes não homologam fontes ou direitos.

## Resultado final observado

| Verificação                                     | Comando                                     | Resultado                                                        |
| ----------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------- |
| Backend e HTTP                                  | npm run test --workspace backend            | 26 aprovados                                                     |
| Frontend / navegação / estados                  | npm run test --workspace frontend           | 24 aprovados                                                     |
| Arquitetura, contratos, fórmulas e artefatos JS | node --test tests/*.test.js                 | 10 aprovados                                                     |
| Pipeline, fórmulas e arquitetura Python         | npm run test:pipeline                       | 157 aprovados                                                    |
| PostgreSQL real isolado                         | npm run test:database                       | 25 aprovados                                                     |
| Total de testes                                 | Suítes acima                                | **242 aprovados**, sem falhas, cancelamentos ou ignorados        |
| ESLint                                          | npm run lint                                | Aprovado, sem avisos                                             |
| Ruff e formatação Python                        | npm run verify:pipeline                     | Aprovados; 39 arquivos formatados                                |
| Prettier                                        | npm run format:check                        | Aprovado                                                         |
| Notebooks                                       | npm run notebooks:execute e notebooks:check | Seis executados; saídas honestas de auditoria/bloqueio           |
| Build                                           | npm run build                               | Aprovado; 2655 módulos, sem aviso de chunk grande                |
| Smoke real HTTP/Vite                            | npm run test:smoke                          | Aprovado; proxy, API, rotas SPA e bloqueio CSV                   |
| Dependências Python                             | .venv/Scripts/python.exe -m pip check       | Nenhuma dependência quebrada                                     |
| OpenAPI reproduzível                            | npm run api:spec                            | Gerado; formatação e testes de artefatos aprovados               |
| Referências reais                               | npm run pipeline:references                 | 38 referências; repetição changed=false                          |
| Preparação BI                                   | npm run powerbi:prepare                     | unavailable, distribution_allowed=false; repetição sem alteração |
| Importação SQL sem aprovação                    | npm run db:import                           | Bloqueada, sem abrir escrita de dados individuais                |
| Whitespace Git                                  | git diff --check                            | Código 0; somente avisos de normalização CRLF/LF                 |
| Preservação de migrações                        | SHA-256 de 001/002                          | Iguais aos hashes anteriores                                     |

npm run verify terminou com código 0, incluindo lint, formatação, as 242 verificações, PostgreSQL isolado, seis notebooks, build e smoke. Após a revisão de números JSON não finitos e do formato do gerador OpenAPI, foram repetidos verify:pipeline, lint, format:check e os dez testes da raiz, todos aprovados. A documentação foi atualizada ao fim e teve nova conferência de formatação/links. Não foi medida porcentagem de cobertura.

O build produziu o bundle principal de aproximadamente 420 kB e o chunk Recharts de aproximadamente 357 kB antes de gzip. Gráficos são carregados sob demanda quando há valores conhecidos. Artefatos em frontend/dist são ignorados pelo Git. A contagem de módulos não é evidência de desempenho visual.

## Casos efetivamente exercitados

- Elegibilidade de 2025 e rodadas 1/19/20/38; rejeição de 0/39, 2024/2026, competição ou clube da atuação divergentes.
- Adiamentos preservando rodada, identidade canônica, fonte/ID externo, duplicatas, lacunas, cronologia e manifesto v2.
- Distinção entre calendário completo, identificação pronta, participações auditadas e ingestão autorizada.
- G+A, taxas por 90 e razões de componentes somados; zero confirmado, null, denominador zero, quartis e outliers. Fixture neutra usada independentemente em JS/Python.
- Entrada individual com schema compartilhado, IDs/rodadas/clubes, duplicatas, hash exato e autorização por uso. NaN, Infinity e overflow JSON 1e999 são recusados.
- Preservação de bytes Bronze e idempotência de importação; desconhecidos permanecem null.
- Busca, filtros de posição/minutos, ordenação permitida, paginação limitada, query semelhante a SQL injection tratada como texto, UUID e parâmetros extras inválidos.
- Respostas de indisponibilidade/partial sem totais anuais falsos, ranking sem métricas desconhecidas, comparação com posições distintas e diferenças nulas.
- CSV sem direito bloqueado; CSV autorizado em fixture isolada com células protegidas contra fórmulas.
- Rate limit, Helmet/CORS, erros sanitizados e ausência de detalhes sensíveis.
- Navegação para todas as páginas, busca/minutos alterando tabela, comparação, loading, erro/retry, SVGs distintos, menu mobile e gateway/cancelamento/escopo.
- Migrações sem sementes, hashes/idempotência, rollback de falhas, constraints/FKs, importação estatística transacional e leitura SQL/API equivalente à porta de arquivo nos testes.
- Preservação de banco legado com partidas antigas; diagnóstico read-only sem criação de tabelas.
- AST/imports e ciclos JS, inclusive importação lazy; fronteiras Python; proibição de comentários/docstrings/células de código.
- Preparação BI sem permissão específica retorna listas vazias; JSON de modelo/tema tem estrutura e escopo esperados. Isso não executa M/DAX.
- Seis notebooks executam sem erro a auditoria real e preservam a indisponibilidade individual; nenhum sintético é carregado pela pesquisa.

## Integração real autorizada

A importação do OpenFootball auditado gerou 38 referências reais, com hash 0fcc4647256b2e1f58b50f1372b751aeb7e6aacb5b8cd747579dd7ab71303fbb. A primeira execução retornou changed=true e as repetições changed=false, inclusive pelo download da revisão fixa.

A API local respondeu 200 em /api/references com 38 referências auxiliares, mantendo o jogo Sport/Flamengo na rodada 12 e data civil 15/11/2025. Fuso e IDs oficiais permanecem nulos. /api/players respondeu 200, availability=unavailable, lista vazia e paginação total=null. Nenhum atleta ou scout fictício foi apresentado.

Os processos dev:backend e dev:frontend iniciaram em 127.0.0.1:3001 e 127.0.0.1:5173. O smoke usa portas temporárias, confere saúde/metadados, doze recursos analíticos, bloqueio de exportação e oito caminhos SPA além da raiz; encerra somente seus próprios processos.

## Limites de validação

O PostgreSQL pessoal não recebeu migrações ou importação; não havia credencial configurada para integração permanente. Os 25 testes usam cluster próprio com autenticação, porta efêmera e encerramento/limpeza pelo helper. O serviço existente continuou Running e não permaneceu diretório postgres-test-* após o teste.

A revisão visual foi tentada com a skill computer-use. O navegador integrado não estava disponível; o controle nativo encerrou por não identificar a URL com confiança para aplicar suas regras. Nenhuma ação de UI foi feita depois disso. Os testes DOM não verificam pintura CSS, dimensões reais, qualidade visual dos gráficos, leitor de tela ou acessibilidade completa. A revisão desktop/mobile permanece pendente.

Power BI Desktop não foi executado. M/DAX/modelo/tema são material preparado; não há PBIX/PBIP produzido, compilação DAX/M comprovada, embed ou publicação. A equivalência numérica no motor Desktop depende de dados autorizados e validação posterior.

CI remoto, Linux/WSL, autenticação em fornecedor, cobertura individual real e cadeia jurídica de dados de atletas não foram verificados nesta execução. Os testes de disponibilidade usam fixtures sintéticas restritas aos diretórios de teste e ao cluster temporário. Nenhuma fonte individual foi homologada pelo resultado das suítes.

## Correções durante a execução

Foram corrigidos sintaxe/formatação do gerador OpenAPI, organização de exports para Fast Refresh, nomes do flag de titularidade, adaptação dos parâmetros no teste do comparador e uma fixture auxiliar que repetia o mesmo par de equipes. O portão rejeitou essa fixture corretamente; ela foi ajustada para dois mandos por adversário sintético. Nenhum teste existente foi removido.

O build inicial alertou sobre um pacote grande; Recharts passou para importação lazy e o build seguinte terminou sem esse aviso. O parser JSON foi endurecido contra constantes e números não finitos. O gerador OpenAPI passou a respeitar a mesma configuração Prettier do repositório. As verificações pertinentes foram repetidas após as correções.

A entrega anterior tinha 186 testes aprovados; esta ampliação acrescentou 56 verificações, totalizando 242. Histórico e migrações anteriores foram preservados, sem reset, commit, push, deploy ou alterações em contas externas.
