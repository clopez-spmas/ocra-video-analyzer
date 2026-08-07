"use strict";

/*
=========================================================
OCRA Video Analyzer

Biomechanical Measurement Catalog

Equivalente JavaScript de:
ocra/biomechanics/measurement_catalog.py

Responsabilidad:
- Definir qué mediciones existen.
- Indicar puntos anatómicos necesarios.
- No realiza cálculos.
- Los umbrales quedan pendientes.

=========================================================
*/


const BIOMECHANICAL_CATALOG = {


    /*
    =====================================================
    Tronco
    =====================================================
    */


    trunk_flexion: {

        name:
            "Flexión / extensión de tronco",

        type:
            "angle",

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



    trunk_lateral: {

        name:
            "Inclinación lateral de tronco",

        type:
            "angle",

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





    /*
    =====================================================
    Cuello
    =====================================================
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





    /*
    =====================================================
    Hombros
    =====================================================
    */


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







    /*
    =====================================================
    Codos
    =====================================================
    */


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







    /*
    =====================================================
    Muñecas
    =====================================================
    */


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







    /*
    =====================================================
    Rodillas
    =====================================================
    */


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








    /*
    =====================================================
    Tobillos
    =====================================================
    */


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





/*
=========================================================
Acceso global para navegador
=========================================================
*/


window.BiomechanicalCatalog =
    BIOMECHANICAL_CATALOG;
