# API REST local

Contrato em [openapi.json](openapi.json), gerado por `npm run api:spec`. O servidor ouve em `127.0.0.1:3001`. Vite encaminha `/api` para essa origem. Não há autenticação pública, publicação ou exposição externa configurada.

O escopo é invariável: Brasileirão Série A masculino, 2025, Flamengo, rodadas oficiais 1–38. Tentar enviar temporada, clube ou limites alternativos retorna 400. Não se utiliza a data para reclassificar adiamentos.

| Grupo             | Recursos                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Operação          | `/api/health`, `/api/metadata`, `/api/data-quality`                                                                                  |
| Catálogo auxiliar | `/api/references`                                                                                                                    |
| Resumo            | `/api/dashboard/summary`, alias `/api/summary`                                                                                       |
| Jogadores         | `/api/players`, `/api/players/:id`, `/api/players/:id/stats`                                                                         |
| Rankings          | `/api/rankings`, `/api/rankings/goals`, `/api/rankings/assists`, `/api/rankings/contributions`                                       |
| Análises          | `/api/analytics/offensive`, `/api/analytics/defensive`, `/api/analytics/positions`, `/api/analytics/distribution`, `/api/statistics` |
| Comparação        | `/api/compare?ids=UUID_A,UUID_B`                                                                                                     |
| Exportação        | `/api/exports/players`, condicionada a permissão específica                                                                          |

Listagens aceitam `q`, `position` e `min_minutes`. Jogadores acrescentam `page` (1–10000), `page_size` (1–100), `sort` da lista permitida e `direction=asc|desc`. Rankings usam `metric` e `top` (1–50). O mínimo de minutos aceita inteiro de 0 a 10000, inclusive 450, 900 e 1500. Comparações exigem dois UUIDs diferentes e aceitam os mesmos filtros. Parâmetros extras ou repetidos em formatos incompatíveis são recusados.

O envelope analítico v1 contém `scope`, `availability`, `reason`, `coverage`, `dataset_version` e `source`. `unavailable` retorna listas vazias, campos esportivos nulos e total de paginação nulo. `partial` identifica observações incompletas e bloqueia os totais anuais do resumo. `available` exige revisão de cobertura, mapeamento oficial, participações e as 38 rodadas. Zero confirmado é um número; campo desconhecido é null.

`/api/metadata` preserva o contrato v2 anterior de inicialização. A prontidão efetiva por dataset está no envelope analítico e em data-quality; o contrato inicial não homologa fontes por si mesmo. Health confirma apenas processo, não autenticação, migrações ou cobertura do banco.

Todos os recursos analíticos retornam 200 para indisponibilidade legítima; exportação sem direitos retorna 409 `EXPORT_NOT_AUTHORIZED`. Entrada inválida retorna 400 `INVALID_QUERY`; perfil ausente em dataset disponível retorna 404; falha inesperada retorna 500 `INTERNAL_ERROR`. Proteção local: 300 requisições/IP/minuto por processo, 429 com Retry-After. Helmet, CORS explícito, no-store e logging sem detalhes de falha/credenciais.

Na exportação autorizada, nulos são células vazias e células com prefixos de fórmula recebem apóstrofo. A ordenação de empates por UUID estabiliza a paginação. Posições desconhecidas permanecem `unknown`, sem inferência pelo nome.
