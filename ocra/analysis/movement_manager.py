"""Manage multiple MovementCounter instances and feed them with frame results.

A FrameResult is expected to be a mapping from joint name to numeric value and a
timestamp (seconds). The manager registers counters per joint and, on each
frame, forwards the sample to every counter registered for that joint.

It exposes a simple API usable by UpperLimbEvaluator:
- register_counter(joint, counter)
- feed_frame(timestamp, joint_values)
- counters (flat list of all counters)
- summary() -> dict per joint with counts, durations and frequency_per_minute
- frequency_per_minute(joint)

This is intentionally small and dependency-free.
"""
from typing import Dict, List, Iterable, Any


class MovementManager:
    def __init__(self):
        # mapping: joint_name -> list of counters
        self._by_joint: Dict[str, List[Any]] = {}

    def register_counter(self, joint: str, counter: Any) -> None:
        """Register a MovementCounter instance under a joint name."""
        self._by_joint.setdefault(joint, []).append(counter)

    def feed_frame(self, timestamp: float, joint_values: Dict[str, float]) -> None:
        """Feed a single frame (timestamp, joint->value) to all registered counters."""
        for joint, counters in self._by_joint.items():
            # use 0.0 if value for joint not present
            val = float(joint_values.get(joint, 0.0))
            for c in counters:
                # counters are expected to implement `.feed(timestamp, value)`
                c.feed(float(timestamp), float(val))

    def register_counters(self, joint: str, counters: Iterable[Any]) -> None:
        """Register multiple counters for a joint at once."""
        for c in counters:
            self.register_counter(joint, c)

    @property
    def joints(self) -> List[str]:
        return list(self._by_joint.keys())

    @property
    def counters(self) -> List[Any]:
        """Return a flat list of all registered counters."""
        out: List[Any] = []
        for lst in self._by_joint.values():
            out.extend(lst)
        return out

    def summary(self) -> Dict[str, Dict[str, Any]]:
        """Return a per-joint summary with counts, durations and frequency.

        Format:
        {
          joint: {
            'counts': [int,...],
            'durations': [float,...],
            'total_count': int,
            'max_duration': float,
            'frequency_per_minute': float,
          },
        }
        """
        out: Dict[str, Dict[str, Any]] = {}
        for joint, counters in self._by_joint.items():
            counts = []
            durations = []
            for c in counters:
                try:
                    counts.append(int(getattr(c, "count", 0)))
                except Exception:
                    counts.append(0)
                try:
                    durations.append(float(getattr(c, "duration", 0.0)))
                except Exception:
                    durations.append(0.0)
            total = sum(counts)
            max_dur = max(durations) if durations else 0.0
            freq = (total / max_dur) * 60.0 if max_dur > 0 else 0.0
            out[joint] = {
                "counts": counts,
                "durations": durations,
                "total_count": total,
                "max_duration": max_dur,
                "frequency_per_minute": freq,
            }
        return out

    def frequency_per_minute(self, joint: str) -> float:
        s = self.summary()
        j = s.get(joint)
        if not j:
            return 0.0
        return float(j.get("frequency_per_minute", 0.0))
