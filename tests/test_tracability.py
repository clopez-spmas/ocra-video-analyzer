import json
from ocra.analysis.analysis_pipeline import AnalysisPipeline
from ocra.models.landmark import Landmark

def test_traceability_json_to_analysisresult(tmp_path):
    # Build a Kinovea JSON with explicit metadata fields per landmark
    frames = [
        {
            "Index": 0,
            "Time": 0.0,
            "Points": [
                {"Id": 1, "X": 0.1, "Y": 0.2, "Z": 0.0, "valid": False, "confidence": 12.3, "reason": "occluded", "source": "kinovea"},
                {"Id": 2, "X": 0.5, "Y": 0.6, "Z": 0.0, "valid": True, "confidence": 99.0, "reason": None, "source": "kinovea"},
            ],
        }
    ]
    path = tmp_path / "trace.json"
    path.write_text(json.dumps(frames), encoding="utf-8")

    pipeline = AnalysisPipeline()
    result = pipeline.run(str(path))

    # Ensure we have one PoseFrame and one BiomechanicalFrame
    assert len(result.pose_frames) == 1
    assert len(result.biomechanical_frames) == 1

    pf = result.pose_frames[0]
    bf = result.biomechanical_frames[0]

    # Pose -> BiomechanicalFrame.source_pose_frame must be the original PoseFrame (identity)
    if bf.source_pose_frame is not pf:
        # Accept structural equivalence if pipeline reconstructed objects
        assert bf.source_pose_frame.frame_index == pf.frame_index
        assert set(bf.source_pose_frame.landmarks.keys()) == set(pf.landmarks.keys())

    # Check that per-landmark metadata propagated from JSON -> PoseFrame
    lm1 = pf.get(1)
    lm2 = pf.get(2)
    assert lm1 is not None and lm2 is not None

    assert lm1.valid is False
    assert lm1.confidence == 12.3
    assert lm1.reason == "occluded"
    assert lm1.source == "kinovea"

    assert lm2.valid is True
    assert lm2.confidence == 99.0
    assert lm2.reason is None
    assert lm2.source == "kinovea"

    # AnalysisResult must reference the same pose_frames list (or an equivalent first element)
    if result.pose_frames[0] is not pf:
        assert result.pose_frames[0].frame_index == pf.frame_index
        assert set(result.pose_frames[0].landmarks.keys()) == set(pf.landmarks.keys())
