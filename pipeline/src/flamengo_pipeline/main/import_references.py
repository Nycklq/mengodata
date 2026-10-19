import argparse
import json
from pathlib import Path

from flamengo_pipeline.adapters.reference_cli import run_reference_import
from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.infrastructure.reference_files import (
    ReferenceFiles,
    fetch_reviewed_reference,
)
from flamengo_pipeline.infrastructure.source_audit_readers import (
    read_openfootball,
    read_source_reviews,
)


def main():
    root = Path(__file__).resolve().parents[4]
    parser = argparse.ArgumentParser(prog="flamengo-import-references")
    parser.add_argument("--input")
    parser.add_argument("--output", default=str(root / "data"))
    arguments = parser.parse_args()
    try:
        review = read_source_reviews(root / "contracts/source-approval.json")[
            "openfootball:football-json"
        ]
        source = (
            Path(arguments.input)
            if arguments.input
            else fetch_reviewed_reference(
                review,
                root / ".tmp/reference-downloads" / f"{review['reviewed_sha256']}.json",
            )
        )
        files = ReferenceFiles(source, arguments.output)
        return run_reference_import(
            lambda: read_openfootball(source), files.store, review, print
        )
    except OSError, ValueError, TypeError, KeyError, ManifestInputError:
        print(json.dumps({"error": "reference_import_failed"}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
