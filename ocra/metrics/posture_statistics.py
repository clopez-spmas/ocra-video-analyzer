"""Posture statistics helpers.

Utilities work with ordered timestamped samples of either boolean conditions or
category labels. They compute:
- accumulated_time: total seconds where a predicate or category matches
- percent_of_time: percentage of the total observation time
- max_continuous_duration: longest continuous segment where predicate/category holds
"""
from typing import Callable, Iterable, List, Tuple, Any


def _ensure_ordered(samples: List[Tuple[float, Any]]) -> List[Tuple[float, Any]]:
    return sorted(samples, key=lambda x: x[0])


def accumulated_time(samples: List[Tuple[float, Any]], predicate: Callable[[Any], bool]) -> float:
    """Return total seconds where predicate(value) is True.

    samples: ordered list of (timestamp, value)
    predicate: function mapping value -> bool
    """
    if not samples:
        return 0.0
    samples = _ensure_ordered(samples)
    total = 0.0
    for i in range(len(samples) - 1):
        t0, v0 = samples[i]
        t1, _ = samples[i + 1]
        if predicate(v0):
            total += (t1 - t0)
    return total


def percent_of_time(samples: List[Tuple[float, Any]], predicate: Callable[[Any], bool]) -> float:
    if not samples:
        return 0.0
    samples = _ensure_ordered(samples)
    start = samples[0][0]
    end = samples[-1][0]
    total = end - start
    if total <= 0:
        return 0.0
    acc = accumulated_time(samples, predicate)
    return (acc / total) * 100.0


def max_continuous_duration(samples: List[Tuple[float, Any]], predicate: Callable[[Any], bool]) -> float:
    """Return the maximum continuous duration where predicate(value) is True."""
    if not samples:
        return 0.0
    samples = _ensure_ordered(samples)
    maxd = 0.0
    cur_start = None
    for i in range(len(samples) - 1):
        t0, v0 = samples[i]
        t1, _ = samples[i + 1]
        dt = t1 - t0
        if predicate(v0):
            if cur_start is None:
                cur_start = t0
        else:
            if cur_start is not None:
                dur = t0 - cur_start + dt
                if dur > maxd:
                    maxd = dur
                cur_start = None
    # if ended while inside predicate, close it
    if cur_start is not None:
        dur = samples[-1][0] - cur_start
        if dur > maxd:
            maxd = dur
    return maxd
