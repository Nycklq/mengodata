# Design e revisão de experiência — 22/10/2026

## Identidade

A imagem enviada foi copiada integralmente para `frontend/public/flamengo-logo.png`: mesma proporção, fundo branco original e nenhum redesenho. Aplicação na sidebar, abertura e favicon com `object-fit: contain`. O fornecimento pelo usuário não transfere a licença CC0 dos dados para a marca; a plataforma se identifica como projeto acadêmico independente.

Vermelho #C8102E, preto, branco e cinzas. Segunda série #34485D. Tipografia local Segoe UI/system-ui, sem fontes externas. Sidebar escura, conteúdo claro, cards com borda/sombra discreta e foco visível. Estilos existentes preservados; refinamento em `refinements.css` evita reescrever módulos legados inativos.

## Experiência implementada

Nove páginas coletivas. Menu compacto até 960 px com Escape, ciclo de foco e retorno ao botão. Navegação move foco ao conteúdo. Tabelas largas mantêm rolagem interna com região nomeada e foco por teclado. Partidas permitem 10/20/50/100 itens por página. Redução de movimento respeitada.

Comparação de dois clubes, troca, restauração e filtros na URL. Quatorze indicadores incluem jogos como denominador. Diferenças e barras usam funções puras no domínio. Barras mostram magnitudes, com sinais nos valores. Gols contra, média de gols contra e derrotas favorecem menores valores; jogos e empates não recebem vencedor. Variação = (A − B) ÷ |B| × 100; base zero/ausências ficam indisponíveis. Δ de aproveitamento usa pontos percentuais. Evolução permite pontos, gols pró/contra, saldo e aproveitamento. Casa/fora mantém o mesmo filtro de mando.

Ataque/defesa usam barras horizontais com altura para os 20 nomes, Flamengo em vermelho. Evolução usa áreas transparentes, tooltip em português e posição com 1º no topo. Distribuições mantêm as partidas reais. Gráficos não interpolam valores durante mudanças de filtros. Fundo de carregamento leve desativado com redução de movimento.

## Checklist manual pendente

O controle de UI não disponibilizou navegador nesta sessão. Não considerar estes itens aprovados com base em DOM/build.

| Janela sugerida | Conferir                                                                         |
| --------------- | -------------------------------------------------------------------------------- |
| 1920 × 1080     | Hierarquia da abertura, quatro KPIs, equilíbrio dos painéis e espaço de conteúdo |
| 1440 × 900      | Sidebar, gráficos lado a lado, legendas e tabelas                                |
| 1024 × 768      | Empilhamento dos painéis, filtros e seletor de clubes sem cortes                 |
| 768 × 1024      | Menu compacto, foco, Escape e bloqueio de scroll com menu aberto                 |
| 390 × 844       | Cards em duas colunas, seletores empilhados e rolagem interna das tabelas        |
| 320 × 640       | Sem overflow global, campos utilizáveis e paginação sem sobreposição             |

Em cada tamanho: percorrer as nove páginas; escolher rodadas 1 e 38; testar casa/fora, adversário e resultado; paginar e exportar CSV; comparar Flamengo/Palmeiras e Bahia/Sport; trocar clubes; copiar URL e recarregar; restaurar; desligar a API e usar Tentar novamente. Conferir tooltips e nomes dos 20 clubes nos gráficos reais.

Com teclado: skip link, Tab/Shift+Tab, menu, foco após navegação e rolagem de tabelas. Conferir contraste, zoom de 200%, redução de movimento e leitor de tela. DOM automatizado cobre parte do comportamento, sem substituir estas verificações.
