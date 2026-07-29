import pytest
import numpy as np

from ocra.pipeline import OcraPipeline
from ocra.models.landmark import Landmark
from ocra.models.pose_frame import PoseFrame


class FakeLoader:
    def __init__(self, video_path):
        self.fps = 30
        self._frames = [np.zeros((480, 640, 3), dtype=np.uint8)]

    def frames(self):
        for f in self._frames:
            yield f

    def release(self):
        pass


class FakeEstimator:
    def estimate(self, frame, frame_index, timestamp):
        # Build landmarks that produce ~90 degree at the elbow, shoulder and wrist for both sides
        # left: shoulder(11) - elbow(13) - wrist(15)
        # right: shoulder(12) - elbow(14) - wrist(16)
        a_left = Landmark(id=11, x=0.0, y=1.0, z=0.0, visibility=1.0)   # shoulder
        b_left = Landmark(id=13, x=0.0, y=0.0, z=0.0, visibility=1.0)   # elbow
        c_left = Landmark(id=15, x=1.0, y=0.0, z=0.0, visibility=1.0)   # wrist

        a_right = Landmark(id=12, x=0.0, y=1.0, z=0.0, visibility=1.0)  # shoulder
        b_right = Landmark(id=14, x=0.0, y=0.0, z=0.0, visibility=1.0)  # elbow
        c_right = Landmark(id=16, x=1.0, y=0.0, z=0.0, visibility=1.0)  # wrist

        # Add hips so shoulder angle (elbow - shoulder - hip) is ~90 degrees
        left_hip = Landmark(id=23, x=1.0, y=1.0, z=0.0, visibility=1.0)
        right_hip = Landmark(id=24, x=1.0, y=1.0, z=0.0, visibility=1.0)

        # Add index finger landmarks so wrist angle (elbow - wrist - index) is ~90 degrees
        left_index = Landmark(id=17, x=2.0, y=1.0, z=0.0, visibility=1.0)
        right_index = Landmark(id=18, x=2.0, y=1.0, z=0.0, visibility=1.0)

        landmarks = {
            11: a_left,
            13: b_left,
            15: c_left,
            12: a_right,
            14: b_right,
            16: c_right,
            23: left_hip,
            24: right_hip,
            17: left_index,
            18: right_index,
        }

        return PoseFrame(frame_index=frame_index, timestamp=timestamp, landmarks=landmarks)

    def close(self):
        pass


def test_pipeline_computes_elbow_angles(monkeypatch):
    # Patch VideoLoader and PoseEstimator used inside OcraPipeline
    monkeypatch.setattr('ocra.pipeline.VideoLoader', FakeLoader)
    monkeypatch.setattr('ocra.pipeline.PoseEstimator', lambda: FakeEstimator())

    pipeline = OcraPipeline()

    results = list(pipeline.analyze("dummy_path"))

    # One frame produced by our FakeLoader
    assert len(results) == 1

    item = results[0]
    assert item is not None

    pose_frame, angles = item

    assert pose_frame.frame_index == 0
    # Angles for both elbows should be approximately 90 degrees
    assert angles.get("left_elbow") is not None
    assert pytest.approx(90.0, rel=1e-3) == angles["left_elbow"]

    assert angles.get("right_elbow") is not None
    assert pytest.approx(90.0, rel=1e-3) == angles["right_elbow"]

    # Shoulders should be approximately 90 degrees (elbow - shoulder - hip)
    assert angles.get("left_shoulder") is not None
    assert pytest.approx(90.0, rel=1e-3) == angles["left_shoulder"]

    assert angles.get("right_shoulder") is not None
    assert pytest.approx(90.0, rel=1e-3) == angles["right_shoulder"]

    # Wrists should be approximately 90 degrees (elbow - wrist - index)
    assert angles.get("left_wrist") is not None
    assert pytest.approx(90.0, rel=1e-3) == angles["left_wrist"]

    assert angles.get("right_wrist") is not None
    assert pytest.approx(90.0, rel=1e-3) == angles["right_wrist"]

    pipeline.close()
