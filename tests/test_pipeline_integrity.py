import json
import pytest
from ocra.analysis.analysis_pipeline import AnalysisPipeline

def make_frame(index, time, points):
    return {"Index": index, "Time": time, "Points": points}

def make_point(i, x, y, z, valid=True, confidence=None, reason=None, source="kinovea"):
    d = {"Id": i, "X": x, "Y": y, "Z": z, "valid": valid, "source": source}
    if confidence is not None:
        d["confidence"] = confidence
    if reason is not None:
        d["reason"] = reason
    return d

def test_analysispipeline_preserves_poseframe_integrity(tmp_path):
    # Create two frames with a small set of landmarks, including metadata
    frames = [
        make_frame(0, 0.0, [
            make_point(10, 0.0, 0.0, 0.0, valid=True, confidence=80.0, reason=None),
            make_point(11, 0.1, 0.2, 0.0, valid=True, confidence=85.0, reason=None),
        ]),
        make_frame(1, 0.033, [
            make_point(10, 0.0, 0.0, 0.0, valid=False, confidence=5.0, reason="occluded"),
            make_point(11, 0.11, 0.21, 0.0, valid=True, confidence=86.0, reason=None),
            make_point(12, 0.5, 0.6, 0.0, valid=True, confidence=90.0, reason=None),
        ]),
    ]

    path = tmp_path / "flow.json"
    path.write_text(json.dumps(frames), encoding="utf-8")

    pipeline = AnalysisPipeline()
    result = pipeline.run(str(path))

    # 1:1 correspondence and same order
    assert len(result.pose_frames) == len(frames)
    assert len(result.biomechanical_frames) == len(frames)
    assert result.metadata.get("num_pose_frames", None) == len(frames)

    for i, original in enumerate(frames):
        pf = result.pose_frames[i]
        bf = result.biomechanical_frames[i]

        # same order of frames (frame_index preserved)
        assert pf.frame_index == original["Index"]

        # same number of landmarks
        assert len(pf.landmarks) == len(original["Points"])

        # landmark-by-landmark checks: positions must match and metadata preserved
        for p in original["Points"]:
            lid = int(p["Id"])
            lm = pf.get(lid)
            assert lm is not None
            # coordinates
            assert lm.x == pytest.approx(p.get("X", 0.0))
            assert lm.y == pytest.approx(p.get("Y", 0.0))
            assert lm.z == pytest.approx(p.get("Z", 0.0))
            # metadata fields preserved
            assert getattr(lm, "valid", True) == bool(p.get("valid", True))
            if "confidence" in p:
                assert lm.confidence == p["confidence"]
            if "reason" in p:
                assert lm.reason == p.get("reason")
            if "source" in p:
                assert lm.source == p.get("source")

        # ensure biomechanical frame references original pose frame (no copy+mutate)
        assert bf.source_pose_frame is pf
