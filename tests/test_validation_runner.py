"""Unit tests for validation runner using synthetic BiomechanicalFrame objects."""

from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame
from ocra.biomechanics.biomechanical_measurement import BiomechanicalMeasurement
from validation.validation_runner import evaluate_case


def make_bm(name, value, valid=True, confidence=90.0, reason=None):
    return BiomechanicalMeasurement(name=name, value=value, unit="deg", category=None, valid=valid, confidence=confidence, reason=reason)


def make_bf(frame_index, measurements):
    # measurements: dict name->BiomechanicalMeasurement
    return BiomechanicalFrame(frame_index=frame_index, timestamp=0.0, measurements=measurements, source_pose_frame=None)


def test_evaluate_case_basic():
    # build two frames of observed measurements
    bf0 = make_bf(0, {"elbow_flexion_left": make_bm("elbow_flexion_left", 89.0)})
    bf1 = make_bf(1, {"elbow_flexion_left": make_bm("elbow_flexion_left", 91.0)})
    observed = [bf0, bf1]

    # reference case
    ref = {
        "case_id": "test",
        "tolerance_deg": 5.0,
        "frames": [
            {"frame_index": 0, "measurements": {"elbow_flexion_left": 90.0}},
            {"frame_index": 1, "measurements": {"elbow_flexion_left": 90.0}},
        ],
    }

    results = evaluate_case(observed, ref)
    m = results.get("elbow_flexion_left")
    assert m is not None
    metrics = m["metrics"]
    # errors: 1 and 1 -> mae 1, max 1
    assert abs(metrics["mae"] - 1.0) < 1e-6
    assert abs(metrics["max_error"] - 1.0) < 1e-6
    assert metrics["percent_within_tol"] == 100.0


def test_evaluate_case_with_invalid_and_missing():
    # observed: frame 0 invalid, frame1 missing
    bf0 = make_bf(0, {"elbow_flexion_left": make_bm("elbow_flexion_left", 0.0, valid=False, reason="occluded")})
    observed = [bf0]
    ref = {"case_id": "test2", "frames": [{"frame_index": 0, "measurements": {"elbow_flexion_left": 90.0}}, {"frame_index": 1, "measurements": {"elbow_flexion_left": 90.0}}]}
    results = evaluate_case(observed, ref)
    m = results.get("elbow_flexion_left")
    assert m is not None
    counts = m["counts"]
    # frame0 invalid -> invalid=1, frame1 missing -> missing=1
    assert counts["invalid"] == 1
    assert counts["missing"] == 1
    # metrics for observed valid values should be NaN because no valid observations
    metrics = m["metrics"]
    assert metrics["percent_within_tol"] == 0.0
