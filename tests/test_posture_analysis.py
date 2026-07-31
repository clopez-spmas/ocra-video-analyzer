"""Tests for temporal posture analysis."""

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
            "shoulder_flexion_right": measurement
        },

        source_pose_frame=None

    )



def test_posture_exposure_above_threshold():

    frames = [

        make_frame(
            0,
            0.0,
            40
        ),

        make_frame(
            1,
            1.0,
            85
        ),

        make_frame(
            2,
            2.0,
            95
        ),

        make_frame(
            3,
            3.0,
            70
        ),

    ]


    analyzer = PostureAnalyzer()


    result = analyzer.analyze(

        frames,

        measurement="shoulder_flexion_right",

        threshold=80

    )


    # Valor angular máximo alcanzado

    assert result.max_value == 95



    # Tiempo total por encima del umbral

    assert result.total_time_above_threshold >= 2.0



    # Debe existir un único episodio

    assert len(result.episodes) == 1



    episode = result.episodes[0]


    # Comprobación del intervalo de exposición

    assert episode.start == 1.0

    assert episode.end == 3.0



    # Duración del episodio

    assert episode.duration == 2.0
