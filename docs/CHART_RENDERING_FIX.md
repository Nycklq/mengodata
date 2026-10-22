# Correção dos gráficos e ilustrações — MengoData

Verificado em 22/10/2026 no Chrome 155.0.8059.86, Windows, com dados reais da Série A masculina de 2025. Landing e dashboard existentes preservados. Nenhuma mudança no backend de produção, nas métricas, no banco ou nas migrações.

## Causa comprovada

O CSS ativo continha `.recharts-wrapper, .recharts-surface { max-width: 100%; }`. No Recharts 3.10.1, o ResponsiveContainer percentual usa um elemento intermediário com `width: 0; overflow-x: visible` para permitir encolhimento e observação de tamanho. Essa estrutura é intencional na biblioteca; não é uma largura de dados inválida.

A restrição percentual no wrapper era calculada contra esse pai de zero pixels: a largura declarada de 1104 px era reduzida a **zero** no layout. O SVG principal também ficava com viewport de zero pixels. A legenda, posicionada absolutamente com largura explícita, permanecia visível.

Reprodução no Chrome antes da alteração:

| Medição             | Antes                               | Removendo somente a restrição   |
| ------------------- | ----------------------------------- | ------------------------------- |
| Pai intermediário   | 0 px, overflow visível              | 0 px, overflow visível          |
| Wrapper do ranking  | 0 px, apesar de width 1104px        | 1104 px                         |
| Wrapper da evolução | 0 px, apesar de width 1104px        | 1104 px                         |
| Dados/paths         | 20 barras e duas curvas presentes   | Mesmos dados e paths            |
| Pintura             | Viewport colapsado; legenda visível | Barras, curvas e eixos visíveis |

A regra foi removida, preservando o mecanismo responsivo da biblioteca. Contenção permanece nos componentes e grids; os testes confirmam ausência de overflow horizontal global. Não foi necessário alterar versão do Recharts, dataKey, conversão numérica ou consultas.

[Medições e matriz executada](evidence/chart-browser-verification.json), [captura anterior](evidence/visualizations/before-width-collapse.png). O funcionamento geral de tamanho está descrito na [documentação oficial do Recharts](https://recharts.github.io/en-US/guide/sizes/); a causalidade acima foi medida localmente.

## Causa por ocorrência e correção

| Ocorrência             | Diagnóstico                                                             | Resultado                                                                               |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Gols por clube         | 20 objetos numéricos e paths corretos, viewport colapsado pelo CSS      | 20 barras horizontais, ordenação preservada, Flamengo vermelho e demais clubes neutros  |
| Evolução do Flamengo   | 38 rodadas e duas curvas presentes, mesmo colapso                       | Gols acumulados e saldo desenhados, tooltip por rodada, domínio inclui zero e negativos |
| Dentro e fora de casa  | API/SQL e categorias corretos; duas barras existiam sob SVG sem largura | 47 e 32 pontos visíveis, mesma base zero, rótulos e tabela coerentes                    |
| Outros gráficos ativos | Compartilhavam o renderer e o CSS                                       | Classificação, comparação, defesa, distribuições e prévias também recuperados           |
| Uma rodada selecionada | Série com apenas um ponto não tinha segmento, e dot estava desativado   | Marcadores reais visíveis, inclusive saldo −1 na rodada 7                               |
| Cards 01 e 03          | Usavam minigráficos Recharts afetados pelo mesmo CSS                    | SVGs próprios reutilizáveis, com série real e composição de campo/mando                 |
| Card 02 em 768 px      | Símbolos pequenos em relação aos cards adjacentes                       | Proporção de 72 px no tablet, mantendo escudo e camisa originais                        |

O domínio que inclui zero corrigido anteriormente foi mantido. Ele resolve a escala truncada, mas sozinho não resolvia o colapso CSS que as novas capturas revelaram.

Altura do ranking: 28 px por categoria mais 78 px para eixos/legenda, com mínimo de 220 px; 20 clubes usam 638 px. Evolução padrão: 300 px. As dimensões são de apresentação; não mudam indicadores. Legenda tem botões acessíveis para ocultar/reexibir séries, mantendo a escala. Poppins, temas, tooltips e redução de movimento preservados.

## Ilustrações da landing

`EvolutionIllustration` desenha a série de pontos por rodada recebida da API, incluindo quatro marcos e os limites reais de rodada. `VenueIllustration` combina um campo/estádio vetorial com os valores reais por mando e pequenas barras proporcionais desde zero. Não há números demonstrativos: os 79/47/32 vêm do resumo/série verificados. Sem dados, o componente informa indisponibilidade.

O campo é decorativo e não representa tracking, posições de atletas ou tática observada. SVGs são próprios, sem dependência de imagem externa. O escudo e a camisa do card 02 foram mantidos. A estrutura, textos, links, fonte e demais seções da landing permanecem.

## Dados e integração

Nova transação Node.js/pg READ ONLY confirmou `mengo_data`, role `flamengo_app`, porta 5432, 380 partidas, 20 clubes, 38 rodadas, 760 fatos, 20 totais e 760 acumulados. As métricas dos 20 clubes coincidem entre SQL e endpoints ofensivo/defensivo; os campos utilizados nos gráficos chegam como números finitos.

Mandante: 19 jogos, 47 pontos, 46 gols pró, oito contra e 82,4561%. Visitante: 19 jogos, 32 pontos, 32 gols pró, 19 contra e 56,1404%. Rodadas 10–20: 15/13 pontos. Evolução final: 78 gols pró e saldo 51. `pg_stat_activity` confirmou o backend 21208 consultando `collective.imports` nesse banco. [Evidência SQL/API sem credenciais](evidence/chart-database-verification.json).

## Testes em navegador

Playwright usa o Chrome instalado em perfil temporário headless próprio. Não opera as abas pessoais do usuário nem a sessão que havia sido bloqueada pelo controle nativo na etapa anterior. A execução foi acrescentada a pedido explícito de testes em navegador.

O teste de regressão foi executado antes da correção e **falhou ao medir viewport = 0 px**. Após a remoção do CSS, passou. Os antigos testes jsdom forneciam dimensões simuladas e não aplicavam o layout CSS; por isso podiam encontrar paths positivos sem garantir pintura. A suíte nova mede viewport, wrapper, geometria, estilos computados, dados, cores e fontes, além de produzir PNGs reais.

| Largura | Claro              | Escuro             |
| ------- | ------------------ | ------------------ |
| 375 px  | 4 testes aprovados | 4 testes aprovados |
| 768 px  | 4 testes aprovados | 4 testes aprovados |
| 1024 px | 4 testes aprovados | 4 testes aprovados |
| 1440 px | 4 testes aprovados | 4 testes aprovados |

Os 32 testes percorrem as nove páginas do dashboard: seis possuem gráficos; Partidas, Power BI e Metodologia não possuem gráficos nessa implementação. Também conferem a landing e seus dois gráficos ativos. Exercitam 20 clubes, barras proporcionais, rótulos, tooltip visitante, mudança para rodadas 10–20, rodada isolada negativa, legenda e links dos cards. Nenhum erro ou aviso do console da página nem resposta API de erro foi observado.

A matriz padrão sobe uma API HTTP isolada, usando os mesmos serviços e a Gold real validada, sem conectar a bancos existentes e sem interceptar/mocar respostas. O limite de requisições maior existe somente nesse harness de teste. Em execução operacional separada, quatro testes adicionais passaram em `http://localhost:5173`, com Vite e API conectada ao PostgreSQL real. Não houve escrita no banco.

Os PNGs de cards, barras e evolução foram inspecionados em amostras dos quatro tamanhos e dos dois temas. Capturas de uma seção alta usam altura de viewport suficiente para evitar que o header sticky encubra a seção; a largura testada permanece inalterada. Não foram escondidos elementos para produzir a evidência.

## Capturas

| Caso                       | Claro                                                   | Escuro                                                 |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Cards 375 px               | [PNG](evidence/visualizations/375-light-cards.png)      | [PNG](evidence/visualizations/375-dark-cards.png)      |
| Cards 768 px               | [PNG](evidence/visualizations/768-light-cards.png)      | [PNG](evidence/visualizations/768-dark-cards.png)      |
| Cards 1024 px              | [PNG](evidence/visualizations/1024-light-cards.png)     | [PNG](evidence/visualizations/1024-dark-cards.png)     |
| Cards 1440 px              | [PNG](evidence/visualizations/1440-light-cards.png)     | [PNG](evidence/visualizations/1440-dark-cards.png)     |
| Mandante/visitante 375 px  | [PNG](evidence/visualizations/375-light-home-away.png)  | [PNG](evidence/visualizations/375-dark-home-away.png)  |
| Mandante/visitante 1440 px | [PNG](evidence/visualizations/1440-light-home-away.png) | [PNG](evidence/visualizations/1440-dark-home-away.png) |
| Ranking ofensivo 1440 px   | [PNG](evidence/visualizations/1440-light-offensive.png) | [PNG](evidence/visualizations/1440-dark-offensive.png) |
| Evolução 375 px            | [PNG](evidence/visualizations/375-light-evolution.png)  | [PNG](evidence/visualizations/375-dark-evolution.png)  |
| Evolução 1440 px           | [PNG](evidence/visualizations/1440-light-evolution.png) | [PNG](evidence/visualizations/1440-dark-evolution.png) |

## Reprodução

Na raiz, com dependências instaladas e Gold disponível:

```powershell
npm.cmd run test:browser
```

Usa Chrome local, porta 4174 e API isolada em porta aleatória; encerra os processos do harness ao terminar. Resultados e traces ficam em `.tmp`, fora do Git. Não exige PostgreSQL para essa matriz.

Para conferência operacional somente leitura no servidor existente, mantenha backend e frontend ativos:

```powershell
$env:MENGODATA_LIVE_URL = 'http://localhost:5173'
npm.cmd run test:browser -- --project=1440-light
Remove-Item Env:MENGODATA_LIVE_URL
```

O endereço operacional aceito é local. Para usar Chromium distribuído pelo Playwright em outro ambiente, instale-o e configure `MENGODATA_BROWSER_CHANNEL=chromium`. O workflow remoto inclui essa preparação, mas CI remoto não foi executado nesta sessão.

## Arquivos e limites

- `frontend/src/app/design-system.css`: remoção da restrição problemática, estilos SVG/legenda e ajuste do tablet.
- `frontend/src/features/analytics/presentation/CollectivePlot.jsx`: alturas, marcadores de ponto único e legenda interativa.
- `frontend/src/features/landing/presentation/FeatureIllustrations.jsx` e `LandingPage.jsx`: ilustrações dos dois cards, mantendo os destinos.
- `frontend/tests/collective-plot.test.jsx` e `feature-illustrations.test.jsx`: regressões unitárias adicionais.
- `frontend/browser/config.js`, `serve.mjs`, `visualizations.spec.js`: matriz real de navegador e modo operacional.
- `package.json`, lockfile e workflow: dependência de testes fixada, comando e prevenção da regressão em verificações futuras.
- Documentação e evidências: diagnóstico, matriz, SQL/API e PNGs.

Não é uma auditoria integral WCAG ou de todos os navegadores. Não foram medidos desempenho em escala nem movimentos com animação ativa; a matriz usa redução de movimento. Power BI nativo/PBIX continua pendente. Dados, fonte, pipeline e fórmulas não foram alterados.
