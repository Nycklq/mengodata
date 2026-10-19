# Notebooks executáveis

Seis arquivos: entendimento, qualidade, ataque, defesa, comparação e estatística. As células foram executadas na .venv, com a evidência real preservada no repositório. As análises individuais registram bloqueio por falta de fonte/observações autorizadas; não existem gráficos ou conclusões esportivas fictícias.

Na raiz: `npm run notebooks:execute` atualiza os arquivos com as saídas. `npm run notebooks:check` reexecuta em .tmp/executed-notebooks, sem substituir os originais. O runner cria um kernel local com o Python da .venv, usa loopback e encerra o processo após cada notebook. Não requer configurar kernel global ou ativar ambiente no PowerShell.

Cada notebook usa módulos de domínio/aplicação/infraestrutura do projeto. Fórmulas não são redefinidas em células. Uma futura Gold individual só será lida após aprovação do artefato exato e das permissões; cobertura parcial terá indicação explícita. Não copie fixtures dos testes para data/ para produzir imagens de demonstração.

Dependências estão em pipeline/requirements.lock.txt. A verificação de AST/tokenização inclui comentários/docstrings das células de código; explicações ficam em Markdown. Consulte [relatório acadêmico](../docs/ACADEMIC_REPORT.md), [métricas](../docs/METRICS.md) e [qualidade](../docs/DATA_QUALITY.md).
