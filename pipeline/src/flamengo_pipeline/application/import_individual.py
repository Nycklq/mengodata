from flamengo_pipeline.application.errors import ManifestInputError
from flamengo_pipeline.domain.individual import assess_individual


def import_individual(read_bundle, store_bundle, approval, source):
    artifact = read_bundle()
    assessment = assess_individual(
        artifact["document"], approval, source, artifact["sha256"]
    )
    if not assessment["authorized"]:
        raise ManifestInputError("individual_ingestion_not_authorized")
    result = store_bundle(artifact)
    return {**result, **assessment}
