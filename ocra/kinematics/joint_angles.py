"""
Joint angle calculation utilities.
"""

from __future__ import annotations

from math import acos, degrees
from typing import Optional

import numpy as np

from ocra.models.landmark import Landmark
from ocra.models.pose_frame import PoseFrame


class JointAngleCalculator:
    """
    Calculates joint angles from body landmarks.
    """

    @staticmethod
    def angle(
        a: Landmark,
        b: Landmark,
        c: Landmark,
    ) -> float:
        """
        Calculates the angle ABC in degrees.
        """

        ba = np.array([
            a.x - b.x,
            a.y - b.y,
            a.z - b.z,
        ])

        bc = np.array([
            c.x - b.x,
            c.y - b.y,
            c.z - b.z,
        ])

        norm_ba = np.linalg.norm(ba)
        norm_bc = np.linalg.norm(bc)

        if norm_ba == 0 or norm_bc == 0:
            return 0.0

        cosine = np.dot(ba, bc) / (norm_ba * norm_bc)
        cosine = np.clip(cosine, -1.0, 1.0)

        return degrees(acos(cosine))

    @staticmethod
    def from_pose(
        pose: PoseFrame,
        a: int,
        b: int,
        c: int,
    ) -> Optional[float]:
        """
        Calculates an angle from landmark identifiers.
        """

        la = pose.get(a)
        lb = pose.get(b)
        lc = pose.get(c)

        if la is None or lb is None or lc is None:
            return None

        return JointAngleCalculator.angle(
            la,
            lb,
            lc,
        )

    @staticmethod
    def shoulder_from_pose(
        pose: PoseFrame,
        shoulder_idx: int,
        elbow_idx: int,
        hip_idx: int,
    ) -> Optional[float]:
        """
        Convenience method to compute the shoulder angle (elbow - shoulder - hip).
        """
        return JointAngleCalculator.from_pose(pose, elbow_idx, shoulder_idx, hip_idx)

    @staticmethod
    def wrist_from_pose(
        pose: PoseFrame,
        wrist_idx: int,
        elbow_idx: int,
        index_idx: int,
    ) -> Optional[float]:
        """
        Convenience method to compute the wrist angle (elbow - wrist - index).
        """
        return JointAngleCalculator.from_pose(pose, elbow_idx, wrist_idx, index_idx)
