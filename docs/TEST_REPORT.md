# Relatório de verificações da Fase 1

Data: 19/10/2026. Esta entrega é documental. **Não foram executados testes automatizados da aplicação, lint de código ou build**, pois não há implementação, manifestos ou scripts correspondentes. As inspeções abaixo não substituem testes de software ou homologação estatística.

## Verificações executadas

| Verificação | Procedimento real | Resultado observado |
| --- | --- | --- |
| Inventário | `rg --files`, listagem da raiz com ocultos e `git ls-files` | Apenas AGENTS.md e contexto antes da tarefa; nenhum arquivo rastreado |
| Estado Git | `git status --short --untracked-files=all` e `git log -5 --oneline` | Branch `main`, sem commits; documentos iniciais não rastreados |
| Leitura normativa | Leitura UTF-8 de AGENTS.md e de todas as 1.738 linhas do contexto em trechos | Escopo, arquitetura, fontes, fórmulas, testes e roadmap examinados |
| Tabela oficial | Leitura textual do PDF e renderização/inspeção visual das páginas 1–5 | Identificados número de jogo e rodada nas 19 referências do Flamengo; início do returno também visível |
| Súmula oficial via FERJ | Leitura e inspeção visual das três páginas | Confirmados identificação da partida/atletas, escalação, gols, cartões e substituições; sanção pós-jogo identificada |
| Catálogo StatsBomb | Download HTTPS e inspeção JSON | 80 entradas; nenhuma com país Brazil; recorte pretendido não localizado |
| Licença StatsBomb | Leitura textual e inspeção visual das cinco páginas | Acordo específico de pesquisa e restrições, sem licença permissiva genérica |
| Documentação de APIs e termos | Consulta às páginas primárias relacionadas em DATA_SOURCES.md | Capacidades e condições registradas; cobertura individual autenticada de 2026 permanece pendente |
| Football-data.org sem token | GET do recurso de partidas BSA/2026 registrado em DATA_SOURCES.md | HTTP 403; não prova ausência de dados |
| Acesso direto adicional à CBF | Consulta HTTPS com Python | Erro local de validação de certificado; TLS não foi desativado |
| Originais consultados | SHA-256 dos PDFs e catálogo | Hashes registrados em DATA_SOURCES.md; arquivos de inspeção ficaram fora do repositório |

As falhas de abertura de páginas da CBF e FBref, e o uso limitado de conteúdo indexado, estão explicitados no relatório de fontes. Nenhum bloqueio foi contornado. Não foram consultadas credenciais ou arquivos de segredos.

## Ambiente observado

| Recurso | Evidência local | Limite da conclusão |
| --- | --- | --- |
| Node.js | `node --version`: `v24.22.0` | Não valida a compatibilidade futura de todas as bibliotecas |
| npm | `npm.cmd --version`: `11.19.1` | A chamada `npm` selecionou npm.ps1 e foi recusada pela política de execução; não houve mudança na política |
| Python | `py -3.14 --version`: `Python 3.14.8` | `python` resolve para um alias WindowsApps; o launcher encontrou a instalação real |
| Pandas e Pytest | `importlib.util.find_spec` no Python 3.14 selecionado retornou ausência | Não afirma ausência em outros ambientes; nada foi instalado no projeto |
| PostgreSQL e Docker | `psql` e `docker` não localizados no PATH da sessão | Não comprova ausência de instalações fora do PATH |
| WSL | Executável encontrado; `wsl --list --quiet` retornou ajuda, sem enumerar distribuições | Ubuntu operacional não foi comprovado |
| PDF | Poppler não localizado no PATH; pypdfium2 e Pillow usados em diretório temporário isolado | Ferramentas de inspeção externas ao repositório, sem dependências de produção adicionadas |
| Power BI Desktop | Não inspecionado | Disponibilidade e capacidade de gerar PBIX/PBIP não comprovadas |

Nenhuma stack foi instalada ou atualizada para iniciar a plataforma. A Fase 2 deverá fixar versões compatíveis e registrar como reproduzir o ambiente, considerando Windows 11/WSL Ubuntu. Power BI Desktop continua no planejamento para Windows.

## Conferência documental final

A conferência automatizada documental foi executada com Python, com saída de processo 0: nove arquivos Markdown encontrados, sendo sete novos; nenhum arquivo novo fora de Markdown; nenhum arquivo vazio; nenhum link local quebrado nos documentos novos; nenhum bloco cercado de Markdown sem fechamento. Os hashes dos dois documentos normativos permaneceram iguais aos da inspeção inicial. O índice contém exatamente as rodadas 1 a 19 e 19 números de jogo distintos.

Não foram encontrados comentários HTML ou caracteres de substituição de codificação nos documentos novos. Como nenhum arquivo de código foi criado ou alterado, não houve introdução de comentários em código. A contagem de referências de partidas verifica a documentação, não constitui teste automatizado da regra de elegibilidade nem comprova cobertura estatística.

O estado final do Git mostra os sete documentos novos e os dois documentos preexistentes como não rastreados. Nenhum commit ou mudança no índice foi realizado. A revisão arquitetural é de proposta documental; aderência de implementação ainda não pode ser afirmada.

## Suíte necessária nas próximas fases

| Área | Casos que precisarão de evidência executável |
| --- | --- |
| Escopo | Incluir rodada 1 e 19; excluir 20–38, outra competição, outro ano e atuação por outro clube; manter rodada adiada; rejeitar rodada/IDs ausentes ou ambíguos |
| Identidade e presença | Jogador transferido, titular, reserva utilizado, reserva não utilizado e participação com minuto arredondado zero |
| Fórmulas | G+A e métricas por 90; soma de componentes antes das taxas; denominadores zero/ausentes; nulos distintos de zero; cobertura compatível |
| Semântica de fonte | Assistência, gol contra, segundo amarelo, vermelho direto, cartão pós-jogo, minutos e distinção entre estatística individual e coletiva |
| Pipeline | Normalização, tipos, duplicidade, quarentena, proveniência, duas execuções idempotentes, correção de fonte e promoção consistente de versão |
| Arquitetura | Núcleo sem dependência de framework/banco/fonte; casos de uso isolados; composição nas bordas; imports sem ciclos e código novo sem comentários |
| PostgreSQL/API | Integridade, transação, consultas parametrizadas, filtros que não ampliam escopo, ordenação permitida, paginação, erro e exportação autorizada |
| React | Carregamento, erro, vazio, indisponibilidade, cobertura parcial, navegação, filtros e comparador; totais independentes da página visível |
| Power BI e paridade | Mesmo conjunto de partidas/atletas e versão em Python, Gold, SQL, API, React, CSV e DAX; nulos e taxas preservados |

Fixtures técnicas futuras devem ser identificadas e separadas de dados reais. Nenhuma fixture ou estatística sintética foi criada nesta fase. A auditoria de cobertura só poderá ser concluída após obter amostras autorizadas e conferir todas as partidas e métricas do recorte.
