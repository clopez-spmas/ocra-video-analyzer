from __future__ import annotations

from typing import Dict, Any, Optional, List

from ocra.input.kinovea_json_provider import KinoveaJSONProvider
from ocra.biomechanics.biomechanical_analyzer import BiomechanicalAnalyzer

from ocra.analysis.analysis_result import AnalysisResult
from ocra.analysis.posture_analyzer import PostureAnalyzer

from ocra.models.pose_frame import PoseFrame


class AnalysisPipeline:
    """
    Pipeline principal de análisis biomecánico.

    Flujo:

        Kinovea JSON
             |
             v
        PoseFrame
             |
             v
        BiomechanicalFrame
             |
             v
        PostureAnalyzer
             |
             v
        AnalysisResult


    NO:
    - calcula puntuación OCRA
    - calcula riesgo ergonómico
    - modifica frames originales

    SI:
    - calcula ángulos biomecánicos
    - analiza exposición postural
    - calcula tiempos sobre umbral
    """



    def __init__(self) -> None:

        self.provider = KinoveaJSONProvider()

        self.analyzer = BiomechanicalAnalyzer()

        self.posture_analyzer = PostureAnalyzer()



    def run(
        self,
        tracking_path: str,
        video_path: Optional[str] = None,
        posture_thresholds: Optional[Dict[str, float]] = None

    ) -> AnalysisResult:


        # -------------------------------------------------
        # 1. Cargar datos Kinovea
        # -------------------------------------------------

        pose_frames: List[PoseFrame] = (
            self.provider.load(tracking_path)
        )



        # -------------------------------------------------
        # 2. Obtener medidas biomecánicas
        # -------------------------------------------------

        biomechanical_frames = []


        for pose_frame in pose_frames:

            biomechanical_frame = (
                self.analyzer.analyze_frame(
                    pose_frame
                )
            )

            biomechanical_frames.append(
                biomechanical_frame
            )



        # -------------------------------------------------
        # 3. Analizar exposición postural
        # -------------------------------------------------

        posture_results = {}



        if posture_thresholds:


            posture_results = (
                self.posture_analyzer.analyze_many(
                    biomechanical_frames,
                    posture_thresholds
                )
            )



        # -------------------------------------------------
        # 4. Metadata
        # -------------------------------------------------

        metadata: Dict[str, Any] = {

            "tracking_path":
                tracking_path,

            "video_path":
                video_path,

            "num_pose_frames":
                len(pose_frames),

            "num_biomechanical_frames":
                len(biomechanical_frames),

            "posture_analysis":
                bool(posture_thresholds)

        }



        # -------------------------------------------------
        # 5. Resultado final
        # -------------------------------------------------

        return AnalysisResult(

            pose_frames=pose_frames,

            biomechanical_frames=biomechanical_frames,

            posture_results=posture_results,

            metadata=metadata

        )
