# Flamengo Analytics

Plataforma planejada de análise individual dos jogadores do Flamengo no **Brasileirão Série A masculino de 2026 — 1º turno (rodadas oficiais 1 a 19)**. Apenas atuações pelo Flamengo são elegíveis; partidas adiadas conservam a rodada de origem.

## Estado em 19/10/2026

A pesquisa da Fase 1 foi documentada. A homologação de uma fonte continua pendente de acesso autorizado, cobertura efetiva e direitos de uso compatíveis. Ainda não há aplicação, pipeline, banco, dataset analítico, testes automatizados ou relatório Power BI implementados neste repositório.

Não existem comandos de instalação ou execução da plataforma nesta etapa. Não há estatísticas calculadas ou resultados esportivos publicados pelo projeto.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Regras permanentes de trabalho |
| [Contexto integral](docs/FLAMENGO_ANALYTICS_CONTEXT.md) | Planejamento e decisões anteriores |
| [Estado e próximos passos](docs/STATUS.md) | Inventário, roadmap, impedimentos e critérios de avanço |
| [Fontes pesquisadas](docs/DATA_SOURCES.md) | Evidências, cobertura, granularidade, permissões e matriz de indicadores |
| [Recorte por rodada](docs/ROUND_SCOPE.md) | Identificação das partidas e protocolo de homologação |
| [Arquitetura inicial](docs/ARCHITECTURE.md) | Fronteiras, módulos, dependências e modelo de dados propostos |
| [Indicadores](docs/METRICS.md) | Semântica, fórmulas, ausências e consistência entre produtos |
| [Verificações](docs/TEST_REPORT.md) | Inspeções executadas e testes ainda necessários |

## Tecnologias preservadas

React com JavaScript, Vite, Tailwind CSS, React Router, Recharts, TanStack Query; Node.js, Express e PostgreSQL; Python, Pandas e estágios Bronze/Silver/Gold; Power BI, Power Query e DAX. Essas tecnologias estão planejadas, sem dependências instaladas no projeto.

Toda implementação futura deverá seguir Clean Architecture e entregar código sem comentários. Licenças de dados, imagens e software são assuntos distintos; este repositório ainda não contém um arquivo de licença de software.
