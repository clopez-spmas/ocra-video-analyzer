"""Upper limb evaluator for ergonomic observations, extended to use MovementCounter(s)."""
from dataclasses import dataclass
from typing import Any, Dict, Iterable
from ocra.evaluation.evaluation_result import EvaluationResult
from ocra.standards.tr12295 import assess_repetition


class UpperLimbEvaluator:
    """Evaluate upper limb risk based on simple inputs.

    Inputs expected as a dict. Supported keys:
      - 'freq_per_min': numeric frequency (legacy)
      - 'force_score': numeric force score
      - 'movement_counters': iterable of MovementCounter instances

    If movement_counters is provided, the evaluator will compute an overall
    frequency per minute from the counters; otherwise it falls back to
    'freq_per_min' in the observations.
    """

    def evaluate(self, observations: Dict[str, Any]) -> EvaluationResult:
        force = observations.get("force_score", 0)

        # compute frequency per minute from movement counters when provided
        freq = observations.get("freq_per_min", None)
        counters = observations.get("movement_counters", None)
        if counters:
            # counters is expected to be an iterable of objects with `.count` and `.duration` properties
            total_count = 0
            max_duration = 0.0
            for c in counters:
                try:
                    total_count += int(c.count)
                except Exception:
                    continue
                try:
                    d = float(getattr(c, "duration", 0.0))
                except Exception:
                    d = 0.0
                if d > max_duration:
                    max_duration = d
            if max_duration > 0:
                # frequency per minute across counters, normalised by the longest observation window
                freq = (total_count / max_duration) * 60.0
            else:
                freq = 0.0

        if freq is None:
            freq = 0.0

        repetition_risk = assess_repetition(freq)
        # Naive numeric score: lower is better
        score = float(force) + (freq / 30.0)
        passed = score < 5.0
        details = {
            "repetition_risk": repetition_risk,
            "force": force,
            "frequency": freq,
            "counts": None,
        }
        if counters:
            details["counts"] = [int(getattr(c, "count", 0)) for c in counters]
        return EvaluationResult(score=score, passed=passed, details=details)
