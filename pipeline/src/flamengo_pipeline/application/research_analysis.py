from flamengo_pipeline.domain.statistics import (
    aggregate_appearances,
    describe_distribution,
)


def analyze_players(document):
    return [
        {
            **player,
            **aggregate_appearances(
                [
                    row
                    for row in document["appearances"]
                    if row["player_id"] == player["player_id"]
                ]
            ),
        }
        for player in document["players"]
    ]


def analyze_metric(players, metric):
    return describe_distribution([player.get(metric) for player in players])
