"""Basic tests for the ergonomic evaluation framework."""
import pytest
from ocra.evaluation.upper_limb_evaluator import UpperLimbEvaluator
from ocra.evaluation.whole_body_evaluator import WholeBodyEvaluator
from ocra.evaluation.evaluation_result import EvaluationResult


def test_upper_limb_evaluator_basic():
    evalr = UpperLimbEvaluator()
    result = evalr.evaluate({"freq_per_min": 20, "force_score": 1.5})
    assert isinstance(result, EvaluationResult)
    assert "repetition_risk" in result.details


def test_whole_body_evaluator_basic():
    evalr = WholeBodyEvaluator()
    result = evalr.evaluate({"posture_score": 1.0, "lift_weight_kg": 3})
    assert isinstance(result, EvaluationResult)
    assert result.details["lifting_risk"] == "low"
