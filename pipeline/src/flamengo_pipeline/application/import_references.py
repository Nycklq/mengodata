from dataclasses import asdict

from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.domain.models import ANALYTICS_SCOPE
from flamengo_pipeline.domain.source_approval import assess_source_use
from flamengo_pipeline.domain.source_quality import assess_reference_matches


def import_references(read_reference, store_reference, review):
    artifact = read_reference()
    quality = {
        **assess_reference_matches(artifact["matches"]),
        "source_id": review["source_id"],
        "sha256": artifact["sha256"],
    }
    decisions = [
        assess_source_use(review, quality, "match_reference", usage)
        for usage in ("acquisition", "postgres_storage", "academic_analysis")
    ]
    if not all(decision["authorized"] for decision in decisions):
        raise ManifestInputError("reference_ingestion_not_authorized")
    return store_reference(
        {
            "schema_version": 1,
            "scope": asdict(ANALYTICS_SCOPE),
            "source_id": review["source_id"],
            "source_url": review["source_url"],
            "source_revision": review["revision"],
            "license": review["license"],
            "artifact_sha256": artifact["sha256"],
            "reference_kind": "auxiliary",
            "official_mapping_verified": False,
            "statistics_coverage": "unverified",
            "matches": artifact["matches"],
        }
    )
