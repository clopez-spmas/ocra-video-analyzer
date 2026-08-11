"""CSV exporter for FrameResult objects.

Exports analysis results in a simple, tabular CSV format where each row
represents a single joint angle measurement for a frame. This makes it
easy to load into spreadsheets or data analysis tools.
"""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Iterable, Union, TextIO

from ocra.output.frame_result import FrameResult


def export_to_csv(frames: Iterable[FrameResult], dest: Union[str, Path, TextIO]) -> None:
    """Export frames to CSV.

    CSV columns:
      - frame_index
      - timestamp
      - joint
      - angle

    Each joint measurement produces one row. Frames with no computed angles
    will not produce rows (but the function itself will not fail).
    """

    opened = None
    try:
        if isinstance(dest, (str, Path)):
            opened = open(dest, "w", newline="", encoding="utf8")
            fh = opened
        else:
            fh = dest

        writer = csv.writer(fh)
        writer.writerow(["frame_index", "timestamp", "joint", "angle"])

        for frame in frames:
            for joint, angle in (frame.angles or {}).items():
                writer.writerow([frame.frame_index, frame.timestamp, joint, "" if angle is None else angle])
    finally:
        if opened is not None:
            opened.close()
