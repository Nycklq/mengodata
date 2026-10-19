import json
from pathlib import Path

from flamengo_pipeline.application.export_powerbi import build_powerbi
from flamengo_pipeline.domain.individual import assess_individual
from flamengo_pipeline.infrastructure.individual_files import read_individual
from flamengo_pipeline.infrastructure.reference_files import encode_json, write_atomic
from flamengo_pipeline.infrastructure.source_audit_readers import (
    read_json,
    read_source_reviews,
)


def main():
    root = Path(__file__).resolve().parents[4]
    path = root / "data/analytics/individual.json"
    artifact = {"document": {}, "sha256": None}
    assessment = {"authorized": False}
    approval = {}
    if path.exists():
        artifact = read_individual(path, root / "contracts/individual.schema.json")
        registry = read_json(root / "contracts/dataset-approvals.json")
        approval = next(
            (
                row
                for row in registry["datasets"]
                if row.get("sha256") == artifact["sha256"]
            ),
            {},
        )
        source = read_source_reviews(root / "contracts/source-approval.json").get(
            approval.get("source_id"), {}
        )
        assessment = assess_individual(
            artifact["document"], approval, source, artifact["sha256"]
        )
    document = build_powerbi(artifact, assessment, approval)
    changed = write_atomic(root / "data/analytics/powerbi.json", encode_json(document))
    print(
        json.dumps(
            {
                "changed": changed,
                "availability": document["availability"],
                "distribution_allowed": document["distribution_allowed"],
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
