"""Biomechanical analyzer: converts PoseFrame -> BiomechanicalFrame using ocra.geometry.

This module respects the project's data integrity rules: it never deletes frames
or landmarks; it propagates valid/confidence/reason metadata; it does not
interpolate. Classification into categories is performed only when numeric
thresholds are defined (thresholds in measurement_catalog); otherwise the
measurement is produced with category=None and reason="Pendiente de definición: thresholds".
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
from ocra.geometry.vector import to_vector, subtract


def _fetch_landmark(pf: PoseFrame, lid) -> Optional[Landmark]:
    if isinstance(lid, int):
        return pf.get(lid)
    # virtual ids
    return None


def _compute_virtual_point(pf: PoseFrame, vid: str) -> Tuple[Optional[Tuple[float, float, float]], Optional[float], Optional[str]]:
    """Compute simple virtual points (hip_center, shoulder_center) when possible.

    Returns (vector or None, confidence_min or None, reason or None)
    """
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
        # confidence: min
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
    # other virtuals pending
    return None, None, "Pendiente de definición"


def _combine_confidences(*args) -> Optional[float]:
    vals = [getattr(a, "confidence", None) for a in args if isinstance(a, Landmark) and getattr(a, "confidence", None) is not None]
    return min(vals) if vals else None


class BiomechanicalAnalyzer:
    def __init__(self) -> None:
        self.catalog = CATALOG

    def analyze_frame(self, pf: PoseFrame) -> BiomechanicalFrame:
        measurements: Dict[str, BiomechanicalMeasurement] = {}

        # Attempt to compute virtual centers once
        hip_center_vec, hip_conf, hip_reason = _compute_virtual_point(pf, "V_HIP_CENTER")
        shoulder_center_vec, sh_conf, sh_reason = _compute_virtual_point(pf, "V_SHOULDER_CENTER")

        ref_system = None
        # try creating ReferenceSystem if possible
        lhip = pf.get(23)
        rhip = pf.get(24)
        lsh = pf.get(11)
        rsh = pf.get(12)
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

            # prepare inputs depending on definition
            angle_value = 0.0
            valid = True
            conf = None
            reason = None
            category = None

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
                    else:
                        ang, valid, conf, reason = angle_at_point(a, b, c)
                        angle_value = ang
                elif key.startswith("trunk_"):
                    # use hip_center and shoulder_center vectors and ref_system
                    if hip_center_vec is None or shoulder_center_vec is None:
                        valid = False
                        reason = hip_reason or sh_reason or "landmarks_missing"
                    elif ref_system is None:
                        # fallback: compute angle between hip->shoulder and global vertical? We avoid inventing global vertical — mark pending
                        valid = False
                        reason = "invalid_reference_system"
                    else:
                        vec_hs = (shoulder_center_vec[0] - hip_center_vec[0], shoulder_center_vec[1] - hip_center_vec[1], shoulder_center_vec[2] - hip_center_vec[2])
                        # compare with superior axis (z)
                        # angle_between_vectors expects two vectors
                        # build pseudo-landmark-like vectors
                        ang, valid_ab, conf_ab, reason_ab = angle_between_vectors(vec_hs, ref_system.z)
                        angle_value = ang
                        valid = valid_ab
                        conf = conf_ab if conf_ab is not None else (hip_conf if hip_conf is not None else sh_conf)
                        reason = reason_ab
                elif key.startswith("neck_") or key.startswith("head_"):
                    # pending definitions — do not compute until formulas agreed
                    valid = False
                    reason = "Pendiente de definición"
                elif key.startswith("ankle_"):
                    lids = lm_defs
                    a = pf.get(lids[0])
                    b = pf.get(lids[1])
                    # foot index may be missing; try alternative
                    foot = pf.get(lids[2])
                    if a is None or b is None or foot is None:
                        valid = False
                        reason = "landmarks_missing"
                    else:
                        ang, valid, conf, reason = angle_at_point(a, b, foot)
                        angle_value = ang
                else:
                    valid = False
                    reason = "unknown_measurement"
            except Exception as e:
                valid = False
                reason = "calculation_error"

            # classification: thresholds not defined -> category None and reason note
            thresholds = meta.get("thresholds")
            if thresholds is None and valid:
                cat = None
                # don't overwrite reason if existing
                # but add informative note in reason if none
                if reason is None:
                    reason = "Pendiente de definición: thresholds"
            else:
                cat = None
                # implement classification here when thresholds provided in future

            bm = BiomechanicalMeasurement(
                name=key,
                value=angle_value,
                unit=unit,
                category=cat,
                valid=bool(valid),
                confidence=float(conf) if conf is not None else None,
                reason=reason,
            )
            measurements[key] = bm

        bf = BiomechanicalFrame(frame_index=pf.frame_index, timestamp=pf.timestamp, measurements=measurements, source_pose_frame=pf)
        return bf
