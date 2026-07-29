"""
Main pipeline for OCRA Video Analyzer.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterator, List, Optional

from ocra.video.video_loader import VideoLoader
from ocra.pose_detection.pose_estimator import PoseEstimator
from ocra.models.pose_frame import PoseFrame


class OcraPipeline:
    """
    Coordinates the video analysis workflow.
    """

    def __init__(self) -> None:
        self.pose_estimator = PoseEstimator()

    def analyze(
        self,
        video_path: str | Path,
    ) -> Iterator[Optional[PoseFrame]]:
        """
        Analyze a video and yield detected PoseFrame for each frame.

        Parameters
        ----------
        video_path:
            Path to the input video.

        Yields
        ------
        Optional[PoseFrame]
            PoseFrame for each frame, or None if no pose is detected.
        """

        loader = VideoLoader(video_path)

        try:
            for frame_index, frame in enumerate(loader.frames()):
                timestamp = frame_index / loader.fps if loader.fps else 0.0
                yield self.pose_estimator.estimate(
                    frame, frame_index=frame_index, timestamp=timestamp
                )
        finally:
            loader.release()

    def close(self) -> None:
        """
        Release all allocated resources.
        """
        self.pose_estimator.close()
