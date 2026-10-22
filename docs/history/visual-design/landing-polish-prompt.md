# MENGODATA — REFINAMENTO EXCLUSIVO DA LANDING PAGE

Você vai aprimorar **somente a landing page pública do MengoData** no repositório já existente. O projeto estuda o desempenho coletivo do Flamengo no Brasileirão Série A de 2025 e compara os 20 clubes. A implementação atual contém landing pública, dashboard funcional, banco PostgreSQL `mengo_data`, API REST e pipeline de dados.

## 0. Antes de alterar qualquer coisa

1. Leia `AGENTS.md` e inspecione os componentes, estilos, assets e testes relacionados **à landing page**.
2. Analise visualmente as quatro imagens colocadas em `referencias/`:
   - `01-hero-estadio-versao-anterior.png`: referência para **restaurar o hero esportivo original**, incluindo o estádio vetorial, as linhas de perspectiva, o painel flutuante de preview do dashboard e a atmosfera sutil de vermelho e branco.
   - `02-card-comparacao-inclinado.png`: referência para **recuperar o card de comparação ligeiramente inclinado**, com o seletor de clube, métricas reais e barras que já funcionavam.
   - `03-secao-projeto-tipografia-grande.png`: **estado a corrigir**; a seção “O projeto” tem texto muito grande, linhas longas e áreas vazias em excesso.
   - `04-torcida-estadio-foto.jpg`: foto enviada para compor um **fundo fotográfico quase imperceptível**, sem competir com o conteúdo.
3. Se as versões anteriores do hero e do card ainda existirem no código ou no histórico local, **reaproveite suas soluções válidas**. Compare diferenças pontualmente; **não faça reset/revert destrutivo de commits**.
4. Registre brevemente quais componentes e estilos serão alterados. Execute as mudanças nesta mesma tarefa, sem parar na etapa de planejamento.

## 1. Limite absoluto de escopo

**Modifique apenas a landing page**: layout, tipografia, ilustrações, assets, estilos, microinterações e testes pertinentes à landing.

**Não altere** o dashboard, as páginas internas, tipos ou dados dos gráficos, endpoints, contratos, PostgreSQL, importação, pipeline Python, cálculos, indicadores, filtros, regras de negócio, autenticação ou documentação não relacionada. Não adicione login ou cadastro. Preserve a rota e o funcionamento de “Explorar dashboard”, os links da navegação e a comparação interativa já existentes.

Preserve Clean Architecture, estrutura em camadas, componentes bem organizados, Poppins em todo o site e **código sem comentários**. Não faça commit, push, deploy nem alterações destrutivas.

## 2. Trazer de volta o hero com estádio e preview flutuante

Quero recuperar **o conceito visual da primeira imagem**, que tinha mais personalidade esportiva:

- Hero editorial com o título atual da landing, mantendo boa hierarquia visual e os botões “Explorar dashboard” e “Entender a análise”.
- **Estádio/campo de futebol estilizado em SVG**, com linhas de perspectiva, arquibancadas e detalhes rubro-negros discretos. Não substitua por um fundo genérico de gradiente.
- **Mockup/painel flutuante do dashboard** à frente do campo, como na referência, com pequena sobreposição e sensação de profundidade.
- Elementos decorativos de movimento apenas onde contribuírem para o visual; sem poluição, fumaça artificial ou brilhos exagerados.
- Melhorar dimensões e espaçamento do hero para que **o título nunca fique cortado por um header fixo/sticky**, em desktop ou mobile.
- Reutilizar os SVGs e o preview preexistentes quando possível. Se o preview for ilustrativo, não apresentar números inventados como dados comprovados; preservar as métricas reais já utilizadas na landing.
- Manter performance: SVGs leves, sem canvas pesado nem animações contínuas custosas.

Não preciso de uma réplica pixel a pixel. Quero trazer de volta a **mesma composição e personalidade**, com refinamento moderno.

## 3. Recuperar o card de comparação “meio torto”

Na seção “Flamengo, frente a frente com o Brasileirão”, voltar ao visual da **segunda imagem**:

- Card de comparação com **inclinação muito sutil** (algo como 1° a 2°), bordas delicadas, sombra suave e espaço ao redor para que não seja recortado.
- Layout em duas colunas no desktop: card à esquerda e texto/CTA à direita; adaptação elegante para uma coluna no mobile.
- **Preservar completamente o seletor funcional, os clubes, os valores verdadeiros, as barras comparativas, fórmulas e links do card.** Não transformá-lo em imagem estática.
- Em hover/foco, permitir uma microinteração sutil (por exemplo, reduzir um pouco a inclinação), **sem deslocar o layout**, comprometer os cliques ou prejudicar a leitura.
- Melhorar a legibilidade, o equilíbrio e o espaçamento sem redesenhar a semântica do componente.
- Preferir `transform` em um contêiner visual externo se isso evitar afetar interações e renderização de dados.

## 4. Reformular a seção “O projeto” da terceira imagem

A seção atual tem **tipografia excessivamente grande, texto muito longo em um bloco e muito espaço vazio**. Quero um resultado editorial mais profissional:

- Reduzir o tamanho do texto principal; usar título conciso, subtítulo e corpo mais legível, sem transformar tudo em um único parágrafo gigante.
- Proposta de escala visual (ajustável conforme o layout): título desktop ~32–40 px e mobile ~26–32 px; corpo ~15–17 px, line-height confortável.
- Limitar a largura das linhas (aproximadamente 60–75 caracteres) e estabelecer margens/gaps consistentes.
- Manter a mensagem central: transformar placares em perspectiva, entender a campanha do Flamengo, descobrir padrões e comparar clubes.
- Preservar e organizar os três indicadores **38 rodadas, 380 partidas e 20 clubes**, sempre a partir das informações reais que o projeto já apresenta; não inventar métricas.
- Aproximar visualmente texto, indicadores e CTA “Conhecer o projeto”, eliminando o vazio excessivo.
- Preferir uma composição editorial assimétrica bem resolvida (texto + área visual discreta, ou blocos cuidadosamente balanceados), em vez de uma grade genérica de cartões iguais.
- Ajustar espaçamento vertical entre todas as seções para criar ritmo; não deixar grandes trechos brancos sem intenção.

## 5. Usar a foto da torcida como fundo quase invisível

A quarta imagem é uma foto de arquibancada/estádio com a torcida e iluminação rubro-negra. Use-a **apenas como textura atmosférica discreta** em uma seção apropriada da landing, preferencialmente “O projeto” ou uma transição entre seções:

- **Não transforme a fotografia em um banner opaco ou protagonista**: ela deve ser quase imperceptível, visível apenas como profundidade.
- Experimente `background-image`/pseudo-elemento com `background-size: cover`, posição coerente e **overlay forte na cor de fundo**, combinado com baixa opacidade. Referência de ajuste: visibilidade fotográfica em torno de 4–10% no tema claro e 6–14% no escuro; ajuste pelo resultado visual, não por número rígido.
- A imagem nunca pode reduzir o contraste do texto, ofuscar botões ou dificultar a leitura.
- Evite repetir a foto em várias seções; ela é um único acento editorial.
- Respeite dimensões responsivas, compressão/otimização do asset e carregamento apropriado.
- A foto foi fornecida pelo usuário como referência. **Antes de disponibilizá-la publicamente, sinalize a necessidade de confirmar direitos de uso**. Se essa confirmação não existir, mantenha um fallback de arte vetorial própria para publicação; não bloqueie o restante do trabalho.

## 6. Efeito de surgimento ao rolar (scroll reveal)

Quero que, **ao descer a página, os elementos apareçam com suavidade e intenção**, como em um site profissional:

- Aplicar reveal progressivo em títulos, subtítulos, cards, indicadores, ilustrações e na seção de comparação.
- Usar uma composição sutil de **fade-in + deslocamento vertical pequeno** (aproximadamente 12–24 px), com delays discretos entre elementos de uma mesma seção.
- Duração de referência: 350–650 ms; easing suave, sem efeito elástico ou movimentação exagerada.
- Ativar quando o elemento entra na viewport (por exemplo, `IntersectionObserver`) e mostrar apenas uma vez, evitando repetição cansativa em cada scroll.
- **Não ocultar permanentemente conteúdo** se JavaScript, observer ou animação falhar: fallback visível por padrão.
- Respeitar `prefers-reduced-motion`: conteúdo aparece imediatamente, sem translação/animacões.
- Não usar animações pesadas ou bibliotecas adicionais sem necessidade; evitar layout shift, scroll-jank e quedas de FPS.
- Não animar os gráficos ou números estatísticos para valores fictícios. Preserve componentes interativos utilizáveis.

## 7. Direção estética

Quero um MengoData **minimalista, autoral, com acabamento de design humano, moderno, esportivo e editorial**, sem “cara de template de IA”.

- Identidade cromática: vermelho `#C3271D`, preto `#000000`, branco `#FFFFFF` e cinzas neutros, incluindo modo claro e escuro.
- Fonte **Poppins** em toda a landing.
- Detalhes contemporâneos: bordas suaves, separadores finos, sombras discretas, hierarquia forte, grids precisos, alinhamentos consistentes.
- Evitar cards repetidos, gradientes chamativos, glassmorphism exagerado, ícones decorativos genéricos, excesso de blur e formas abstratas aleatórias.
- **Não recolocar moldura, cartão branco ou borda em volta da logo do Flamengo**; preservar o escudo original, proporcional e legível em ambos os temas.
- Navbar, links e CTAs devem continuar reconhecíveis e funcionais.
- Manter os conteúdos, números e seções já existentes que fazem sentido. Melhorar a direção de arte, não reinventar o produto.

## 8. Responsividade, acessibilidade e desempenho

Validar especialmente as larguras 375 px, 768 px e 1440 px, nos temas claro e escuro:

- Hero sem título cortado nem preview fora da tela.
- Campo/estádio responsivo; simplificar ou reposicionar suas camadas em mobile.
- Card inclinado sem overflow horizontal nem elementos cortados.
- Texto da seção “O projeto” sem linhas enormes ou espaçamento exagerado.
- Fotos decorativas com contraste controlado.
- Botões e seletor utilizáveis com toque/teclado; foco visível; sem animações intrusivas.
- Sem horizontal scroll involuntário nem CLS notável.
- Imagens e SVGs leves; loading apropriado; sem degradação perceptível da fluidez.

## 9. Verificações e entrega

1. Execute os testes do frontend pertinentes à landing, lint e build; atualize testes se necessário.
2. Verifique navegação por âncoras e CTAs, inclusive “Explorar dashboard”, “Entender a análise” e “Comparar campanhas”.
3. Verifique que o seletor de comparação ainda funciona com dados reais e que os números não mudaram.
4. Se houver ferramenta de navegador, produza **capturas reais** do hero, seção “O projeto” e comparação, em desktop e mobile, além de testar revelação no scroll e tema escuro.
5. Se não houver validação visual possível, **não afirme que o design foi validado visualmente**; documente o que depende de conferência manual.
6. Ao concluir, relate arquivos alterados, ajustes feitos, resultados reais dos testes e qualquer pendência.

**Critérios de aceite:** a primeira imagem volta a inspirar o hero com estádio e preview; a segunda volta a inspirar o card sutilmente inclinado; a terceira deixa de ter texto gigante e vazio exagerado; a quarta inspira um fundo fotográfico quase invisível; a landing apresenta reveal on scroll fluido; nenhum dado, gráfico de dashboard, banco, API ou outra página do MengoData foi alterado.

**Implemente as melhorias agora. Não entregue apenas um plano.**
