import argparse
import json
from pathlib import Path

from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.application.import_individual import import_individual
from flamengo_pipeline.infrastructure.individual_files import (
    read_individual,
    store_individual,
)
from flamengo_pipeline.infrastructure.source_audit_readers import (
    fingerprint,
    read_json,
    read_source_reviews,
)


def main():
    root = Path(__file__).resolve().parents[4]
    parser = argparse.ArgumentParser()
    parser.add_argument("input")
    arguments = parser.parse_args()
    try:
        checksum = fingerprint(arguments.input)
        registry = read_json(root / "contracts/dataset-approvals.json")
        approval = next(
            (row for row in registry["datasets"] if row.get("sha256") == checksum), {}
        )
        source = read_source_reviews(root / "contracts/source-approval.json").get(
            approval.get("source_id"), {}
        )
        result = import_individual(
            lambda: read_individual(
                arguments.input, root / "contracts/individual.schema.json"
            ),
            lambda artifact: store_individual(artifact, root / "data"),
            approval,
            source,
        )
    except OSError, ValueError, KeyError, TypeError, ManifestInputError:
        print(json.dumps({"error": "individual_import_blocked_or_failed"}))
        return 2
    print(json.dumps(result))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
