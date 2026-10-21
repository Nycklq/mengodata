from pathlib import Path

import pandas as pd


def export_collective_powerbi(document, destination):
    destination = Path(destination)
    destination.mkdir(parents=True, exist_ok=True)
    tables = {
        "TeamMatches": document["team_matches"],
        "Clubs": document["clubs"],
        "Standings": document["standings"],
        "Matches": document["matches"],
        "Rounds": [{"official_round": number} for number in range(1, 39)],
        "Seasons": [
            {"season": 2025, "competition_id": document["scope"]["competition_id"]}
        ],
        "Provenance": [{**document["source"], "coverage_verified": True}],
    }
    for name, rows in tables.items():
        pd.DataFrame(rows).to_csv(
            destination / f"{name}.csv", index=False, encoding="utf-8-sig"
        )
    return {name: len(rows) for name, rows in tables.items()}
