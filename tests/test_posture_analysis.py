"""Tests for temporal posture analysis."""

from ocra.models.pose_frame import PoseFrame

from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame
from ocra.biomechanics.biomechanical_measurement import BiomechanicalMeasurement

from ocra.analysis.posture_analyzer import PostureAnalyzer



def make_measurement(name, value):

    return BiomechanicalMeasurement(

        name=name,

        value=value,

        unit="deg",

        category=None,

        valid=True,

        confidence=100.0,

        reason=None,

        calculation_method="test"

    )



def make_frame(index, timestamp, shoulder_angle):

    measurement = make_measurement(
        "shoulder_flexion_right",
        shoulder_angle
    )

    return BiomechanicalFrame(

        frame_index=index,

        timestamp=timestamp,

        measurements={
            "shoulder_flexion_right":
                measurement
        },

        source_pose_frame=None

    )



def test_posture_exposure_above_threshold():

    frames = [

        make_frame(0, 0.0, 40),

        make_frame(1, 1.0, 85),

        make_frame(2, 2.0, 95),

        make_frame(3, 3.0, 70),

    ]


    analyzer = PostureAnalyzer()


    result = analyzer.analyze(

        frames,

        measurement_name="shoulder_flexion_right",

        threshold=80

    )


    assert result.max_angle == 95

    assert result.total_time >= 2.0

    assert len(result.episodes) == 1


    episode = result.episodes[0]

    assert episode.start == 1.0

    assert episode.end == 3.0
