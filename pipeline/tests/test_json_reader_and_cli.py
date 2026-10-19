import json
import subprocess
import sys

import pytest

from flamengo_pipeline.adapters.cli import run_validation
from flamengo_pipeline.application.errors import ManifestInputError


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("official_round", None),
        ("official_round", True),
        ("official_round", "1"),
        ("match_id", "synthetic-invalid-uuid"),
        ("source_id", ""),
        ("external_match_id", " "),
        ("evidence_url", "http://synthetic.invalid"),
        ("collected_at", "2025-01-01T12:00:00"),
        ("official_round", 39),
        ("collected_at", "not-a-date"),
    ],
)
def test_transport_rejects_malformed_fields(
    document, reader, write_manifest, field, value
):
    document["matches"][0][field] = value
    with pytest.raises(ManifestInputError, match="invalid_manifest_shape"):
        reader.read(write_manifest(document))


def test_missing_identity_is_not_inferred(document, reader, write_manifest):
    del document["matches"][0]["official_round"]
    with pytest.raises(ManifestInputError):
        reader.read(write_manifest(document))


def test_season_totals_are_not_accepted_as_a_match(document, reader, write_manifest):
    document["matches"][0]["goals"] = 99
    with pytest.raises(ManifestInputError):
        reader.read(write_manifest(document))


def test_duplicate_json_keys_are_rejected(tmp_path, reader):
    path = tmp_path / "synthetic-ambiguous.json"
    path.write_text('{"scope": {}, "scope": {}}', encoding="utf-8")
    with pytest.raises(ManifestInputError, match="duplicate_json_key"):
        reader.read(str(path))


def test_reader_reports_missing_file_without_exposing_contents(tmp_path, reader):
    with pytest.raises(ManifestInputError, match="manifest_unreadable"):
        reader.read(str(tmp_path / "missing.json"))


def test_cli_returns_json_and_never_collects(document, reader, write_manifest):
    lines = []
    assert run_validation(write_manifest(document), reader.read, lines.append) == 0
    assert json.loads(lines[0])["ingestion_ready"] is False
    assert json.loads(lines[0])["statistics_coverage"] == "unverified"
    assert json.loads(lines[0])["identified_matches"] == 38


def test_legacy_manifest_version_is_not_silently_reinterpreted(
    document, reader, write_manifest
):
    document["schema_version"] = 1
    with pytest.raises(ManifestInputError, match="invalid_manifest_shape"):
        reader.read(write_manifest(document))


def test_duplicate_records_reach_domain_diagnostics(document, reader, write_manifest):
    document["matches"].append(document["matches"][0])
    lines = []
    assert run_validation(write_manifest(document), reader.read, lines.append) == 1
    report = json.loads(lines[0])
    assert report["identified_matches"] == 39
    assert any(error["code"] == "duplicate_match_id" for error in report["errors"])


def test_cli_distinguishes_invalid_input_from_invalid_scope(
    document, reader, write_manifest
):
    lines = []
    document["matches"].pop()
    assert run_validation(write_manifest(document), reader.read, lines.append) == 1
    assert run_validation("synthetic-missing-file", reader.read, lines.append) == 2


def test_installed_entrypoint_can_validate_from_another_directory(
    document, write_manifest, tmp_path
):
    path = write_manifest(document)
    result = subprocess.run(
        [sys.executable, "-m", "flamengo_pipeline.main.cli", path],
        cwd=tmp_path,
        check=False,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, result.stderr
    assert json.loads(result.stdout)["complete"] is True


def test_cli_reports_invalid_custom_schema_without_traceback(tmp_path):
    schema = tmp_path / "synthetic-schema.json"
    schema.write_text('{"type": "synthetic-invalid-type"}', encoding="utf-8")
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "flamengo_pipeline.main.cli",
            "missing",
            "--schema",
            str(schema),
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 2
    assert json.loads(result.stdout)["error"] == "invalid_manifest_schema"
    assert result.stderr == ""
