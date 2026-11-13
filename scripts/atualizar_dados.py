"""Gera os CSVs que o site lê, a partir dos arquivos baixados das fontes oficiais.

Uso:
    python scripts/atualizar_dados.py --cepea CEPEA_xxxx.xls --cot fut_disagg_xls_2026.zip [--cot outro_ano.zip ...]

Fontes:
    CEPEA/ESALQ  https://www.cepea.org.br/br/indicador/soja.aspx
                 Indicador da Soja Paranaguá -> "Série de preços" (.xls). Licença CC BY-NC.
    CFTC (COT)   https://www.cftc.gov/MarketReports/CommitmentsofTraders/HistoricalCompressed/index.htm
                 Disaggregated Futures Only -> Excel do ano (.zip). Domínio público (governo dos EUA).

Saída (pasta data/):
    cepea_soja_paranagua.csv  data, preco_brl, preco_usd
    cot_soja_cbot.csv         uma linha por relatório, com data_referencia e data_publicacao

A data de publicação do COT não vem no arquivo da CFTC. Ela é tirada de
data/cot_calendario_publicacao.csv (calendário oficial da CFTC): a primeira
publicação a partir de 3 dias depois da data de referência. Ao entrar um ano novo,
acrescente as datas daquele ano ao calendário.

Observação: o .xls do CEPEA vem com um defeito interno e só abre com
xlrd.open_workbook(..., ignore_workbook_corruption=True).
"""
import argparse
import io
import zipfile
from pathlib import Path

import pandas as pd
import xlrd

RAIZ = Path(__file__).resolve().parent.parent
DADOS = RAIZ / "data"
CODIGO_SOJA_CBOT = "005602"

COLUNAS_COT = {
    "Open_Interest_All": "open_interest",
    "M_Money_Positions_Long_ALL": "fundos_comprados",
    "M_Money_Positions_Short_ALL": "fundos_vendidos",
    "Prod_Merc_Positions_Long_ALL": "comerciais_comprados",
    "Prod_Merc_Positions_Short_ALL": "comerciais_vendidos",
    "Swap_Positions_Long_All": "swap_comprados",
    "Swap__Positions_Short_All": "swap_vendidos",
    "Other_Rept_Positions_Long_ALL": "outros_comprados",
    "Other_Rept_Positions_Short_ALL": "outros_vendidos",
    "NonRept_Positions_Long_All": "pequenos_comprados",
    "NonRept_Positions_Short_All": "pequenos_vendidos",
    "Traders_M_Money_Long_All": "traders_fundos_comprados",
    "Traders_M_Money_Short_All": "traders_fundos_vendidos",
}


def ler_cepea(caminho: Path) -> pd.DataFrame:
    livro = xlrd.open_workbook(str(caminho), ignore_workbook_corruption=True)
    df = pd.read_excel(livro, header=3, engine="xlrd")
    df.columns = ["data", "preco_brl", "preco_usd"]
    df["data"] = pd.to_datetime(df["data"], format="%d/%m/%Y")
    df = df.dropna().sort_values("data").drop_duplicates("data")
    if (df[["preco_brl", "preco_usd"]] <= 0).any().any():
        raise ValueError("CEPEA: há preços menores ou iguais a zero.")
    return df


def ler_cot(caminho: Path) -> pd.DataFrame:
    if caminho.suffix.lower() == ".zip":
        with zipfile.ZipFile(caminho) as z:
            nome = next(n for n in z.namelist() if n.lower().endswith((".xls", ".xlsx")))
            bruto = io.BytesIO(z.read(nome))
    else:
        bruto = caminho
    df = pd.read_excel(bruto, dtype={"CFTC_Contract_Market_Code": str})
    df = df[df["CFTC_Contract_Market_Code"].str.strip() == CODIGO_SOJA_CBOT].copy()
    df["data_referencia"] = pd.to_datetime(df["Report_Date_as_MM_DD_YYYY"])
    df = df[["data_referencia", *COLUNAS_COT]].rename(columns=COLUNAS_COT)
    numericas = list(COLUNAS_COT.values())
    if df[numericas].isna().any().any():
        raise ValueError("COT: há valores vazios nas colunas usadas.")
    df[numericas] = df[numericas].astype("int64")
    return df


def data_publicacao(referencias: pd.Series) -> pd.Series:
    cal = pd.read_csv(DADOS / "cot_calendario_publicacao.csv", parse_dates=["data_publicacao"])
    datas = sorted(cal["data_publicacao"])

    def achar(ref):
        minimo = ref + pd.Timedelta(days=3)
        for d in datas:
            if d >= minimo:
                return d
        raise ValueError(
            f"Sem data de publicação no calendário para a referência {ref:%d/%m/%Y}. "
            "Acrescente as datas do ano em data/cot_calendario_publicacao.csv."
        )

    return referencias.apply(achar)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cepea", type=Path, help="arquivo .xls baixado do CEPEA")
    ap.add_argument("--cot", type=Path, action="append", default=[], help="arquivo(s) .zip/.xls do COT da CFTC")
    args = ap.parse_args()

    if args.cepea:
        cepea = ler_cepea(args.cepea)
        cepea.to_csv(DADOS / "cepea_soja_paranagua.csv", index=False, date_format="%Y-%m-%d", float_format="%.2f")
        print(f"CEPEA: {len(cepea)} pregões, {cepea.data.min():%d/%m/%Y} a {cepea.data.max():%d/%m/%Y}")

    if args.cot:
        cot = pd.concat([ler_cot(c) for c in args.cot]).drop_duplicates("data_referencia").sort_values("data_referencia")
        liquido = sum(
            cot[f"{g}_comprados"] - cot[f"{g}_vendidos"] for g in ("fundos", "comerciais", "swap", "outros", "pequenos")
        )
        if liquido.abs().max() != 0:
            raise ValueError("COT: comprados e vendidos não fecham em alguma semana.")
        cot.insert(1, "data_publicacao", data_publicacao(cot["data_referencia"]))
        cot.to_csv(DADOS / "cot_soja_cbot.csv", index=False, date_format="%Y-%m-%d")
        print(f"COT: {len(cot)} relatórios, {cot.data_referencia.min():%d/%m/%Y} a {cot.data_referencia.max():%d/%m/%Y}")


if __name__ == "__main__":
    main()
