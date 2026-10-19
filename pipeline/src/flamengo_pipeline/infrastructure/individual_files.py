import hashlib
from datetime import datetime
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.infrastructure.reference_files import write_atomic
from flamengo_pipeline.infrastructure.source_audit_readers import read_json


def read_individual(path, schema_path):
    payload = Path(path).read_bytes()
    document = read_json(path)
    validator = Draft202012Validator(
        read_json(schema_path), format_checker=FormatChecker()
    )
    if list(validator.iter_errors(document)):
        raise ManifestInputError("invalid_individual_schema")
    collected = datetime.fromisoformat(document["collected_at"])
    if any(
        datetime.fromisoformat(row["played_at"]) > collected
        for row in document["matches"]
    ):
        raise ManifestInputError("collection_precedes_match")
    return {
        "document": document,
        "sha256": hashlib.sha256(payload).hexdigest(),
        "payload": payload,
    }


def store_individual(artifact, directory):
    root = Path(directory).resolve()
    checksum = artifact["sha256"]
    payload = artifact["payload"]
    if hashlib.sha256(payload).hexdigest() != checksum:
        raise ManifestInputError("individual_content_changed")
    changed = write_atomic(
        root / "raw/individual" / f"{checksum}.json", payload, immutable=True
    )
    changed = (
        write_atomic(
            root / "processed/individual" / f"{checksum}.json", payload, immutable=True
        )
        or changed
    )
    changed = write_atomic(root / "analytics/individual.json", payload) or changed
    return {
        "changed": changed,
        "sha256": checksum,
        "appearances": len(artifact["document"]["appearances"]),
    }
