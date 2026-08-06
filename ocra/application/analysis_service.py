"""
High-level analysis service.

Coordinates the complete biomechanical analysis workflow without modifying
the existing pipeline or analysis modules.

Responsibilities
----------------
- Execute the biomechanical pipeline.
- Collect BiomechanicalFrames.
- Run posture analysis.
- Return all generated information.

This module contains NO biomechanical calculations.
It only orchestrates existing components.
"""

from __future__ import annotations

from pathlib import Path
from typing import Dict, List

from ocra.pipeline_biomechanics import BiomechanicalPipeline
from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame
from ocra.analysis.posture_analyzer import (
    PostureAnalyzer,
    PostureResult,
)


class AnalysisService:
    """
    High-level application service.

    Executes the complete biomechanical workflow while keeping all
    existing modules independent.
    """

    def __init__(self) -> None:

        self.pipeline = BiomechanicalPipeline()

        self.posture_analyzer = PostureAnalyzer()

    def analyze_video(
        self,
        video_path: str | Path,
        posture_thresholds: Dict[str, float] | None = None,
    ) -> Dict:

        biomechanical_frames: List[BiomechanicalFrame] = []

        for frame in self.pipeline.analyze(video_path):

            if frame is not None:
                biomechanical_frames.append(frame)

        posture_results: Dict[str, PostureResult] = {}

        if posture_thresholds:

            posture_results = self.posture_analyzer.analyze_many(
                biomechanical_frames,
                posture_thresholds,
            )

        return {

            "biomechanical_frames": biomechanical_frames,

            "posture_results": posture_results,

        }

    def close(self) -> None:

        self.pipeline.close()
