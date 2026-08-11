from pathlib import Path
import json

from ocra.models.landmark import Landmark
from ocra.biomechanics.biomechanical_measurement import BiomechanicalMeasurement
from ocra.analysis.analysis_result import AnalysisResult

FIXTURE_PATH = Path("tests/fixtures/kinovea_sample.json")


def test_landmark_instance_has_required_fields():
    # Create an instance and ensure required fields exist and are accessible
    lm = Landmark(id=1, x=0.0, y=0.0, z=0.0, visibility=0.0, valid=True, confidence=90.0, reason="r", source="kinovea")
    # Required fields per biomechanical model
    required = ("id", "x", "y", "z", "valid", "confidence", "reason", "source")
    for f in required:
        assert hasattr(lm, f), f"Landmark instance missing required field '{f}'"


def test_biomechanical_measurement_instance_fields():
    bm = BiomechanicalMeasurement(name="m", value=0.0, unit="deg", category=None, valid=True, confidence=50.0, reason=None, calculation_method="angle_at_point")
    required = ("name", "value", "unit", "category", "valid", "confidence", "reason", "calculation_method")
    for f in required:
        assert hasattr(bm, f), f"BiomechanicalMeasurement instance missing field '{f}'"


def test_analysis_result_basic_contract():
    # Ensure AnalysisResult exposes the public fields we rely on
    ar = AnalysisResult(pose_frames=[], biomechanical_frames=[], metadata={})
    assert hasattr(ar, "pose_frames")
    assert hasattr(ar, "biomechanical_frames")
    assert hasattr(ar, "metadata")


def test_fixture_contains_frames_and_landmarks():
    # Sanity: fixture must be present and contain frames with points
    assert FIXTURE_PATH.exists(), f"Fixture not found at {FIXTURE_PATH}"
    data = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    assert isinstance(data, list) and len(data) >= 1
    # ensure each frame has Points list
    for f in data:
        assert isinstance(f.get("Points", f.get("points", [])), list)
