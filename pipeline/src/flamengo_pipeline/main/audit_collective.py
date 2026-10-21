import json
from pathlib import Path

from flamengo_pipeline.infrastructure.official_collective_audit import audit_official


def main():
    root = Path(__file__).resolve().parents[4]
    document = json.loads(
        (root / "data/analytics/collective.json").read_text(encoding="utf-8")
    )
    result = audit_official(
        document,
        root / "docs/evidence/collective-cbf-audit.json",
        root / ".tmp/cbf-2025.pdf",
    )
    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
