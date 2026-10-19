import hashlib
import json
import os
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from urllib.request import Request, urlopen

from flamengo_pipeline.application.errors import ManifestInputError


def write_atomic(path, payload, immutable=False):
    target = Path(path)
    if target.exists():
        if target.read_bytes() == payload:
            return False
        if immutable:
            raise ManifestInputError("immutable_artifact_conflict")
    target.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=".ingest-", dir=target.parent)
    temporary = Path(temporary)
    try:
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(payload)
            stream.flush()
            os.fsync(stream.fileno())
        temporary.replace(target)
    finally:
        temporary.unlink(missing_ok=True)
    return True


def encode_json(document):
    return (
        json.dumps(document, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    ).encode("utf-8")


def fetch_reviewed_reference(review, destination):
    if (
        review.get("technical_status") != "approved"
        or "match_reference" not in review.get("approved_data_kinds", [])
        or review.get("permissions", {}).get("acquisition", {}).get("status")
        != "allowed"
        or not review.get("source_url", "").startswith("https://")
    ):
        raise ManifestInputError("reference_download_not_authorized")
    request = Request(
        review["source_url"], headers={"User-Agent": "Flamengo-Analytics"}
    )
    with urlopen(request, timeout=30) as response:
        payload = response.read(2_000_001)
    if (
        len(payload) > 2_000_000
        or hashlib.sha256(payload).hexdigest() != review["reviewed_sha256"]
    ):
        raise ManifestInputError("unreviewed_reference_download")
    write_atomic(destination, payload, immutable=True)
    return Path(destination)


class ReferenceFiles:
    def __init__(self, source, destination):
        self.source = Path(source)
        self.destination = Path(destination).resolve()

    def store(self, document):
        payload = self.source.read_bytes()
        checksum = document["artifact_sha256"]
        if hashlib.sha256(payload).hexdigest() != checksum:
            raise ManifestInputError("artifact_changed_during_import")
        bronze = self.destination / "raw/openfootball" / f"{checksum}.json"
        silver = self.destination / "processed/references" / f"{checksum}.json"
        gold = self.destination / "analytics/references.json"
        changed = write_atomic(bronze, payload, immutable=True)
        changed = write_atomic(silver, encode_json(document), immutable=True) or changed
        previous = (
            json.loads(gold.read_text(encoding="utf-8")) if gold.exists() else None
        )
        if previous and previous.get("artifact_sha256") == checksum:
            if {
                key: value for key, value in previous.items() if key != "ingested_at"
            } != document:
                raise ManifestInputError("reference_gold_conflict")
            return {
                "changed": changed,
                "references": len(document["matches"]),
                "artifact_sha256": checksum,
                "statistics_ingestion_ready": False,
            }
        published = {**document, "ingested_at": datetime.now(UTC).isoformat()}
        changed = write_atomic(gold, encode_json(published)) or changed
        return {
            "changed": changed,
            "references": len(document["matches"]),
            "artifact_sha256": checksum,
            "statistics_ingestion_ready": False,
        }
