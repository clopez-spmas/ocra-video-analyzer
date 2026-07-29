"""
Main pipeline for OCRA Video Analyzer.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterator, Dict, Optional

from ocra.video.video_loader import VideoLoader
from ocra.pose_detection.pose_estimator import PoseEstimator
from ocra.models.pose_frame import PoseFrame
from ocra.kinematics import JointAngleCalculator
from ocra.output import FrameResult


class OcraPipeline:
    """
    Coordinates the video analysis workflow.
    """

    def __init__(self) -> None:
        self.pose_estimator = PoseEstimator()

    def analyze(
        self,
        video_path: str | Path,
    ) -> Iterator[Optional[FrameResult]]:
        """
        Analyze a video and yield a FrameResult for each frame.

        Parameters
        ----------
        video_path:
            Path to the input video.

        Yields
        ------
        Optional[FrameResult]
            For each frame, yields a FrameResult containing the detected
            PoseFrame (or None) and a mapping of computed joint angles, or
            yields None if no pose was detected for that frame.
        """

        loader = VideoLoader(video_path)

        try:
            for frame_index, frame in enumerate(loader.frames()):
                timestamp = frame_index / loader.fps if loader.fps else 0.0
                pose = self.pose_estimator.estimate(
                    frame, frame_index=frame_index, timestamp=timestamp
                )

                if pose is None:
                    # Yield a FrameResult with no pose to keep the stream stable
                    yield FrameResult(frame_index=frame_index, timestamp=timestamp, pose=None, angles={})
                    continue

                # Example joint angle calculations (MediaPipe landmark indices):
                # left_elbow: shoulder(11) - elbow(13) - wrist(15)
                # right_elbow: shoulder(12) - elbow(14) - wrist(16)
                # left_shoulder: elbow(13) - shoulder(11) - hip(23)
                # right_shoulder: elbow(14) - shoulder(12) - hip(24)
                # left_wrist: elbow(13) - wrist(15) - index(17)
                # right_wrist: elbow(14) - wrist(16) - index(18)
                angles: Dict[str, Optional[float]] = {}

                angles["left_elbow"] = JointAngleCalculator.from_pose(
                    pose, 11, 13, 15
                )
                angles["right_elbow"] = JointAngleCalculator.from_pose(
                    pose, 12, 14, 16
                )

                angles["left_shoulder"] = JointAngleCalculator.shoulder_from_pose(
                    pose, shoulder_idx=11, elbow_idx=13, hip_idx=23
                )
                angles["right_shoulder"] = JointAngleCalculator.shoulder_from_pose(
                    pose, shoulder_idx=12, elbow_idx=14, hip_idx=24
                )

                angles["left_wrist"] = JointAngleCalculator.wrist_from_pose(
                    pose, wrist_idx=15, elbow_idx=13, index_idx=17
                )
                angles["right_wrist"] = JointAngleCalculator.wrist_from_pose(
                    pose, wrist_idx=16, elbow_idx=14, index_idx=18
                )

                yield FrameResult(frame_index=frame_index, timestamp=timestamp, pose=pose, angles=angles)
        finally:
            loader.release()

    def close(self) -> None:
        """
        Release all allocated resources.
        """
        self.pose_estimator.close()
