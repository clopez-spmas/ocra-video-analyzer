"""Validation runner utilities.

Functions to load reference cases, compare analyzer outputs and compute
statistics: MAE, max error, standard deviation and percent within tolerance.

This module is independent of test frameworks and can be used as a library or
as a CLI helper in further automation.
"""
from __future__ import annotations

import json
import math
import statistics
from typing import Dict, List, Tuple, Optional

from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame
from ocra.biomechanics.biomechanical_measurement import BiomechanicalMeasurement


def load_reference_case(path: str) -> Dict:
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def _gather_measurements_by_frame(bf_list: List[BiomechanicalFrame]) -> Dict[int, BiomechanicalFrame]:
    return {bf.frame_index: bf for bf in bf_list}


def compute_metrics_for_measurement(
    observed_values: List[float], expected_values: List[float], tolerance: float
) -> Dict[str, float]:
    """Compute MAE, max error, std dev and percent within tolerance.

    Expects lists of equal length > 0.
    """
    if len(observed_values) == 0:
        return {"mae": float("nan"), "max_error": float("nan"), "std": float("nan"), "percent_within_tol": 0.0}

    errors = [abs(o - e) for o, e in zip(observed_values, expected_values)]
    mae = float(sum(errors) / len(errors))
    max_error = float(max(errors))
    std = float(statistics.pstdev(errors)) if len(errors) >= 1 else 0.0
    within = float(sum(1 for err in errors if err <= tolerance))
    percent_within = (within / len(errors)) * 100.0
    return {"mae": mae, "max_error": max_error, "std": std, "percent_within_tol": percent_within}


def evaluate_case(
    biomech_frames: List[BiomechanicalFrame],
    reference_case: Dict,
    measurement_name: Optional[str] = None,
    tolerance_deg: Optional[float] = None,
) -> Dict[str, Dict]:
    """Compare analyzer outputs (biomech_frames) with reference_case.

    If measurement_name is provided, compute metrics only for that measurement.
    Otherwise compute per-measurement metrics for all keys found in the
    reference.

    Returns a dict mapping measurement_name -> metrics dict and a summary entry
    under key '_summary' with counts.
    """
    ref_map = {frame["frame_index"]: frame["measurements"] for frame in reference_case.get("frames", [])}
    tol = tolerance_deg if tolerance_deg is not None else reference_case.get("tolerance_deg", 5.0)

    bf_by_index = _gather_measurements_by_frame(biomech_frames)

    # collect set of measurements to evaluate
    measurement_keys = set()
    for f in reference_case.get("frames", []):
        for k in f.get("measurements", {}).keys():
            measurement_keys.add(k)
    if measurement_name is not None:
        measurement_keys = {measurement_name}

    results: Dict[str, Dict] = {}

    total_frames = 0
    total_valid = 0
    total_invalid = 0
    total_missing = 0

    for m in sorted(measurement_keys):
        observed = []
        expected = []
        missing = 0
        invalid = 0
        valid_count = 0
        reasons = []

        for frame_idx, measurements in ref_map.items():
            total_frames += 1
            expected_val = measurements.get(m)
            if expected_val is None:
                continue
            bf = bf_by_index.get(frame_idx)
            if bf is None:
                missing += 1
                total_missing += 1
                continue
            bm: BiomechanicalMeasurement = bf.get(m)
            if bm is None:
                missing += 1
                total_missing += 1
                continue
            if not bm.valid:
                invalid += 1
                total_invalid += 1
                reasons.append(bm.reason)
                continue
            # valid measurement
            observed.append(float(bm.value))
            expected.append(float(expected_val))
            valid_count += 1
            total_valid += 1

        metrics = compute_metrics_for_measurement(observed, expected, tol)
        results[m] = {
            "metrics": metrics,
            "counts": {"valid": valid_count, "invalid": invalid, "missing": missing},
            "sample_reasons_for_invalid": reasons[:10],
        }

    results["_summary"] = {
        "total_frames_referenced": len(ref_map),
        "total_valid_measurements": total_valid,
        "total_invalid_measurements": total_invalid,
        "total_missing_measurements": total_missing,
    }
    return results


# Lightweight CLI helper
def run_case_and_print(biomech_frames: List[BiomechanicalFrame], reference_path: str, measurement_name: Optional[str] = None, tolerance_deg: Optional[float] = None):
    ref = load_reference_case(reference_path)
    res = evaluate_case(biomech_frames, ref, measurement_name=measurement_name, tolerance_deg=tolerance_deg)
    print("Validation results for:", ref.get("case_id"))
    for k, v in res.items():
        if k == "_summary":
            print("SUMMARY:", v)
            continue
        print(f"Measurement: {k}")
        print("  counts:", v["counts"])
        print("  metrics:", v["metrics"])
        if v["sample_reasons_for_invalid"]:
            print("  sample invalid reasons:", v["sample_reasons_for_invalid"])
