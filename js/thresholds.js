"use strict";

/*
=========================================================
OCRA Video Analyzer

Threshold Configuration

Los valores de DEFAULT_THRESHOLDS son los valores iniciales.
Los cambios realizados por el usuario solo son válidos para
el análisis actual y se restauran al comenzar un nuevo análisis.
=========================================================
*/

const DEFAULT_THRESHOLDS = {

    shoulder_flexion_left: 80,
    shoulder_flexion_right: 80,

    elbow_flexion_left: 90,
    elbow_flexion_right: 90,

    trunk_flexion: 20,
    trunk_lateral: 20,

    neck_flexion: 20

};


const Thresholds = {

    shoulder_flexion_left: {
        label: "Flexión hombro izquierdo",
        value: DEFAULT_THRESHOLDS.shoulder_flexion_left,
        unit: "deg"
    },

    shoulder_flexion_right: {
        label: "Flexión hombro derecho",
        value: DEFAULT_THRESHOLDS.shoulder_flexion_right,
        unit: "deg"
    },

    elbow_flexion_left: {
        label: "Flexión codo izquierdo",
        value: DEFAULT_THRESHOLDS.elbow_flexion_left,
        unit: "deg"
    },

    elbow_flexion_right: {
        label: "Flexión codo derecho",
        value: DEFAULT_THRESHOLDS.elbow_flexion_right,
        unit: "deg"
    },

    trunk_flexion: {
        label: "Flexión de tronco",
        value: DEFAULT_THRESHOLDS.trunk_flexion,
        unit: "deg"
    },

    trunk_lateral: {
        label: "Inclinación lateral tronco",
        value: DEFAULT_THRESHOLDS.trunk_lateral,
        unit: "deg"
    },

    neck_flexion: {
        label: "Flexión cervical",
        value: DEFAULT_THRESHOLDS.neck_flexion,
        unit: "deg"
    }

};


/*
=========================================================
RESTAURAR VALORES POR DEFECTO
=========================================================
*/

function resetThresholds() {

    Object.keys(DEFAULT_THRESHOLDS).forEach(id => {

        if (Thresholds[id]) {
            Thresholds[id].value =
                DEFAULT_THRESHOLDS[id];
        }

    });

    return true;
}


/*
=========================================================
OBTENER UMBRAL
=========================================================
*/

function getThreshold(id) {

    if (!Thresholds[id]) {
        return null;
    }

    return Number(Thresholds[id].value);
}


/*
=========================================================
MODIFICAR UMBRAL
=========================================================
*/

function setThreshold(id, value) {

    if (!Thresholds[id]) {
        return false;
    }

    const numericValue = Number(value);

    if (
        !Number.isFinite(numericValue) ||
        numericValue < 0
    ) {
        return false;
    }

    Thresholds[id].value = numericValue;

    return true;
}


/*
=========================================================
OBTENER TODOS LOS UMBRALES
=========================================================
*/

function getAllThresholds() {
    return Thresholds;
}


/*
=========================================================
EXPORTACIÓN NAVEGADOR
=========================================================
*/

window.Thresholds = Thresholds;
window.DEFAULT_THRESHOLDS = DEFAULT_THRESHOLDS;
window.getThreshold = getThreshold;
window.setThreshold = setThreshold;
window.getAllThresholds = getAllThresholds;
window.resetThresholds = resetThresholds;