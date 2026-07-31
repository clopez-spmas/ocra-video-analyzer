from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Dict, Any

from ocra.models.pose_frame import PoseFrame
from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame


@dataclass
class AnalysisResult:
    """
    Container principal del análisis biomecánico.

    Contiene:

    - frames originales de Kinovea
    - frames biomecánicos calculados
    - resultados temporales de postura

    No contiene:
    - puntuación OCRA
    - evaluación normativa
    - nivel de riesgo
    """

    pose_frames: List[PoseFrame]

    biomechanical_frames: List[BiomechanicalFrame]

    posture_results: Dict[str, Any] = field(
        default_factory=dict
    )

    metadata: Dict[str, Any] = field(
        default_factory=dict
    )


    def as_dict(self) -> Dict[str, Any]:
        """
        Resumen exportable.
        """

        return {

            "metadata": dict(self.metadata),

            "num_pose_frames":
                len(self.pose_frames),

            "num_biomechanical_frames":
                len(self.biomechanical_frames),

            "posture_results":
                {
                    key:
                    value.as_dict()
                    if hasattr(value, "as_dict")
                    else value

                    for key, value
                    in self.posture_results.items()
                }
        }
