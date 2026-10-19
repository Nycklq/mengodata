import argparse
import json
from pathlib import Path

from flamengo_pipeline.adapters.source_audit_cli import run_source_audit
from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.infrastructure.source_audit_readers import (
    read_openfootball,
    read_snapshots,
    read_source_reviews,
)


def main():
    parser = argparse.ArgumentParser(prog="flamengo-source-audit")
    parser.add_argument("--openfootball", required=True)
    parser.add_argument("--cartola-directory", required=True)
    arguments = parser.parse_args()
    try:
        reviews = read_source_reviews(
            Path(__file__).resolve().parents[4] / "contracts/source-approval.json"
        )
        return run_source_audit(
            lambda: read_openfootball(arguments.openfootball),
            lambda: read_snapshots(arguments.cartola_directory),
            reviews,
            print,
        )
    except OSError, ValueError, KeyError, TypeError, ManifestInputError:
        print(json.dumps({"error": "source_audit_input_invalid"}))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
