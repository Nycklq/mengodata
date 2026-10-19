import argparse
import json
from pathlib import Path

from flamengo_pipeline.adapters.cli import run_validation
from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.infrastructure.json_manifest_reader import JsonManifestReader


def main() -> int:
    parser = argparse.ArgumentParser(prog="flamengo-manifest")
    parser.add_argument("manifest")
    parser.add_argument(
        "--schema",
        default=Path(__file__).resolve().parents[4] / "contracts/manifest.schema.json",
    )
    arguments = parser.parse_args()
    try:
        schema = json.loads(Path(arguments.schema).read_text(encoding="utf-8"))
        reader = JsonManifestReader(schema)
    except OSError, UnicodeError, json.JSONDecodeError:
        print(json.dumps({"error": "schema_unreadable"}))
        return 2
    except ManifestInputError as error:
        print(json.dumps({"error": str(error)}))
        return 2
    return run_validation(arguments.manifest, reader.read, print)


if __name__ == "__main__":
    raise SystemExit(main())
