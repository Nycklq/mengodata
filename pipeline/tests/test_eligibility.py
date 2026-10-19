from dataclasses import replace
from datetime import UTC, datetime

import pytest

from flamengo_pipeline.domain.eligibility import (
    appearance_belongs_to_scope,
    eligibility_issues,
)


@pytest.mark.parametrize("round_number", range(1, 39))
def test_every_full_season_round_is_eligible(manifest, round_number):
    match = replace(manifest.matches[0], official_round=round_number)
    assert eligibility_issues(match) == ()


@pytest.mark.parametrize("round_number", [-1, 0, 39, 40, None, True, "1", 1.0])
def test_invalid_and_outside_season_rounds_are_rejected(manifest, round_number):
    match = replace(manifest.matches[0], official_round=round_number)
    assert "round_outside_scope" in eligibility_issues(match)


@pytest.mark.parametrize(
    ("changes", "code"),
    [
        ({"season": 2024}, "season_outside_scope"),
        ({"season": 2026}, "season_outside_scope"),
        ({"season": 2025.0}, "season_outside_scope"),
        ({"competition_id": "synthetic:other-cup"}, "competition_outside_scope"),
        ({"home_team_id": "synthetic:other-club"}, "club_outside_scope"),
        ({"away_team_id": "club:flamengo"}, "identical_teams"),
    ],
)
def test_competitive_identity_is_mandatory(manifest, changes, code):
    assert code in eligibility_issues(replace(manifest.matches[0], **changes))


def test_away_fixture_is_eligible(manifest):
    match = replace(
        manifest.matches[0],
        home_team_id="synthetic:opponent",
        away_team_id="club:flamengo",
    )
    assert eligibility_issues(match) == ()


def test_postponed_match_keeps_its_original_round_regardless_of_date(manifest):
    match = replace(
        manifest.matches[0],
        official_round=4,
        played_at=datetime(2027, 1, 1, tzinfo=UTC),
    )
    assert eligibility_issues(match) == ()
    assert "round_outside_scope" in eligibility_issues(
        replace(match, official_round=39, played_at=None)
    )


def test_transferred_players_are_filtered_by_appearance_club(manifest):
    match = manifest.matches[0]
    assert appearance_belongs_to_scope(match, "club:flamengo")
    assert not appearance_belongs_to_scope(match, "synthetic:former-club")
    assert not appearance_belongs_to_scope(
        replace(match, official_round=39), "club:flamengo"
    )
