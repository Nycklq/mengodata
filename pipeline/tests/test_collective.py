import copy
import hashlib
import json
from pathlib import Path

import pandas as pd
import pytest

from flamengo_pipeline.application.import_collective import import_collective
from flamengo_pipeline.domain.collective import (
    aggregate_clubs,
    build_gold,
    descriptive,
    normalize_matches,
    rank_clubs,
    team_facts,
)
from flamengo_pipeline.infrastructure.collective_files import (
    CollectiveFiles,
    CollectiveSource,
)

ROOT = Path(__file__).resolve().parents[2]
REVIEW = json.loads(
    (ROOT / "contracts/collective-source.json").read_text(encoding="utf-8")
)
RAW = (
    ROOT
    / "data/raw/collective/season=2025/competition=brasileirao-serie-a-men"
    / f"{REVIEW['reviewed_sha256']}.json"
)
CLUBS = json.loads((ROOT / "contracts/clubs.json").read_text(encoding="utf-8"))


@pytest.fixture
def source():
    return json.loads(RAW.read_text(encoding="utf-8"))


def test_real_source_hash_full_coverage_and_home_away(source):
    assert hashlib.sha256(RAW.read_bytes()).hexdigest() == REVIEW["reviewed_sha256"]
    matches = normalize_matches(source, CLUBS)
    facts = team_facts(matches)
    assert len(matches) == 380
    assert len(facts) == 760
    assert facts.groupby("club_id").size().eq(38).all()
    assert facts.groupby(["club_id", "venue"]).size().eq(19).all()
    assert facts.groupby(["official_round", "club_id"]).size().eq(1).all()
    assert set(facts.official_round) == set(range(1, 39))


@pytest.mark.parametrize(
    "mutation,expected",
    [
        ("missing", "INCOMPLETE_SEASON"),
        ("duplicate", "DUPLICATE_MATCH"),
        ("null_score", "INVALID_SCORE"),
        ("negative", "INVALID_SCORE"),
        ("boolean", "INVALID_SCORE"),
        ("unknown", "INVALID_CLUB"),
        ("same_club", "INVALID_CLUB"),
        ("round_zero", "INVALID_ROUND"),
        ("round_39", "INVALID_ROUND"),
        ("season", "INVALID_COMPETITION_SEASON"),
        ("date", "INVALID_DATE"),
    ],
)
def test_invalid_real_source_variants_fail_before_publication(
    source, mutation, expected
):
    changed = copy.deepcopy(source)
    row = changed["matches"][0]
    if mutation == "missing":
        changed["matches"].pop()
    if mutation == "duplicate":
        changed["matches"].append(copy.deepcopy(row))
    if mutation == "null_score":
        row["score"] = None
    if mutation == "negative":
        row["score"] = [-1, 0]
    if mutation == "boolean":
        row["score"] = [True, 0]
    if mutation == "unknown":
        row["team1"] = "Unknown"
    if mutation == "same_club":
        row["team1"] = row["team2"]
    if mutation == "round_zero":
        row["round"] = "Matchday 0"
    if mutation == "round_39":
        row["round"] = "Matchday 39"
    if mutation == "season":
        changed["name"] = "Brasileiro Série A 2026"
    if mutation == "date":
        row["date"] = "invalid-date"
    with pytest.raises(ValueError, match=expected):
        normalize_matches(changed, CLUBS)


def test_real_totals_accumulated_rounds_and_postponement(source):
    matches = normalize_matches(source, CLUBS)
    gold = build_gold(matches, CLUBS)
    flamengo = gold["club_totals"][0]
    assert {
        key: flamengo[key]
        for key in [
            "played",
            "points",
            "wins",
            "draws",
            "losses",
            "goals_for",
            "goals_against",
            "goal_difference",
            "clean_sheets",
        ]
    } == {
        "played": 38,
        "points": 79,
        "wins": 23,
        "draws": 10,
        "losses": 5,
        "goals_for": 78,
        "goals_against": 27,
        "goal_difference": 51,
        "clean_sheets": 18,
    }
    assert flamengo["efficiency"] == pytest.approx(79 / 114 * 100)
    postponed = next(
        row
        for row in matches
        if row["home_id"] == "club:sport" and row["away_id"] == "club:flamengo"
    )
    assert postponed["official_round"] == 12
    assert postponed["date"] == "2025-11-15"
    assert len(gold["standings"]) == 760
    round_one = [row for row in gold["standings"] if row["official_round"] == 1]
    assert len(round_one) == 20 and all(row["played"] == 1 for row in round_one)
    assert sum(row["goals_for"] for row in gold["club_totals"]) == 959
    home = aggregate_clubs(
        team_facts(matches).query("club_id == 'club:flamengo' and venue == 'home'")
    )[0]
    assert home["points"] == 47 and home["losses"] == 0


def test_postponement_does_not_replace_official_scope_with_calendar_year(source):
    changed = copy.deepcopy(source)
    changed["matches"][0]["date"] = "2026-01-02"
    normalized = normalize_matches(changed, CLUBS)
    postponed = next(row for row in normalized if row["source_locator"] == "matches[0]")
    assert postponed["season"] == 2025
    assert postponed["official_round"] == 1


def test_idempotence_bronze_integrity_and_parquet(tmp_path):
    source = CollectiveSource(REVIEW, RAW)
    store = CollectiveFiles(tmp_path)
    first = import_collective(source, store, CLUBS, REVIEW)
    files = {path: path.read_bytes() for path in tmp_path.rglob("*") if path.is_file()}
    second = import_collective(source, store, CLUBS, REVIEW)
    assert first["changed"] is True and second["changed"] is False
    assert all(path.read_bytes() == payload for path, payload in files.items())
    assert next(tmp_path.glob("raw/**/*.json")).read_bytes() == RAW.read_bytes()
    facts = pd.read_parquet(next(tmp_path.glob("analytics/**/team_matches.parquet")))
    assert len(facts) == 760 and facts.points.sum() == 1041


def test_unreviewed_bytes_never_reach_storage(tmp_path):
    class Source:
        def read(self):
            return {"sha256": "0" * 64}

    with pytest.raises(ValueError, match="UNREVIEWED_SOURCE_HASH"):
        import_collective(Source(), CollectiveFiles(tmp_path), CLUBS, REVIEW)
    assert not list(tmp_path.iterdir())


def test_descriptive_population_and_unresolved_ties():
    assert descriptive([]) == {"n": 0}
    assert descriptive([0, 1, 2, 9])["q1"] == 0.75
    rows = [
        {"club_id": name, "points": 10, "wins": 3, "goal_difference": 2, "goals_for": 8}
        for name in ["b", "a"]
    ]
    assert [(row["position"], row["tied"]) for row in rank_clubs(rows)] == [
        (1, True),
        (1, True),
    ]


def test_official_comparison_contains_no_score_discrepancies():
    audit = json.loads(
        (ROOT / "docs/evidence/collective-cbf-audit.json").read_text(encoding="utf-8")
    )
    assert audit["fixtures_compared"] == 380
    assert audit["explicit_rounds_compared"] == 370
    assert audit["explicit_dates_compared"] == 379
    assert audit["differences"] == []
