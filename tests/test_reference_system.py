from ocra.geometry.reference_system import ReferenceSystem
from ocra.models.landmark import Landmark
import math


def _make_landmark(id, x, y, z, confidence=90.0, valid=True, reason=None):
    return Landmark(id=id, x=float(x), y=float(y), z=float(z), visibility=1.0, valid=valid, confidence=float(confidence), reason=reason, source="test")


def _vec_len(v):
    return math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])


def _dot(a, b):
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]


def _cross(a, b):
    return (
        a[1]*b[2] - a[2]*b[1],
        a[2]*b[0] - a[0]*b[2],
        a[0]*b[1] - a[1]*b[0],
    )


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

    # matrix orthonormality: scalar triple product magnitude should be ~1 (right-handed or left-handed)
    triple = _dot(x_axis, _cross(y_axis, z_axis))
    assert abs(abs(triple) - 1.0) < 1e-6, "Basis is not orthonormal (determinant magnitude != 1)"

    # transform hip_center -> local origin
    assert rs.transform_to_local(hc) == (0.0, 0.0, 0.0)

    # Consistency: reconstruct a world point from the origin + linear combination of the declared local axes
    # then transforming it back must recover the same coefficients. This checks transform and axes are consistent
    coeffs = (0.5, -1.2, 2.0)
    world_point = (
        hc[0] + coeffs[0] * x_axis[0] + coeffs[1] * y_axis[0] + coeffs[2] * z_axis[0],
        hc[1] + coeffs[0] * x_axis[1] + coeffs[1] * y_axis[1] + coeffs[2] * z_axis[1],
        hc[2] + coeffs[0] * x_axis[2] + coeffs[1] * y_axis[2] + coeffs[2] * z_axis[2],
    )

    lx, ly, lz = rs.transform_to_local(world_point)
    assert math.isclose(lx, coeffs[0], rel_tol=1e-6, abs_tol=1e-6)
    assert math.isclose(ly, coeffs[1], rel_tol=1e-6, abs_tol=1e-6)
    assert math.isclose(lz, coeffs[2], rel_tol=1e-6, abs_tol=1e-6)

    # Continuity: small perturbations produce small changes in local coordinates
    eps = 1e-4
    pert_world = (world_point[0] + eps, world_point[1] - eps, world_point[2] + eps)
    lx2, ly2, lz2 = rs.transform_to_local(pert_world)
    # difference between transformed points should be small and of the same order as eps
    assert abs(lx2 - lx) < 1e-2 and abs(ly2 - ly) < 1e-2 and abs(lz2 - lz) < 1e-2

    # Sensitivity: small change in shoulder position should change local axes (detect orientation changes)
    pert_left_sh = _make_landmark(11, -0.5, 1.0, -0.2)  # move anterior -> posterior flip on z
    rs2 = ReferenceSystem(left_hip, right_hip, pert_left_sh, right_sh)
    assert rs2.is_valid()
    x2, y2, z2 = rs2.local_axes()
    # axes should not be numerically identical
    def axes_equal(a, b):
        return abs(a[0]-b[0])<1e-9 and abs(a[1]-b[1])<1e-9 and abs(a[2]-b[2])<1e-9
    assert not axes_equal(x_axis, x2) or not axes_equal(y_axis, y2) or not axes_equal(z_axis, z2), "Changing shoulder orientation must change local axes"
