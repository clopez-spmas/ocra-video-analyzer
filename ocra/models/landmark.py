from dataclasses import dataclass


@dataclass(frozen=True)
class Landmark:
    """
    Represents a body landmark detected in a frame.
    """

    id: int
    x: float
    y: float
    z: float
    visibility: float
