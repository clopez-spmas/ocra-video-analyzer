"""Movement statistics helpers.

Functions accept either a MovementCounter instance, a list of MovementEvent
objects, or a simple list of (start, end) tuples.
"""
from typing import List, Iterable, Tuple, Any
from statistics import mean


def _events_from(obj: Any) -> List[Tuple[float, float, float]]:
    """Normalize different input types to a list of (start, peak_time, end, amplitude) tuples.

    Returns list of tuples (start, end, amplitude) where amplitude may be 0.
    """
    events: List[Tuple[float, float, float]] = []
    # MovementCounter-like object
    if hasattr(obj, "events") and callable(getattr(obj, "events")):
        evs = obj.events()
        for ev in evs:
            events.append((ev.start_time, ev.end_time, getattr(ev, "amplitude", 0.0)))
        return events
    # MovementCounter with property .events (list)
    if hasattr(obj, "events"):
        evs = getattr(obj, "events")
        for ev in evs:
            events.append((ev.start_time, ev.end_time, getattr(ev, "amplitude", 0.0)))
        return events
    # list of MovementEvent
    if isinstance(obj, Iterable):
        for item in obj:
            if hasattr(item, "start_time") and hasattr(item, "end_time"):
                events.append((item.start_time, item.end_time, getattr(item, "amplitude", 0.0)))
            elif isinstance(item, (list, tuple)) and len(item) >= 2:
                s = float(item[0])
                e = float(item[1])
                amp = float(item[2]) if len(item) > 2 else 0.0
                events.append((s, e, amp))
    return events


def count_movements(obj: Any) -> int:
    events = _events_from(obj)
    return len(events)


def frequency_per_minute_from_events(obj: Any, observation_duration: float = 0.0) -> float:
    events = _events_from(obj)
    n = len(events)
    if observation_duration <= 0.0:
        # try to infer duration from events timestamps
        if not events:
            return 0.0
        starts = [s for s, _, _ in events]
        ends = [e for _, e, _ in events]
        obs_start = min(starts)
        obs_end = max(ends)
        observation_duration = obs_end - obs_start
        if observation_duration <= 0.0:
            return 0.0
    return (n / observation_duration) * 60.0


def mean_duration(obj: Any) -> float:
    events = _events_from(obj)
    if not events:
        return 0.0
    durs = [e - s for s, e, _ in [(s, e, a) for s, e, a in events]]
    return mean(durs) if durs else 0.0


def execution_speed_optional(obj: Any) -> float:
    """Optional speed metric: mean amplitude divided by mean duration.

    Returns 0.0 if values unavailable.
    """
    events = _events_from(obj)
    if not events:
        return 0.0
    amps = [a for _, _, a in events if a is not None]
    durs = [e - s for s, e, _ in events if e > s]
    if not durs:
        return 0.0
    mean_amp = mean(amps) if amps else 0.0
    mean_dur = mean(durs)
    if mean_dur <= 0.0:
        return 0.0
    return mean_amp / mean_dur
