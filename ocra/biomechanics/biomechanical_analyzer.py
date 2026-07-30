"""Biomechanical analyzer: converts PoseFrame -> BiomechanicalFrame using ocra.geometry.

This module respects the project's data integrity rules: it never deletes frames
or landmarks; it propagates valid/confidence/reason metadata; it does not
interpolate. Classification into categories is performed only when numeric
thresholds are defined (thresholds in measurement_catalog); otherwise the
measurement is produced with category=None and reason="Pendiente de definición: thresholds".

Virtual landmarks implemented here (mathematical formulas):
- V_HEAD_CENTER: computed as the average of NOSE, midpoint(LEFT_EYE, RIGHT_EYE) and midpoint(LEFT_EAR, RIGHT_EAR) when all are available. If some components are missing, fallback combinations are used:
    1) If NOSE + both eyes available -> average(NOSE, mid_eyes)
    2) If NOSE + both ears available -> average(NOSE, mid_ears)
    3) If both eyes + both ears available -> average(mid_eyes, mid_ears)
   Confidence is the minimum of available confidences; if any contributing landmark is invalid, the virtual point is invalid with the same reason.

- V_NECK_BASE: computed as midpoint between V_HEAD_CENTER and V_SHOULDER_CENTER when both are available. This places the neck base halfway between the cranial center and the shoulder midpoint — a pragmatic anatomical approximation. Confidence is the minimum of the two contributors.

These formulas are documented here and must be validated clinically; they represent the project's agreed initial decision for virtual landmark estimation.
"""
from __future__ import annotations

from typing import Dict, Optional, Tuple

from ocra.models.pose_frame import PoseFrame
from ocra.models.landmark import Landmark
from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame
from ocra.biomechanics.biomechanical_measurement import BiomechanicalMeasurement
from ocra.biomechanics.measurement_catalog import CATALOG
from ocra.geometry.angles import angle_at_point, angle_between_vectors
from ocra.geometry.reference_system import ReferenceSystem
from ocra.geometry.vector import to_vector


def _fetch_landmark(pf: PoseFrame, lid) -> Optional[Landmark]:
    if isinstance(lid, int):
        return pf.get(lid)
    # virtual ids are handled separately
    return None


def _compute_virtual_point(pf: PoseFrame, vid: str) -> Tuple[Optional[Tuple[float, float, float]], Optional[float], Optional[str]]:
    """Compute virtual landmarks used by the biomechanical analyzer.

    Supported virtuals implemented here:
    - V_HIP_CENTER: midpoint of LEFT_HIP (23) and RIGHT_HIP (24)
    - V_SHOULDER_CENTER: midpoint of LEFT_SHOULDER (11) and RIGHT_SHOULDER (12)
    - V_HEAD_CENTER: see module docstring for formula
    - V_NECK_BASE: midpoint of V_HEAD_CENTER and V_SHOULDER_CENTER

    Returns (vector or None, confidence_min or None, reason or None)
    """
    # HIP_CENTER and SHOULDER_CENTER implemented previously
    if vid == "V_HIP_CENTER":
        l = pf.get(23)
        r = pf.get(24)
        if l is None or r is None:
            return None, None, "landmarks_missing"
        if not getattr(l, "valid", True):
            return None, None, getattr(l, "reason", "landmarks_missing")
        if not getattr(r, "valid", True):
            return None, None, getattr(r, "reason", "landmarks_missing")
        v_l = to_vector(l)
        v_r = to_vector(r)
        vc = ((v_l[0] + v_r[0]) / 2.0, (v_l[1] + v_r[1]) / 2.0, (v_l[2] + v_r[2]) / 2.0)
        confs = [c for c in (getattr(l, "confidence", None), getattr(r, "confidence", None)) if c is not None]
        conf = min(confs) if confs else None
        return vc, conf, None

    if vid == "V_SHOULDER_CENTER":
        l = pf.get(11)
        r = pf.get(12)
        if l is None or r is None:
            return None, None, "landmarks_missing"
        if not getattr(l, "valid", True):
            return None, None, getattr(l, "reason", "landmarks_missing")
        if not getattr(r, "valid", True):
            return None, None, getattr(r, "reason", "landmarks_missing")
        v_l = to_vector(l)
        v_r = to_vector(r)
        vc = ((v_l[0] + v_r[0]) / 2.0, (v_l[1] + v_r[1]) / 2.0, (v_l[2] + v_r[2]) / 2.0)
        confs = [c for c in (getattr(l, "confidence", None), getattr(r, "confidence", None)) if c is not None]
        conf = min(confs) if confs else None
        return vc, conf, None

    if vid == "V_HEAD_CENTER":
        # attempt to compute robust head center from nose, eyes and ears
        nose = pf.get(0)
        leye = pf.get(2)
        reye = pf.get(5)
        lear = pf.get(7)
        rear = pf.get(8)

        # helper to check validity
        def valid_lm(lm: Optional[Landmark]) -> Tuple[bool, Optional[str]]:
            if lm is None:
                return False, None
            if not getattr(lm, "valid", True):
                return False, getattr(lm, "reason", "invalid_landmark")
            return True, None

        # collect available contributors
        contributors = []
        reasons = []
        # compute midpoints when both eyes/ears available
        mid_eyes = None
        if leye and reye:
            ok_l, r_l = valid_lm(leye)
            ok_r, r_r = valid_lm(reye)
            if not ok_l:
                return None, None, r_l
            if not ok_r:
                return None, None, r_r
            v_le = to_vector(leye)
            v_re = to_vector(reye)
            mid_eyes = ((v_le[0] + v_re[0]) / 2.0, (v_le[1] + v_re[1]) / 2.0, (v_le[2] + v_re[2]) / 2.0)

        mid_ears = None
        if lear and rear:
            ok_l, r_l = valid_lm(lear)
            ok_r, r_r = valid_lm(rear)
            if not ok_l:
                return None, None, r_l
            if not ok_r:
                return None, None, r_r
            v_le = to_vector(lear)
            v_re = to_vector(rear)
            mid_ears = ((v_le[0] + v_re[0]) / 2.0, (v_le[1] + v_re[1]) / 2.0, (v_le[2] + v_re[2]) / 2.0)

        # require at least two components among (nose, mid_eyes, mid_ears)
        components = []
        confs = []
        if nose:
            ok, rr = valid_lm(nose)
            if not ok:
                return None, None, rr
            components.append(to_vector(nose))
            if getattr(nose, "confidence", None) is not None:
                confs.append(nose.confidence)
        if mid_eyes is not None:
            components.append(mid_eyes)
            # collect confidences for eyes if present
            if leye and getattr(leye, "confidence", None) is not None:
                confs.append(leye.confidence)
            if reye and getattr(reye, "confidence", None) is not None:
                confs.append(reye.confidence)
        if mid_ears is not None:
            components.append(mid_ears)
            if lear and getattr(lear, "confidence", None) is not None:
                confs.append(lear.confidence)
            if rear and getattr(rear, "confidence", None) is not None:
                confs.append(rear.confidence)

        if len(components) < 2:
            return None, None, "landmarks_missing"

        # head center is average of available components
        sx = sum(c[0] for c in components) / len(components)
        sy = sum(c[1] for c in components) / len(components)
        sz = sum(c[2] for c in components) / len(components)
        conf = min(confs) if confs else None
        return (sx, sy, sz), conf, None

    if vid == "V_NECK_BASE":
        # need V_HEAD_CENTER and V_SHOULDER_CENTER
        head_vec, head_conf, head_reason = _compute_virtual_point(pf, "V_HEAD_CENTER")
        sh_vec, sh_conf, sh_reason = _compute_virtual_point(pf, "V_SHOULDER_CENTER")
        if head_vec is None:
            return None, None, head_reason
        if sh_vec is None:
            return None, None, sh_reason
        vc = ((head_vec[0] + sh_vec[0]) / 2.0, (head_vec[1] + sh_vec[1]) / 2.0, (head_vec[2] + sh_vec[2]) / 2.0)
        confs = [c for c in (head_conf, sh_conf) if c is not None]
        conf = min(confs) if confs else None
        return vc, conf, None

    return None, None, "unknown_virtual"


def _combine_confidences(*args) -> Optional[float]:
    vals = [getattr(a, "confidence", None) for a in args if isinstance(a, Landmark) and getattr(a, "confidence", None) is not None]
    return min(vals) if vals else None


class BiomechanicalAnalyzer:
    def __init__(self) -> None:
        self.catalog = CATALOG

    def analyze_frame(self, pf: PoseFrame) -> BiomechanicalFrame:
        measurements: Dict[str, BiomechanicalMeasurement] = {}

        # Compute virtual centers
        hip_center_vec, hip_conf, hip_reason = _compute_virtual_point(pf, "V_HIP_CENTER")
        shoulder_center_vec, sh_conf, sh_reason = _compute_virtual_point(pf, "V_SHOULDER_CENTER")
        head_center_vec, head_conf, head_reason = _compute_virtual_point(pf, "V_HEAD_CENTER")
        neck_base_vec, neck_conf, neck_reason = _compute_virtual_point(pf, "V_NECK_BASE")

        # try creating ReferenceSystem if possible
        lhip = pf.get(23)
        rhip = pf.get(24)
        lsh = pf.get(11)
        rsh = pf.get(12)
        ref_system = None
        try:
            if lhip and rhip and lsh and rsh and getattr(lhip, "valid", True) and getattr(rhip, "valid", True) and getattr(lsh, "valid", True) and getattr(rsh, "valid", True):
                ref_system = ReferenceSystem(lhip, rhip, lsh, rsh)
                if not ref_system.is_valid():
                    ref_system = None
        except Exception:
            ref_system = None

        for key, meta in self.catalog.items():
            name = meta.get("name")
            unit = meta.get("unit", "deg")
            lm_defs = meta.get("landmarks", [])
            plane = meta.get("plane")

            angle_value = 0.0
            valid = True
            conf = None
            reason = None
            category = None
            calc_method = None

            try:
                if key.startswith("elbow_") or key.startswith("knee_") or key.startswith("wrist_") or key.startswith("shoulder_"):
                    # triplet A-B-C expected
                    lids = lm_defs
                    a = pf.get(lids[0])
                    b = pf.get(lids[1])
                    c = pf.get(lids[2])
                    if a is None or b is None or c is None:
                        valid = False
                        reason = "landmarks_missing"
                        calc_method = "angle_at_point(A-B-C) failed: missing landmarks"
                    else:
                        ang, valid, conf, reason = angle_at_point(a, b, c)
                        angle_value = ang
                        calc_method = f"angle_at_point({lids[0]}-{lids[1]}-{lids[2]})"
                elif key.startswith("trunk_"):
                    # use hip_center and shoulder_center vectors and compare with world vertical
                    if hip_center_vec is None or shoulder_center_vec is None:
                        valid = False
                        reason = hip_reason or sh_reason or "landmarks_missing"
                        calc_method = "trunk angle requires V_HIP_CENTER and V_SHOULDER_CENTER"
                    else:
                        vec_hs = (shoulder_center_vec[0] - hip_center_vec[0], shoulder_center_vec[1] - hip_center_vec[1], shoulder_center_vec[2] - hip_center_vec[2])
                        # compare with world vertical (0,1,0)
                        vertical = (0.0, 1.0, 0.0)
                        ang, valid, conf_ab, reason_ab = angle_between_vectors(vec_hs, vertical)
                        angle_value = ang
                        valid = valid and True
                        conf = conf_ab if conf_ab is not None else (hip_conf if hip_conf is not None else sh_conf)
                        reason = reason_ab
                        calc_method = "angle_between(shoulder_center-hip_center, global_vertical)"
                elif key.startswith("neck_"):
                    # compute neck angles using virtuals
                    if neck_base_vec is None or head_center_vec is None:
                        valid = False
                        reason = neck_reason or head_reason or "landmarks_missing"
                        calc_method = "V_NECK_BASE or V_HEAD_CENTER missing"
                    else:
                        # example: neck flexion = angle at neck_base between head_center - neck_base - shoulder_center
                        # we fallback to using shoulder_center_vec if available
                        if shoulder_center_vec is None:
                            valid = False
                            reason = "V_SHOULDER_CENTER missing"
                            calc_method = "neck requires V_SHOULDER_CENTER"
                        else:
                            # build pseudo-landmark tuples for angle_at_point
                            # use head_center (A), neck_base (B), shoulder_center (C)
                            ang, valid, conf_ab, reason_ab = angle_at_point(head_center_vec, neck_base_vec, shoulder_center_vec)
                            angle_value = ang
                            conf = conf_ab if conf_ab is not None else (neck_conf if 'neck_conf' in locals() else None)
                            reason = reason_ab
                            calc_method = "angle_at_point(V_HEAD_CENTER-V_NECK_BASE-V_SHOULDER_CENTER)"
                elif key.startswith("ankle_"):
                    lids = lm_defs
                    a = pf.get(lids[0])
                    b = pf.get(lids[1])
                    foot = pf.get(lids[2])
                    if a is None or b is None or foot is None:
                        valid = False
                        reason = "landmarks_missing"
                        calc_method = "angle_at_point(A-B-C) failed: missing landmarks"
                    else:
                        ang, valid, conf, reason = angle_at_point(a, b, foot)
                        angle_value = ang
                        calc_method = f"angle_at_point({lids[0]}-{lids[1]}-{lids[2]})"
                else:
                    valid = False
                    reason = "unknown_measurement"
                    calc_method = "unknown"
            except Exception:
                valid = False
                reason = "calculation_error"
                calc_method = "exception"

            thresholds = meta.get("thresholds")
            if thresholds is None and valid:
                cat = None
                if reason is None:
                    reason = "Pendiente de definición: thresholds"
            else:
                cat = None

            bm = BiomechanicalMeasurement(
                name=key,
                value=angle_value,
                unit=unit,
                category=cat,
                valid=bool(valid),
                confidence=float(conf) if conf is not None else None,
                reason=reason,
                calculation_method=calc_method,
            )
            measurements[key] = bm

        bf = BiomechanicalFrame(frame_index=pf.frame_index, timestamp=pf.timestamp, measurements=measurements, source_pose_frame=pf)
        return bf
