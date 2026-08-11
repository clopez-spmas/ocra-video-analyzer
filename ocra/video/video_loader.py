"""
Video loading utilities for OCRA Video Analyzer.
"""

from __future__ import annotations

from pathlib import Path
from typing import Generator

import cv2
import numpy as np


class VideoLoader:
    """
    Utility class for loading and reading video files.
    """

    def __init__(self, video_path: str | Path):
        self.video_path = Path(video_path)

        if not self.video_path.exists():
            raise FileNotFoundError(f"Video not found: {self.video_path}")

        self.capture = cv2.VideoCapture(str(self.video_path))

        if not self.capture.isOpened():
            raise RuntimeError(f"Unable to open video: {self.video_path}")

        self.fps = float(self.capture.get(cv2.CAP_PROP_FPS))
        self.frame_count = int(self.capture.get(cv2.CAP_PROP_FRAME_COUNT))
        self.width = int(self.capture.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.capture.get(cv2.CAP_PROP_FRAME_HEIGHT))

    @property
    def duration(self) -> float:
        """Return video duration in seconds."""
        if self.fps == 0:
            return 0.0
        return self.frame_count / self.fps

    def frames(self) -> Generator[np.ndarray, None, None]:
        """
        Iterate sequentially through all frames.
        """
        while True:
            success, frame = self.capture.read()

            if not success:
                break

            yield frame

    def get_frame(self, frame_index: int) -> np.ndarray:
        """
        Read a specific frame.
        """
        if frame_index < 0 or frame_index >= self.frame_count:
            raise IndexError("Frame index out of range.")

        self.capture.set(cv2.CAP_PROP_POS_FRAMES, frame_index)

        success, frame = self.capture.read()

        if not success:
            raise RuntimeError(f"Unable to read frame {frame_index}")

        return frame

    def release(self) -> None:
        """Release OpenCV resources."""
        self.capture.release()
