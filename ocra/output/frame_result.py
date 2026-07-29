"""Structured output model for a single analyzed video frame.

This module defines FrameResult which encapsulates the analysis results
for a single frame in the pipeline. It is intentionally lightweight so
that downstream consumers (exporters, visualizers, metrics) can consume
a stable, typed object.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, Optional

from ocra.models.pose_frame import PoseFrame


@dataclass
class FrameResult:
    """Result of analyzing a single video frame.

    Attributes
    ----------
    frame_index:
        Index of the frame in the source video (0-based).
    timestamp:
        Timestamp of the frame in seconds.
    pose:
        The detected PoseFrame for this frame, or ``None`` if no pose was
        detected.
    angles:
        Mapping from a joint name (e.g. "left_elbow") to the computed angle
        in degrees, or ``None`` when the angle could not be computed.
    metadata:
        Optional dictionary for any extra information producers want to
        attach to the frame result (processing flags, confidence scores,
        provenance, etc.).
    """

    frame_index: int
    timestamp: float
    pose: Optional[PoseFrame]
    angles: Dict[str, Optional[float]] = field(default_factory=dict)
    metadata: Dict[str, object] = field(default_factory=dict)
