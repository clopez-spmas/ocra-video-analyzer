"""EN 1005-4: Safety of machinery — Human physical performance (placeholder)
"""

def assess_lifting_risk(weight_kg):
    """Very simple risk categorization for lifting tasks."""
    if weight_kg < 5:
        return "low"
    if weight_kg < 15:
        return "medium"
    return "high"
