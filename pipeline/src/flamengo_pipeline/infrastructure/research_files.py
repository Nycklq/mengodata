from pathlib import Path

from flamengo_pipeline.domain.individual import assess_individual
from flamengo_pipeline.infrastructure.individual_files import read_individual
from flamengo_pipeline.infrastructure.source_audit_readers import (
    read_json,
    read_source_reviews,
)


def read_research(root):
    root = Path(root)
    evidence = read_json(root / "docs/evidence/source-audit-2025.json")
    state = {
        "availability": "unavailable",
        "reason": "individual_source_not_approved",
        "document": None,
        "evidence": evidence,
    }
    path = root / "data/analytics/individual.json"
    if not path.exists():
        return state
    artifact = read_individual(path, root / "contracts/individual.schema.json")
    approvals = read_json(root / "contracts/dataset-approvals.json")["datasets"]
    approval = next(
        (row for row in approvals if row.get("sha256") == artifact["sha256"]), {}
    )
    source = read_source_reviews(root / "contracts/source-approval.json").get(
        approval.get("source_id"), {}
    )
    assessment = assess_individual(
        artifact["document"], approval, source, artifact["sha256"]
    )
    if not assessment["authorized"]:
        return {**state, "reason": "artifact_not_approved_for_research"}
    return {
        **state,
        **assessment,
        "document": artifact["document"],
        "reason": None if assessment["coverage_verified"] else "partial_coverage",
    }
