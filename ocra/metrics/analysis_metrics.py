"""Unified model for biomechanical analysis metrics.

Defines a compact, serializable container (dataclasses) that groups the
key metrics produced by the ocra.metrics extraction layer so they can be
persisted, exchanged or fed into reporting tools later.

Important: this module does NOT compute the metrics itself — it only holds
results produced by the metric extraction functions.
"""
from dataclasses import dataclass, field
from typing import Optional, Dict, Any


@dataclass
class SegmentMetrics:
    """Metrics that are relevant for a single body segment or joint group.

    Fields:
    - accumulated_time: total seconds spent in the monitored condition
    - percent_time: percentage of the observed time spent in the condition
    - number_of_episodes: number of continuous episodes detected
    - max_continuous_duration: longest continuous episode (seconds)
    - frequency_per_minute: actions per minute when applicable (None otherwise)
    """
    accumulated_time: float = 0.0
    percent_time: float = 0.0
    number_of_episodes: int = 0
    max_continuous_duration: float = 0.0
    frequency_per_minute: Optional[float] = None


@dataclass
class AnalysisMetrics:
    """Top-level container for a biomechanical analysis.

    The dataclass groups general analysis metadata and per-region metrics. It
    is intentionally permissive and lightweight so callers can populate only
    the fields relevant for a particular analysis.
    """
    # general analysis information
    analysis_id: Optional[str] = None
    subject_id: Optional[str] = None
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    duration: Optional[float] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    # per-region metrics
    right_upper_limb: SegmentMetrics = field(default_factory=SegmentMetrics)
    left_upper_limb: SegmentMetrics = field(default_factory=SegmentMetrics)
    trunk: SegmentMetrics = field(default_factory=SegmentMetrics)
    neck: SegmentMetrics = field(default_factory=SegmentMetrics)
    head: SegmentMetrics = field(default_factory=SegmentMetrics)
    knees: SegmentMetrics = field(default_factory=SegmentMetrics)
    ankles: SegmentMetrics = field(default_factory=SegmentMetrics)

    def as_dict(self) -> Dict[str, Any]:
        """Return a plain dict representation useful for serialization.

        Note: keeps the structure shallow and converts dataclasses to dicts.
        """
        def seg_to_dict(seg: SegmentMetrics) -> Dict[str, Any]:
            return {
                "accumulated_time": seg.accumulated_time,
                "percent_time": seg.percent_time,
                "number_of_episodes": seg.number_of_episodes,
                "max_continuous_duration": seg.max_continuous_duration,
                "frequency_per_minute": seg.frequency_per_minute,
            }

        return {
            "analysis_id": self.analysis_id,
            "subject_id": self.subject_id,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration": self.duration,
            "metadata": dict(self.metadata),
            "right_upper_limb": seg_to_dict(self.right_upper_limb),
            "left_upper_limb": seg_to_dict(self.left_upper_limb),
            "trunk": seg_to_dict(self.trunk),
            "neck": seg_to_dict(self.neck),
            "head": seg_to_dict(self.head),
            "knees": seg_to_dict(self.knees),
            "ankles": seg_to_dict(self.ankles),
        }
