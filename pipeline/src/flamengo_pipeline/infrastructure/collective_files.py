import hashlib
import io
import json
from datetime import UTC, datetime
from pathlib import Path
from urllib.request import Request, urlopen

import pandas as pd

from flamengo_pipeline.infrastructure.reference_files import encode_json, write_atomic


class CollectiveSource:
    def __init__(self, review, path=None):
        self.review = review
        self.path = Path(path) if path else None

    def read(self):
        if self.path:
            payload = self.path.read_bytes()
        else:
            request = Request(
                self.review["source_url"], headers={"User-Agent": "Flamengo-Analytics"}
            )
            with urlopen(request, timeout=30) as response:
                payload = response.read(2_000_001)
        if len(payload) > 2_000_000:
            raise ValueError("SOURCE_TOO_LARGE")
        return {
            "payload": payload,
            "document": json.loads(payload),
            "sha256": hashlib.sha256(payload).hexdigest(),
        }


class CollectiveFiles:
    def __init__(self, root):
        self.root = Path(root)

    def store(self, artifact, gold, quality, review):
        checksum = artifact["sha256"]
        partition = Path("season=2025/competition=brasileirao-serie-a-men")
        bronze = self.root / "raw/collective" / partition / f"{checksum}.json"
        publication = self.root / "analytics/collective.json"
        previous = (
            json.loads(publication.read_text(encoding="utf-8"))
            if publication.exists()
            else None
        )
        collected = (
            previous["source"]["collected_at"]
            if previous and previous["dataset_version"] == checksum
            else datetime.now(UTC).isoformat()
        )
        provenance = {
            "source_id": review["source_id"],
            "url": review["source_url"],
            "revision": review["revision"],
            "license": review["license"],
            "sha256": checksum,
            "collected_at": collected,
            "license_url": review["permissions"]["academic_analysis"]["evidence"],
        }
        document = {
            "schema_version": 1,
            "dataset_version": checksum,
            "scope": {
                "competition_id": "competition:brasileirao-serie-a-men",
                "season": 2025,
                "team_id": "club:flamengo",
                "first_round": 1,
                "last_round": 38,
            },
            "source": provenance,
            "coverage": quality,
            "availability": "available",
            "reason": None,
            **gold,
        }
        for row in document["matches"]:
            row.update(source_id=review["source_id"], collected_at=collected)
        changed = write_atomic(bronze, artifact["payload"], immutable=True)
        changed = (
            write_atomic(
                bronze.with_suffix(".metadata.json"),
                encode_json(provenance),
                immutable=True,
            )
            or changed
        )
        for stage, tables in (
            ("processed", {"matches": document["matches"]}),
            (
                "analytics",
                {
                    "team_matches": gold["team_matches"],
                    "club_totals": gold["club_totals"],
                    "standings": gold["standings"],
                    "clubs": gold["clubs"],
                },
            ),
        ):
            for name, rows in tables.items():
                frame = pd.DataFrame(rows)
                target = self.root / stage / "collective" / partition / name
                stream = io.BytesIO()
                frame.to_parquet(stream, index=False)
                changed = (
                    write_atomic(target.with_suffix(".parquet"), stream.getvalue())
                    or changed
                )
                changed = (
                    write_atomic(
                        target.with_suffix(".csv"),
                        frame.to_csv(index=False).encode("utf-8-sig"),
                    )
                    or changed
                )
        changed = write_atomic(publication, encode_json(document)) or changed
        receipt = {
            "changed": changed,
            "matches": len(gold["matches"]),
            "team_matches": len(gold["team_matches"]),
            "clubs": len(gold["clubs"]),
            "rounds": 38,
            "dataset_version": checksum,
        }
        return receipt
