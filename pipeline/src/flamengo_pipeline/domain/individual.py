from dataclasses import asdict

from flamengo_pipeline.domain.models import ANALYTICS_SCOPE


def assess_individual(document, approval, source, checksum):
    blockers = []
    if document.get("scope") != asdict(ANALYTICS_SCOPE):
        blockers.append("scope_mismatch")
    if (
        approval.get("status") != "approved"
        or approval.get("sha256") != checksum
        or approval.get("data_kind") != "player_match"
        or approval.get("source_id") != document.get("source_id")
    ):
        blockers.append("dataset_not_approved")
    if (
        source.get("technical_status") != "approved"
        or source.get("reviewed_sha256") != checksum
        or "player_match" not in source.get("approved_data_kinds", [])
    ):
        blockers.append("source_not_approved")
    for usage in ("acquisition", "postgres_storage", "academic_analysis"):
        permission = approval.get("permissions", {}).get(usage, {})
        if permission.get("status") != "allowed" or not permission.get(
            "evidence", ""
        ).startswith("https://"):
            blockers.append(f"permission_missing:{usage}")
    if not approval.get("evidence", "").startswith("https://"):
        blockers.append("approval_evidence_missing")
    players = {row["player_id"] for row in document["players"]}
    if len({row["external_player_id"] for row in document["players"]}) != len(players):
        blockers.append("duplicate_external_player_id")
    matches = {row["match_id"]: row for row in document["matches"]}
    rounds = {row["official_round"] for row in document["matches"]}
    keys = {(row["player_id"], row["match_id"]) for row in document["appearances"]}
    if (
        len(players) != len(document["players"])
        or len(matches) != len(document["matches"])
        or len(rounds) != len(document["matches"])
        or len(keys) != len(document["appearances"])
        or len({row["official_match_number"] for row in document["matches"]})
        != len(matches)
        or len({row["external_match_id"] for row in document["matches"]})
        != len(matches)
    ):
        blockers.append("duplicate_identity")
    for row in document["matches"]:
        if row["home_team_id"] == row[
            "away_team_id"
        ] or ANALYTICS_SCOPE.team_id not in (row["home_team_id"], row["away_team_id"]):
            blockers.append("match_club_mismatch")
    for row in document["appearances"]:
        match = matches.get(row["match_id"])
        if (
            row["player_id"] not in players
            or match is None
            or match["official_round"] != row["official_round"]
        ):
            blockers.append("appearance_identity_mismatch")
    complete = (
        approval.get("coverage_verified") is True
        and approval.get("official_mapping_verified") is True
        and approval.get("participation_verified") is True
        and rounds == set(range(1, 39))
        and {row["official_round"] for row in document["appearances"]} == rounds
    )
    return {
        "authorized": not blockers,
        "blockers": sorted(set(blockers)),
        "coverage_verified": complete,
        "availability": "available" if complete else "partial",
    }
