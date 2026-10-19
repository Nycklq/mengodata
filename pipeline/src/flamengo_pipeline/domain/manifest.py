from flamengo_pipeline.domain.eligibility import eligibility_issues
from flamengo_pipeline.domain.models import (
    ANALYTICS_SCOPE,
    Finding,
    Manifest,
    ManifestReport,
)


def assess_manifest(manifest: Manifest) -> ManifestReport:
    errors = []
    warnings = []
    if type(manifest.schema_version) is not int or manifest.schema_version != 2:
        errors.append(Finding("unsupported_schema_version", "schema_version"))
    if manifest.scope != ANALYTICS_SCOPE or any(
        type(value) is not int
        for value in (
            manifest.scope.season,
            manifest.scope.first_round,
            manifest.scope.last_round,
        )
    ):
        errors.append(Finding("scope_mismatch", "scope"))

    sources = {}
    for index, source in enumerate(manifest.sources):
        path = f"sources/{index}"
        if source.source_id in sources:
            errors.append(Finding("duplicate_source_id", path))
        sources[source.source_id] = source
        if source.approval_status != "approved":
            warnings.append(Finding("source_not_approved", path))
        elif not source.approval_reference:
            errors.append(Finding("approval_evidence_required", path))

    seen = {"match_id": set(), "official_match_number": set(), "source_match": set()}
    seen_rounds = set()
    eligible_rounds = set()
    for index, match in enumerate(manifest.matches):
        path = f"matches/{index}"
        issues = eligibility_issues(match)
        errors.extend(Finding(code, path) for code in issues)
        if not issues:
            eligible_rounds.add(match.official_round)
        keys = {
            "match_id": match.match_id,
            "official_match_number": (
                match.competition_id,
                match.season,
                match.official_match_number,
            ),
            "source_match": (match.source_id, match.external_match_id),
        }
        for name, key in keys.items():
            if key in seen[name]:
                errors.append(Finding(f"duplicate_{name}", path))
            seen[name].add(key)
        if match.official_round in seen_rounds:
            errors.append(Finding("duplicate_round", path))
        seen_rounds.add(match.official_round)
        if match.source_id not in sources:
            errors.append(Finding("unknown_source", path))
        if match.status != "finished":
            warnings.append(Finding("match_not_finished", path))
        elif match.played_at is None:
            errors.append(Finding("finished_match_requires_played_at", path))
        if match.played_at and match.played_at > match.collected_at:
            errors.append(Finding("collection_precedes_played_at", path))

    expected_rounds = set(
        range(ANALYTICS_SCOPE.first_round, ANALYTICS_SCOPE.last_round + 1)
    )
    missing = tuple(sorted(expected_rounds - eligible_rounds))
    if missing:
        errors.append(Finding("incomplete_manifest", "matches"))
    complete = not missing and not errors
    identification_ready = complete and not warnings
    statistics_coverage = "unverified"
    warnings.append(Finding("statistics_coverage_unverified", "matches"))
    return ManifestReport(
        valid=not errors,
        complete=complete,
        identification_ready=identification_ready,
        statistics_coverage=statistics_coverage,
        ingestion_ready=identification_ready and statistics_coverage == "verified",
        identified_matches=len(manifest.matches),
        missing_rounds=missing,
        errors=tuple(errors),
        warnings=tuple(warnings),
    )
