"""
Biomechanical analysis pipeline for OCRA Video Analyzer.

This pipeline extends the basic pipeline by producing BiomechanicalFrame
objects instead of FrameResult objects.

It does not modify the existing OcraPipeline and can coexist with it.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterator, Optional

from ocra.video.video_loader import VideoLoader
from ocra.pose_detection.pose_estimator import PoseEstimator
from ocra.biomechanics.biomechanical_analyzer import BiomechanicalAnalyzer
from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame


class BiomechanicalPipeline:
    """
    Pipeline dedicated to biomechanical analysis.

    Workflow:

        Video
          ↓
        PoseEstimator
          ↓
        PoseFrame
          ↓
        BiomechanicalAnalyzer
          ↓
        BiomechanicalFrame
    """

    def __init__(self) -> None:
        self.pose_estimator = PoseEstimator()
        self.biomechanical_analyzer = BiomechanicalAnalyzer()

    def analyze(
        self,
        video_path: str | Path,
    ) -> Iterator[Optional[BiomechanicalFrame]]:
        """
        Analyze a video and yield one BiomechanicalFrame per video frame.
        """

        loader = VideoLoader(video_path)

        try:
            for frame_index, frame in enumerate(loader.frames()):

                timestamp = (
                    frame_index / loader.fps
                    if loader.fps
                    else 0.0
                )

                pose = self.pose_estimator.estimate(
                    frame,
                    frame_index=frame_index,
                    timestamp=timestamp,
                )

                if pose is None:
                    yield None
                    continue

                biomechanical_frame = self.biomechanical_analyzer.analyze(
                    pose
                )

                yield biomechanical_frame

        finally:
            loader.release()

    def close(self) -> None:
        """
        Release allocated resources.
        """
        self.pose_estimator.close()
