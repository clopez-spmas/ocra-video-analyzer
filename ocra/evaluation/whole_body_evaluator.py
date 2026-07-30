"""Whole body evaluator combining posture and load assessments."""
from ocra.evaluation.evaluation_result import EvaluationResult
from ocra.standards.iso11226 import assess_posture_risk
from ocra.standards.en1005_4 import assess_lifting_risk


class WholeBodyEvaluator:
    def evaluate(self, observations: dict) -> EvaluationResult:
        posture = observations.get("posture_score", 0)
        lift_weight = observations.get("lift_weight_kg", 0)

        posture_risk = assess_posture_risk(posture)
        lifting_risk = assess_lifting_risk(lift_weight)

        score = float(posture) * 0.7 + (lift_weight / 10.0)
        passed = score < 5.0
        details = {
            "posture_risk": posture_risk,
            "lifting_risk": lifting_risk,
            "posture_score": posture,
            "lift_weight_kg": lift_weight,
        }
        return EvaluationResult(score=score, passed=passed, details=details)
