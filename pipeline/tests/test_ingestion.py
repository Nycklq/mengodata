import copy
import hashlib
import json
from dataclasses import asdict
from pathlib import Path
from uuid import uuid4

import pytest

from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.application.export_powerbi import build_powerbi
from flamengo_pipeline.application.import_individual import import_individual
from flamengo_pipeline.application.import_references import import_references
from flamengo_pipeline.domain.individual import assess_individual
from flamengo_pipeline.domain.models import ANALYTICS_SCOPE
from flamengo_pipeline.domain.statistics import COUNT_METRICS
from flamengo_pipeline.infrastructure.individual_files import (
    read_individual,
    store_individual,
)
from flamengo_pipeline.infrastructure.reference_files import ReferenceFiles
from flamengo_pipeline.infrastructure.source_audit_readers import read_openfootball

ROOT = Path(__file__).resolve().parents[2]


def permission():
    return {"status": "allowed", "evidence": "https://example.invalid/synthetic-only"}


@pytest.fixture
def reference(tmp_path):
    document = {
        "name": "Brasileiro Série A 2025",
        "matches": [
            {
                "round": f"Matchday {round}",
                "date": "2025-11-15" if round == 12 else "2025-01-01",
                "team1": "CR Flamengo"
                if round <= 19
                else f"Synthetic opponent {(round - 1) % 19 + 1}",
                "team2": f"Synthetic opponent {(round - 1) % 19 + 1}"
                if round <= 19
                else "CR Flamengo",
                "score": {"ft": [0, 0]} if round % 2 else [0, 0],
            }
            for round in range(1, 39)
        ],
    }
    path = tmp_path / "synthetic-reference.json"
    path.write_text(json.dumps(document), encoding="utf-8")
    review = {
        "source_id": "synthetic:source",
        "technical_status": "approved",
        "approved_data_kinds": ["match_reference"],
        "reviewed_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "source_url": "https://example.invalid/synthetic-only",
        "revision": "synthetic",
        "license": "synthetic-only",
        "permissions": {
            usage: permission()
            for usage in ("acquisition", "postgres_storage", "academic_analysis")
        },
    }
    return path, review


def test_reference_import_is_byte_preserving_and_idempotent(reference, tmp_path):
    path, review = reference
    files = ReferenceFiles(path, tmp_path / "data")
    first = import_references(lambda: read_openfootball(path), files.store, review)
    assert first["changed"] is True
    assert first["references"] == 38
    second = import_references(lambda: read_openfootball(path), files.store, review)
    assert second["changed"] is False
    assert second["statistics_ingestion_ready"] is False
    bronze = tmp_path / "data/raw/openfootball" / f"{review['reviewed_sha256']}.json"
    assert bronze.read_bytes() == path.read_bytes()
    gold = json.loads((tmp_path / "data/analytics/references.json").read_text())
    postponed = next(row for row in gold["matches"] if row["source_round"] == 12)
    assert postponed["played_on"] == "2025-11-15"
    assert postponed["official_match_number"] is None


def test_unreviewed_reference_never_calls_storage(reference):
    path, review = reference
    review["reviewed_sha256"] = "0" * 64
    writes = []
    with pytest.raises(ManifestInputError):
        import_references(lambda: read_openfootball(path), writes.append, review)
    assert writes == []


def synthetic_individual():
    player_id, match_id = str(uuid4()), str(uuid4())
    document = {
        "schema_version": 1,
        "scope": asdict(ANALYTICS_SCOPE),
        "source_id": "synthetic:source",
        "dataset_version": "synthetic-only",
        "collected_at": "2026-01-01T00:00:00Z",
        "players": [
            {
                "player_id": player_id,
                "external_player_id": "synthetic:p",
                "display_name": "Synthetic only",
                "position": "forward",
            }
        ],
        "matches": [
            {
                "match_id": match_id,
                "official_round": 38,
                "official_match_number": 380,
                "home_team_id": "club:flamengo",
                "away_team_id": "synthetic:other",
                "played_at": "2025-12-01T12:00:00Z",
                "external_match_id": "synthetic:m",
                "evidence_url": "https://example.invalid/synthetic-only",
            }
        ],
        "appearances": [
            {
                **dict.fromkeys(COUNT_METRICS),
                "player_id": player_id,
                "match_id": match_id,
                "competition_id": ANALYTICS_SCOPE.competition_id,
                "season": 2025,
                "team_id": ANALYTICS_SCOPE.team_id,
                "official_round": 38,
                "starter": None,
                "goals": 0,
            }
        ],
    }
    payload = json.dumps(document).encode()
    checksum = hashlib.sha256(payload).hexdigest()
    approval = {
        "status": "approved",
        "sha256": checksum,
        "data_kind": "player_match",
        "source_id": document["source_id"],
        "evidence": "https://example.invalid/review",
        "permissions": {
            usage: permission()
            for usage in ("acquisition", "postgres_storage", "academic_analysis")
        },
    }
    source = {
        "technical_status": "approved",
        "reviewed_sha256": checksum,
        "approved_data_kinds": ["player_match"],
    }
    return (
        {"document": document, "payload": payload, "sha256": checksum},
        approval,
        source,
    )


def test_generic_ingestion_validates_then_preserves_nulls_and_is_idempotent(tmp_path):
    artifact, approval, source = synthetic_individual()
    path = tmp_path / "synthetic-individual.json"
    path.write_bytes(artifact["payload"])

    def read():
        return read_individual(path, ROOT / "contracts/individual.schema.json")

    def store(bundle):
        return store_individual(bundle, tmp_path / "data")

    first = import_individual(read, store, approval, source)
    assert first["availability"] == "partial"
    assert first["changed"] is True
    assert import_individual(read, store, approval, source)["changed"] is False
    gold = json.loads((tmp_path / "data/analytics/individual.json").read_text())
    assert gold["appearances"][0]["minutes"] is None
    assert gold["appearances"][0]["goals"] == 0


@pytest.mark.parametrize(
    "change", ["rights", "fingerprint", "source", "duplicate", "club"]
)
def test_blocked_generic_ingestion_does_not_write(change):
    artifact, approval, source = synthetic_individual()
    if change == "rights":
        approval["permissions"]["acquisition"]["status"] = "pending"
    if change == "fingerprint":
        approval["sha256"] = "0" * 64
    if change == "source":
        source["approved_data_kinds"] = ["match_reference"]
    if change == "duplicate":
        artifact["document"]["appearances"] *= 2
    if change == "club":
        artifact["document"]["matches"][0]["home_team_id"] = "synthetic:another"
    writes = []
    with pytest.raises(ManifestInputError):
        import_individual(lambda: artifact, writes.append, approval, source)
    assert writes == []


def test_schema_rejects_foreign_scope_and_invented_zero_replacements(tmp_path):
    artifact, _, _ = synthetic_individual()
    for change in (
        {"season": 2026},
        {"official_round": 39},
        {"minutes": -1},
        {"goals": 1.5},
        {"minutes": float("nan")},
        {"xg": float("inf")},
    ):
        document = copy.deepcopy(artifact["document"])
        document["appearances"][0].update(change)
        path = tmp_path / "synthetic-invalid.json"
        path.write_text(json.dumps(document))
        with pytest.raises(ManifestInputError):
            read_individual(path, ROOT / "contracts/individual.schema.json")
    for token in ("NaN", "Infinity", "1e999"):
        payload = json.dumps(artifact["document"]).replace(
            '"minutes": null', f'"minutes": {token}'
        )
        path.write_text(payload)
        with pytest.raises(ManifestInputError):
            read_individual(path, ROOT / "contracts/individual.schema.json")


def test_powerbi_requires_its_own_permission():
    artifact, approval, source = synthetic_individual()
    assessment = assess_individual(
        artifact["document"], approval, source, artifact["sha256"]
    )
    blocked = build_powerbi(artifact, assessment, approval)
    assert blocked["distribution_allowed"] is False
    assert blocked["appearances"] == []
    approval["permissions"]["power_bi_distribution"] = permission()
    allowed = build_powerbi(artifact, assessment, approval)
    assert allowed["distribution_allowed"] is True
    assert allowed["coverage_verified"] is False
    assert allowed["appearances"][0]["minutes"] is None
