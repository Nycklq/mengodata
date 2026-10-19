USES = (
    "acquisition",
    "postgres_storage",
    "academic_analysis",
    "react_display",
    "rest_api",
    "csv_export",
    "power_bi_distribution",
    "github_publication",
)


def assess_source_use(review, quality, data_kind, usage):
    reasons = []
    if review.get("technical_status") != "approved":
        reasons.append("review_not_approved")
    if usage not in USES:
        reasons.append("unsupported_usage")
    if data_kind not in review.get("approved_data_kinds", []):
        reasons.append("data_kind_not_approved")
    if quality.get("data_kind") != data_kind:
        reasons.append("quality_granularity_mismatch")
    if quality.get("technical_approved") is not True:
        reasons.append("technical_approval_missing")
    if review.get("source_id") != quality.get("source_id"):
        reasons.append("source_identity_mismatch")
    if (
        not review.get("reviewed_sha256")
        or quality.get("sha256") != review["reviewed_sha256"]
    ):
        reasons.append("unreviewed_artifact")
    permission = review.get("permissions", {}).get(usage, {})
    if permission.get("status") != "allowed":
        reasons.append("permission_not_documented")
    if not str(permission.get("evidence", "")).startswith("https://"):
        reasons.append("permission_evidence_missing")
    return {
        "authorized": not reasons,
        "data_kind": data_kind,
        "usage": usage,
        "blockers": reasons,
    }
