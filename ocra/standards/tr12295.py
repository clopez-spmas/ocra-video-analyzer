"""TR 12295: Technical report example (placeholder)
"""

def assess_repetition(freq_per_min):
    """Assess repetition risk from frequency per minute."""
    if freq_per_min < 10:
        return "low"
    if freq_per_min < 30:
        return "medium"
    return "high"
