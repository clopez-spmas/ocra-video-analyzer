"""Vector utilities for 2D/3D operations without external deps."""
from __future__ import annotations

import math
from typing import Iterable, Tuple, Union

from ocra.models.landmark import Landmark

Vector = Tuple[float, float, float]


def to_vector(obj: Union[Landmark, Iterable[float]]) -> Vector:
    """Convert a Landmark or iterable to a 3D vector (x,y,z).

    If the iterable has only 2 elements, z is set to 0.0.
    """
    if isinstance(obj, Landmark):
        return (float(obj.x), float(obj.y), float(obj.z))
    vals = list(obj)
    if len(vals) == 2:
        return (float(vals[0]), float(vals[1]), 0.0)
    if len(vals) >= 3:
        return (float(vals[0]), float(vals[1]), float(vals[2]))
    raise ValueError("Cannot convert object to vector")


def dot(a: Vector, b: Vector) -> float:
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def cross(a: Vector, b: Vector) -> Vector:
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def norm(a: Vector) -> float:
    return math.sqrt(dot(a, a))


def normalize(a: Vector) -> Vector:
    n = norm(a)
    if n == 0.0:
        raise ValueError("zero-length vector")
    return (a[0] / n, a[1] / n, a[2] / n)


def subtract(a: Vector, b: Vector) -> Vector:
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def add(a: Vector, b: Vector) -> Vector:
    return (a[0] + b[0], a[1] + b[1], a[2] + b[2])


def scale(a: Vector, s: float) -> Vector:
    return (a[0] * s, a[1] * s, a[2] * s)


def angle_between(a: Vector, b: Vector) -> float:
    """Return the angle in radians between vectors a and b (0..pi).

    Raises ValueError for zero-length vectors.
    """
    na = norm(a)
    nb = norm(b)
    if na == 0.0 or nb == 0.0:
        raise ValueError("zero-length vector")
    cosv = dot(a, b) / (na * nb)
    # Clamp numerical noise
    cosv = max(-1.0, min(1.0, cosv))
    return math.acos(cosv)


def angle_between_degrees(a: Vector, b: Vector) -> float:
    return math.degrees(angle_between(a, b))
