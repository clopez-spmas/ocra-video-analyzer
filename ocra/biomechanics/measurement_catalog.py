"""Catalog of biomechanical measurements definitions.

Each entry defines a measurement id, human name, involved landmarks (MediaPipe
indices or virtual ids prefixed with 'V_') and a category set (names only).
Thresholds are intentionally left as None (Pendiente de definición) and must be
agreed in a future specification.
"""

from typing import Dict, List, Optional


MeasurementDef = Dict[str, Optional[object]]


CATALOG: Dict[str, MeasurementDef] = {
    # Trunk
    "trunk_flexion": {
        "name": "Trunk flexion/extension",
        "landmarks": ["V_HIP_CENTER", "V_SHOULDER_CENTER"],
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["neutral", "leve_flexion", "moderada_flexion", "severa_flexion"],
        "thresholds": None,  # Pendiente de definición
    },
    "trunk_lateral": {
        "name": "Trunk lateral inclination",
        "landmarks": ["V_HIP_CENTER", "V_SHOULDER_CENTER"],
        "plane": "frontal",
        "unit": "deg",
        "category_names": ["neutral", "leve", "moderado", "severo"],
        "thresholds": None,
    },

    # Neck / Head
    "neck_flexion": {
        "name": "Neck flexion/extension",
        "landmarks": ["V_NECK_BASE", "V_HEAD_CENTER", "V_SHOULDER_CENTER"],
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["neutral", "leve", "moderado", "severo"],
        "thresholds": None,
    },
    "neck_rotation": {
        "name": "Neck axial rotation",
        "landmarks": ["V_NECK_BASE", "V_HEAD_CENTER"],
        "plane": "transverse",
        "unit": "deg",
        "category_names": ["neutral", "leve", "moderado", "severo"],
        "thresholds": None,
    },

    # Shoulders (left/right)
    "shoulder_flexion_left": {
        "name": "Left shoulder flexion",
        "landmarks": [11, 13, 15],  # LEFT_SHOULDER (11), LEFT_ELBOW (13), LEFT_WRIST (15)
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["neutral", "elevacion_leve", "elevacion_moderada", "elevacion_severa"],
        "thresholds": None,
    },
    "shoulder_flexion_right": {
        "name": "Right shoulder flexion",
        "landmarks": [12, 14, 16],
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["neutral", "elevacion_leve", "elevacion_moderada", "elevacion_severa"],
        "thresholds": None,
    },

    # Elbows
    "elbow_flexion_left": {
        "name": "Left elbow flexion",
        "landmarks": [11, 13, 15],  # SHOULDER-ELBOW-WRIST
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["extension_neutra", "flexion_leve", "flexion_moderada", "flexion_severa"],
        "thresholds": None,
    },
    "elbow_flexion_right": {
        "name": "Right elbow flexion",
        "landmarks": [12, 14, 16],
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["extension_neutra", "flexion_leve", "flexion_moderada", "flexion_severa"],
        "thresholds": None,
    },

    # Wrists
    "wrist_flexion_left": {
        "name": "Left wrist flexion",
        "landmarks": [13, 15, 19],  # ELBOW-WRIST-INDEX
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["neutral", "flexion_leve", "flexion_moderada", "flexion_severa"],
        "thresholds": None,
    },
    "wrist_flexion_right": {
        "name": "Right wrist flexion",
        "landmarks": [14, 16, 20],
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["neutral", "flexion_leve", "flexion_moderada", "flexion_severa"],
        "thresholds": None,
    },

    # Knees
    "knee_flexion_left": {
        "name": "Left knee flexion",
        "landmarks": [23, 25, 27],  # HIP-KNEE-ANKLE
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["extendida", "flexion_leve", "flexion_moderada", "flexion_severa"],
        "thresholds": None,
    },
    "knee_flexion_right": {
        "name": "Right knee flexion",
        "landmarks": [24, 26, 28],
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["extendida", "flexion_leve", "flexion_moderada", "flexion_severa"],
        "thresholds": None,
    },

    # Ankles
    "ankle_dorsiflex_left": {
        "name": "Left ankle dorsiflexion",
        "landmarks": [25, 27, 31],  # KNEE-ANKLE-FOOT_INDEX
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["neutral", "dorsiflexion", "plantiflexion"],
        "thresholds": None,
    },
    "ankle_dorsiflex_right": {
        "name": "Right ankle dorsiflexion",
        "landmarks": [26, 28, 32],
        "plane": "sagittal",
        "unit": "deg",
        "category_names": ["neutral", "dorsiflexion", "plantiflexion"],
        "thresholds": None,
    },
}
