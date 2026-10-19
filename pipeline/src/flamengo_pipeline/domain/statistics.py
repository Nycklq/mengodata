from math import isfinite

COUNT_METRICS = (
    "minutes",
    "goals",
    "assists",
    "shots",
    "shots_on_target",
    "tackles",
    "interceptions",
    "clearances",
    "blocks",
    "passes_completed",
    "passes_attempted",
    "yellow_cards",
    "red_cards",
    "xg",
    "xa",
)


def complete_sum(values):
    if not values or any(
        type(value) not in (int, float) or not isfinite(value) or value < 0
        for value in values
    ):
        return None
    return sum(values)


def safe_ratio(numerator, denominator, multiplier=1):
    if (
        type(numerator) not in (int, float)
        or type(denominator) not in (int, float)
        or not isfinite(numerator)
        or not isfinite(denominator)
        or numerator < 0
        or denominator <= 0
    ):
        return None
    return numerator * multiplier / denominator


def aggregate_appearances(rows):
    metrics = {
        field: complete_sum([row.get(field) for row in rows]) for field in COUNT_METRICS
    }
    metrics["matches"] = len({row["match_id"] for row in rows}) if rows else None
    metrics["starts"] = (
        sum(row["starter"] for row in rows)
        if rows and all(type(row.get("starter")) is bool for row in rows)
        else None
    )
    metrics["contributions"] = complete_sum([metrics["goals"], metrics["assists"]])
    for field in ("goals", "assists", "contributions"):
        metrics[f"{field}_per90"] = safe_ratio(metrics[field], metrics["minutes"], 90)
    metrics["conversion_pct"] = safe_ratio(metrics["goals"], metrics["shots"], 100)
    metrics["pass_accuracy_pct"] = safe_ratio(
        metrics["passes_completed"], metrics["passes_attempted"], 100
    )
    return metrics


def quantile(values, probability):
    if type(probability) not in (int, float) or not 0 <= probability <= 1:
        return None
    ordered = sorted(
        value for value in values if type(value) in (int, float) and isfinite(value)
    )
    if not ordered:
        return None
    index = (len(ordered) - 1) * probability
    lower = int(index)
    upper = min(lower + 1, len(ordered) - 1)
    return ordered[lower] + (ordered[upper] - ordered[lower]) * (index - lower)


def describe_distribution(values):
    observed = [
        value for value in values if type(value) in (int, float) and isfinite(value)
    ]
    if not observed:
        return {
            "sample_size": 0,
            "mean": None,
            "median": None,
            "q1": None,
            "q3": None,
            "minimum": None,
            "maximum": None,
            "outliers": [],
        }
    q1, q3 = quantile(observed, 0.25), quantile(observed, 0.75)
    spread = q3 - q1
    return {
        "sample_size": len(observed),
        "mean": sum(observed) / len(observed),
        "median": quantile(observed, 0.5),
        "q1": q1,
        "q3": q3,
        "minimum": min(observed),
        "maximum": max(observed),
        "outliers": [
            value
            for value in observed
            if value < q1 - 1.5 * spread or value > q3 + 1.5 * spread
        ],
    }
