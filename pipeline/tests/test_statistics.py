import json
from pathlib import Path

import pytest

from flamengo_pipeline.domain.statistics import (
    aggregate_appearances,
    complete_sum,
    describe_distribution,
    quantile,
    safe_ratio,
)

FIXTURE = json.loads(
    (Path(__file__).resolve().parents[2] / "tests/fixtures/statistics.json").read_text()
)


def test_formulas_share_the_javascript_contract_and_weighted_components():
    actual = aggregate_appearances(FIXTURE["rows"])
    for field, expected in FIXTURE["expected"].items():
        if expected is None:
            assert actual[field] is None
        else:
            assert actual[field] == pytest.approx(expected)


@pytest.mark.parametrize("denominator", [0, None, -1, float("nan")])
def test_missing_or_invalid_denominators_remain_unavailable(denominator):
    assert safe_ratio(1, denominator, 90) is None


def test_zero_confirmed_and_unknown_are_distinct():
    assert complete_sum([0, 0]) == 0
    assert complete_sum([0, None]) is None
    assert complete_sum([]) is None
    assert safe_ratio(0, 90, 90) == 0
    assert aggregate_appearances([])["matches"] is None


def test_linear_quartiles_and_outliers_share_the_contract():
    actual = describe_distribution(FIXTURE["distribution"]["values"])
    for field in ("q1", "median", "q3", "outliers"):
        assert actual[field] == FIXTURE["distribution"][field]
    assert actual["sample_size"] == 6
    assert describe_distribution([])["mean"] is None
    assert quantile([1], 2) is None
