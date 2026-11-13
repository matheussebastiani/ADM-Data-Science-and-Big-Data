# AgroMarket · Hora de vender

Projeto da disciplina de **BI, Data Science e Big Data**. O app mostra ao produtor de soja se o preço de hoje é bom para vender, comparando com a mesma época dos últimos cinco anos, a posição dos fundos na Bolsa de Chicago e o câmbio.

**Site:** https://matheussebastiani.github.io/ADM-Data-Science-and-Big-Data/

Equipe: Ana Cades, Amanda Vargas, Murilo e Matheus.

## O que o site faz

| Tela | O que mostra |
|---|---|
| Visão geral | Termômetro de venda (quantos sinais históricos favorecem vender), régua das cinco colheitas, de onde veio a variação das últimas 4 semanas |
| Preço na época | Percentil sazonal em R$ e US$, distribuição dos pregões da mesma época, série mensal |
| Fundos em Chicago | Posição líquida dos fundos (COT/CFTC) semana a semana, faixa do ano, leitura preço × contratos em aberto |
| Câmbio | O mesmo dia em R$, US$ e câmbio; separação entre efeito do grão e efeito do dólar |
| Avaliar oferta | Margem sobre o custo, diferença para Paranaguá e registro de ofertas (salvo só no navegador) |
| Como calculamos | Fontes, fórmulas e regras do termômetro |

No topo de cada tela dá para escolher uma data e ver o mercado **como estava naquele dia**. O app só usa o que já era público na data escolhida: o relatório COT entra a partir da **data de publicação**, não da data de referência.

Tudo é calculado no navegador a partir dos CSVs da pasta `data/`. Não há servidor nem banco de dados (GitHub Pages só hospeda arquivos estáticos).

## Estrutura

```
index.html                       página única com as 6 telas
assets/app.js                    leitura dos CSVs e todos os cálculos
assets/style.css                 tokens do DESIGN.md
data/cepea_soja_paranagua.csv    preço diário (data, preco_brl, preco_usd)
data/cot_soja_cbot.csv           COT da soja, com data_referencia e data_publicacao
data/cot_calendario_publicacao.csv  calendário oficial de publicação da CFTC
scripts/atualizar_dados.py       gera os CSVs a partir dos arquivos das fontes
DESIGN.md                        sistema visual (formato DESIGN.md do Google Stitch)
```

## Como atualizar os dados

1. **CEPEA:** em https://www.cepea.org.br/br/indicador/soja.aspx, no indicador **Soja Paranaguá**, baixe a "Série de preços" (.xls).
2. **CFTC:** em https://www.cftc.gov/MarketReports/CommitmentsofTraders/HistoricalCompressed/index.htm, seção **Disaggregated Futures Only**, baixe o Excel do ano (.zip). Pode passar vários anos.
3. Rode:

   ```bash
   pip install pandas xlrd
   python scripts/atualizar_dados.py --cepea CEPEA_xxxx.xls --cot fut_disagg_xls_2026.zip
   ```

4. Faça commit dos CSVs. O site atualiza sozinho em um ou dois minutos.

Ao entrar um ano novo, acrescente as datas de publicação daquele ano em `data/cot_calendario_publicacao.csv`. A CFTC anunciou em 27/10/2026 que o COT passa a sair duas vezes por semana até o fim de 2026: inclua as novas datas no calendário.

O `.xls` do CEPEA vem com um defeito interno e só abre com `xlrd.open_workbook(..., ignore_workbook_corruption=True)`. O script já trata isso.

## Rodar no computador

O navegador não deixa a página ler os CSVs abrindo o `index.html` direto. Use um servidor local:

```bash
python -m http.server 8000
# abra http://localhost:8000
```

## Metodologia (resumo)

- **Percentil da época:** pregões de 15 dias antes a 15 dias depois da mesma data, nos 5 anos anteriores; percentil = quantos tiveram preço menor que hoje ÷ total.
- **Termômetro:** 4 sinais (preço em R$, câmbio, fundos em Chicago, preço em US$). Percentil ≥ 60 é favorável, 40–59 neutro, abaixo de 40 desfavorável. Fundos: favorável a vender cedo quando a posição líquida passa de 15% do mercado e caiu na semana. Placar = favoráveis ÷ disponíveis.
- **Grão × câmbio:** efeito do grão = (US$ hoje − US$ antes) × dólar antes; efeito do câmbio = US$ hoje × (dólar hoje − dólar antes).

É uma leitura descritiva do histórico, feita para fins didáticos. **Não é previsão nem recomendação de investimento.**

## Fontes e licenças

- **CEPEA/ESALQ-USP**, Indicador da Soja Paranaguá. Licença [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/deed.pt_BR): atribuição obrigatória, uso não comercial.
- **CFTC** (Commodity Futures Trading Commission, EUA), Commitments of Traders, Disaggregated Futures Only, soja CBOT (código 005602). Dado público do governo dos EUA.

## Google Stitch

O arquivo `DESIGN.md` segue o formato aberto do Google Stitch. Para refinar o visual no Stitch, cole o link deste repositório no campo **Public GitHub repository** ou envie o `DESIGN.md` em **Upload a DESIGN.md file**.
