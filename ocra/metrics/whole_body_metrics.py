"""Whole-body metrics: time spent in categories for trunk, neck, head, knees and ankles.

We expect per-joint posture samples in the form list[(timestamp, category_string)].
The functions compute accumulated time per category and basic summarizations.
"""
from typing import Dict, List, Tuple, Any

from ocra.metrics.posture_statistics import accumulated_time, percent_of_time, max_continuous_duration


def time_by_category(samples: List[Tuple[float, str]]) -> Dict[str, float]:
    """Compute accumulated time per category from timestamped category samples.

    samples should be an ordered list of (timestamp, category_name).
    """
    out: Dict[str, float] = {}
    if not samples:
        return out
    times = [t for t, _ in samples]
    cats = [c for _, c in samples]
    for i in range(len(samples) - 1):
        dt = times[i + 1] - times[i]
        cat = cats[i]
        out[cat] = out.get(cat, 0.0) + dt
    return out


def trunk_time_by_category(samples: List[Tuple[float, str]]) -> Dict[str, float]:
    return time_by_category(samples)


def neck_time_by_category(samples: List[Tuple[float, str]]) -> Dict[str, float]:
    return time_by_category(samples)


def head_time_by_category(samples: List[Tuple[float, str]]) -> Dict[str, float]:
    return time_by_category(samples)


def knees_time_by_category(samples: List[Tuple[float, str]]) -> Dict[str, float]:
    return time_by_category(samples)


def ankles_time_by_category(samples: List[Tuple[float, str]]) -> Dict[str, float]:
    return time_by_category(samples)
