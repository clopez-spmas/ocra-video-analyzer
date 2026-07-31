"""
Biomechanical analysis exporter.

Exports AnalysisResult objects containing:

- metadata
- biomechanical measurements per frame
- posture temporal analysis

This module does NOT export OCRA scores.
It only exports biomechanical observations.
"""

from __future__ import annotations

import json

from pathlib import Path
from typing import Union, TextIO, Dict, Any

from ocra.analysis.analysis_result import AnalysisResult



def measurement_to_dict(measurement) -> Dict[str, Any]:
    """
    Convert BiomechanicalMeasurement into JSON data.
    """

    return {

        "name":
            measurement.name,

        "value":
            measurement.value,

        "unit":
            measurement.unit,

        "valid":
            measurement.valid,

        "confidence":
            measurement.confidence,

        "reason":
            measurement.reason,

        "calculation_method":
            measurement.calculation_method

    }



def biomechanical_frame_to_dict(frame) -> Dict[str, Any]:
    """
    Convert BiomechanicalFrame into JSON data.
    """

    return {

        "frame_index":
            frame.frame_index,

        "timestamp":
            frame.timestamp,

        "measurements":
            {
                name:
                measurement_to_dict(measurement)

                for name, measurement
                in frame.measurements.items()
            }

    }



def analysis_result_to_dict(
    result: AnalysisResult
) -> Dict[str, Any]:
    """
    Convert complete AnalysisResult into serializable dict.
    """

    return {

        "metadata":
            result.metadata,


        "frames":

            [
                biomechanical_frame_to_dict(frame)

                for frame
                in result.biomechanical_frames
            ],


        "postures":

            {
                name:

                posture.as_dict()

                if hasattr(posture, "as_dict")

                else posture

                for name, posture
                in result.posture_results.items()
            }

    }



def export_analysis_json(
    result: AnalysisResult,
    destination: Union[str, Path, TextIO]
) -> None:
    """
    Export biomechanical analysis to JSON.
    """

    opened = None

    try:

        if isinstance(destination, (str, Path)):

            opened = open(
                destination,
                "w",
                encoding="utf8"
            )

            fh = opened

        else:

            fh = destination



        json.dump(
            analysis_result_to_dict(result),
            fh,
            ensure_ascii=False,
            indent=2
        )


    finally:

        if opened is not None:

            opened.close()
