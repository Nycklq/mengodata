# Decisões de implementação

## 2025 e preservação do histórico

A temporada completa de 2025 substitui explicitamente o primeiro turno de 2026. As migrações 001/002 e docs/history/2026 foram preservados. A nova 003 acrescenta importações/fatos e integridade sem apagar ou reclassificar jogos. Um banco com partidas antigas exige isolamento; o executor não converte seus registros.

## Aprovação por conteúdo e finalidade

OpenFootball foi aprovado somente como referência auxiliar CC0 da revisão auditada. O catálogo real foi importado em Bronze/Silver/Gold e integrado à visão geral. Não libera manifesto oficial ou dados de jogador. O registro dataset-approvals está vazio por falta de fonte individual auditada. Uma flag enviada pelo cliente não pode aprovar dados.

O importador individual aceita um formato canônico por jogador/partida, não implementa scraping ou tenta converter snapshots Cartola. Cada artefato futuro precisa de revisão exata de hash, identidade, cobertura, participações e evidências de direitos. Armazenamento, React/API, CSV e Power BI têm permissões distintas. O estado atual é bloqueado por padrão.

## Continuidade sem estatísticas inventadas

Endpoints, filtros, fórmulas, comparação, interface e persistência foram implementados independentemente da homologação. Na aplicação real, métricas individuais são null e listas ficam vazias. Fixtures são restritas aos testes. O catálogo auxiliar aparece separado e identificado. Nenhum ranking real ou conclusão sobre melhor jogador foi produzido.

## Camadas e dependências

Funções/objetos representam portas necessárias; não há contêiner de DI ou classes base. A feature React analytics compartilha gateway, casos de uso, estados e apresentação entre as páginas. Não se criaram camadas vazias por rota. Fórmulas JS/Python usam contratos e fixtures neutras, sem importação entre linguagens. O schema JSON do artefato é confrontado ao Zod por teste.

React Router atende as rotas exigidas; Lucide fornece ícones vetoriais; Recharts fornece barras condicionais. Foram acrescentados somente ao frontend e fixados no lock. Recharts fica em chunk dinâmico para não carregar o motor quando não há dados. nbformat/nbclient/ipykernel executam notebooks; matplotlib prepara gráficos futuros autorizados. As versões instaladas foram registradas no lock Python. Não foram instalados Spark/Hadoop ou Power BI Desktop.

## Persistência e execução

A API funciona sem banco no estado atual e nunca migra no startup. Com DATABASE_URL, a leitura individual exige a mesma versão aprovada no PostgreSQL. Escrita depende de comando explícito. Os testes SQL usam cluster próprio, autenticação e porta temporárias. Nenhum banco pessoal recebeu migração ou seed.

## Power BI e revisão visual

Foram entregues artefatos próprios de montagem, sem criar um PBIX/PBIP fictício. M/DAX ainda dependem de compilação e conferência no Desktop; preparação JSON e permissões têm testes locais. Não há incorporação, publicação ou envio de dados.

A revisão visual foi tentada por computer-use. Não havia navegador integrado disponível; o controle nativo encerrou porque não identificou a URL com confiança suficiente para aplicar suas regras. A automação de UI foi interrompida. Testes DOM, build e smoke passaram em execuções locais, mas não certificam layout visual completo ou conformidade de acessibilidade.
