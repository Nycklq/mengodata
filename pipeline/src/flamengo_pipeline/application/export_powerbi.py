def build_powerbi(artifact, assessment, approval):
    if (
        not assessment["authorized"]
        or approval.get("permissions", {})
        .get("power_bi_distribution", {})
        .get("status")
        != "allowed"
        or not approval.get("permissions", {})
        .get("power_bi_distribution", {})
        .get("evidence", "")
        .startswith("https://")
    ):
        return {
            "schema_version": 1,
            "availability": "unavailable",
            "reason": "power_bi_distribution_not_authorized",
            "distribution_allowed": False,
            "coverage_verified": False,
            "players": [],
            "matches": [],
            "appearances": [],
        }
    document = artifact["document"]
    return {
        **document,
        "availability": assessment["availability"],
        "distribution_allowed": True,
        "coverage_verified": assessment["coverage_verified"],
        "artifact_sha256": artifact["sha256"],
    }
