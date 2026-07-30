"""Plane definitions and projection utilities.

Provides the canonical anatomical planes (sagittal, frontal, transverse) based
on a ReferenceSystem instance and functions to project vectors onto those planes.
"""
from __future__ import annotations
from typing import Optional, Tuple

from ocra.geometry.vector import Vector, to_vector, dot, subtract, cross, normalize
from ocra.geometry.reference_system import ReferenceSystem

Vector3 = Tuple[float, float, float]


def sagittal_plane_normal_from_ref(rs: ReferenceSystem) -> Optional[Vector3]:
    """Return normal vector of sagittal plane (mediolateral axis) in world coords."""
    if not rs.is_valid():
        return None
    return rs.y


def frontal_plane_normal_from_ref(rs: ReferenceSystem) -> Optional[Vector3]:
    """Return normal vector of frontal plane (anterior-posterior axis)."""
    if not rs.is_valid():
        return None
    return rs.x


def transverse_plane_normal_from_ref(rs: ReferenceSystem) -> Optional[Vector3]:
    """Return normal vector of transverse plane (superior-inferior axis)."""
    if not rs.is_valid():
        return None
    return rs.z


def project_vector_to_plane(vec: Vector3, plane_normal: Vector3) -> Vector3:
    """Project vec onto plane defined by plane_normal (both in world coords)."""
    # v_proj = v - (v·n) n
    n = normalize(plane_normal)
    v = to_vector(vec)
    v_dot_n = dot(v, n)
    proj = (v[0] - v_dot_n * n[0], v[1] - v_dot_n * n[1], v[2] - v_dot_n * n[2])
    return proj
