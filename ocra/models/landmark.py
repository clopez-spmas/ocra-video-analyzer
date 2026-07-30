from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class Landmark:
    """
    Represents a body landmark detected in a frame.

    Backwards-compatible extension: we add optional metadata fields used by the
    ingestion layer to record validity and provenance without breaking existing
    call sites that construct Landmark(id, x, y, z, visibility).
    """

    id: int
    x: float
    y: float
    z: float
    visibility: float

    # Optional metadata (defaults preserve backwards compatibility)
    valid: bool = True
    confidence: Optional[float] = None
    reason: Optional[str] = None
    source: Optional[str] = None
