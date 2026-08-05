from dataclasses import dataclass
from typing import Optional


@dataclass
class BiomechanicalMeasurement:
    """Represents a single biomechanical measurement.

    A measurement is the smallest unit of biomechanical information
    generated for a specific frame of a video.

    Examples:
        - Right shoulder flexion
        - Left elbow flexion
        - Trunk inclination
        - Neck flexion

    Attributes:
        id:
            Stable identifier of the measurement.

        definition_id:
            Identifier of the corresponding entry in measurement_catalog.py.

        name:
            Human-readable measurement name.

        value:
            Numeric value of the measurement.

        unit:
            Measurement unit (deg, mm, %, ...).

        category:
            Classification assigned according to the measurement definition.

        side:
            Body side ("left", "right", "center", or None).

        body_region:
            Anatomical region (upper_limb, trunk, neck, ...).

        frame_index:
            Frame where the measurement was calculated.

        timestamp:
            Time in seconds.

        valid:
            Indicates whether the measurement is considered valid.

        confidence:
            Confidence of the calculation (0–100).

        reason:
            Reason why the measurement is invalid, if applicable.

        calculation_method:
            Description of the algorithm used to calculate the measurement.
    """

    # ------------------------------------------------------------------
    # Identification
    # ------------------------------------------------------------------

    id: str
    definition_id: str
    name: str

    # ------------------------------------------------------------------
    # Measurement
    # ------------------------------------------------------------------

    value: float
    unit: str
    category: Optional[str] = None

    # ------------------------------------------------------------------
    # Anatomical information
    # ------------------------------------------------------------------

    side: Optional[str] = None
    body_region: Optional[str] = None

    # ------------------------------------------------------------------
    # Temporal information
    # ------------------------------------------------------------------

    frame_index: Optional[int] = None
    timestamp: Optional[float] = None

    # ------------------------------------------------------------------
    # Quality information
    # ------------------------------------------------------------------

    valid: bool = True
    confidence: Optional[float] = None
    reason: Optional[str] = None

    # ------------------------------------------------------------------
    # Metadata
    # ------------------------------------------------------------------

    calculation_method: Optional[str] = None
