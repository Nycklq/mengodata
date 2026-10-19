from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True)
class Scope:
    competition_id: str
    season: int
    team_id: str
    first_round: int
    last_round: int


ANALYTICS_SCOPE = Scope(
    competition_id="competition:brasileirao-serie-a-men",
    season=2025,
    team_id="club:flamengo",
    first_round=1,
    last_round=38,
)


@dataclass(frozen=True)
class Source:
    source_id: str
    name: str
    approval_status: str
    approval_reference: str | None


@dataclass(frozen=True)
class Match:
    match_id: UUID
    competition_id: str
    season: int
    official_round: int
    official_match_number: int
    home_team_id: str
    away_team_id: str
    status: str
    played_at: datetime | None
    source_id: str
    external_match_id: str
    evidence_url: str
    collected_at: datetime


@dataclass(frozen=True)
class Manifest:
    schema_version: int
    scope: Scope
    sources: tuple[Source, ...]
    matches: tuple[Match, ...]


@dataclass(frozen=True)
class Finding:
    code: str
    path: str


@dataclass(frozen=True)
class ManifestReport:
    valid: bool
    complete: bool
    identification_ready: bool
    statistics_coverage: str
    ingestion_ready: bool
    identified_matches: int
    missing_rounds: tuple[int, ...]
    errors: tuple[Finding, ...]
    warnings: tuple[Finding, ...]
