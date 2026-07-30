from dataclasses import dataclass
from typing import Optional


@dataclass
class BiomechanicalMeasurement:
    """A single biomechanical measurement.

    Fields:
    - name: unique name of the measurement (e.g., "elbow_flexion_left")
    - value: numeric value (e.g., degrees)
    - unit: unit string (e.g., "deg")
    - category: nominal category label (e.g., 'neutral', 'leve') or None if unclassified
    - valid: bool — follows project policy (do not drop data)
    - confidence: Optional[float] (0..100) when valid
    - reason: Optional[str] — reason when invalid
    """

    name: str
    value: float
    unit: str
    category: Optional[str]
    valid: bool = True
    confidence: Optional[float] = None
    reason: Optional[str] = None
