"use strict";

/*
=========================================================
OCRA Video Analyzer

Threshold Configuration

Responsabilidad:
- Definir valores iniciales de exposición angular.
- Permitir modificación por el usuario.
- Mantener los valores disponibles para el análisis.
- No calcula riesgo.
- No realiza puntuación OCRA.

Las unidades son grados (deg).
=========================================================
*/


const Thresholds = {


    /*
    -----------------------------------------
    Hombros
    -----------------------------------------
    */


    shoulder_flexion_left: {

        label:
            "Flexión hombro izquierdo",

        value:
            80,

        unit:
            "deg"

    },


    shoulder_flexion_right: {

        label:
            "Flexión hombro derecho",

        value:
            80,

        unit:
            "deg"

    },


    /*
    -----------------------------------------
    Codos
    -----------------------------------------
    */


    elbow_flexion_left: {

        label:
            "Flexión codo izquierdo",

        value:
            90,

        unit:
            "deg"

    },


    elbow_flexion_right: {

        label:
            "Flexión codo derecho",

        value:
            90,

        unit:
            "deg"

    },


    /*
    -----------------------------------------
    Tronco
    -----------------------------------------
    */


    trunk_flexion: {

        label:
            "Flexión de tronco",

        value:
            20,

        unit:
            "deg"

    },


    trunk_lateral: {

        label:
            "Inclinación lateral tronco",

        value:
            20,

        unit:
            "deg"

    },


    /*
    -----------------------------------------
    Cuello
    -----------------------------------------
    */


    neck_flexion: {

        label:
            "Flexión cervical",

        value:
            20,

        unit:
            "deg"

    }

};


/*
=========================================================
OBTENER UMBRAL
=========================================================
*/

function getThreshold(
    id
) {

    if (
        !Thresholds[id]
    ) {

        return null;

    }


    return Number(
        Thresholds[id].value
    );

}


/*
=========================================================
MODIFICAR UMBRAL
=========================================================
*/

function setThreshold(
    id,
    value
) {

    if (
        !Thresholds[id]
    ) {

        return false;

    }


    const numericValue =
        Number(value);


    if (
        !Number.isFinite(
            numericValue
        ) ||
        numericValue < 0
    ) {

        return false;

    }


    Thresholds[id].value =
        numericValue;


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

window.Thresholds =
    Thresholds;


window.getThreshold =
    getThreshold;


window.setThreshold =
    setThreshold;


window.getAllThresholds =
    getAllThresholds;