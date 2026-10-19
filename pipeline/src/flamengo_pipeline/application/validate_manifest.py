from collections.abc import Callable

from flamengo_pipeline.domain.manifest import assess_manifest
from flamengo_pipeline.domain.models import Manifest, ManifestReport


def validate_manifest(
    resource: str, read_manifest: Callable[[str], Manifest]
) -> ManifestReport:
    manifest = read_manifest(resource)
    return assess_manifest(manifest)
