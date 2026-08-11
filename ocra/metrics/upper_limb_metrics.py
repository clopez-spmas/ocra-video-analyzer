"""Upper limb specific metrics.

Functions are small adapters that compute metrics from signals, movement
counters or MovementEvent lists. They do NOT implement any risk scoring.
"""
from typing import Dict, Iterable, List, Tuple, Any
from statistics import mean

from ocra.analysis.movement_manager import MovementManager
from ocra.analysis.movement_counter import MovementCounter
from ocra.analysis.movement_event import MovementEvent
from ocra.metrics.movement_statistics import (
    count_movements,
    frequency_per_minute_from_events,
    mean_duration,
)
from ocra.metrics.posture_statistics import (
    accumulated_time,
    percent_of_time,
    max_continuous_duration,
)


def actions_technical_from_manager(manager: MovementManager) -> int:
    """Return total number of technical actions (movements) across all joints.

    manager: MovementManager instance
    """
    s = manager.summary()
    total = 0
    for j in s.values():
        total += int(j.get("total_count", 0))
    return total


def frequency_overall_from_manager(manager: MovementManager) -> float:
    """Return an overall frequency (actions per minute) aggregated from manager.

    Uses the same aggregation strategy as MovementManager.summary: total_count
    divided by the longest observation duration among counters, scaled to
    minutes.
    """
    s = manager.summary()
    total = 0
    max_dur = 0.0
    for j in s.values():
        total += int(j.get("total_count", 0))
        if j.get("max_duration", 0.0) > max_dur:
            max_dur = float(j.get("max_duration", 0.0))
    if max_dur <= 0:
        return 0.0
    return (total / max_dur) * 60.0


def time_by_joint_ranges(
    joint_samples: Dict[str, List[Tuple[float, float]]],
    ranges: Dict[str, Tuple[float, float]],
) -> Dict[str, Dict[str, float]]:
    """Compute time spent by joint inside named angular ranges.

    joint_samples: mapping joint -> list of (timestamp, angle_in_degrees)
    ranges: mapping range_name -> (min_inclusive, max_inclusive)

    Returns mapping joint -> mapping range_name -> seconds spent in that range.
    """
    out: Dict[str, Dict[str, float]] = {}
    for joint, samples in joint_samples.items():
        per_range = {k: 0.0 for k in ranges.keys()}
        if not samples:
            out[joint] = per_range
            continue
        # build timestamps and values
        times = [t for t, _ in samples]
        vals = [v for _, v in samples]
        # assume samples ordered
        for i in range(len(samples) - 1):
            t0 = times[i]
            t1 = times[i + 1]
            dt = t1 - t0
            val = vals[i]
            for rname, (mn, mx) in ranges.items():
                if mn <= val <= mx:
                    per_range[rname] += dt
                    break
        out[joint] = per_range
    return out


def cycle_durations_from_events(events: List[MovementEvent]) -> List[float]:
    return [ev.end_time - ev.start_time for ev in events if ev.end_time > ev.start_time]


def average_cycle_duration_from_events(events: List[MovementEvent]) -> float:
    ds = cycle_durations_from_events(events)
    if not ds:
        return 0.0
    return mean(ds)
