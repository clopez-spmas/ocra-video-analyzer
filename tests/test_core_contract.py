import pytest
from ocra.models.landmark import Landmark
from ocra.models.pose_frame import PoseFrame
from ocra.biomechanics.biomechanical_analyzer import BiomechanicalAnalyzer
from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame
from ocra.biomechanics.biomechanical_measurement import BiomechanicalMeasurement
from ocra.analysis.analysis_result import AnalysisResult
from ocra.analysis.analysis_pipeline import AnalysisPipeline


def test_biomechanical_analyzer_returns_biomechanical_frame():
    # Build a minimal PoseFrame with a few landmarks so analyzer can run
    lm_lsh = Landmark(11, 0.0, 0.0, 0.0, 1.0, valid=True, confidence=90.0, reason=None, source="unit")
    lm_rsh = Landmark(12, 1.0, 0.0, 0.0, 1.0, valid=True, confidence=92.0, reason=None, source="unit")
    lm_lhip = Landmark(23, 0.0, -1.0, 0.0, 1.0, valid=True, confidence=88.0, reason=None, source="unit")
    lm_rhip = Landmark(24, 1.0, -1.0, 0.0, 1.0, valid=True, confidence=87.0, reason=None, source="unit")

    pf = PoseFrame(frame_index=0, timestamp=0.0, landmarks={11: lm_lsh, 12: lm_rsh, 23: lm_lhip, 24: lm_rhip})

    analyzer = BiomechanicalAnalyzer()
    bf = analyzer.analyze_frame(pf)

    assert isinstance(bf, BiomechanicalFrame)
    assert hasattr(bf, "measurements")
    assert isinstance(bf.source_pose_frame, PoseFrame)
    # Measurements should be BiomechanicalMeasurement instances (may be many; check at least one)
    if len(bf.measurements) > 0:
        any_val = next(iter(bf.measurements.values()))
        assert isinstance(any_val, BiomechanicalMeasurement)


def test_analysis_pipeline_and_analysis_result_contract(tmp_path):
    # Create a tiny Kinovea-like JSON to ensure AnalysisPipeline.run returns AnalysisResult
    tracking = [
        {
            "Index": 0,
            "Time": 0.0,
            "Points": [
                {"Id": 11, "X": 0.0, "Y": 0.0, "Z": 0.0, "valid": True, "confidence": 95.0, "reason": None, "source": "test"},
                {"Id": 12, "X": 1.0, "Y": 0.0, "Z": 0.0, "valid": True, "confidence": 93.0, "reason": None, "source": "test"},
                {"Id": 23, "X": 0.0, "Y": -1.0, "Z": 0.0, "valid": True, "confidence": 90.0, "reason": None, "source": "test"},
                {"Id": 24, "X": 1.0, "Y": -1.0, "Z": 0.0, "valid": True, "confidence": 89.0, "reason": None, "source": "test"},
            ],
        }
    ]

    f = tmp_path / "k.json"
    import json
    f.write_text(json.dumps(tracking), encoding="utf-8")

    pipeline = AnalysisPipeline()
    result = pipeline.run(str(f))

    assert isinstance(result, AnalysisResult)
    assert isinstance(result.pose_frames, list)
    assert isinstance(result.biomechanical_frames, list)
    # 1:1 correspondence asserted by AnalysisResult contract
    assert len(result.pose_frames) == len(result.biomechanical_frames)
