import json
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

from flamengo_pipeline.domain.collective import aggregate_clubs, descriptive


def research_tables(document):
    facts = pd.DataFrame(document["team_matches"])
    totals = pd.DataFrame(document["club_totals"])
    flamengo = facts[facts.club_id == "club:flamengo"].copy()
    series = pd.DataFrame(document["standings"])
    series = series[series.club_id == "club:flamengo"]
    home_away = pd.DataFrame(
        [
            {"venue": venue, **aggregate_clubs(flamengo[flamengo.venue == venue])[0]}
            for venue in ("home", "away")
        ]
    )
    return facts, totals, flamengo, series, home_away


def generate_research(document, destination):
    destination = Path(destination)
    destination.mkdir(parents=True, exist_ok=True)
    facts, totals, flamengo, series, home_away = research_tables(document)
    sns.set_theme(style="whitegrid", palette=["#C8102E", "#17191D", "#9499A4"])
    figures = []

    def save(figure, name, title, interpretation):
        figure.suptitle(title, fontsize=15, fontweight="bold", x=0.08, ha="left")
        figure.text(
            0.08,
            0.015,
            "Fonte: OpenFootball · CC0 · Série A masculina 2025 · "
            "rodadas oficiais 1–38",
            fontsize=8,
        )
        figure.tight_layout(rect=(0, 0.045, 1, 0.94))
        figure.savefig(destination / f"{name}.png", dpi=160)
        plt.close(figure)
        figures.append(
            {"file": f"{name}.png", "title": title, "interpretation": interpretation}
        )

    figure, axis = plt.subplots(figsize=(11, 5))
    matches = pd.DataFrame(document["matches"])
    goals = matches.home_goals + matches.away_goals
    sns.histplot(x=goals, discrete=True, ax=axis, color="#C8102E")
    axis.set(xlabel="Gols totais por partida", ylabel="Partidas (n=380)")
    save(
        figure,
        "01_distribuicao",
        "Como os gols se distribuem no campeonato",
        f"Média de {goals.mean():.3f} e mediana de {goals.median():.0f} "
        "gols por partida. A distribuição não mede qualidade das chances.",
    )

    figure, axes = plt.subplots(1, 2, figsize=(12, 5))
    sns.lineplot(
        data=series, x="official_round", y="points", ax=axes[0], color="#C8102E"
    )
    long = series.melt(
        id_vars="official_round",
        value_vars=["goals_for", "goals_against"],
        var_name="Indicador",
        value_name="Gols",
    )
    sns.lineplot(data=long, x="official_round", y="Gols", hue="Indicador", ax=axes[1])
    axes[0].set(xlabel="Rodada oficial", ylabel="Pontos acumulados")
    axes[1].set(xlabel="Rodada oficial", ylabel="Gols acumulados")
    axes[1].legend(title="", labels=["Gols pró", "Gols contra"])
    save(
        figure,
        "02_evolucao",
        "A construção da campanha do Flamengo",
        "Acumulado por rodada oficial. Jogos adiados entram na rodada de origem; "
        "a curva não representa informação disponível em cada data.",
    )

    figure, axes = plt.subplots(1, 2, figsize=(11, 5))
    home_away["Mando"] = home_away.venue.map({"home": "Mandante", "away": "Visitante"})
    sns.barplot(data=home_away, x="Mando", y="efficiency", ax=axes[0], color="#C8102E")
    goals_venue = home_away.melt(
        id_vars="Mando",
        value_vars=["goals_for", "goals_against"],
        var_name="Indicador",
        value_name="Gols",
    )
    sns.barplot(data=goals_venue, x="Mando", y="Gols", hue="Indicador", ax=axes[1])
    axes[0].set(xlabel="", ylabel="Aproveitamento (%)", ylim=(0, 100))
    axes[1].set(xlabel="", ylabel="Gols (19 jogos por mando)")
    axes[1].legend(title="", labels=["Gols pró", "Gols contra"])
    save(
        figure,
        "03_casa_fora",
        "Mandante e visitante: duas campanhas",
        "O Flamengo somou 47 pontos em casa e 32 fora. A comparação é descritiva; "
        "mando não é a única diferença entre as partidas.",
    )

    figure, axis = plt.subplots(figsize=(12, 6))
    ordered = totals.sort_values("points", ascending=False)
    colors = [
        "#C8102E" if value == "club:flamengo" else "#9BA0A8"
        for value in ordered.club_id
    ]
    axis.bar(ordered.name, ordered.points, color=colors)
    axis.tick_params(axis="x", rotation=55)
    axis.set(xlabel="Clube", ylabel="Pontos em 38 jogos")
    save(
        figure,
        "04_clubes",
        "Flamengo e os outros 19 clubes",
        "Flamengo terminou com 79 pontos e Palmeiras com 76. "
        "A classificação calculada usa resultados e não certifica "
        "critérios disciplinares.",
    )

    figure, axis = plt.subplots(figsize=(10, 6))
    sns.scatterplot(
        data=totals, x="goals_against", y="goals_for", ax=axis, color="#9499A4", s=60
    )
    for row in totals.itertuples():
        offsets = {
            "club:sao-paulo": (7, 17),
            "club:atletico-mg": (-40, 4),
            "club:corinthians": (6, -14),
            "club:bragantino": (6, 14),
            "club:internacional": (6, 0),
            "club:fortaleza": (6, -14),
        }
        axis.annotate(
            row.name,
            (row.goals_against, row.goals_for),
            xytext=offsets.get(row.club_id, (4, 4)),
            textcoords="offset points",
            fontsize=8,
            color="#C8102E" if row.club_id == "club:flamengo" else "#434750",
        )
    axis.set(xlabel="Gols sofridos (38 jogos)", ylabel="Gols marcados (38 jogos)")
    save(
        figure,
        "05_ataque_defesa",
        "Produção ofensiva e proteção defensiva",
        "Na base, o Flamengo tem o maior total de gols pró (78) e "
        "o menor total de gols contra (27). Placares não descrevem "
        "ações táticas ou chances criadas.",
    )

    figure, axes = plt.subplots(1, 2, figsize=(12, 5))
    sns.boxplot(data=facts, x="venue", y="goals_for", ax=axes[0], color="#C8102E")
    correlation = totals[
        ["points", "wins", "goals_for", "goals_against", "goal_difference"]
    ].corr()
    sns.heatmap(
        correlation, annot=True, fmt=".2f", cmap="RdBu_r", vmin=-1, vmax=1, ax=axes[1]
    )
    axes[0].set(
        xlabel="Mando (home = mandante; away = visitante)",
        ylabel="Gols por clube × partida (n=760)",
    )
    axes[1].tick_params(axis="x", rotation=45)
    save(
        figure,
        "06_estatistica",
        "Dispersão e correlações exploratórias",
        "Correlações entre variáveis derivadas do placar têm dependência "
        "matemática. Não demonstram causalidade nem generalização "
        "para outras temporadas.",
    )

    report = {
        "dataset_version": document["dataset_version"],
        "source": document["source"],
        "coverage": document["coverage"],
        "figures": figures,
        "flamengo": totals[totals.club_id == "club:flamengo"].to_dict("records")[0],
        "home_away": home_away.drop(columns="Mando").to_dict("records"),
        "flamengo_goals": descriptive(flamengo.goals_for.tolist()),
        "statistics": document["statistics"],
    }
    (destination / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    totals.to_csv(destination / "club_totals.csv", index=False, encoding="utf-8-sig")
    return report
