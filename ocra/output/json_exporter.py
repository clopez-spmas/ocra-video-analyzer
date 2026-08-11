"""JSON exporter for FrameResult objects.

Provides helpers to convert FrameResult to serializable dictionaries and to
export an iterable of FrameResult instances into a JSON Lines (one JSON per
line) file. Keeping this as a small utility to avoid heavy third-party
dependencies and make outputs easy to stream.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable, Union, TextIO, Dict, Any

from ocra.output.frame_result import FrameResult


def frame_to_dict(frame: FrameResult) -> Dict[str, Any]:
    """Convert a FrameResult into a JSON-serializable dictionary.

    The pose is represented as a mapping from landmark id to a simple dict
    with x, y, z and visibility. If pose is None, the value is null.
    """

    pose_obj = None
    if frame.pose is not None:
        pose_obj = {
            str(l_id): {
                "x": lm.x,
                "y": lm.y,
                "z": lm.z,
                "visibility": lm.visibility,
            }
            for l_id, lm in frame.pose.landmarks.items()
        }

    return {
        "frame_index": frame.frame_index,
        "timestamp": frame.timestamp,
        "pose": pose_obj,
        "angles": frame.angles,
        "metadata": frame.metadata,
    }


def export_to_jsonl(frames: Iterable[FrameResult], dest: Union[str, Path, TextIO]) -> None:
    """Export frames as JSON Lines.

    Parameters
    ----------
    frames:
        Iterable of FrameResult instances.
    dest:
        Path or file-like object to write to. If a string/Path is provided a
        file will be opened for writing (UTF-8).
    """

    opened = None
    try:
        if isinstance(dest, (str, Path)):
            opened = open(dest, "w", encoding="utf8")
            fh = opened
        else:
            fh = dest

        for frame in frames:
            json.dump(frame_to_dict(frame), fh, ensure_ascii=False)
            fh.write("\n")
    finally:
        if opened is not None:
            opened.close()
