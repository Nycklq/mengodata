import argparse
import json
from pathlib import Path

from flamengo_pipeline.application.import_collective import import_collective
from flamengo_pipeline.infrastructure.collective_files import (
    CollectiveFiles,
    CollectiveSource,
)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input")
    arguments = parser.parse_args()
    root = Path(__file__).resolve().parents[4]
    review = json.loads(
        (root / "contracts/collective-source.json").read_text(encoding="utf-8")
    )
    clubs = json.loads((root / "contracts/clubs.json").read_text(encoding="utf-8"))
    receipt = import_collective(
        CollectiveSource(review, arguments.input),
        CollectiveFiles(root / "data"),
        clubs,
        review,
    )
    print(json.dumps(receipt))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
