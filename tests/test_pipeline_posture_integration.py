"""Integration test: AnalysisPipeline + posture analysis."""

from ocra.analysis.analysis_pipeline import AnalysisPipeline
from ocra.models.pose_frame import PoseFrame
from ocra.models.landmark import Landmark



def test_pipeline_generates_posture_results(monkeypatch):

    pipeline = AnalysisPipeline()


    # -------------------------------------------------
    # Crear frames biomecánicos simulados
    # -------------------------------------------------

    class FakeMeasurement:

        def __init__(self, value):

            self.value = value

            self.valid = True



    class FakeBiomechanicalFrame:


        def __init__(self, timestamp, angle):

            self.timestamp = timestamp

            self.measurements = {

                "shoulder_flexion_right":
                    FakeMeasurement(angle)

            }



        def get(self, name):

            return self.measurements.get(name)



    fake_frames = [

        FakeBiomechanicalFrame(0.0, 40),

        FakeBiomechanicalFrame(1.0, 85),

        FakeBiomechanicalFrame(2.0, 95),

        FakeBiomechanicalFrame(3.0, 70),

    ]



    result = pipeline.posture_analyzer.analyze_many(

        fake_frames,

        {
            "shoulder_flexion_right": 80
        }

    )


    posture = result[
        "shoulder_flexion_right"
    ]


    assert posture.max_value == 95

    assert posture.total_time_above_threshold == 2.0

    assert len(posture.episodes) == 1
