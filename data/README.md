# Estágios de dados

raw/ é Bronze; processed/ é Silver; analytics/ é Gold. São estágios de dados, não camadas de código. Os arquivos gerados são ignorados pelo Git.

A importação real executada nesta entrega criou raw/openfootball/<sha256>.json com os bytes autorizados, processed/references/<sha256>.json normalizado e analytics/references.json com recibo de ingestão. Há 38 referências auxiliares, sem prova de estatísticas individuais, IDs CBF ou fuso.

Reproduza com npm run pipeline:references. O download usa somente a revisão/hash de contracts/source-approval.json. Uma cópia local pode ser passada com --input. A reexecução idêntica não altera conteúdo nem timestamp.

analytics/individual.json só pode ser criado pelo importador após aprovação exata de fonte, artefato e direitos em contracts/dataset-approvals.json. Esse registro está vazio; não há base individual de produção. Não copie fixtures sintéticas dos testes para esta pasta.

analytics/powerbi.json é produzido por npm run powerbi:prepare. Atualmente registra indisponibilidade e listas vazias. Linhas individuais só são exportadas com permissão documental específica para distribuição Power BI.
