"""Upper limb evaluator for ergonomic observations."""
from dataclasses import dataclass
from ocra.evaluation.evaluation_result import EvaluationResult
from ocra.standards.tr12295 import assess_repetition


class UpperLimbEvaluator:
    """Evaluate upper limb risk based on simple inputs.

    Inputs expected as a dict with keys: 'freq_per_min', 'force_score'
    """

    def evaluate(self, observations: dict) -> EvaluationResult:
        freq = observations.get("freq_per_min", 0)
        force = observations.get("force_score", 0)

        repetition_risk = assess_repetition(freq)
        # Naive numeric score: lower is better
        score = float(force) + (freq / 30.0)
        passed = score < 5.0
        details = {
            "repetition_risk": repetition_risk,
            "force": force,
            "frequency": freq,
        }
        return EvaluationResult(score=score, passed=passed, details=details)
