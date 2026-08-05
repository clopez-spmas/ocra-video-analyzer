from dataclasses import dataclass, field
from typing import Dict, List, Optional

from ocra.models.pose_frame import PoseFrame
from ocra.biomechanics.biomechanical_measurement import BiomechanicalMeasurement


@dataclass
class BiomechanicalFrame:
    """Biomechanical data calculated for a single video frame.

    A BiomechanicalFrame contains all biomechanical measurements
    computed from one PoseFrame.
    """

    frame_index: int
    timestamp: float
    source_pose_frame: PoseFrame

    measurements: Dict[str, BiomechanicalMeasurement] = field(default_factory=dict)

    def as_list(self) -> List[BiomechanicalMeasurement]:
        """Return all measurements as a list."""
        return list(self.measurements.values())

    def get(self, measurement_id: str) -> Optional[BiomechanicalMeasurement]:
        """Return a measurement by its identifier."""
        return self.measurements.get(measurement_id)

    def add(self, measurement: BiomechanicalMeasurement) -> None:
        """Add or replace a measurement."""
        self.measurements[measurement.id] = measurement

    def keys(self):
        """Return measurement identifiers."""
        return self.measurements.keys()

    def values(self):
        """Return measurement objects."""
        return self.measurements.values()

    def items(self):
        """Return (id, measurement) pairs."""
        return self.measurements.items()

    def __contains__(self, measurement_id: str) -> bool:
        return measurement_id in self.measurements

    def __len__(self) -> int:
        return len(self.measurements)
