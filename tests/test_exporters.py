import io
import json
import csv

import pytest

from ocra.models.landmark import Landmark
from ocra.models.pose_frame import PoseFrame
from ocra.output.frame_result import FrameResult
from ocra.output.json_exporter import frame_to_dict, export_to_jsonl
from ocra.output.csv_exporter import export_to_csv


def make_sample_frame():
    # Create a small set of landmarks
    lm_shoulder = Landmark(id=11, x=0.0, y=1.0, z=0.0, visibility=0.9)
    lm_elbow = Landmark(id=13, x=0.0, y=0.0, z=0.0, visibility=0.95)
    landmarks = {11: lm_shoulder, 13: lm_elbow}

    pose = PoseFrame(frame_index=0, timestamp=0.033, landmarks=landmarks)

    angles = {
        "left_elbow": 90.0,
        "left_shoulder": None,
    }

    metadata = {"source": "test"}

    return FrameResult(frame_index=0, timestamp=0.033, pose=pose, angles=angles, metadata=metadata)


def test_frame_to_dict_contains_expected_fields():
    frame = make_sample_frame()

    d = frame_to_dict(frame)

    assert d["frame_index"] == 0
    assert pytest.approx(d["timestamp"]) == 0.033
    assert d["metadata"]["source"] == "test"

    # Pose should be converted to a dict keyed by string ids
    assert isinstance(d["pose"], dict)
    assert "11" in d["pose"]
    assert d["pose"]["11"]["x"] == 0.0
    assert d["pose"]["11"]["visibility"] == pytest.approx(0.9)

    # Angles should be preserved (including None)
    assert d["angles"]["left_elbow"] == 90.0
    assert d["angles"]["left_shoulder"] is None


def test_export_to_jsonl_writes_valid_json_lines():
    frame = make_sample_frame()
    buf = io.StringIO()

    export_to_jsonl([frame], buf)

    contents = buf.getvalue().strip().splitlines()
    assert len(contents) == 1

    obj = json.loads(contents[0])
    # Must match the frame_to_dict representation
    assert obj == frame_to_dict(frame)


def test_export_to_csv_writes_rows_per_angle():
    frame = make_sample_frame()
    buf = io.StringIO()

    export_to_csv([frame], buf)

    buf.seek(0)
    reader = csv.reader(buf)
    rows = list(reader)

    # Header + two angle rows (one angle is None -> empty cell)
    assert rows[0] == ["frame_index", "timestamp", "joint", "angle"]

    data_rows = rows[1:]
    assert len(data_rows) == 2

    row_map = {r[2]: r[3] for r in data_rows}
    assert row_map["left_elbow"] == "90.0" or row_map["left_elbow"] == "90"
    # None angle should be an empty string
    assert row_map["left_shoulder"] == ""
