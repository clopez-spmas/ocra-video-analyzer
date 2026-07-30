from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

from ocra.input.kinovea_json_provider import KinoveaJSONProvider
from ocra.biomechanics.biomechanical_analyzer import BiomechanicalAnalyzer
from ocra.analysis.analysis_result import AnalysisResult
from ocra.models.pose_frame import PoseFrame


class AnalysisPipeline:
    """Run a strictly modular biomechanical extraction flow.

    Contracts:
    - The pipeline only transforms Kinovea JSON -> PoseFrame -> BiomechanicalFrame -> AnalysisResult.
    - It does NOT compute metrics, frequencies, scores, or feed MovementManager.
    - It preserves all per-landmark and per-measurement metadata produced by the
      ingestion and analyzer layers (valid, confidence, reason, calculation_method).
    - The video_path is optional and stored only in metadata for external use.
    """

    def __init__(self) -> None:
        self.provider = KinoveaJSONProvider()
        self.analyzer = BiomechanicalAnalyzer()

    def run(self, tracking_path: str, video_path: Optional[str] = None) -> AnalysisResult:
        """Execute the extraction flow.

        Args:
            tracking_path: Path to the Kinovea JSON tracking export. The analysis
                MUST be runnable with this JSON alone.
            video_path: Optional path to the video file (kept only in metadata).

        Returns:
            AnalysisResult containing the original PoseFrames, the corresponding
            BiomechanicalFrames and a metadata dictionary. No metrics or
            ergonomic evaluations are performed here.
        """
        # 1) Load PoseFrame list from tracking JSON
        pose_frames: List[PoseFrame] = self.provider.load(tracking_path)

        # 2) Analyze each PoseFrame into a BiomechanicalFrame
        biomechanical_frames = []
        for pf in pose_frames:
            bf = self.analyzer.analyze_frame(pf)
            biomechanical_frames.append(bf)

        # 3) Build AnalysisResult (no metrics, no MovementManager use)
        metadata: Dict[str, Any] = {
            "tracking_path": tracking_path,
            "video_path": video_path,
            "num_pose_frames": len(pose_frames),
            "num_biomechanical_frames": len(biomechanical_frames),
        }

        return AnalysisResult(pose_frames=pose_frames, biomechanical_frames=biomechanical_frames, metadata=metadata)
