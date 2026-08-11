"""
Posture Analyzer

Analiza la exposición temporal a posturas a partir de BiomechanicalFrames.

Responsabilidades:
- Detectar cuándo un ángulo supera un umbral.
- Calcular tiempo total en postura.
- Detectar episodios de exposición.
- Obtener valores máximos.
- Trabajar únicamente con datos biomecánicos.

NO:
- Calcula puntuaciones OCRA.
- Calcula riesgo ergonómico.
- Modifica frames originales.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from ocra.biomechanics.biomechanical_frame import BiomechanicalFrame


# =========================================================
# Modelos de resultado
# =========================================================


@dataclass
class PostureEpisode:
    """
    Representa un periodo continuo donde una postura
    supera un umbral determinado.
    """

    start: float
    end: float

    @property
    def duration(self) -> float:
        return max(0.0, self.end - self.start)


@dataclass
class PostureResult:
    """
    Resultado temporal de una medición biomecánica.
    """

    measurement: str

    threshold: float

    max_value: float = 0.0

    total_time_above_threshold: float = 0.0

    episodes: List[PostureEpisode] = field(
        default_factory=list
    )

    @property
    def exposure_count(self) -> int:
        """
        Número de episodios detectados.
        """
        return len(self.episodes)

    def as_dict(self) -> Dict:
        """
        Conversión sencilla para exportación JSON.
        """

        return {
            "measurement": self.measurement,
            "threshold": self.threshold,
            "max_value": self.max_value,
            "total_time_above_threshold":
                self.total_time_above_threshold,
            "exposure_count":
                self.exposure_count,
            "episodes": [
                {
                    "start": e.start,
                    "end": e.end,
                    "duration": e.duration
                }
                for e in self.episodes
            ]
        }


# =========================================================
# Analizador temporal
# =========================================================


class PostureAnalyzer:
    """
    Analizador de posturas mantenidas.

    Entrada:
        List[BiomechanicalFrame]

    Salida:
        PostureResult

    Ejemplo:

        result = analyzer.analyze(
            frames,
            "shoulder_right",
            80
        )

    Devuelve:
        - tiempo total con hombro >80º
        - número de episodios
        - duración de cada episodio
        - ángulo máximo
    """

    def analyze(
        self,
        frames: List[BiomechanicalFrame],
        measurement: str,
        threshold: float
    ) -> PostureResult:


        result = PostureResult(
            measurement=measurement,
            threshold=threshold
        )


        active = False

        start_time: Optional[float] = None


        for frame in frames:

            measure = frame.get(measurement)


            # Si no existe la medición no se cuenta
            if measure is None:
                continue


            # Si el cálculo no es válido no se cuenta
            if not measure.valid:
                continue


            value = measure.value


            if value is None:
                continue


            # Guardar máximo angular
            if value > result.max_value:
                result.max_value = value


            above_threshold = (
                value >= threshold
            )


            # Inicio de exposición
            if above_threshold and not active:

                active = True

                start_time = frame.timestamp


            # Final de exposición
            elif not above_threshold and active:

                active = False


                if start_time is not None:

                    episode = PostureEpisode(
                        start=start_time,
                        end=frame.timestamp
                    )


                    result.episodes.append(
                        episode
                    )


                    result.total_time_above_threshold += (
                        episode.duration
                    )


                start_time = None



        # Cerrar episodio si el vídeo termina
        # mientras mantiene la postura

        if active and start_time is not None and frames:

            episode = PostureEpisode(
                start=start_time,
                end=frames[-1].timestamp
            )


            result.episodes.append(
                episode
            )


            result.total_time_above_threshold += (
                episode.duration
            )


        return result



    def analyze_many(
        self,
        frames: List[BiomechanicalFrame],
        thresholds: Dict[str, float]
    ) -> Dict[str, PostureResult]:
        """
        Analiza múltiples articulaciones.

        Ejemplo:

        thresholds = {
            "shoulder_right":80,
            "shoulder_left":80,
            "trunk_flexion":20
        }

        """

        results = {}


        for measurement, threshold in thresholds.items():

            results[measurement] = self.analyze(
                frames,
                measurement,
                threshold
            )


        return results
