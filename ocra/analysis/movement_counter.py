"""Simple movement counter for detecting repetitions in a numeric signal.

Algorithm (very small, deliberately simple prototype):
- Use two thresholds (high, low) to implement hysteresis.
- When the signal rises at/above `high` we mark movement start.
- While above low we track peak amplitude and peak time.
- When the signal falls at/below `low` we mark movement end. A movement is
  considered valid if its duration >= min_duration.
- Incomplete movements (no falling edge) are not counted until `complete()`
  is called; even then incomplete movements are not counted.

This is intentionally simple to make the behavior easy to test.
"""
from dataclasses import dataclass
from typing import List, Optional
import math

from ocra.analysis.movement_event import MovementEvent


class MovementCounter:
    def __init__(
        self,
        threshold: float = 0.5,
        hysteresis: float = 0.1,
        min_duration: float = 0.05,
    ):
        """Create a MovementCounter.

        threshold: value above which a movement is considered started.
        hysteresis: amount subtracted from threshold to form the low threshold.
        min_duration: minimum duration (seconds) for a movement to be valid.
        """
        self.high = float(threshold)
        self.low = float(threshold - abs(hysteresis))
        if self.low < 0:
            self.low = 0.0
        self.min_duration = float(min_duration)

        self._state = "below"  # or 'above'
        self._first_ts: Optional[float] = None
        self._last_ts: Optional[float] = None
        self._start_ts: Optional[float] = None
        self._peak = -math.inf
        self._peak_ts: Optional[float] = None
        self._events: List[MovementEvent] = []

    def feed(self, timestamp: float, value: float) -> None:
        """Feed a single sample into the counter."""
        if self._first_ts is None:
            self._first_ts = timestamp
        self._last_ts = timestamp

        if self._state == "below":
            # detect rising edge
            if value >= self.high:
                self._state = "above"
                self._start_ts = timestamp
                self._peak = value
                self._peak_ts = timestamp
        else:  # above
            if value > self._peak:
                self._peak = value
                self._peak_ts = timestamp
            # detect falling edge using low threshold
            if value <= self.low:
                # potential movement completed
                end_ts = timestamp
                duration = end_ts - (self._start_ts or end_ts)
                if duration >= self.min_duration:
                    ev = MovementEvent(
                        start_time=self._start_ts or end_ts,
                        peak_time=self._peak_ts or (self._start_ts or end_ts),
                        end_time=end_ts,
                        amplitude=self._peak if self._peak != -math.inf else 0.0,
                    )
                    self._events.append(ev)
                # reset state
                self._state = "below"
                self._start_ts = None
                self._peak = -math.inf
                self._peak_ts = None

    def add_samples(self, samples: List[tuple]) -> None:
        """Feed an iterable of (timestamp, value) samples.

        timestamps must be increasing for sensible duration calculations.
        """
        for ts, val in samples:
            self.feed(float(ts), float(val))

    def complete(self) -> None:
        """Called when no more samples will be provided.

        Currently incomplete trailing movements are discarded (not counted).
        """
        # Nothing to do - we intentionally do not count incomplete movements
        # to avoid false positives when data stream was interrupted.
        return

    @property
    def events(self) -> List[MovementEvent]:
        return list(self._events)

    @property
    def count(self) -> int:
        return len(self._events)

    @property
    def duration(self) -> float:
        if self._first_ts is None or self._last_ts is None:
            return 0.0
        return float(self._last_ts - self._first_ts)
