import json

from flamengo_pipeline.application.audit_sources import audit_sources
from flamengo_pipeline.application.errors import ManifestInputError


def run_source_audit(read_references, read_snapshots, reviews, output):
    try:
        report = audit_sources(read_references, read_snapshots, reviews)
        output(json.dumps(report, ensure_ascii=True, indent=2, allow_nan=False))
        return 0
    except OSError, ValueError, KeyError, TypeError, ManifestInputError:
        output(json.dumps({"error": "source_audit_input_invalid"}))
        return 2
