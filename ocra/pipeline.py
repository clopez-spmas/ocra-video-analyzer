"""
Main pipeline for OCRA Video Analyzer.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterator, List, Optional

from ocra.video.video_loader import VideoLoader
from ocra.pose_detection.pose_estimator import PoseEstimator, Landmark


class OcraPipeline:
    """
    Coordinates the video analysis workflow.
    """

    def __init__(self) -> None:
        self.pose_estimator = PoseEstimator()

    def analyze(
        self,
        video_path: str | Path,
    ) -> Iterator[Optional[List[Landmark]]]:
        """
        Analyze a video and yield detected landmarks for each frame.

        Parameters
        ----------
        video_path:
            Path to the input video.

        Yields
        ------
        Optional[List[Landmark]]
            Landmarks detected in each frame, or None if no pose is detected.
        """

        loader = VideoLoader(video_path)

        try:
            for frame in loader.frames():
                yield self.pose_estimator.estimate(frame)
        finally:
            loader.release()

    def close(self) -> None:
        """
        Release all allocated resources.
        """
        self.pose_estimator.close()
