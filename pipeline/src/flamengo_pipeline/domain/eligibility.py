from flamengo_pipeline.domain.models import ANALYTICS_SCOPE, Match


def eligibility_issues(match: Match) -> tuple[str, ...]:
    issues = []
    if match.competition_id != ANALYTICS_SCOPE.competition_id:
        issues.append("competition_outside_scope")
    if type(match.season) is not int or match.season != ANALYTICS_SCOPE.season:
        issues.append("season_outside_scope")
    if (
        type(match.official_round) is not int
        or not ANALYTICS_SCOPE.first_round
        <= match.official_round
        <= ANALYTICS_SCOPE.last_round
    ):
        issues.append("round_outside_scope")
    if ANALYTICS_SCOPE.team_id not in (match.home_team_id, match.away_team_id):
        issues.append("club_outside_scope")
    if match.home_team_id == match.away_team_id:
        issues.append("identical_teams")
    return tuple(issues)


def appearance_belongs_to_scope(match: Match, appearance_team_id: str) -> bool:
    return (
        not eligibility_issues(match) and appearance_team_id == ANALYTICS_SCOPE.team_id
    )
