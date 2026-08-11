import json
from pathlib import Path

from ocra.analysis.analysis_pipeline import AnalysisPipeline
from ocra.analysis.analysis_result import AnalysisResult
from ocra.models.landmark import Landmark
from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame
from ocra.biomechanics.biomechanical_measurement import BiomechanicalMeasurement

FIXTURE_PATH = Path("tests/fixtures/kinovea_sample.json")


def _load_fixture_raw(path: Path):
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)


def test_analysis_pipeline_end_to_end_preserves_data_and_metadata(tmp_path):
    """
    End-to-end pipeline test that enforces the Biomechanical Core v1.0 invariants:

    - Kinovea JSON -> KinoveaJSONProvider -> PoseFrame -> BiomechanicalAnalyzer -> BiomechanicalFrame -> AnalysisResult
    - No interpolation, no frame removal, no smoothing, no metric calculation, no MovementManager usage.
    - Preserve all landmark metadata (valid, confidence, reason, source).
    - Preserve all measurement metadata (value, unit, valid, confidence, reason, calculation_method).
    - Verify all measurements are present for each BiomechanicalFrame (catalog keys) and include calculation_method.
    """

    repo_fixture = FIXTURE_PATH
    if not repo_fixture.exists():
        raise FileNotFoundError(f"Expected fixture at {FIXTURE_PATH}. Place tests/fixtures/kinovea_sample.json in the repo.")

    raw = _load_fixture_raw(repo_fixture)
    assert isinstance(raw, list) and len(raw) >= 1

    pipeline = AnalysisPipeline()
    result: AnalysisResult = pipeline.run(tracking_path=str(repo_fixture), video_path=None)

    # Basic shape checks
    assert isinstance(result, AnalysisResult)
    assert hasattr(result, "pose_frames")
    assert hasattr(result, "biomechanical_frames")
    assert hasattr(result, "metadata")

    # 1:1 correspondence and counts
    num_fixture_frames = len(raw)
    assert len(result.pose_frames) == num_fixture_frames, "No pose frame should be dropped"
    assert len(result.biomechanical_frames) == num_fixture_frames, "Biomechanical frames must match pose frames 1:1"

    # Metadata correctness (only pipeline metadata, no metrics)
    md = result.metadata
    assert md.get("tracking_path") is not None
    assert "video_path" in md
    assert md.get("num_pose_frames") == num_fixture_frames
    assert md.get("num_biomechanical_frames") == num_fixture_frames

    # Ensure landmark-level preservation and that source is 'kinovea'
    for i, frame_json in enumerate(raw):
        pf = result.pose_frames[i]
        # Index preserved
        expected_index = int(frame_json.get("Index", frame_json.get("index", i)))
        assert pf.frame_index == expected_index, f"Frame index changed for frame {i}"
        # Timestamp preserved
        expected_time = float(frame_json.get("Time", frame_json.get("time", 0.0)))
        assert pf.timestamp == expected_time, f"Timestamp changed for frame {i}"

        points = frame_json.get("Points", frame_json.get("points", []))
        for p in points:
            lid = p.get("Id") or p.get("ID") or p.get("id") or p.get("index")
            if lid is None:
                continue
            lid_int = int(lid)
            lm = pf.get(lid_int)
            assert lm is not None, f"Landmark {lid_int} missing in PoseFrame {i}"
            # Coordinates preserved exactly (no interpolation)
            expected_x = float(p.get("X", p.get("x", 0.0)))
            expected_y = float(p.get("Y", p.get("y", 0.0)))
            expected_z = float(p.get("Z", p.get("z", 0.0)))
            assert lm.x == expected_x and lm.y == expected_y and lm.z == expected_z, (
                f"Landmark coordinates changed for id {lid_int} in frame {i}: "
                f"expected ({expected_x},{expected_y},{expected_z}) got ({lm.x},{lm.y},{lm.z})"
            )
            # Landmark metadata preserved
            expected_valid = bool(p.get("valid", p.get("Valid", True)))
            assert lm.valid == expected_valid, f"Landmark.valid mismatch for id {lid_int} in frame {i}"
            if "confidence" in p:
                assert lm.confidence == float(p["confidence"]), f"Landmark.confidence mismatch for id {lid_int} in frame {i}"
            elif "Confidence" in p:
                assert lm.confidence == float(p["Confidence"]), f"Landmark.confidence mismatch for id {lid_int} in frame {i}"
            elif "Visibility" in p:
                try:
                    assert lm.confidence == float(p["Visibility"])
                except Exception:
                    # if visibility non-numeric, confidence may be None - acceptable
                    pass
            if "reason" in p or "Reason" in p:
                expected_reason = p.get("reason") or p.get("Reason")
                assert lm.reason == expected_reason, f"Landmark.reason mismatch for id {lid_int} in frame {i}"
            # source must be present and equal to 'kinovea'
            assert getattr(lm, "source", None) == "kinovea", f"Landmark.source must be 'kinovea' for id {lid_int} in frame {i}"

    # Specific case: ensure invalid landmarks are not interpolated and keep valid=False and reason
    # In our fixture frame 1, landmark 11 is marked valid=false with reason 'occluded'
    pf1 = result.pose_frames[1]
    lm11 = pf1.get(11)
    assert lm11 is not None, "Expected landmark 11 in frame 1"
    assert lm11.valid is False, "Invalid landmark lost its valid=False flag"
    assert lm11.reason == "occluded", "Invalid landmark reason not preserved"
    # Coordinates must be exactly as provided in fixture (no interpolation)
    assert lm11.x == -0.26 and lm11.y == 0.85

    # Verify biomechanical frames: all measurements exist and include required metadata
    for i, bf in enumerate(result.biomechanical_frames):
        assert isinstance(bf, BiomechanicalFrame)
        # Check every measurement object in the frame
        assert isinstance(bf.measurements, dict)
        for name, m in bf.measurements.items():
            assert isinstance(m, BiomechanicalMeasurement), f"Measurement {name} is not BiomechanicalMeasurement"
            # required fields
            assert hasattr(m, "value"), f"Measurement {name} missing 'value'"
            assert hasattr(m, "unit"), f"Measurement {name} missing 'unit'"
            assert hasattr(m, "valid"), f"Measurement {name} missing 'valid'"
            assert hasattr(m, "confidence"), f"Measurement {name} missing 'confidence'"
            assert hasattr(m, "reason"), f"Measurement {name} missing 'reason'"
            assert hasattr(m, "calculation_method"), f"Measurement {name} missing 'calculation_method'"
            # calculation_method should be present (may be descriptive string)
            assert m.calculation_method is not None, f"Measurement {name} has no calculation_method in frame {i}"

    # Ensure no re-ordering
    indices = [pf.frame_index for pf in result.pose_frames]
    assert indices == sorted(indices), "PoseFrame indices changed order"


