"""Tests for the AnalysisMetrics model."""
from ocra.metrics.analysis_metrics import AnalysisMetrics


def test_analysis_metrics_storage_and_defaults():
    am = AnalysisMetrics(analysis_id="test1", subject_id="subjA", start_time=0.0, end_time=60.0, duration=60.0)

    # populate some synthetic metrics
    am.right_upper_limb.accumulated_time = 12.0
    am.right_upper_limb.percent_time = 20.0
    am.right_upper_limb.number_of_episodes = 4
    am.right_upper_limb.max_continuous_duration = 5.0
    am.right_upper_limb.frequency_per_minute = 6.0

    am.left_upper_limb.accumulated_time = 8.0
    am.left_upper_limb.percent_time = 13.3333333
    am.left_upper_limb.number_of_episodes = 2
    am.left_upper_limb.max_continuous_duration = 3.0
    am.left_upper_limb.frequency_per_minute = 3.0

    am.trunk.accumulated_time = 25.0
    am.trunk.percent_time = 41.6666667
    am.trunk.number_of_episodes = 1
    am.trunk.max_continuous_duration = 25.0

    # basic assertions
    d = am.as_dict()
    assert d["analysis_id"] == "test1"
    assert d["subject_id"] == "subjA"
    assert d["right_upper_limb"]["accumulated_time"] == 12.0
    assert d["right_upper_limb"]["frequency_per_minute"] == 6.0
    assert d["left_upper_limb"]["number_of_episodes"] == 2
    assert d["trunk"]["max_continuous_duration"] == 25.0

    # defaults for segments not set should be zeros/None
    assert d["head"]["accumulated_time"] == 0.0
    assert d["head"]["frequency_per_minute"] is None
