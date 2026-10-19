from collections import Counter, defaultdict

from flamengo_pipeline.domain.models import ANALYTICS_SCOPE

SNAPSHOT_METRICS = (
    "goals",
    "assists",
    "tackles",
    "saved_shots",
    "shots_off_target",
    "shots_woodwork",
    "yellow_cards",
    "red_cards",
    "appearance_counter",
)


def assess_reference_matches(matches):
    expected = set(range(ANALYTICS_SCOPE.first_round, ANALYTICS_SCOPE.last_round + 1))
    rounds = Counter(row["source_round"] for row in matches)
    locators = Counter(row["source_record_id"] for row in matches)
    pairs = Counter((row["home_team"], row["away_team"]) for row in matches)
    errors = []
    for index, row in enumerate(matches):
        if type(row["source_round"]) is not int or row["source_round"] not in expected:
            errors.append(f"round_outside_scope:{index}")
        if ANALYTICS_SCOPE.team_id not in (row["home_team_id"], row["away_team_id"]):
            errors.append(f"club_outside_scope:{index}")
        if row["home_team"] == row["away_team"]:
            errors.append(f"identical_teams:{index}")
        if (
            not isinstance(row["score"], (list, tuple))
            or len(row["score"]) != 2
            or any(type(value) is not int or value < 0 for value in row["score"])
        ):
            errors.append(f"invalid_or_missing_score:{index}")
    missing = sorted(expected - rounds.keys())
    if missing:
        errors.append("incomplete_reference_catalog")
    for name, counts in (("round", rounds), ("locator", locators), ("pair", pairs)):
        if any(count > 1 for count in counts.values()):
            errors.append(f"duplicate_{name}")
    complete = not errors and len(matches) == len(expected)
    return {
        "technical_approved": complete,
        "data_kind": "match_reference",
        "reference_count": len(matches),
        "missing_rounds": missing,
        "errors": errors,
        "official_mapping_verified": False,
        "player_statistics_coverage": "unverified",
        "statistics_ingestion_ready": False,
    }


def assess_snapshot_rows(rows):
    flamengo = [row for row in rows if row["team_id"] == ANALYTICS_SCOPE.team_id]
    players = [row for row in flamengo if row["participant_kind"] == "player"]
    keys = Counter((row["player_id"], row["snapshot_round"]) for row in rows)
    clubs = defaultdict(set)
    for row in rows:
        clubs[row["player_id"]].add(row["team_id"])
    groups = defaultdict(list)
    for row in players:
        groups[row["player_id"]].append(row)
    differences = {}
    for field in SNAPSHOT_METRICS:
        counts = {"positive": 0, "equal": 0, "negative": 0}
        for group in groups.values():
            ordered = sorted(group, key=lambda row: row["snapshot_round"])
            for previous, current in zip(ordered, ordered[1:], strict=False):
                left, right = previous["values"][field], current["values"][field]
                if left is not None and right is not None:
                    category = (
                        "positive"
                        if right > left
                        else "negative"
                        if right < left
                        else "equal"
                    )
                    counts[category] += 1
        differences[field] = counts
    expected = set(range(ANALYTICS_SCOPE.first_round, ANALYTICS_SCOPE.last_round + 1))
    observed = {row["snapshot_round"] for row in rows}
    flagged = {row["snapshot_round"] for row in players if row["appeared"]}
    return {
        "technical_approved": False,
        "data_kind": "player_snapshot",
        "row_count": len(rows),
        "player_ids": len(clubs),
        "snapshot_rounds": sorted(observed),
        "missing_snapshot_rounds": sorted(expected - observed),
        "outside_scope_snapshot_rounds": sorted(observed - expected),
        "duplicate_player_snapshot_keys": sum(count - 1 for count in keys.values()),
        "declared_round_mismatches": sum(
            row["snapshot_round"] != row["declared_round"] for row in rows
        ),
        "flamengo_club_label_mismatches": sum(
            row.get("club_label_consistent", True) is False for row in flamengo
        ),
        "flamengo_rows": len(flamengo),
        "flamengo_coach_rows": len(flamengo) - len(players),
        "flamengo_player_rows": len(players),
        "flamengo_registered_player_ids": len(groups),
        "flamengo_flagged_player_ids": len(
            {row["player_id"] for row in players if row["appeared"]}
        ),
        "flamengo_appearance_flags": sum(row["appeared"] for row in players),
        "rounds_without_flamengo_appearance_flags": sorted(expected - flagged),
        "flamengo_nulls": {
            field: sum(row["values"][field] is None for row in players)
            for field in SNAPSHOT_METRICS
        },
        "negative_scout_values": {
            field: sum(
                row["values"][field] is not None and row["values"][field] < 0
                for row in rows
            )
            for field in SNAPSHOT_METRICS
        },
        "consecutive_snapshot_differences": differences,
        "multi_club_player_ids": sum(len(value) > 1 for value in clubs.values()),
        "flamengo_multi_club_player_ids": sorted(
            player for player in groups if len(clubs[player]) > 1
        ),
        "official_match_links": 0,
        "verified_player_appearances": None,
        "statistics_ingestion_ready": False,
        "blockers": [
            "snapshot_is_not_player_match",
            "official_match_links_missing",
            "collection_timestamps_missing",
            "accumulated_scout_semantics_unverified",
            "minutes_and_starts_missing",
            "third_party_data_rights_unverified",
        ],
    }
