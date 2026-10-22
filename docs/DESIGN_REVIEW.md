# Design e revisão de experiência — MengoData

Atualizado em 22/10/2026. Implementação local; revisão visual em navegador continua pendente.

## Referências e decisões

O pacote original fornecido pelo usuário foi recuperado de `PACOTE_MENGODATA_REDESIGN_CODEX.zip`. Os arquivos iniciais tinham extensões/nomes trocados: o suposto Markdown era uma imagem do gráfico; `flamengo_logo.png` na raiz era a referência Finexa; `grafico_mandante_visitante_atual.png` na raiz era a logo. Foram preservados. O Prompt Mestre textual correto e as três imagens corretas estão na raiz e em `referencias/`, respectivamente. A cópia inicial do falso Markdown foi preservada em `.tmp/input-backups/prompt-original.png`.

As três referências foram inspecionadas. Finexa orienta a composição: menu central em cápsula, headline ampla centralizada, produto em primeiro plano com fade, texto editorial, três métricas, três cards visuais e seções alternadas. O MengoData adapta esses elementos para placares, clubes, mando e engenharia de dados. Estádio/gramado são SVGs próprios, sem fotografia externa; não há conteúdo financeiro, promessa de IA, usuários fictícios ou depoimentos.

Logo transparente fornecida aplicada sem edição em `frontend/public/brand/flamengo.png`, com `object-fit: contain` e suporte branco: o preto do escudo continua visível no tema escuro. Identidade #C3271D/#000000/#FFFFFF com neutros semânticos. Poppins auto-hospedada em todos os textos, controles e gráficos; pesos 400/500/600/700 e itálico 500, com swap. [Proveniência e direitos](ASSETS.md).

O tema resolve preferência de sistema ou escolha explícita, persiste em localStorage, sincroniza abas e mantém o estado entre landing/dashboard. Bootstrap síncrono e regra CSS de sistema precedem o React. Cores de superfície, texto, foco, borda, grade e segunda série são tokens compartilhados. Estilos legados permanecem preservados e inativos.

## Gráficos e navegação

Causa do Visitante invisível: o antigo `YAxis` com `['auto', 'auto']` adotava mínimo 32. O valor 32 coincidia com a base e tinha altura zero. O novo domínio inclui zero no eixo numérico vertical ou horizontal e mantém negativos; posição usa 1–20 invertido. Barras curtas têm rótulos reais e descrição acessível; não se atribui altura artificial a valores zero. SQL e API confirmam 47/32 no recorte integral e 15/13 entre rodadas 10–20. Tabela e gráfico leem o mesmo resumo.

Recharts foi preservado. Linhas/áreas mostram evolução; barras mostram totais/distribuição. Tooltip e legendas usam pt-BR/Poppins e tokens de tema. Gráficos são carregados sob demanda. Prévias dentro de links desativam interação do gráfico para evitar focos aninhados. Loading skeleton e transições respeitam redução de movimento.

Landing `/`; painel `/dashboard` e oito subpáginas. Aliases antigos preservam query/hash. CTA, recursos, comparação e metodologia têm destinos reais. Sidebar compacta até 960 px com Escape, foco circular e devolução ao acionador. Menu público tem foco inicial e Escape. Tabelas e fluxo de dados têm rolagem interna nomeada e foco por teclado. Filtros de comparação ajustam limites e persistem na URL.

## Evidência automatizada e limite

Testes usam o componente real Recharts com ResizeObserver e dimensões controladas no jsdom: 375/768/1024/1440, claro/escuro, duas barras positivas, proporção 47/32, base comum, valores filtrados, zero, negativos e vazio. Outros testes exercitam cobertura, indisponibilidade, seletores, filtros, menu, rotas e tema. Isso verifica DOM e geometria SVG, sem certificar pintura, contraste ou layout CSS no Chrome.

IAB retornou `Browser is not available: iab`. A habilidade de controle nativo encontrou o Chrome, mas interrompeu a captura porque não conseguiu determinar a URL atual com confiança. Não houve contorno. Sem screenshot React ou revisão visual completa aprovada nesta sessão.

## Checklist manual obrigatório

Em cada largura, executar as duas colunas de tema. Marcar somente após observar no navegador.

| Largura | Claro    | Escuro   | Conferência específica                                                                                              |
| ------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------- |
| 375 px  | Pendente | Pendente | Headline, botões, menu público, prévia, cards empilhados, seletores, tabela com scroll interno; sem overflow global |
| 768 px  | Pendente | Pendente | Menu público compacto, sidebar drawer, filtros, grids, comparação e barras completas                                |
| 1024 px | Pendente | Pendente | Navbar em cápsula, painel com sidebar, legibilidade do hero e equilíbrio das seções alternadas                      |
| 1440 px | Pendente | Pendente | Composição com a referência Finexa, hierarquia editorial, produto central, densidade de gráficos e acabamento       |

1. Abrir `/` com sistema claro e escuro sem preferência salva; recarregar e observar eventual flash. Alternar no botão, recarregar e navegar ao painel/voltar. Testar localStorage bloqueado e sincronização entre abas.
2. Conferir Poppins computada, inclusive selects, tabelas, tooltip, legendas e SVG. Logo nítida, completa e sem inversão nos dois temas.
3. Usar Tab/Shift+Tab/Enter/Escape: skip link, âncoras, CTA, menus, seletores e comparações; confirmar foco visível, retorno e ausência de controles inacessíveis fora do drawer.
4. Conferir 47/32 e 19/19 em `/dashboard#casa-fora`. Alterar para rodadas 10–20: 15/13 pontos. Mando restrito deve mostrar somente categorias que têm observações, sem inventar zero para ausências.
5. Comparar Flamengo/Palmeiras e Bahia/Sport, trocar lados, restaurar, atualizar indicador e compartilhar URL. Conferir saldo negativo, base zero, empate e menor é melhor.
6. Visitar as nove páginas; rolar tabelas sem deslocar a página inteira. Conferir nomes dos 20 clubes, tamanhos de toque, zoom de 200%, contraste e preferência de movimento reduzido.
7. Interromper API e observar erro/retry; testar janela vazia e URL inválida. Prévias não devem apresentar contagens inventadas. Retomar API e confirmar recuperação.
8. Conferir o resultado lado a lado com `referencias/landing_finexa_referencia.png`, identificando diferenças de enquadramento e espaçamento antes de aprovar fidelidade visual.

Power BI M/DAX e temas também dependem da validação nativa; o build web não certifica esses artefatos.
