"""Result object for evaluations."""
from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class EvaluationResult:
    score: float
    passed: bool
    details: Dict[str, Any]
