"""Unit tests for the biomechanical analyzer using synthetic poses."""
import math

from ocra.models.landmark import Landmark
from ocra.models.pose_frame import PoseFrame
from ocra.biomechanics.biomechanical_analyzer import _compute_virtual_point, BiomechanicalAnalyzer


def make_landmark(lid, x, y, z, valid=True, confidence=90.0, reason=None):
    return Landmark(id=lid, x=x, y=y, z=z, visibility=1.0, valid=valid, confidence=confidence, reason=reason, source="test")


def make_pose_frame(mapping):
    # mapping: id->Landmark
    return PoseFrame(frame_index=0, timestamp=0.0, landmarks=mapping)


def approx(a, b, tol=1e-6):
    return abs(a - b) <= tol


def test_virtual_head_and_neck_base():
    # place nose and symmetric eyes/ears
    nose = make_landmark(0, 0.0, 2.0, 0.0)
    left_eye = make_landmark(2, -0.1, 2.1, 0.0)
    right_eye = make_landmark(5, 0.1, 2.1, 0.0)
    left_ear = make_landmark(7, -0.3, 2.0, 0.0)
    right_ear = make_landmark(8, 0.3, 2.0, 0.0)

    left_shoulder = make_landmark(11, -0.2, 1.6, 0.0)
    right_shoulder = make_landmark(12, 0.2, 1.6, 0.0)

    pf = make_pose_frame({0: nose, 2: left_eye, 5: right_eye, 7: left_ear, 8: right_ear, 11: left_shoulder, 12: right_shoulder})

    head_vec, head_conf, head_reason = _compute_virtual_point(pf, "V_HEAD_CENTER")
    assert head_vec is not None
    # expected head center = average of nose, mid_eyes, mid_ears
    mid_eyes = ((-0.1 + 0.1) / 2.0, (2.1 + 2.1) / 2.0, 0.0)
    mid_ears = ((-0.3 + 0.3) / 2.0, (2.0 + 2.0) / 2.0, 0.0)
    expected_head = ((0.0 + mid_eyes[0] + mid_ears[0]) / 3.0, (2.0 + mid_eyes[1] + mid_ears[1]) / 3.0, 0.0)
    assert approx(head_vec[0], expected_head[0], tol=1e-6)
    assert approx(head_vec[1], expected_head[1], tol=1e-6)

    # now neck base should be midpoint between head center and shoulder center
    shoulder_center_vec, sh_conf, sh_reason = _compute_virtual_point(pf, "V_SHOULDER_CENTER")
    neck_vec, neck_conf, neck_reason = _compute_virtual_point(pf, "V_NECK_BASE")
    assert neck_vec is not None
    expected_neck = ((head_vec[0] + shoulder_center_vec[0]) / 2.0, (head_vec[1] + shoulder_center_vec[1]) / 2.0, (head_vec[2] + shoulder_center_vec[2]) / 2.0)
    assert approx(neck_vec[0], expected_neck[0], tol=1e-6)
    assert approx(neck_vec[1], expected_neck[1], tol=1e-6)


def test_elbow_wrist_knee_angles_and_propagation():
    # left elbow: shoulder (0,1.6,0), elbow (0,1.0,0), wrist (1,1.0,0) => 90deg
    lsh = make_landmark(11, 0.0, 1.6, 0.0, confidence=80.0)
    lel = make_landmark(13, 0.0, 1.0, 0.0, confidence=70.0)
    lwr = make_landmark(15, 1.0, 1.0, 0.0, confidence=60.0)

    # wrist: elbow (0,1.0,0), wrist (0,0.5,0), index (1,0.5,0) => 90deg
    lel_w = make_landmark(13, 0.0, 1.0, 0.0, confidence=70.0)
    lwr_w = make_landmark(15, 0.0, 0.5, 0.0, confidence=65.0)
    lidx = make_landmark(19, 1.0, 0.5, 0.0, confidence=60.0)

    # knee: hip (0,0,0), knee (0,-1,0), ankle (1,-1,0) => 90deg
    lhip = make_landmark(23, 0.0, 0.0, 0.0, confidence=85.0)
    lknee = make_landmark(25, 0.0, -1.0, 0.0, confidence=80.0)
    lank = make_landmark(27, 1.0, -1.0, 0.0, confidence=75.0)

    pf = make_pose_frame({11: lsh, 13: lel, 15: lwr, 19: lidx, 23: lhip, 25: lknee, 27: lank})

    analyzer = BiomechanicalAnalyzer()
    bf = analyzer.analyze_frame(pf)

    # elbow measurement
    m_elbow = bf.get("elbow_flexion_left")
    assert m_elbow is not None
    assert m_elbow.valid
    assert approx(m_elbow.value, 90.0, tol=1e-6)
    # confidence should be min of confidences 80,70,60 => 60
    assert m_elbow.confidence == 60.0

    # wrist measurement: using landmarks 13,15,19 in catalog; but here wrist landmarks differ
    m_wrist = bf.get("wrist_flexion_left")
    # In our setup we included 13,15,19 but coordinates used for elbow earlier; we expect calculation
    assert m_wrist is not None
    assert m_wrist.valid
    assert approx(m_wrist.value, 90.0, tol=1e-6)

    # knee
    m_knee = bf.get("knee_flexion_left")
    assert m_knee is not None
    assert m_knee.valid
    assert approx(m_knee.value, 90.0, tol=1e-6)


def test_trunk_flexion():
    # hip_center at (0,0,0), shoulder_center at (0.5, 0.8660254, 0) -> angle with vertical = 30deg
    lhip = make_landmark(23, -0.5, 0.0, 0.0)
    rhip = make_landmark(24, 0.5, 0.0, 0.0)
    lsh = make_landmark(11, -0.0 + 0.5, 0.8660254, 0.0)
    rsh = make_landmark(12, 0.0 + 0.5, 0.8660254, 0.0)

    pf = make_pose_frame({23: lhip, 24: rhip, 11: lsh, 12: rsh})
    analyzer = BiomechanicalAnalyzer()
    bf = analyzer.analyze_frame(pf)
    m_trunk = bf.get("trunk_flexion")
    assert m_trunk is not None
    assert m_trunk.valid
    assert approx(m_trunk.value, 30.0, tol=1e-4)


def test_propagation_of_invalid_landmarks():
    # left elbow with invalid elbow landmark
    lsh = make_landmark(11, 0.0, 1.6, 0.0)
    lel_bad = make_landmark(13, 0.0, 1.0, 0.0, valid=False, reason="occluded")
    lwr = make_landmark(15, 1.0, 1.0, 0.0)
    pf = make_pose_frame({11: lsh, 13: lel_bad, 15: lwr})
    analyzer = BiomechanicalAnalyzer()
    bf = analyzer.analyze_frame(pf)
    m_elbow = bf.get("elbow_flexion_left")
    assert m_elbow is not None
    assert not m_elbow.valid
    assert m_elbow.reason == "occluded"
