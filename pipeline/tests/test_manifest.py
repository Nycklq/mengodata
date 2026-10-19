from dataclasses import replace

import pytest

from flamengo_pipeline.application.validate_manifest import validate_manifest
from flamengo_pipeline.domain.manifest import assess_manifest


def error_codes(report):
    return {error.code for error in report.errors}


@pytest.mark.parametrize("approval_status", ["pending", "rejected"])
def test_complete_unapproved_manifest_never_authorizes_ingestion(
    manifest, approval_status
):
    source = replace(manifest.sources[0], approval_status=approval_status)
    report = assess_manifest(replace(manifest, sources=(source,)))
    assert report.valid
    assert report.complete
    assert report.identified_matches == 38
    assert not report.identification_ready
    assert report.statistics_coverage == "unverified"
    assert not report.ingestion_ready
    assert report.missing_rounds == ()
    assert report.warnings[0].code == "source_not_approved"


def test_declared_approval_needs_evidence(manifest):
    source = replace(manifest.sources[0], approval_status="approved")
    report = assess_manifest(replace(manifest, sources=(source,)))
    assert "approval_evidence_required" in error_codes(report)
    assert not report.ingestion_ready


def test_declared_approval_cannot_prove_statistics_or_authorize_ingestion(manifest):
    source = replace(
        manifest.sources[0],
        approval_status="approved",
        approval_reference="https://synthetic.invalid/approval",
    )
    report = assess_manifest(replace(manifest, sources=(source,)))
    assert report.valid and report.complete and report.identification_ready
    assert report.statistics_coverage == "unverified"
    assert not report.ingestion_ready
    assert report.warnings[-1].code == "statistics_coverage_unverified"


@pytest.mark.parametrize("status", ["scheduled", "postponed", "suspended", "cancelled"])
def test_unfinished_match_remains_identified_but_blocks_ingestion(manifest, status):
    matches = (replace(manifest.matches[0], status=status, played_at=None),)
    report = assess_manifest(replace(manifest, matches=matches + manifest.matches[1:]))
    assert report.valid and report.complete
    assert not report.ingestion_ready
    assert any(finding.code == "match_not_finished" for finding in report.warnings)


def test_missing_round_is_reported_without_inventing_a_match(manifest):
    report = assess_manifest(replace(manifest, matches=manifest.matches[1:]))
    assert report.missing_rounds == (1,)
    assert report.identified_matches == 37
    assert not report.valid and not report.complete


@pytest.mark.parametrize(
    ("changes", "code"),
    [
        ({"match_id": "copy"}, "duplicate_match_id"),
        ({"official_match_number": 1}, "duplicate_official_match_number"),
        ({"external_match_id": "synthetic-match-1"}, "duplicate_source_match"),
        ({"official_round": 1}, "duplicate_round"),
        ({"source_id": "synthetic:unknown"}, "unknown_source"),
        ({"played_at": None}, "finished_match_requires_played_at"),
    ],
)
def test_conflicting_records_are_rejected(manifest, changes, code):
    if changes.get("match_id") == "copy":
        changes = {"match_id": manifest.matches[0].match_id}
    matches = list(manifest.matches)
    matches[1] = replace(matches[1], **changes)
    report = assess_manifest(replace(manifest, matches=tuple(matches)))
    assert code in error_codes(report)
    assert not report.ingestion_ready


def test_duplicate_source_is_not_silently_overwritten(manifest):
    report = assess_manifest(replace(manifest, sources=manifest.sources * 2))
    assert "duplicate_source_id" in error_codes(report)


def test_collection_must_not_precede_played_match(manifest):
    match = manifest.matches[0]
    changed = replace(match, played_at=match.collected_at.replace(year=2028))
    report = assess_manifest(
        replace(manifest, matches=(changed,) + manifest.matches[1:])
    )
    assert "collection_precedes_played_at" in error_codes(report)


def test_scope_cannot_be_widened_or_omitted(manifest):
    for scope in (
        replace(manifest.scope, last_round=39),
        replace(manifest.scope, first_round=True),
        replace(manifest.scope, team_id="synthetic:other-club"),
    ):
        report = assess_manifest(replace(manifest, scope=scope))
        assert "scope_mismatch" in error_codes(report)


def test_outside_season_round_is_not_counted_as_coverage(manifest):
    changed = replace(manifest.matches[0], official_round=39)
    report = assess_manifest(
        replace(manifest, matches=(changed,) + manifest.matches[1:])
    )
    assert report.missing_rounds == (1,)
    assert "round_outside_scope" in error_codes(report)


def test_use_case_reads_once_and_has_no_output_side_effect(manifest):
    resources = []

    def read(resource):
        resources.append(resource)
        return manifest

    first = validate_manifest("synthetic-resource", read)
    second = validate_manifest("synthetic-resource", read)
    assert first == second
    assert resources == ["synthetic-resource", "synthetic-resource"]


@pytest.mark.parametrize("round_number", [1, 19, 20, 38])
def test_each_missing_boundary_round_is_reported(manifest, round_number):
    matches = tuple(
        match for match in manifest.matches if match.official_round != round_number
    )
    report = assess_manifest(replace(manifest, matches=matches))
    assert report.missing_rounds == (round_number,)
    assert report.identified_matches == 37
    assert not report.complete and not report.ingestion_ready


def test_identification_counts_are_order_independent_and_never_hide_duplicates(
    manifest,
):
    first = assess_manifest(manifest)
    reversed_report = assess_manifest(
        replace(manifest, matches=tuple(reversed(manifest.matches)))
    )
    assert first == reversed_report
    duplicated = assess_manifest(
        replace(manifest, matches=manifest.matches + (manifest.matches[0],))
    )
    assert duplicated.identified_matches == 39
    assert duplicated.missing_rounds == ()
    assert not duplicated.complete
    assert "duplicate_match_id" in error_codes(duplicated)


@pytest.mark.parametrize("season", [2024, 2026])
def test_wrong_season_never_contributes_to_identification(manifest, season):
    matches = (replace(manifest.matches[0], season=season),) + manifest.matches[1:]
    report = assess_manifest(replace(manifest, matches=matches))
    assert report.missing_rounds == (1,)
    assert "season_outside_scope" in error_codes(report)


def test_other_club_never_contributes_to_identification(manifest):
    changed = replace(manifest.matches[0], home_team_id="synthetic:other-club")
    report = assess_manifest(
        replace(manifest, matches=(changed,) + manifest.matches[1:])
    )
    assert report.missing_rounds == (1,)
    assert "club_outside_scope" in error_codes(report)


def test_legacy_contract_is_rejected_by_domain(manifest):
    report = assess_manifest(replace(manifest, schema_version=1))
    assert "unsupported_schema_version" in error_codes(report)
