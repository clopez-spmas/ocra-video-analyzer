from dataclasses import dataclass
from typing import Dict

from ocra.models.landmark import Landmark


@dataclass
class PoseFrame:
    """
    Represents all detected landmarks for a single video frame.
    """

    frame_index: int
    timestamp: float
    landmarks: Dict[int, Landmark]

    def get(self, landmark_id: int) -> Landmark | None:
        """
        Returns the requested landmark or None if it does not exist.
        """
        return self.landmarks.get(landmark_id)
