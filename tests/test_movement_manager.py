"""Tests for MovementManager behavior."""
import pytest
from ocra.analysis.movement_counter import MovementCounter
from ocra.analysis.movement_manager import MovementManager


def make_timeline(start, end, step=0.01):
    t = start
    out = []
    while t <= end + 1e-9:
        out.append(round(t, 6))
        t += step
    return out


def generate_signal(timeline, pulses):
    # pulses: list of (start, duration, value)
    vals = []
    for t in timeline:
        v = 0.0
        for s, d, val in pulses:
            if s <= t <= s + d:
                v = val
                break
        vals.append(v)
    return vals


def test_multiple_counters_simultaneous():
    mgr = MovementManager()
    # two sensors for the same joint
    c1 = MovementCounter(threshold=0.5, hysteresis=0.1, min_duration=0.02)
    c2 = MovementCounter(threshold=0.5, hysteresis=0.1, min_duration=0.02)
    mgr.register_counter("wrist", c1)
    mgr.register_counter("wrist", c2)

    # three short pulses
    pulses = [(0.06, 0.06, 1.0), (0.16, 0.06, 1.0), (0.26, 0.06, 1.0)]
    timeline = make_timeline(0.0, 0.34, step=0.01)
    values = generate_signal(timeline, pulses)

    for t, v in zip(timeline, values):
        mgr.feed_frame(t, {"wrist": v})

    # complete counters
    c1.complete()
    c2.complete()

    summary = mgr.summary()
    assert "wrist" in summary
    assert summary["wrist"]["counts"] == [3, 3]
    # frequency per minute should be > 0
    assert summary["wrist"]["frequency_per_minute"] > 0


def test_independence_between_joints():
    mgr = MovementManager()
    wrist = MovementCounter(threshold=0.5, hysteresis=0.1, min_duration=0.02)
    elbow = MovementCounter(threshold=0.5, hysteresis=0.1, min_duration=0.02)
    mgr.register_counter("wrist", wrist)
    mgr.register_counter("elbow", elbow)

    # only wrist pulses
    pulses = [(0.05, 0.06, 1.0), (0.15, 0.06, 1.0)]
    timeline = make_timeline(0.0, 0.24, step=0.01)
    vals = generate_signal(timeline, pulses)

    for t, v in zip(timeline, vals):
        mgr.feed_frame(t, {"wrist": v, "elbow": 0.0})

    wrist.complete()
    elbow.complete()

    s = mgr.summary()
    assert s["wrist"]["total_count"] == 2
    assert s["elbow"]["total_count"] == 0


def test_summary_and_frequencies():
    mgr = MovementManager()
    c1 = MovementCounter(threshold=0.5, hysteresis=0.1, min_duration=0.02)
    c2 = MovementCounter(threshold=0.5, hysteresis=0.1, min_duration=0.02)
    mgr.register_counter("wrist", c1)
    mgr.register_counter("elbow", c2)

    # wrist: 2 pulses over 0.2s window
    wrist_pulses = [(0.02, 0.06, 1.0), (0.12, 0.06, 1.0)]
    # elbow: 1 pulse over same window
    elbow_pulses = [(0.05, 0.1, 1.0)]

    timeline = make_timeline(0.0, 0.22, step=0.01)
    wrist_vals = generate_signal(timeline, wrist_pulses)
    elbow_vals = generate_signal(timeline, elbow_pulses)

    for t, wv, ev in zip(timeline, wrist_vals, elbow_vals):
        mgr.feed_frame(t, {"wrist": wv, "elbow": ev})

    c1.complete()
    c2.complete()

    s = mgr.summary()
    # counts per counter
    assert s["wrist"]["counts"] == [2]
    assert s["elbow"]["counts"] == [1]

    # compute expected frequency: total_count / max_duration * 60
    wrist_total = s["wrist"]["total_count"]
    wrist_max_dur = s["wrist"]["max_duration"]
    if wrist_max_dur > 0:
        expected_wrist_freq = (wrist_total / wrist_max_dur) * 60.0
    else:
        expected_wrist_freq = 0.0

    assert pytest.approx(s["wrist"]["frequency_per_minute"], rel=1e-3) == expected_wrist_freq

    elbow_total = s["elbow"]["total_count"]
    elbow_max_dur = s["elbow"]["max_duration"]
    if elbow_max_dur > 0:
        expected_elbow_freq = (elbow_total / elbow_max_dur) * 60.0
    else:
        expected_elbow_freq = 0.0

    assert pytest.approx(s["elbow"]["frequency_per_minute"], rel=1e-3) == expected_elbow_freq
