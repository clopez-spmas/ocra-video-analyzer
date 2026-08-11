"""Unit tests for ocra.geometry package."""
import math

from ocra.geometry.vector import (
    angle_between_degrees,
    to_vector,
    dot,
    cross,
    norm,
)
from ocra.geometry.angles import (
    angle_between_vectors,
    angle_at_point,
    angle_in_plane,
)
from ocra.models.landmark import Landmark


def approx(a, b, tol=1e-6):
    return abs(a - b) <= tol


def test_angle_between_vectors_known_angles():
    v_x = (1.0, 0.0, 0.0)
    # 30 degrees
    v_30 = (math.cos(math.radians(30)), math.sin(math.radians(30)), 0.0)
    a, valid, conf, reason = angle_between_vectors(v_x, v_30)
    assert valid
    assert approx(a, 30.0, tol=1e-6)

    # 45 degrees
    v_45 = (math.cos(math.radians(45)), math.sin(math.radians(45)), 0.0)
    a2, valid2, _, _ = angle_between_vectors(v_x, v_45)
    assert valid2
    assert approx(a2, 45.0, tol=1e-6)

    # 90 degrees
    v_y = (0.0, 1.0, 0.0)
    a3, valid3, _, _ = angle_between_vectors(v_x, v_y)
    assert valid3
    assert approx(a3, 90.0, tol=1e-6)

    # 180 degrees
    v_mx = (-1.0, 0.0, 0.0)
    a4, valid4, _, _ = angle_between_vectors(v_x, v_mx)
    assert valid4
    assert approx(a4, 180.0, tol=1e-6)


def test_angle_at_point_simple():
    # Right angle at origin between (0,1,0) - (0,0,0) - (1,0,0)
    A = (0.0, 1.0, 0.0)
    B = (0.0, 0.0, 0.0)
    C = (1.0, 0.0, 0.0)
    ang, valid, _, _ = angle_at_point(A, B, C)
    assert valid
    assert approx(ang, 90.0, tol=1e-6)

    # Straight line (180)
    A2 = (-1.0, 0.0, 0.0)
    B2 = (0.0, 0.0, 0.0)
    C2 = (1.0, 0.0, 0.0)
    ang2, valid2, _, _ = angle_at_point(A2, B2, C2)
    assert valid2
    assert approx(ang2, 180.0, tol=1e-6)


def test_angle_in_plane_and_landmark_confidence():
    # Use Landmarks with confidence
    lm1 = Landmark(id=1, x=1.0, y=0.0, z=0.0, visibility=1.0, valid=True, confidence=80.0, reason=None, source="test")
    lm2 = Landmark(id=2, x=0.0, y=0.0, z=0.0, visibility=1.0, valid=True, confidence=90.0, reason=None, source="test")
    lm3 = Landmark(id=3, x=0.0, y=1.0, z=0.0, visibility=1.0, valid=True, confidence=85.0, reason=None, source="test")

    # angle at lm2 between lm1-lm2-lm3 is 90deg
    ang, valid, conf, reason = angle_at_point(lm1, lm2, lm3)
    assert valid
    assert approx(ang, 90.0, tol=1e-6)
    # confidence should be min of 80,90,85 -> 80
    assert conf == 80.0

    # If one landmark invalid, propagate invalid
    lm_bad = Landmark(id=4, x=0.0, y=0.0, z=0.0, visibility=0.0, valid=False, confidence=None, reason="occluded", source="test")
    ang2, valid2, conf2, reason2 = angle_at_point(lm1, lm_bad, lm3)
    assert not valid2
    assert reason2 == "occluded"

    # angle in plane using explicit plane normal
    plane_normal = (0.0, 0.0, 1.0)  # XY plane
    ang3, valid3, conf3, r3 = angle_in_plane(lm1, lm2, lm3, plane_normal)
    assert valid3
    assert approx(ang3, 90.0, tol=1e-6)
    assert conf3 == 80.0
