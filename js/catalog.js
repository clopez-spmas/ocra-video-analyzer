"use strict";

/*
==========================================================
OCRA VIDEO ANALYZER
Archivo: catalog.js

CATÁLOGO DE MEDICIONES BIOMECÁNICAS

Responsabilidades:

- Definir las mediciones biomecánicas disponibles.
- Definir los puntos anatómicos necesarios.
- Definir el plano de análisis.
- Definir la unidad.

NO realiza cálculos.

NO realiza clasificación de riesgo.

NO calcula puntuación OCRA.

Los umbrales se gestionan de forma independiente.

==========================================================
*/


const BIOMECHANICAL_CATALOG = {


    /* =====================================================
       TRONCO
       ===================================================== */


    /*
    ---------------------------------------------------------
    FLEXIÓN / EXTENSIÓN DE TRONCO

    Se calcula mediante DOS puntos:

        pelvis
             |
             |
        shoulder_center

    No necesitamos un tercer punto.

    El biomechanics.js calcula la orientación del segmento
    respecto a la vertical.
    ---------------------------------------------------------
    */

    trunk_flexion: {

        name:
            "Flexión / extensión de tronco",

        type:
            "segment_angle",

        points: [

            "pelvis",

            "shoulder_center"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /*
    ---------------------------------------------------------
    INCLINACIÓN LATERAL DE TRONCO

    También utiliza únicamente el segmento formado por:

        pelvis
             |
             |
        shoulder_center

    La medición se realiza en el plano frontal.
    ---------------------------------------------------------
    */

    trunk_lateral: {

        name:
            "Inclinación lateral de tronco",

        type:
            "segment_angle",

        points: [

            "pelvis",

            "shoulder_center"

        ],

        plane:
            "frontal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       CUELLO
       ===================================================== */


    /*
    ---------------------------------------------------------
    FLEXIÓN / EXTENSIÓN CERVICAL

        head
          \
           neck
             \
              shoulder_center

    El vértice del ángulo es neck.
    ---------------------------------------------------------
    */

    neck_flexion: {

        name:
            "Flexión / extensión cervical",

        type:
            "angle",

        points: [

            "head",

            "neck",

            "shoulder_center"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       HOMBRO IZQUIERDO
       ===================================================== */


    shoulder_flexion_left: {

        name:
            "Flexión hombro izquierdo",

        type:
            "angle",

        points: [

            "left_elbow",

            "left_shoulder",

            "pelvis"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       HOMBRO DERECHO
       ===================================================== */


    shoulder_flexion_right: {

        name:
            "Flexión hombro derecho",

        type:
            "angle",

        points: [

            "right_elbow",

            "right_shoulder",

            "pelvis"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       CODO IZQUIERDO
       ===================================================== */


    elbow_flexion_left: {

        name:
            "Flexión codo izquierdo",

        type:
            "angle",

        points: [

            "left_shoulder",

            "left_elbow",

            "left_wrist"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       CODO DERECHO
       ===================================================== */


    elbow_flexion_right: {

        name:
            "Flexión codo derecho",

        type:
            "angle",

        points: [

            "right_shoulder",

            "right_elbow",

            "right_wrist"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       MUÑECA IZQUIERDA
       ===================================================== */


    wrist_flexion_left: {

        name:
            "Flexión muñeca izquierda",

        type:
            "angle",

        points: [

            "left_elbow",

            "left_wrist",

            "left_index"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       MUÑECA DERECHA
       ===================================================== */


    wrist_flexion_right: {

        name:
            "Flexión muñeca derecha",

        type:
            "angle",

        points: [

            "right_elbow",

            "right_wrist",

            "right_index"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       RODILLA IZQUIERDA
       ===================================================== */


    knee_flexion_left: {

        name:
            "Flexión rodilla izquierda",

        type:
            "angle",

        points: [

            "left_hip",

            "left_knee",

            "left_ankle"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       RODILLA DERECHA
       ===================================================== */


    knee_flexion_right: {

        name:
            "Flexión rodilla derecha",

        type:
            "angle",

        points: [

            "right_hip",

            "right_knee",

            "right_ankle"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       TOBILLO IZQUIERDO
       ===================================================== */


    ankle_left: {

        name:
            "Movimiento tobillo izquierdo",

        type:
            "angle",

        points: [

            "left_knee",

            "left_ankle",

            "left_foot"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    },


    /* =====================================================
       TOBILLO DERECHO
       ===================================================== */


    ankle_right: {

        name:
            "Movimiento tobillo derecho",

        type:
            "angle",

        points: [

            "right_knee",

            "right_ankle",

            "right_foot"

        ],

        plane:
            "sagittal",

        unit:
            "deg",

        thresholds:
            null

    }

};


/* ==========================================================
   EXPORTACIÓN GLOBAL PARA NAVEGADOR

   Este proyecto utiliza scripts clásicos.

   NO utilizar:

       export
       import

========================================================== */

window.BiomechanicalCatalog =
    BIOMECHANICAL_CATALOG;


/* ==========================================================
   COMPATIBILIDAD
========================================================== */

window.CATALOG =
    BIOMECHANICAL_CATALOG;


/* ==========================================================
   CONFIRMACIÓN
========================================================== */

console.log(
    "OCRA Video Analyzer: catalog.js cargado correctamente"
);