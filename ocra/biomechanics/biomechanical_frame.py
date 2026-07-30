from dataclasses import dataclass
from typing import Dict, List

from ocra.models.pose_frame import PoseFrame
from ocra.biomechanics.biomechanical_measurement import BiomechanicalMeasurement


@dataclass
class BiomechanicalFrame:
    """Collection of BiomechanicalMeasurements associated to a PoseFrame."""

    frame_index: int
    timestamp: float
    measurements: Dict[str, BiomechanicalMeasurement]
    source_pose_frame: PoseFrame

    def as_list(self) -> List[BiomechanicalMeasurement]:
        return list(self.measurements.values())

    def get(self, name: str) -> BiomechanicalMeasurement | None:
        return self.measurements.get(name)
