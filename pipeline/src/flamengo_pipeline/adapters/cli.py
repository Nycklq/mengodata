import json
from dataclasses import asdict

from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.application.validate_manifest import validate_manifest


def run_validation(resource, read_manifest, output) -> int:
    try:
        report = validate_manifest(resource, read_manifest)
    except ManifestInputError as error:
        output(json.dumps({"error": str(error)}, ensure_ascii=False))
        return 2
    output(json.dumps(asdict(report), ensure_ascii=False))
    return 0 if report.valid else 1
