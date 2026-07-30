from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Dict, Any

from ocra.models.pose_frame import PoseFrame
from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame


@dataclass
class AnalysisResult:
    """Minimal container produced by the AnalysisPipeline.

    Fields:
    - pose_frames: original list of PoseFrame produced by the ingestion layer.
    - biomechanical_frames: list of BiomechanicalFrame produced by the analyzer,
      one-to-one with pose_frames (no frames removed).
    - metadata: arbitrary dictionary (tracking_path, video_path, counts, etc.).

    This object intentionally contains NO metrics, NO scores and NO normative
    evaluations. Those are computed by separate modules that consume
    AnalysisResult.
    """

    pose_frames: List[PoseFrame]
    biomechanical_frames: List[BiomechanicalFrame]
    metadata: Dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> Dict[str, Any]:
        return {
            "metadata": dict(self.metadata),
            "num_pose_frames": len(self.pose_frames),
            "num_biomechanical_frames": len(self.biomechanical_frames),
        }
