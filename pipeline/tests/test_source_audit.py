import copy
import json
import subprocess
import sys
from pathlib import Path

import pandas as pd
import pytest

from flamengo_pipeline.adapters.source_audit_cli import run_source_audit
from flamengo_pipeline.application.audit_sources import audit_sources
from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.domain.source_approval import USES, assess_source_use
from flamengo_pipeline.domain.source_quality import (
    SNAPSHOT_METRICS,
    assess_reference_matches,
    assess_snapshot_rows,
)
from flamengo_pipeline.infrastructure.source_audit_readers import (
    read_openfootball,
    read_snapshots,
    read_source_reviews,
)

ROOT = Path(__file__).resolve().parents[2]


def synthetic_references():
    return [
        {
            "source_record_id": f"/matches/{number}",
            "source_round": number,
            "home_team": "CR Flamengo" if number <= 19 else f"synthetic:{number - 19}",
            "away_team": f"synthetic:{number}" if number <= 19 else "CR Flamengo",
            "home_team_id": "club:flamengo"
            if number <= 19
            else f"synthetic:{number - 19}",
            "away_team_id": f"synthetic:{number}" if number <= 19 else "club:flamengo",
            "played_on": "2025-12-31",
            "score": [0, 0],
        }
        for number in range(1, 39)
    ]


def synthetic_snapshot(number=1, club=262, appeared=False, position=5, value=None):
    return {
        "player_id": 1,
        "snapshot_round": number,
        "declared_round": number,
        "team_id": "club:flamengo" if club == 262 else f"synthetic:club:{club}",
        "participant_kind": "coach" if position == 6 else "player",
        "appeared": appeared,
        "values": dict.fromkeys(SNAPSHOT_METRICS, value),
    }


def synthetic_review():
    return {
        "source_id": "synthetic:source",
        "technical_status": "approved",
        "approved_data_kinds": ["match_reference"],
        "reviewed_sha256": "synthetic-fingerprint",
        "permissions": {
            usage: {
                "status": "allowed",
                "evidence": "https://synthetic.invalid/license",
            }
            for usage in USES
        },
    }


def synthetic_quality():
    return {
        **assess_reference_matches(synthetic_references()),
        "sha256": "synthetic-fingerprint",
        "source_id": "synthetic:source",
    }


def test_complete_reference_catalog_never_claims_official_or_individual_coverage():
    rows = synthetic_references()
    rows[11]["played_on"] = "2026-01-01"
    result = assess_reference_matches(tuple(reversed(rows)))
    assert result["technical_approved"] is True
    assert result["reference_count"] == 38
    assert result["official_mapping_verified"] is False
    assert result["player_statistics_coverage"] == "unverified"
    assert result["statistics_ingestion_ready"] is False


@pytest.mark.parametrize(
    ("change", "error"),
    [
        ({"source_round": 39}, "round_outside_scope:0"),
        ({"source_round": True}, "round_outside_scope:0"),
        ({"home_team_id": "synthetic:other-club"}, "club_outside_scope:0"),
        ({"away_team": "CR Flamengo"}, "identical_teams:0"),
        ({"score": [True, 0]}, "invalid_or_missing_score:0"),
        ({"score": [-1, 0]}, "invalid_or_missing_score:0"),
        ({"score": None}, "invalid_or_missing_score:0"),
    ],
)
def test_reference_quality_rejects_invalid_scope_and_scores(change, error):
    rows = synthetic_references()
    rows[0].update(change)
    report = assess_reference_matches(rows)
    assert report["technical_approved"] is False
    assert error in report["errors"]


def test_reference_duplicates_and_missing_rounds_block_technical_approval():
    rows = synthetic_references()
    rows[-1] = dict(rows[0])
    result = assess_reference_matches(rows)
    assert result["technical_approved"] is False
    assert result["missing_rounds"] == [38]
    assert {"duplicate_round", "duplicate_locator", "duplicate_pair"}.issubset(
        result["errors"]
    )


def test_snapshot_flags_never_become_verified_appearances_and_nulls_remain_missing():
    rows = [synthetic_snapshot(number) for number in range(1, 39)]
    rows[1]["appeared"] = True
    rows[1]["values"]["goals"] = 0
    rows.append(synthetic_snapshot(2, club=999, appeared=True))
    rows.append(synthetic_snapshot(3, position=6, appeared=True))
    result = assess_snapshot_rows(rows)
    assert result["technical_approved"] is False
    assert result["flamengo_appearance_flags"] == 1
    assert result["flamengo_nulls"]["goals"] == 37
    assert result["flamengo_coach_rows"] == 1
    assert result["flamengo_multi_club_player_ids"] == [1]
    assert result["duplicate_player_snapshot_keys"] == 2
    assert result["verified_player_appearances"] is None
    assert result["statistics_ingestion_ready"] is False


def test_snapshot_differences_diagnose_accumulation_without_creating_match_events():
    rows = [
        synthetic_snapshot(number, value=value)
        for number, value in [(1, None), (2, 1), (3, 1), (4, 2), (5, 1)]
    ]
    result = assess_snapshot_rows(rows)
    assert result["consecutive_snapshot_differences"]["goals"] == {
        "positive": 1,
        "equal": 1,
        "negative": 1,
    }
    assert "accumulated_scout_semantics_unverified" in result["blockers"]


@pytest.mark.parametrize("usage", USES)
def test_reviewed_reference_permission_is_limited_to_its_data_kind(usage):
    review, quality = synthetic_review(), synthetic_quality()
    assert assess_source_use(review, quality, "match_reference", usage)["authorized"]
    assert not assess_source_use(review, quality, "player_match", usage)["authorized"]
    assert not assess_source_use(review, quality, "official_manifest", usage)[
        "authorized"
    ]


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("reviewed_sha256", "changed"),
        ("technical_status", "pending"),
        ("source_id", "synthetic:other"),
        ("approved_data_kinds", []),
    ],
)
def test_approval_fails_closed_on_unreviewed_or_mismatched_evidence(field, value):
    review = synthetic_review()
    review[field] = value
    assert not assess_source_use(
        review, synthetic_quality(), "match_reference", "postgres_storage"
    )["authorized"]


def test_storage_permission_never_implies_api_or_export_permission():
    review = synthetic_review()
    review["permissions"] = {
        "postgres_storage": review["permissions"]["postgres_storage"]
    }
    quality = synthetic_quality()
    assert assess_source_use(review, quality, "match_reference", "postgres_storage")[
        "authorized"
    ]
    for usage in ("rest_api", "csv_export", "github_publication", "unknown"):
        assert not assess_source_use(review, quality, "match_reference", usage)[
            "authorized"
        ]
    review["permissions"]["postgres_storage"]["evidence"] = "http://synthetic.invalid"
    assert not assess_source_use(
        review, quality, "match_reference", "postgres_storage"
    )["authorized"]


def test_registry_never_approves_any_source_for_player_match_data():
    registry = json.loads((ROOT / "contracts/source-approval.json").read_text())
    assert registry["scope"]["season"] == 2025
    assert registry["scope"]["last_round"] == 38
    for review in registry["sources"]:
        assert "player_match" not in review["approved_data_kinds"]


@pytest.mark.parametrize("change", ["scope", "duplicate_source", "invalid_hash"])
def test_registry_reader_rejects_unreliable_review_identity_and_scope(tmp_path, change):
    registry = json.loads((ROOT / "contracts/source-approval.json").read_text())
    if change == "scope":
        registry["scope"]["season"] = 2026
    elif change == "duplicate_source":
        registry["sources"].append(copy.deepcopy(registry["sources"][0]))
    else:
        registry["sources"][0]["reviewed_sha256"] = "not-a-fingerprint"
    path = tmp_path / "synthetic-reviews.json"
    path.write_text(json.dumps(registry), encoding="utf-8")
    with pytest.raises(ManifestInputError):
        read_source_reviews(path)


def test_reader_handles_both_observed_score_formats_and_keeps_unknown_ids_null(
    tmp_path,
):
    path = tmp_path / "synthetic-reference.json"
    document = {
        "name": "Brasileiro Série A 2025",
        "matches": [
            {
                "round": f"Matchday {n}",
                "date": "2025-12-31",
                "team1": "CR Flamengo",
                "team2": f"synthetic:{n}",
                "score": {"ft": [1, 0]} if n == 1 else [0, 0],
            }
            for n in (1, 2)
        ],
    }
    path.write_text(json.dumps(document), encoding="utf-8")
    result = read_openfootball(path)
    assert [row["score"] for row in result["matches"]] == [[1, 0], [0, 0]]
    assert all(row["official_match_number"] is None for row in result["matches"])
    assert all(row["time_zone"] is None for row in result["matches"])
    document["name"] = "Brasileiro Série A 2026"
    path.write_text(json.dumps(document), encoding="utf-8")
    with pytest.raises(ManifestInputError, match="unexpected_competition_or_season"):
        read_openfootball(path)


def test_snapshot_reader_audits_every_local_file_without_network(tmp_path):
    columns = {"atletas.atleta_id": 1, "atletas.rodada_id": 1}
    for number in range(1, 39):
        raw = pd.DataFrame([{**columns, "atletas.rodada_id": number}])
        for directory, suffix in (
            ("cartola", ""),
            ("cartola_processado", "_processado"),
        ):
            path = tmp_path / directory / f"rodada-{number}{suffix}.csv"
            path.parent.mkdir(exist_ok=True)
            raw.to_csv(path, index=False)
    consolidated = pd.DataFrame(
        [
            {
                "id_jogador": 1,
                "rodada": 1,
                "atletas.rodada_id": 1,
                "atletas.clube_id": 262,
                "posicao_id": 5,
                "entrou_em_campo": False,
            }
        ]
    )
    path = tmp_path / "cartola_api_completo.csv"
    consolidated.to_csv(path, index=False)
    pd.DataFrame(
        [{"Rodada": number, "Total Jogadores": 1} for number in range(1, 39)]
    ).to_csv(tmp_path / "cartola_processado/resumo_rodadas.csv", index=False)
    result = read_snapshots(tmp_path)
    assert len(result["inventory"]["snapshots"]) == 38
    assert result["rows"][0]["values"]["goals"] is None
    consolidated["rodada"] = 1.5
    consolidated.to_csv(path, index=False)
    with pytest.raises(ManifestInputError, match="invalid_snapshot_integer"):
        read_snapshots(tmp_path)


def test_audit_use_case_keeps_both_sources_and_serializes_without_side_effects():
    reference = {
        "matches": synthetic_references(),
        "sha256": "synthetic-fingerprint",
        "provenance": {},
        "inventory": {},
    }
    snapshot = {
        "rows": [synthetic_snapshot()],
        "sha256": "synthetic-other",
        "provenance": {},
        "inventory": {},
    }
    original = copy.deepcopy((reference, snapshot))
    result = audit_sources(lambda: reference, lambda: snapshot, {})
    assert result["production_ingestion_executed"] is False
    assert len(result["sources"]) == 2
    assert (reference, snapshot) == original
    assert not any(
        result["sources"][0]["permissions"][usage]["authorized"] for usage in USES
    )
    output = []
    assert run_source_audit(lambda: reference, lambda: snapshot, {}, output.append) == 0
    assert json.loads(output[0]) == result


def test_source_audit_cli_handles_missing_files_without_traceback(tmp_path):
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "flamengo_pipeline.main.audit_sources",
            "--openfootball",
            str(tmp_path / "missing.json"),
            "--cartola-directory",
            str(tmp_path),
        ],
        capture_output=True,
        text=True,
        check=False,
        cwd=tmp_path,
    )
    assert result.returncode == 2
    assert json.loads(result.stdout) == {"error": "source_audit_input_invalid"}
    assert result.stderr == ""
