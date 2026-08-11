"""Kinovea JSON provider.

This module provides a small transformer that reads JSON exports produced by
Kinovea (or compatible JSON structures) and converts them into the project's
internal PoseFrame and Landmark objects. The provider does NOT perform any
interpolation or biomechanical computation — its sole responsibility is to
map input fields into the internal model and to attach the required
valid/confidence/reason/source metadata.

Usage example:
    from ocra.input.kinovea_json_provider import KinoveaJSONProvider
    provider = KinoveaJSONProvider()
    frames = provider.load("kinovea_export.json")  # -> list[PoseFrame]

Supported input shapes (flexible):
- A top-level list of frame objects.
- A dict containing a key like 'Frames' or 'frames' with a list of frame objects.
- A dict with 'Tracks' whose entries are point trajectories (a minimal conversion
  from tracks to per-frame points is attempted).

Each frame object is expected to contain an index and a timestamp and a list of
points/landmarks. Point entries may use a variety of key casings (Id/ID/id,
X/x, Y/y, Z/z, Confidence/confidence, Valid/valid, Reason/reason). The provider
maps those fields where present.
"""
from __future__ import annotations

import json
from typing import Any, Dict, List

from ocra.models.pose_frame import PoseFrame
from ocra.models.landmark import Landmark


class KinoveaJSONProvider:
    def __init__(self, source: str = "kinovea") -> None:
        self.source = source

    def load(self, path: str) -> List[PoseFrame]:
        """Load Kinovea JSON from a file path and return a list of PoseFrame."""
        with open(path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        return self._parse(data)

    def _parse(self, data: Any) -> List[PoseFrame]:
        # locate frames list
        frames = None
        if isinstance(data, dict):
            for key in ("Frames", "frames", "frames_list", "data"):
                if key in data and isinstance(data[key], list):
                    frames = data[key]
                    break
            if frames is None and "Tracks" in data and isinstance(data["Tracks"], list):
                frames = self._frames_from_tracks(data["Tracks"])  # convert tracks -> frames
        elif isinstance(data, list):
            frames = data

        if frames is None:
            raise ValueError("Unrecognized Kinovea JSON structure: expected frames list or Tracks")

        out: List[PoseFrame] = []
        for i, f in enumerate(frames):
            idx = None
            timestamp = 0.0
            # flexible field names
            if isinstance(f, dict):
                idx = f.get("Index") or f.get("index") or f.get("frame") or f.get("frame_index")
                timestamp = f.get("Time") or f.get("time") or f.get("timestamp") or 0.0
                points = (
                    f.get("Points")
                    or f.get("points")
                    or f.get("Landmarks")
                    or f.get("landmarks")
                    or f.get("Keypoints")
                    or f.get("keypoints")
                    or []
                )
            else:
                # not a dict: skip
                continue

            landmarks: Dict[int, Landmark] = {}
            for p in points:
                if not isinstance(p, dict):
                    continue
                # id detection
                lid = p.get("Id") or p.get("ID") or p.get("id") or p.get("index") or p.get("name")
                if lid is None:
                    # skip points without id
                    continue
                try:
                    lid_int = int(lid)
                except Exception:
                    # if not convertible, skip
                    continue

                # coordinates
                x = p.get("X") or p.get("x") or p.get("pos_x") or p.get("posX") or 0.0
                y = p.get("Y") or p.get("y") or p.get("pos_y") or p.get("posY") or 0.0
                z = p.get("Z") or p.get("z") or p.get("pos_z") or p.get("posZ") or 0.0

                # visibility/confidence
                visibility = p.get("Visibility") or p.get("visibility") or p.get("visible") or None
                confidence = None
                if "confidence" in p:
                    confidence = p.get("confidence")
                elif "Confidence" in p:
                    confidence = p.get("Confidence")
                elif visibility is not None:
                    # if only visibility present, do not assume numeric confidence semantics
                    try:
                        confidence = float(visibility)
                    except Exception:
                        confidence = None

                # valid/reason
                valid = True
                if "valid" in p:
                    valid = bool(p.get("valid"))
                elif "Valid" in p:
                    valid = bool(p.get("Valid"))

                reason = p.get("reason") or p.get("Reason") or None

                # Build Landmark. We preserve backwards compatibility by storing
                # defaults when optional fields are absent.
                try:
                    lm = Landmark(
                        id=lid_int,
                        x=float(x),
                        y=float(y),
                        z=float(z),
                        visibility=float(visibility) if visibility is not None else 0.0,
                        valid=bool(valid),
                        confidence=float(confidence) if confidence is not None else None,
                        reason=str(reason) if reason is not None else None,
                        source=self.source,
                    )
                except Exception:
                    # If conversion fails, record a minimal invalid landmark
                    lm = Landmark(id=lid_int, x=0.0, y=0.0, z=0.0, visibility=0.0, valid=False, confidence=None, reason="calculation_error", source=self.source)

                landmarks[lid_int] = lm

            frame_index = int(idx) if idx is not None else i
            try:
                timestamp_f = float(timestamp)
            except Exception:
                timestamp_f = 0.0

            pf = PoseFrame(frame_index=frame_index, timestamp=timestamp_f, landmarks=landmarks)
            out.append(pf)

        return out

    def _frames_from_tracks(self, tracks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Attempt to convert a Kinovea-like Tracks export into per-frame dicts.

        The function expects tracks to be an iterable of track objects, each
        containing point samples with frame/time and coordinates. This is a
        best-effort conversion and aims to support common Kinovea JSON shapes.
        """
        # build mapping: frame_index -> list of point dicts
        frames_map: Dict[int, List[Dict[str, Any]]] = {}
        for t in tracks:
            # track id may be provided
            track_points = t.get("Points") or t.get("points") or t.get("samples") or []
            for s in track_points:
                # s expected to contain frame/index and coordinates
                idx = s.get("Index") or s.get("index") or s.get("frame")
                if idx is None:
                    continue
                try:
                    idx_int = int(idx)
                except Exception:
                    continue
                # construct a point dict compatible with the parser above
                pt = {}
                pt["Id"] = t.get("Id") or t.get("ID") or t.get("id") or t.get("track_id")
                pt["X"] = s.get("X") or s.get("x") or s.get("pos_x")
                pt["Y"] = s.get("Y") or s.get("y") or s.get("pos_y")
                pt["Z"] = s.get("Z") or s.get("z") or s.get("pos_z")
                frames_map.setdefault(idx_int, []).append(pt)

        # build frames list
        frames: List[Dict[str, Any]] = []
        for idx in sorted(frames_map.keys()):
            frames.append({"Index": idx, "Time": idx, "Points": frames_map[idx]})
        return frames
