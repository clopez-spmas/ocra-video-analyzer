"""Angle computation helpers (pure geometry).

Each function returns a tuple: (angle_degrees, valid, confidence, reason)
- angle_degrees: float (0..180) when valid True, otherwise 0.0
- valid: bool indicating whether the calculation is trustworthy
- confidence: Optional[float] (0..100) when calculable from input landmarks; None otherwise
- reason: Optional[str] describing why invalid when valid == False

The functions accept ocra.models.landmark.Landmark instances or raw vectors/iterables
for convenience. Confidence is conservatively combined using the minimum of
input confidences when available.
"""
from __future__ import annotations

from typing import Any, Iterable, Optional, Tuple
import math

from ocra.models.landmark import Landmark
from ocra.geometry.vector import (
    to_vector,
    subtract,
    angle_between_degrees,
    normalize,
    norm,
)
from ocra.geometry.planes import project_vector_to_plane, sagittal_plane_normal_from_ref, frontal_plane_normal_from_ref, transverse_plane_normal_from_ref
from ocra.geometry.reference_system import ReferenceSystem


def _extract_valid_and_confidence(objs: Iterable[Any]) -> Tuple[bool, Optional[float], Optional[str]]:
    """Return (all_valid, confidence, reason).

    confidence is the minimum of provided confidences (0..100) when present.
    If any object is a Landmark with valid==False, returns valid False and
    its reason (first encountered).
    """
    min_conf: Optional[float] = None
    reason: Optional[str] = None
    for o in objs:
        if isinstance(o, Landmark):
            if not getattr(o, "valid", True):
                return False, None, getattr(o, "reason", "invalid_landmark")
            conf = getattr(o, "confidence", None)
            if conf is not None:
                try:
                    cval = float(conf)
                    if min_conf is None or cval < min_conf:
                        min_conf = cval
                except Exception:
                    pass
    return True, min_conf, None


def angle_between_vectors(a: Any, b: Any) -> Tuple[float, bool, Optional[float], Optional[str]]:
    """Compute angle between two vectors or landmarks (0..180 degrees).

    Returns (angle_deg, valid, confidence, reason)
    """
    # extract validity/conf from landmarks if present
    all_valid, conf, reason = _extract_valid_and_confidence((a, b))
    if not all_valid:
        return 0.0, False, conf, reason
    try:
        va = to_vector(a)
        vb = to_vector(b)
        # check zero-length
        if norm(va) == 0.0 or norm(vb) == 0.0:
            return 0.0, False, None, "zero_length_vector"
        ang = angle_between_degrees(va, vb)
        return float(ang), True, conf, None
    except ValueError as e:
        return 0.0, False, None, "zero_length_vector"
    except Exception:
        return 0.0, False, None, "calculation_error"


def angle_at_point(a: Any, b: Any, c: Any) -> Tuple[float, bool, Optional[float], Optional[str]]:
    """Compute angle at point b between BA and BC (triplet A-B-C).

    Accepts Landmark or vector-like inputs.
    """
    all_valid, conf, reason = _extract_valid_and_confidence((a, b, c))
    if not all_valid:
        return 0.0, False, conf, reason
    try:
        va = to_vector(a)
        vb = to_vector(b)
        vc = to_vector(c)
        ba = subtract(va, vb)
        bc = subtract(vc, vb)
        if norm(ba) == 0.0 or norm(bc) == 0.0:
            return 0.0, False, None, "zero_length_vector"
        ang = angle_between_degrees(ba, bc)
        return float(ang), True, conf, None
    except ValueError:
        return 0.0, False, None, "zero_length_vector"
    except Exception:
        return 0.0, False, None, "calculation_error"


def angle_in_plane(a: Any, b: Any, c: Any, plane_normal: Any) -> Tuple[float, bool, Optional[float], Optional[str]]:
    """Compute angle at B between BA and BC after projecting onto the plane with normal plane_normal.

    plane_normal may be a vector or Landmark. Returns same tuple format.
    """
    all_valid, conf, reason = _extract_valid_and_confidence((a, b, c, plane_normal))
    if not all_valid:
        return 0.0, False, conf, reason
    try:
        va = to_vector(a)
        vb = to_vector(b)
        vc = to_vector(c)
        pn = to_vector(plane_normal)
        ba = subtract(va, vb)
        bc = subtract(vc, vb)
        pba = project_vector_to_plane(ba, pn)
        pbc = project_vector_to_plane(bc, pn)
        if norm(pba) == 0.0 or norm(pbc) == 0.0:
            return 0.0, False, None, "zero_length_vector"
        ang = angle_between_degrees(pba, pbc)
        return float(ang), True, conf, None
    except ValueError:
        return 0.0, False, None, "zero_length_vector"
    except Exception:
        return 0.0, False, None, "calculation_error"


def angle_on_anatomical_plane(a: Any, b: Any, c: Any, ref: Optional[ReferenceSystem], plane: str) -> Tuple[float, bool, Optional[float], Optional[str]]:
    """Compute angle at B between BA and BC projected on anatomical plane ('sagittal','frontal','transverse').

    If ref is None or invalid, returns invalid.
    """
    if ref is None or not ref.is_valid():
        return 0.0, False, None, "invalid_reference_system"
    plane = plane.lower()
    if plane == "sagittal":
        pn = sagittal_plane_normal_from_ref(ref)
    elif plane == "frontal":
        pn = frontal_plane_normal_from_ref(ref)
    elif plane == "transverse" or plane == "horizontal":
        pn = transverse_plane_normal_from_ref(ref)
    else:
        return 0.0, False, None, "unknown_plane"
    if pn is None:
        return 0.0, False, None, "invalid_reference_system"
    return angle_in_plane(a, b, c, pn)
