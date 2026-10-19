import json
from pathlib import Path

import pytest
from fixtures import synthetic_manifest

from flamengo_pipeline.infrastructure.json_manifest_reader import JsonManifestReader


@pytest.fixture
def document():
    return synthetic_manifest()


@pytest.fixture
def reader():
    schema_path = Path(__file__).resolve().parents[2] / "contracts/manifest.schema.json"
    return JsonManifestReader(json.loads(schema_path.read_text(encoding="utf-8")))


@pytest.fixture
def write_manifest(tmp_path):
    def write(document):
        path = tmp_path / "synthetic-manifest.json"
        path.write_text(json.dumps(document), encoding="utf-8")
        return str(path)

    return write


@pytest.fixture
def manifest(document, reader, write_manifest):
    return reader.read(write_manifest(document))
