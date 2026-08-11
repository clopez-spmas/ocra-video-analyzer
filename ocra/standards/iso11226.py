"""ISO 11226: Ergonomics - Static Working Postures (placeholder)
"""

def assess_posture_risk(posture_score):
    """Return risk level based on a numeric posture_score.

    This is a simplified placeholder implementation.
    """
    if posture_score < 2:
        return "low"
    if posture_score < 4:
        return "medium"
    return "high"
