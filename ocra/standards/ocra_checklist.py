"""OCRA checklist definitions and helpers
"""

OCRA_CHECKLIST = [
    "Force",
    "Repetition",
    "Posture",
    "Recovery time",
]


def default_ocra_score(observations):
    """Compute a naive OCRA-like score from observations (placeholder).

    observations: dict with keys matching OCRA_CHECKLIST and numeric values.
    Returns a float score (lower is better).
    """
    score = 0.0
    for key in OCRA_CHECKLIST:
        score += float(observations.get(key, 0))
    return score
