from ocra.geometry.reference_system import ReferenceSystem
from ocra.models.landmark import Landmark
import math


def _make_landmark(id, x, y, z, confidence=90.0, valid=True, reason=None):
    return Landmark(id=id, x=float(x), y=float(y), z=float(z), visibility=1.0, valid=valid, confidence=float(confidence), reason=reason, source="test")


def _vec_len(v):
    return math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])


def _dot(a, b):
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]


def test_reference_system_orthonormal_and_axes():
    # synthetic landmarks: place hips at (-1,0,0) and (1,0,0) so hip_center=(0,0,0)
    left_hip = _make_landmark(23, -1.0, 0.0, 0.0)
    right_hip = _make_landmark(24, 1.0, 0.0, 0.0)
    # shoulders above hips and slightly anterior
    left_sh = _make_landmark(11, -0.5, 1.0, 0.2)
    right_sh = _make_landmark(12, 0.5, 1.0, 0.2)

    rs = ReferenceSystem(left_hip, right_hip, left_sh, right_sh)
    assert rs.is_valid(), "ReferenceSystem should be valid for these synthetic landmarks"

    # origin equals pelvis midpoint
    hc = rs.hip_center
    assert hc == (0.0, 0.0, 0.0)

    # axes are unit length (orthonormal)
    x_axis, y_axis, z_axis = rs.local_axes()
    assert x_axis is not None and y_axis is not None and z_axis is not None

    # unit length
    assert abs(_vec_len(x_axis) - 1.0) < 1e-6, "X axis not unit length"
    assert abs(_vec_len(y_axis) - 1.0) < 1e-6, "Y axis not unit length"
    assert abs(_vec_len(z_axis) - 1.0) < 1e-6, "Z axis not unit length"

    # perpendicularity
    assert abs(_dot(x_axis, y_axis)) < 1e-6, "X and Y axes are not perpendicular"
    assert abs(_dot(x_axis, z_axis)) < 1e-6, "X and Z axes are not perpendicular"
    assert abs(_dot(y_axis, z_axis)) < 1e-6, "Y and Z axes are not perpendicular"

    # transform hip_center -> local origin
    assert rs.transform_to_local(hc) == (0.0, 0.0, 0.0)

    # test directionality: a point to the right should map to positive local X
    world_right = (0.5, 0.0, 0.0)
    lx, ly, lz = rs.transform_to_local(world_right)
    assert lx > 0.0, "Local X should be positive for a point to the world's right"

    # a point above should map to positive local Y (cranial)
    world_up = (0.0, 1.0, 0.0)
    lx, ly, lz = rs.transform_to_local(world_up)
    assert ly > 0.0, "Local Y should be positive for a point above (cranial)"

    # a point in front should map to positive local Z (anterior)
    world_front = (0.0, 0.0, 1.0)
    lx, ly, lz = rs.transform_to_local(world_front)
    assert lz > 0.0, "Local Z should be positive for a point anterior to the pelvis"

    # Sensitivity: small change in shoulder position should change local axes (detect orientation changes)
    pert_left_sh = _make_landmark(11, -0.5, 1.0, -0.2)  # move anterior -> posterior flip on z
    rs2 = ReferenceSystem(left_hip, right_hip, pert_left_sh, right_sh)
    assert rs2.is_valid()
    x2, y2, z2 = rs2.local_axes()
    # axes should not be numerically identical
    def axes_equal(a, b):
        return abs(a[0]-b[0])<1e-9 and abs(a[1]-b[1])<1e-9 and abs(a[2]-b[2])<1e-9
    assert not axes_equal(x_axis, x2) or not axes_equal(y_axis, y2) or not axes_equal(z_axis, z2), "Changing shoulder orientation must change local axes"
