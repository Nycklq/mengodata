from dataclasses import asdict
from uuid import NAMESPACE_URL, uuid5

from flamengo_pipeline.domain.models import ANALYTICS_SCOPE


def synthetic_manifest():
    return {
        "schema_version": 2,
        "scope": asdict(ANALYTICS_SCOPE),
        "sources": [
            {
                "source_id": "synthetic:source",
                "name": "Synthetic automated test source",
                "approval_status": "pending",
                "approval_reference": None,
            }
        ],
        "matches": [
            {
                "match_id": str(
                    uuid5(NAMESPACE_URL, f"synthetic-match-{round_number}")
                ),
                "competition_id": ANALYTICS_SCOPE.competition_id,
                "season": 2025,
                "official_round": round_number,
                "official_match_number": round_number,
                "home_team_id": "club:flamengo",
                "away_team_id": f"synthetic:opponent-{round_number}",
                "status": "finished",
                "played_at": "2025-01-01T12:00:00Z",
                "source_id": "synthetic:source",
                "external_match_id": f"synthetic-match-{round_number}",
                "evidence_url": f"https://synthetic.invalid/matches/{round_number}",
                "collected_at": "2027-01-01T12:00:00Z",
            }
            for round_number in range(1, 39)
        ],
    }
