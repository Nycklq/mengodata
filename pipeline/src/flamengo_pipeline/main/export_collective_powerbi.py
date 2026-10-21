import json
from pathlib import Path

from flamengo_pipeline.infrastructure.collective_powerbi import (
    export_collective_powerbi,
)


def main():
    root = Path(__file__).resolve().parents[4]
    document = json.loads(
        (root / "data/analytics/collective.json").read_text(encoding="utf-8")
    )
    print(json.dumps(export_collective_powerbi(document, root / "data/powerbi")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
