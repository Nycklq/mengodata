from flamengo_pipeline.domain.collective import build_gold, normalize_matches


def import_collective(source, destination, clubs, review):
    artifact = source.read()
    if artifact["sha256"] != review["reviewed_sha256"]:
        raise ValueError("UNREVIEWED_SOURCE_HASH")
    if (
        review["license"] != "CC0-1.0"
        or review["technical_status"] != "approved"
        or "team_match_result" not in review["approved_data_kinds"]
        or any(
            permission["status"] != "allowed"
            for permission in review["permissions"].values()
        )
    ):
        raise ValueError("UNAPPROVED_LICENSE")
    matches = normalize_matches(artifact["document"], clubs)
    gold = build_gold(matches, clubs)
    quality = {
        "status": "verified",
        "matches": len(matches),
        "clubs": len(clubs),
        "rounds": 38,
        "matches_per_round": 10,
        "matches_per_club": 38,
        "flamengo_matches": sum(
            "club:flamengo" in (row["home_id"], row["away_id"]) for row in matches
        ),
        "duplicates": 0,
        "missing_scores": 0,
        "removed_rows": 0,
        "official_mapping": "round_labels_from_openfootball_not_cbf_match_ids",
    }
    return destination.store(artifact, gold, quality, review)
