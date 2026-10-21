import json
from pathlib import Path

from flamengo_pipeline.infrastructure.collective_research import generate_research


def main():
    root = Path(__file__).resolve().parents[4]
    document = json.loads(
        (root / "data/analytics/collective.json").read_text(encoding="utf-8")
    )
    report = generate_research(document, root / "reports/collective")
    print(
        json.dumps(
            {
                "figures": len(report["figures"]),
                "destination": "reports/collective",
                "matches": report["coverage"]["matches"],
            }
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
