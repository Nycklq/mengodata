import json

from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.application.import_references import import_references


def run_reference_import(read_reference, store_reference, review, output):
    try:
        result = import_references(read_reference, store_reference, review)
        output(json.dumps(result, ensure_ascii=True))
        return 0
    except OSError, ValueError, TypeError, KeyError, ManifestInputError:
        output(json.dumps({"error": "reference_import_failed"}))
        return 2
