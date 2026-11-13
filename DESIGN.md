---
version: alpha
name: AgroMarket — Hora de vender
description: Sistema visual do app AgroMarket, que mostra ao produtor de soja se o preço de hoje é bom para vender, comparando com o histórico da mesma época, a posição dos fundos em Chicago e o câmbio.
colors:
  primary: "#1F4D2E"
  on-primary: "#FFFFFF"
  on-primary-muted: "#E7EFE8"
  on-primary-subtle: "#CFE0D2"
  primary-container: "#2E7D3E"
  on-primary-container: "#FFFFFF"
  tertiary: "#9CCB4F"
  success-container: "#DDEFD6"
  on-success-container: "#1F4D2E"
  background: "#EEF1EC"
  on-background: "#1A1A1A"
  surface: "#FFFFFF"
  on-surface: "#1A1A1A"
  on-surface-variant: "#3D4A41"
  on-surface-muted: "#5F6B63"
  surface-positive: "#F3F8F1"
  surface-warning: "#FFF7E6"
  surface-neutral: "#F4F6F3"
  outline: "#B8C4B5"
  outline-variant: "#DCE3D9"
  positive: "#1E6B2F"
  negative: "#B3261E"
  warning: "#8A5A00"
  alert: "#D32F2F"
  data-usd: "#2E86AB"
  on-data-usd: "#1F5F7A"
  data-fx: "#E0A800"
  data-season: "#F5A623"
  chart-range: "#A9CFA0"
typography:
  display-logo:
    fontFamily: Lato
    fontSize: 30px
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lato
    fontSize: 40px
    fontWeight: 900
    lineHeight: 1.1
  headline-md:
    fontFamily: Lato
    fontSize: 24px
    fontWeight: 900
    lineHeight: 1.2
  stat-lg:
    fontFamily: Lato
    fontSize: 34px
    fontWeight: 900
    lineHeight: 1.1
  stat-md:
    fontFamily: Lato
    fontSize: 28px
    fontWeight: 900
    lineHeight: 1.15
  stat-sm:
    fontFamily: Lato
    fontSize: 22px
    fontWeight: 900
    lineHeight: 1.2
  title-md:
    fontFamily: Lato
    fontSize: 17px
    fontWeight: 700
    lineHeight: 1.35
  body-lg:
    fontFamily: Lato
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.45
  body-md:
    fontFamily: Lato
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  body-strong:
    fontFamily: Lato
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1.5
  label-md:
    fontFamily: Lato
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
  label-bold:
    fontFamily: Lato
    fontSize: 14px
    fontWeight: 700
    lineHeight: 1.4
  label-caps:
    fontFamily: Lato
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0.03em
  caption:
    fontFamily: Lato
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.45
  input-value:
    fontFamily: Lato
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.2
rounded:
  xs: 3px
  sm: 4px
  md: 6px
  lg: 10px
  xl: 12px
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 28px
  gutter: 20px
  margin: 28px
  card-padding: 22px
  sidebar-width: 260px
  touch-target: 44px
  kpi-min-width: 220px
  card-min-width: 460px
  phone-width: 390px
components:
  page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    typography: "{typography.body-md}"
    padding: "{spacing.margin}"
  sidebar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary-muted}"
    width: "{spacing.sidebar-width}"
    padding: "{spacing.2xl}"
  sidebar-tagline:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary-subtle}"
    typography: "{typography.label-md}"
  brand-wordmark:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.display-logo}"
  brand-wordmark-accent:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.tertiary}"
    typography: "{typography.display-logo}"
  nav-item:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary-muted}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    height: "{spacing.touch-target}"
    padding: "{spacing.lg}"
  nav-item-active:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary-container}"
    typography: "{typography.body-strong}"
  page-title:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
    typography: "{typography.headline-lg}"
  page-subtitle:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body-lg}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-padding}"
  card-header:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.title-md}"
    padding: "{spacing.md}"
  kpi-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-md}"
    rounded: "{rounded.xl}"
    padding: "{spacing.xl}"
  kpi-value:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.stat-md}"
  kpi-accent-positive:
    backgroundColor: "{colors.primary-container}"
    width: 6px
    rounded: "{rounded.xs}"
  kpi-accent-usd:
    backgroundColor: "{colors.data-usd}"
    width: 6px
    rounded: "{rounded.xs}"
  kpi-accent-season:
    backgroundColor: "{colors.data-season}"
    width: 6px
    rounded: "{rounded.xs}"
  kpi-accent-fx:
    backgroundColor: "{colors.data-fx}"
    width: 6px
    rounded: "{rounded.xs}"
  kpi-accent-alert:
    backgroundColor: "{colors.alert}"
    width: 6px
    rounded: "{rounded.xs}"
  delta-positive:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.positive}"
    typography: "{typography.label-md}"
  delta-negative:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.negative}"
    typography: "{typography.label-md}"
  score-badge:
    backgroundColor: "{colors.success-container}"
    textColor: "{colors.on-success-container}"
    typography: "{typography.stat-lg}"
    rounded: "{rounded.full}"
    size: 92px
  verdict-title:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.headline-md}"
  signal-row-favorable:
    backgroundColor: "{colors.surface-positive}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  signal-icon-favorable:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 26px
  signal-row-neutral:
    backgroundColor: "{colors.surface-warning}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  signal-icon-neutral:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 26px
  callout-dark:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.title-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  callout-positive:
    backgroundColor: "{colors.surface-positive}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  callout-warning:
    backgroundColor: "{colors.surface-warning}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  quadrant-tile:
    backgroundColor: "{colors.surface-neutral}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md}"
  quadrant-tile-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.success-container}"
  stat-usd:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-data-usd}"
    typography: "{typography.stat-sm}"
  stat-fx:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.warning}"
    typography: "{typography.stat-sm}"
  range-track:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.md}"
    height: 28px
  range-fill:
    backgroundColor: "{colors.chart-range}"
    rounded: "{rounded.md}"
  today-marker:
    backgroundColor: "{colors.alert}"
    width: 3px
  chart-bar:
    backgroundColor: "{colors.primary-container}"
    rounded: "{rounded.sm}"
  chart-bar-peak:
    backgroundColor: "{colors.primary}"
    rounded: "{rounded.sm}"
  chart-bar-unwind:
    backgroundColor: "{colors.tertiary}"
    rounded: "{rounded.sm}"
  chart-bar-latest:
    backgroundColor: "{colors.alert}"
    rounded: "{rounded.sm}"
  chart-gridline:
    backgroundColor: "{colors.outline-variant}"
    height: 1px
  table-header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-bold}"
    padding: "{spacing.sm}"
  table-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    padding: "{spacing.sm}"
  input-label:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface-variant}"
    typography: "{typography.label-caps}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.input-value}"
    rounded: "{rounded.lg}"
    height: 48px
    padding: "{spacing.md}"
  input-field-border:
    backgroundColor: "{colors.outline}"
    height: 1.5px
  segmented-option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    height: "{spacing.touch-target}"
  segmented-option-selected:
    backgroundColor: "{colors.success-container}"
    textColor: "{colors.on-success-container}"
    typography: "{typography.body-strong}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.title-md}"
    rounded: "{rounded.xl}"
    height: 52px
    padding: "{spacing.lg}"
  link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-strong}"
  source-footnote:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.caption}"
  mobile-app-bar:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.title-md}"
    padding: "{spacing.lg}"
---

# AgroMarket — Hora de vender

## Overview

O AgroMarket é um app para o produtor de soja responder a uma pergunta por dia: **"o preço de hoje é bom para vender?"**. Ele compara o preço de hoje com a mesma época dos últimos cinco anos e explica de onde veio a variação: o grão em Chicago, a aposta dos fundos e o câmbio. O tom é de **assessor de confiança do campo**: direto, sem jargão de mesa de operações, sempre mostrando o número que sustenta cada frase e a fonte de onde ele veio.

O estilo é **painel de cooperativa moderno**: barra lateral verde-escura com a marca, fundo verde-acinzentado muito claro, cartões brancos com cabeçalho verde-escuro e indicadores com uma faixa colorida à esquerda do número. A sensação deve ser de ferramenta séria e calma, nunca de corretora agressiva. O app descreve o histórico e não faz previsão: o veredito é sempre uma leitura dos dados, e a decisão é do produtor.

Telas do produto:

- **Visão geral — "Hoje é dia de vender?"**: quatro indicadores no topo, o termômetro de venda (quantos sinais históricos favorecem vender agora), a régua das cinco colheitas, a decomposição da alta das últimas quatro semanas e as principais leituras.
- **Preço na época**: percentil sazonal em reais e em dólares, a distribuição dos pregões da mesma época, a série mensal desde 2021 e como o percentil é calculado, em três passos.
- **Fundos em Chicago**: a posição líquida dos fundos (relatório COT da CFTC) semana a semana, onde ela está na faixa do ano, a leitura de preço × contratos em aberto e uma tabela com data de referência e data de publicação.
- **Câmbio: grão × moeda**: o mesmo dia medido em reais, em dólares e pelo câmbio, e a ponte que separa o efeito do grão do efeito do dólar.
- **Avaliar oferta (celular, 390 × 844)**: o produtor digita a oferta e o custo, vê a margem e a diferença para Paranaguá e registra a oferta para o mapa de preços da praça.

Público: produtores e gestores de cooperativas do Sul e do Centro-Oeste. Leem no computador do escritório e no celular, no campo e muitas vezes ao sol, por isso o contraste é alto e os números são grandes.

## Colors

A paleta nasce da lavoura: um verde-escuro de folha madura como base, um verde mais vivo para estados positivos e um verde-broto como assinatura da marca. As cores de dados são poucas, fixas por grandeza e nunca trocam de significado entre telas.

- **Verde Lavoura — `primary` (#1F4D2E):** cor da marca. Barra lateral, cabeçalho de todos os cartões, títulos de página, botão principal e o destaque do veredito. Texto branco sobre ela tem contraste de 9,7:1.
- **Verde Folha — `primary-container` (#2E7D3E):** item de menu ativo, ícones de sinal favorável, barras de gráfico e a faixa de indicadores em reais. Texto branco sobre ela: 5,1:1.
- **Verde Broto — `tertiary` (#9CCB4F):** a palavra "Market" do logotipo, o grão de soja do símbolo e as barras de desmonte no gráfico dos fundos. Só aparece sobre o Verde Lavoura ou como gráfico, nunca como fundo de texto.
- **Fundo e superfícies:** `background` (#EEF1EC) é o fundo de página, um verde-acinzentado que faz os cartões brancos (`surface`, #FFFFFF) se destacarem sem precisar de borda. `surface-positive` (#F3F8F1), `surface-warning` (#FFF7E6) e `surface-neutral` (#F4F6F3) são tons de apoio para linhas de sinal, avisos e blocos de explicação.
- **Texto:** `on-surface` (#1A1A1A) para números e títulos; `on-surface-variant` (#3D4A41) para texto de apoio; `on-surface-muted` (#5F6B63) só para legendas e fontes. Na barra lateral, `on-primary-muted` (#E7EFE8) para o menu e `on-primary-subtle` (#CFE0D2) para o slogan.
- **Variação:** `positive` (#1E6B2F) para alta e `negative` (#B3261E) para queda, sempre acompanhadas de seta (▲ ▼) e sinal (+ −), nunca só pela cor.
- **Atenção:** `warning` (#8A5A00) para sinais neutros e textos sobre câmbio. `alert` (#D32F2F) é o marcador de "hoje" nas réguas e a última barra dos gráficos; não é usado para texto corrido.
- **Cores de dados:** reais = Verde Folha; dólar = `data-usd` (#2E86AB) nas barras e `on-data-usd` (#1F5F7A) no texto; câmbio = `data-fx` (#E0A800); época/sazonalidade = `data-season` (#F5A623); faixa histórica = `chart-range` (#A9CFA0).

## Typography

Toda a interface usa **Lato**, uma sans-serif humanista com números largos e legíveis, em três pesos: 400 para texto, 700 para títulos de cartão e rótulos e 900 para números e títulos de página. Números são o centro de cada tela, então eles recebem o peso mais forte.

- **Títulos de página (`headline-lg`, 40px/900):** em Verde Lavoura, formulados como pergunta ou resposta ("Hoje é dia de vender?").
- **Veredito (`headline-md`, 24px/900):** a frase-resposta do termômetro.
- **Números (`stat-lg` 34px, `stat-md` 28px, `stat-sm` 22px, todos 900):** valores em R$, US$, percentis e contratos. Unidades ao lado em `label-md` ou `body-md` 400, nunca no mesmo peso do número.
- **Cabeçalhos de cartão (`title-md`, 17px/700):** brancos sobre a faixa verde-escura.
- **Texto (`body-md`, 15px/400; `body-lg`, 17px/400 para subtítulos):** explicações curtas, uma ideia por frase.
- **Rótulos (`label-md`, 14px):** nome do indicador acima do número e variações abaixo dele. `label-caps` (12px/700, maiúsculas) só nos rótulos de campo do celular.
- **Fontes (`caption`, 12px/400):** rodapé de cada tela citando de onde vêm os dados.

Formatação de números sempre no padrão brasileiro: vírgula decimal, ponto de milhar, "R$ 158,53", "US$ 28,87", "19,8%", datas "05/11/2026".

## Layout

Desktop: **barra lateral fixa de até 260px + área de conteúdo fluida**. A área de conteúdo tem margem de 28px e organiza tudo em grades que se reorganizam sozinhas:

- **Linha de indicadores:** grade de colunas automáticas com mínimo de 220px e espaço de 16px; quatro indicadores por linha no desktop, um por linha no celular.
- **Cartões:** grade de colunas automáticas com mínimo de 460px e espaço de 20px; dois por linha no desktop, empilhados abaixo disso.
- **Ordem de leitura de cada tela:** título e subtítulo → indicadores → cartão principal (a resposta) → cartões de explicação → aviso ou leitura de rodapé → fontes.
- **Escala de espaçamento em múltiplos de 4px:** 4, 8, 12, 16, 20 e 28. Dentro dos cartões, 22px de respiro lateral.
- **Celular (390px):** barra superior verde com voltar e o nome da praça, conteúdo em coluna única com blocos brancos e o botão principal fixo na base da tela.
- Abaixo de cerca de 780px, a barra lateral vira uma faixa acima do conteúdo, e tabelas largas rolam na horizontal dentro do próprio cartão.
- Alvos de toque têm no mínimo 44px de altura.

## Elevation & Depth

A profundidade vem principalmente do **contraste de tons**: cartões brancos sobre o fundo verde-acinzentado. Uma única sombra suave reforça essa separação: `0 2px 8px rgba(20, 40, 25, 0.10)`, levemente esverdeada. No celular, `0 1px 4px rgba(20, 40, 25, 0.12)`.

- Não há segundo nível de sombra: modais e menus, se surgirem, usam a mesma sombra com o fundo escurecido.
- O cabeçalho verde-escuro de cada cartão cria hierarquia sem precisar de sombra extra.
- Destaques usam **troca de fundo** (um bloco verde-escuro com texto branco, ou um tom claro de apoio), nunca brilho, gradiente ou borda grossa.

## Shapes

Formas **arredondadas, mas firmes**: cantos que suavizam sem deixar a interface infantil.

- **Cartões, indicadores, avisos e botão principal:** 12px (`rounded.xl`).
- **Itens de menu, campos, opções segmentadas, linhas de sinal e blocos internos:** 10px (`rounded.lg`).
- **Réguas de faixa histórica:** 6px (`rounded.md`).
- **Barras de gráfico:** 4px no topo (`rounded.sm`); faixa de cor dos indicadores: 3px (`rounded.xs`).
- **Círculos:** placar do termômetro, ícones de sinal e o símbolo da marca (`rounded.full`).
- **Ícones:** traço de 2px com pontas arredondadas, dentro de círculos coloridos de 26px. Nada de emoji.

## Components

### Navegação

A barra lateral (`sidebar`) traz o símbolo do grão de soja, o logotipo "Agro**Market**" (`brand-wordmark` + `brand-wordmark-accent`) e o slogan "Dados que conectam o campo ao mercado". Os itens (`nav-item`) têm 44px de altura; o item da tela atual (`nav-item-active`) recebe fundo Verde Folha, texto branco em negrito e `aria-current="page"`. Os nomes dos integrantes do grupo ficam no pé da barra, em texto pequeno.

### Indicadores (KPI)

`kpi-card`: cartão branco com uma faixa vertical de 6px à esquerda (`kpi-accent-*`), o rótulo em `label-md`, o número em `stat-md` com a unidade em peso 400 e uma linha de variação abaixo (`delta-positive` ou `delta-negative`, sempre com seta e sinal). A cor da faixa segue a grandeza: verde para reais, azul para dólar, âmbar para época, ouro para câmbio e vermelho para queda.

### Termômetro de venda

O componente central do app. À esquerda, o placar (`score-badge`) em círculo verde-claro com "3/4" e a palavra "sinais"; à direita, o veredito (`verdict-title`) e uma frase de explicação. Abaixo, uma linha por sinal: `signal-row-favorable` com ícone de visto (`signal-icon-favorable`) ou `signal-row-neutral` com ícone de traço (`signal-icon-neutral`). Cada linha tem um título curto ("Câmbio · favorável") e uma frase com o número que a justifica. Termina sempre com a nota "Leitura descritiva do histórico, não previsão. A decisão é do produtor."

### Réguas e gráficos

- **Régua das cinco colheitas:** uma linha por ano, com trilho (`range-track`), a faixa de preço daquela época (`range-fill`) e o marcador de hoje (`today-marker`), vertical, vermelho, 3px, cruzando todas as linhas na mesma posição. À direita, o resultado em palavras ("acima de todos", "abaixo de todos").
- **Barras semanais:** `chart-bar` em Verde Folha; o pico em `chart-bar-peak`, o desmonte depois do pico em `chart-bar-unwind` e a última semana em `chart-bar-latest`, com legenda abaixo.
- **Linhas:** traço de 2,5px em Verde Lavoura, pontas e junções arredondadas, último ponto marcado com um círculo vermelho e rótulo com o valor.
- **Grade:** linhas de 1px em `outline-variant`; rótulos de eixo em `caption`.
- **Ponte (cascata):** barras horizontais do valor inicial, de cada efeito (vermelho para o que tirou, ouro para o câmbio) e do valor final, com o valor em R$ à direita.
- Todo gráfico tem um título que diz o que ele mostra, uma descrição acessível (`role="img"` + `aria-label` com os números principais) e a unidade escrita.

### Blocos de leitura

- `callout-dark`: a conclusão da tela em uma frase, branco sobre Verde Lavoura.
- `callout-positive`: explicação de um gráfico, sobre o tom verde-claro.
- `callout-warning`: limitação ou risco ("Por que este quadro não prevê o preço"), sobre o tom âmbar-claro, com o início da frase em negrito.
- `quadrant-tile`: os quatro casos de preço × contratos em aberto em grade 2 × 2; o caso da semana em `quadrant-tile-active`.

### Tabelas

Cabeçalho em `label-bold`, células em `label-md`, números alinhados à direita e datas à esquerda, linhas separadas por 1px em `background`. A linha mais recente fica em negrito. Tabelas com datas do COT mostram sempre as duas colunas: "Posições de" e "Público em".

### Formulário do celular

Rótulo em `label-caps` acima de cada campo; `input-field` com 48px de altura, borda de 1,5px em `outline` e valor em `input-value`. A escolha entre "Fechei negócio" e "Só recebi a oferta" usa opções segmentadas (`segmented-option` / `segmented-option-selected`, com `aria-pressed`). O botão principal (`button-primary`) ocupa a largura toda, tem 52px de altura e fica fixo na base. Depois de registrar, aparece uma confirmação em `callout-dark` com `role="status"`.

### Fontes de dados

Toda tela termina com `source-footnote` citando a fonte de cada número: "CEPEA/ESALQ, Indicador da Soja Paranaguá (CC BY-NC)", "CFTC, Commitments of Traders, Disaggregated Futures Only" e o período usado.

## Do's and Don'ts

- Do responder à pergunta da tela no primeiro bloco e explicar depois.
- Do acompanhar todo veredito com o número que o sustenta e a data do dado.
- Do mostrar, nos dados do COT, a data de referência e a data de publicação; o produtor só pode usar o que já era público.
- Do separar sempre o efeito do grão do efeito do câmbio quando o preço em reais mudar.
- Do citar a fonte no rodapé de toda tela, incluindo a licença do CEPEA (CC BY-NC).
- Do indicar alta e queda com seta e sinal, além da cor.
- Do manter contraste mínimo de 4,5:1 em todo texto; os pares de cor deste sistema já passam nessa medida.
- Don't usar linguagem de recomendação de investimento ("compre", "venda tudo", "garantido"); o app descreve o histórico, a decisão é do produtor.
- Don't usar o verde vivo do modelo de slides (#4CAF50) atrás de texto branco: o contraste é de só 2,8:1. O item de menu ativo usa o Verde Folha (#2E7D3E).
- Don't colocar texto sobre o Verde Broto (#9CCB4F) nem usar o vermelho de alerta em texto corrido.
- Don't usar gradientes, emoji, sombras pesadas ou cartões com borda colorida em um lado só.
- Don't inventar números: campos ainda sem dado aparecem como marcador entre colchetes, por exemplo "[MEDIANA DA PRAÇA]".
- Don't trocar a cor de uma grandeza entre telas: dólar é sempre azul, câmbio é sempre ouro.
