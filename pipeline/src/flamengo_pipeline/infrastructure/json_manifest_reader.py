import json
from datetime import datetime
from math import isfinite
from pathlib import Path
from uuid import UUID

from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import SchemaError

from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.domain.models import Manifest, Match, Scope, Source


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ManifestInputError(f"duplicate_json_key:{key}")
        result[key] = value
    return result


def reject_constant(value):
    raise ManifestInputError("non_finite_json_number")


def finite_float(value):
    number = float(value)
    if not isfinite(number):
        raise ManifestInputError("non_finite_json_number")
    return number


class JsonManifestReader:
    def __init__(self, schema: dict):
        try:
            Draft202012Validator.check_schema(schema)
        except SchemaError as error:
            raise ManifestInputError("invalid_manifest_schema") from error
        self.validator = Draft202012Validator(schema, format_checker=FormatChecker())

    def read(self, resource: str) -> Manifest:
        try:
            text = Path(resource).read_text(encoding="utf-8")
            document = json.loads(
                text,
                object_pairs_hook=unique_object,
                parse_constant=reject_constant,
                parse_float=finite_float,
            )
        except (OSError, UnicodeError, json.JSONDecodeError) as error:
            raise ManifestInputError("manifest_unreadable") from error
        errors = sorted(
            self.validator.iter_errors(document),
            key=lambda error: str(list(error.absolute_path)),
        )
        if errors:
            paths = ["/".join(map(str, error.absolute_path)) for error in errors]
            raise ManifestInputError("invalid_manifest_shape:" + ",".join(paths))
        matches = []
        for row in document["matches"]:
            values = dict(row)
            values["match_id"] = UUID(values["match_id"])
            for field in ("played_at", "collected_at"):
                if values[field] is not None:
                    values[field] = datetime.fromisoformat(
                        values[field].replace("z", "+00:00")
                    )
            matches.append(Match(**values))
        return Manifest(
            schema_version=document["schema_version"],
            scope=Scope(**document["scope"]),
            sources=tuple(Source(**row) for row in document["sources"]),
            matches=tuple(matches),
        )
