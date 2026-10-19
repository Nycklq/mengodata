from flamengo_pipeline.domain.source_approval import USES, assess_source_use
from flamengo_pipeline.domain.source_quality import (
    assess_reference_matches,
    assess_snapshot_rows,
)


def audit_sources(read_references, read_snapshots, reviews):
    references = read_references()
    reference_quality = {
        **assess_reference_matches(references["matches"]),
        "sha256": references["sha256"],
        "source_id": "openfootball:football-json",
    }
    snapshots = read_snapshots()
    snapshot_quality = {
        **assess_snapshot_rows(snapshots["rows"]),
        "sha256": snapshots["sha256"],
        "source_id": "github:jhonatasjgr-brasileirao-2025",
    }
    results = []
    for source_id, artifact, quality in (
        ("openfootball:football-json", references, reference_quality),
        ("github:jhonatasjgr-brasileirao-2025", snapshots, snapshot_quality),
    ):
        review = reviews.get(source_id, {})
        results.append(
            {
                "source_id": source_id,
                "provenance": {
                    **artifact["provenance"],
                    "reviewed_revision": review.get("revision"),
                    "reviewed_source_url": review.get("source_url"),
                    "reviewed_at": review.get("reviewed_at"),
                    "artifact_matches_review": artifact["sha256"]
                    == review.get("reviewed_sha256"),
                },
                "quality": quality,
                "inventory": artifact["inventory"],
                "permissions": {
                    usage: assess_source_use(
                        review, quality, quality["data_kind"], usage
                    )
                    for usage in USES
                },
            }
        )
    return {
        "schema_version": 1,
        "sources": results,
        "production_ingestion_executed": False,
    }
