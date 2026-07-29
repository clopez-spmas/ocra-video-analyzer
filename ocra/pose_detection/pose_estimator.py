"""
Pose estimation module using MediaPipe.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

import cv2
import mediapipe as mp
import numpy as np


@dataclass
class Landmark:
    id: int
    x: float
    y: float
    z: float
    visibility: float


class PoseEstimator:
    """
    Wrapper around MediaPipe Pose.
    """

    def __init__(
        self,
        model_complexity: int = 1,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
    ):

        self._mp_pose = mp.solutions.pose

        self.pose = self._mp_pose.Pose(
            static_image_mode=False,
            model_complexity=model_complexity,
            smooth_landmarks=True,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )

    def estimate(self, frame: np.ndarray) -> Optional[List[Landmark]]:
        """
        Estimate body landmarks from a frame.
        """

        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        result = self.pose.process(rgb)

        if result.pose_landmarks is None:
            return None

        landmarks = []

        for idx, lm in enumerate(result.pose_landmarks.landmark):

            landmarks.append(
                Landmark(
                    id=idx,
                    x=lm.x,
                    y=lm.y,
                    z=lm.z,
                    visibility=lm.visibility,
                )
            )

        return landmarks

    def close(self):
        self.pose.close()
