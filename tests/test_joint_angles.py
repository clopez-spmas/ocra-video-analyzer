import pytest

from ocra.kinematics.joint_angles import JointAngleCalculator
from ocra.models.landmark import Landmark
from ocra.models.pose_frame import PoseFrame


def test_angle_right_angle():
    # Right angle at b: a=(0,1,0), b=(0,0,0), c=(1,0,0) => 90 degrees
    a = Landmark(id=0, x=0.0, y=1.0, z=0.0, visibility=1.0)
    b = Landmark(id=1, x=0.0, y=0.0, z=0.0, visibility=1.0)
    c = Landmark(id=2, x=1.0, y=0.0, z=0.0, visibility=1.0)

    angle = JointAngleCalculator.angle(a, b, c)
    assert pytest.approx(90.0, rel=1e-3) == angle


def test_from_pose_returns_same_angle():
    a = Landmark(id=0, x=0.0, y=1.0, z=0.0, visibility=1.0)
    b = Landmark(id=1, x=0.0, y=0.0, z=0.0, visibility=1.0)
    c = Landmark(id=2, x=1.0, y=0.0, z=0.0, visibility=1.0)

    landmarks = {0: a, 1: b, 2: c}
    pose = PoseFrame(frame_index=0, timestamp=0.0, landmarks=landmarks)

    angle = JointAngleCalculator.from_pose(pose, 0, 1, 2)
    assert angle is not None
    assert pytest.approx(90.0, rel=1e-3) == angle
