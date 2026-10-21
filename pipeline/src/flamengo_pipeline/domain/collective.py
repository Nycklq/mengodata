from collections import Counter
from datetime import date
from uuid import NAMESPACE_URL, uuid5

import numpy as np
import pandas as pd

COMPETITION = "competition:brasileirao-serie-a-men"
COUNTS = [
    "played",
    "wins",
    "draws",
    "losses",
    "goals_for",
    "goals_against",
    "goal_difference",
    "points",
    "clean_sheets",
]
RANKING_NOTE = (
    "Classificação calculada por pontos, vitórias, saldo e gols pró. "
    "Empates restantes compartilham posição; confronto direto, cartões, sorteio "
    "e sanções não são reproduzidos. Acumulado por rodada oficial, não por data."
)


def normalize_matches(document, clubs):
    if document.get("name") != "Brasileiro Série A 2025":
        raise ValueError("INVALID_COMPETITION_SEASON")
    mapping = {club["source_name"]: club for club in clubs}
    rows = []
    for index, item in enumerate(document.get("matches", [])):
        label = item.get("round", "")
        if not label.startswith("Matchday "):
            raise ValueError("INVALID_ROUND")
        round_number = int(label.removeprefix("Matchday "))
        if not 1 <= round_number <= 38:
            raise ValueError("INVALID_ROUND")
        home, away = mapping.get(item.get("team1")), mapping.get(item.get("team2"))
        if not home or not away or home == away:
            raise ValueError("INVALID_CLUB")
        try:
            played_date = date.fromisoformat(item["date"])
        except ValueError:
            raise ValueError("INVALID_DATE") from None
        score = item.get("score")
        score = score.get("ft") if isinstance(score, dict) else score
        if (
            not isinstance(score, list)
            or len(score) != 2
            or any(type(value) is not int or value < 0 for value in score)
        ):
            raise ValueError("INVALID_SCORE")
        identity = f"{COMPETITION}/2025/{home['club_id']}/{away['club_id']}"
        rows.append(
            {
                "match_id": str(uuid5(NAMESPACE_URL, identity)),
                "competition_id": COMPETITION,
                "season": 2025,
                "official_round": round_number,
                "date": played_date.isoformat(),
                "home_id": home["club_id"],
                "away_id": away["club_id"],
                "home_name": home["name"],
                "away_name": away["name"],
                "home_goals": score[0],
                "away_goals": score[1],
                "source_locator": f"matches[{index}]",
                "external_match_id": None,
            }
        )
    ids = [row["match_id"] for row in rows]
    if len(set(ids)) != len(ids):
        raise ValueError("DUPLICATE_MATCH")
    round_counts = Counter(row["official_round"] for row in rows)
    appearances = Counter(
        (row["official_round"], row[side])
        for row in rows
        for side in ("home_id", "away_id")
    )
    home_counts = Counter(row["home_id"] for row in rows)
    away_counts = Counter(row["away_id"] for row in rows)
    if (
        len(rows) != 380
        or set(round_counts) != set(range(1, 39))
        or set(round_counts.values()) != {10}
        or len(appearances) != 760
        or set(appearances.values()) != {1}
        or len(home_counts) != 20
        or len(away_counts) != 20
        or set(home_counts.values()) != {19}
        or set(away_counts.values()) != {19}
    ):
        raise ValueError("INCOMPLETE_SEASON")
    pairs = {(row["home_id"], row["away_id"]) for row in rows}
    if any((away, home) not in pairs for home, away in pairs):
        raise ValueError("INVALID_DOUBLE_ROUND_ROBIN")
    return sorted(rows, key=lambda row: (row["official_round"], row["match_id"]))


def team_facts(matches):
    frame = pd.DataFrame(matches)
    frames = []
    for venue, own, other in (("home", "home", "away"), ("away", "away", "home")):
        facts = frame[
            ["match_id", "competition_id", "season", "official_round", "date"]
        ].copy()
        facts["club_id"] = frame[f"{own}_id"]
        facts["name"] = frame[f"{own}_name"]
        facts["opponent_id"] = frame[f"{other}_id"]
        facts["venue"] = venue
        facts["goals_for"] = frame[f"{own}_goals"]
        facts["goals_against"] = frame[f"{other}_goals"]
        facts["played"] = 1
        facts["wins"] = (facts.goals_for > facts.goals_against).astype(int)
        facts["draws"] = (facts.goals_for == facts.goals_against).astype(int)
        facts["losses"] = (facts.goals_for < facts.goals_against).astype(int)
        facts["goal_difference"] = facts.goals_for - facts.goals_against
        facts["points"] = 3 * facts.wins + facts.draws
        facts["clean_sheets"] = (facts.goals_against == 0).astype(int)
        facts["result"] = np.select(
            [facts.wins == 1, facts.draws == 1], ["W", "D"], default="L"
        )
        frames.append(facts)
    return pd.concat(frames, ignore_index=True).sort_values(
        ["official_round", "club_id"]
    )


def streaks(rows):
    wins = unbeaten = best_wins = best_unbeaten = 0
    for row in sorted(rows, key=lambda row: (row["date"], row["match_id"])):
        wins = wins + 1 if row["wins"] else 0
        unbeaten = unbeaten + 1 if not row["losses"] else 0
        best_wins, best_unbeaten = max(best_wins, wins), max(best_unbeaten, unbeaten)
    return {"winning_streak": best_wins, "unbeaten_streak": best_unbeaten}


def aggregate_clubs(facts):
    if facts.empty:
        return []
    totals = facts.groupby(["club_id", "name"], as_index=False)[COUNTS].sum()
    totals["efficiency"] = totals.points / (3 * totals.played) * 100
    totals["goals_for_average"] = totals.goals_for / totals.played
    totals["goals_against_average"] = totals.goals_against / totals.played
    rows = totals.to_dict("records")
    for row in rows:
        row.update(streaks(facts[facts.club_id == row["club_id"]].to_dict("records")))
    return rank_clubs(rows)


def rank_clubs(rows):
    keys = ["points", "wins", "goal_difference", "goals_for"]
    ordered = sorted(
        rows, key=lambda row: (*(-row[key] for key in keys), row["club_id"])
    )
    previous = None
    position = 0
    for index, row in enumerate(ordered):
        current = tuple(row[key] for key in keys)
        if current != previous:
            position = index + 1
        row["position"] = position
        row["tied"] = (
            sum(tuple(other[key] for key in keys) == current for other in rows) > 1
        )
        previous = current
    return ordered


def descriptive(values):
    array = np.asarray(values, dtype=float)
    if not len(array):
        return {"n": 0}
    return {
        "n": len(array),
        "mean": float(array.mean()),
        "median": float(np.median(array)),
        "q1": float(np.quantile(array, 0.25)),
        "q3": float(np.quantile(array, 0.75)),
        "std_population": float(array.std(ddof=0)),
        "variance_population": float(array.var(ddof=0)),
        "min": float(array.min()),
        "max": float(array.max()),
    }


def build_gold(matches, clubs):
    facts = team_facts(matches)
    standings = []
    for round_number in range(1, 39):
        for row in aggregate_clubs(facts[facts.official_round <= round_number]):
            standings.append({"official_round": round_number, **row})
    totals = aggregate_clubs(facts)
    match_goals = [row["home_goals"] + row["away_goals"] for row in matches]
    return {
        "clubs": clubs,
        "matches": matches,
        "team_matches": facts.to_dict("records"),
        "club_totals": totals,
        "standings": standings,
        "statistics": {
            "match_goals": descriptive(match_goals),
            "club_points": descriptive([row["points"] for row in totals]),
            "correlation_goals_points": float(
                np.corrcoef(
                    [row["goals_for"] for row in totals],
                    [row["points"] for row in totals],
                )[0, 1]
            ),
        },
        "ranking_note": RANKING_NOTE,
    }
