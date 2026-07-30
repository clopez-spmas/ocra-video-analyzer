"""Reference anatomical coordinate system builders.

Provides a simple ReferenceSystem class that defines a local orthonormal basis
from pelvis/shoulder landmarks. The class is intentionally minimal and
configurable: it does not hard-code anatomical conventions beyond computing a
stable basis when the required landmarks are available.

Note: precise anatomical conventions (e.g. which direction is +X) are kept
documented in the model spec; this module only offers a straightforward
implementation that callers may adopt or replace.
"""
from __future__ import annotations

from typing import Optional, Tuple

from ocra.models.landmark import Landmark
from ocra.geometry.vector import to_vector, normalize, subtract, cross

Vector = Tuple[float, float, float]


class ReferenceSystem:
    """Simple local reference system based on the pelvis (hip center) and shoulders.

    Required inputs (Landmarks): left_hip, right_hip, left_shoulder, right_shoulder.
    The origin is set at the hip center (midpoint). The mediolateral axis (y)
    is computed from right_hip -> left_hip. The superior axis (z) is computed
    approximately from hip_center -> shoulder_center. The anterior axis (x)
    is computed as cross(z, y) to obtain a right-handed orthonormal basis.

    If any input is missing or leads to degenerate vectors, the ReferenceSystem
    may be partially invalid (attributes set to None).
    """

    def __init__(
        self,
        left_hip: Landmark,
        right_hip: Landmark,
        left_shoulder: Landmark,
        right_shoulder: Landmark,
    ) -> None:
        self.left_hip = left_hip
        self.right_hip = right_hip
        self.left_shoulder = left_shoulder
        self.right_shoulder = right_shoulder

        # compute virtual centers
        lh = to_vector(left_hip)
        rh = to_vector(right_hip)
        ls = to_vector(left_shoulder)
        rs = to_vector(right_shoulder)

        self.hip_center = ((lh[0] + rh[0]) / 2.0, (lh[1] + rh[1]) / 2.0, (lh[2] + rh[2]) / 2.0)
        self.shoulder_center = ((ls[0] + rs[0]) / 2.0, (ls[1] + rs[1]) / 2.0, (ls[2] + rs[2]) / 2.0)

        # mediolateral axis: right -> left
        try:
            y_raw = subtract(lh, rh)
            self.y = normalize(y_raw)
        except Exception:
            self.y = None

        # superior axis approx: hip_center -> shoulder_center (upwards)
        try:
            z_raw = subtract(self.shoulder_center, self.hip_center)
            self.z = normalize(z_raw)
        except Exception:
            self.z = None

        # anterior axis: cross(z, y)
        try:
            if self.z is None or self.y is None:
                self.x = None
            else:
                cross_x = cross(self.z, self.y)
                self.x = normalize(cross_x)
        except Exception:
            self.x = None

    def is_valid(self) -> bool:
        return self.x is not None and self.y is not None and self.z is not None

    def transform_to_local(self, vec: Vector) -> Optional[Vector]:
        """Project a world vector (absolute coordinates) into the local basis.

        Returns coordinates in local (x,y,z) or None if basis invalid.
        """
        if not self.is_valid():
            return None
        # translate to origin
        v = (vec[0] - self.hip_center[0], vec[1] - self.hip_center[1], vec[2] - self.hip_center[2])
        # dot with basis
        lx = v[0] * self.x[0] + v[1] * self.x[1] + v[2] * self.x[2]
        ly = v[0] * self.y[0] + v[1] * self.y[1] + v[2] * self.y[2]
        lz = v[0] * self.z[0] + v[1] * self.z[1] + v[2] * self.z[2]
        return (lx, ly, lz)

    def local_axes(self) -> Tuple[Optional[Vector], Optional[Vector], Optional[Vector]]:
        return (self.x, self.y, self.z)
