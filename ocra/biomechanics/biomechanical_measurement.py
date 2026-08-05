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
    - side: body side ("left", "right", "center") when applicable
    - body_region: anatomical region ("upper_limb", "trunk", "neck", ...)
    - frame_index: frame where the measurement was calculated
    - timestamp: time in seconds
    - valid: follows project policy (do not drop data)
    - confidence: confidence of the measurement (0..100)
    - reason: reason when invalid
    - calculation_method: textual description of the geometric algorithm used
    """

    # Measurement identification
    name: str

    # Measurement value
    value: float
    unit: str
    category: Optional[str] = None

    # Anatomical information
    side: Optional[str] = None
    body_region: Optional[str] = None

    # Temporal information
    frame_index: Optional[int] = None
    timestamp: Optional[float] = None

    # Quality information
    valid: bool = True
    confidence: Optional[float] = None
    reason: Optional[str] = None

    # Metadata
    calculation_method: Optional[str] = None
