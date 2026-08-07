"use strict";

/*
=========================================================
Analysis Result Model

Equivalente al AnalysisResult de Python.

Responsabilidades:

- Mantener el resultado completo del análisis.
- Separar datos originales de datos calculados.
- No contiene evaluación OCRA.
- No contiene nivel de riesgo.

Contiene:

- frames originales Kinovea
- frames anatómicos adaptados
- resultados biomecánicos
- resultados postura
- resultados movimientos
- metadatos

=========================================================
*/


class AnalysisResult {


    constructor() {


        this.metadata = {};


        /*
        -----------------------------------------
        Datos originales
        -----------------------------------------
        */

        this.poseFrames = [];



        /*
        -----------------------------------------
        Datos preparados para biomecánica
        -----------------------------------------
        */

        this.anatomicalFrames = [];



        /*
        -----------------------------------------
        Resultados biomecánicos
        -----------------------------------------
        */

        this.biomechanicalFrames = [];



        /*
        -----------------------------------------
        Resultados temporales
        -----------------------------------------
        */

        this.postureResults = {};

        this.movementResults = {};



        /*
        -----------------------------------------
        Evaluación OCRA

        Se mantiene vacío.
        El cálculo lo realizará el especialista.
        -----------------------------------------
        */

        this.ocra = null;


    }



    /*
    =====================================================
    Cargar metadatos
    =====================================================
    */


    setMetadata(
        data
    ) {


        this.metadata = {

            ...this.metadata,

            ...data

        };


    }





    /*
    =====================================================
    Añadir frames Kinovea
    =====================================================
    */


    setPoseFrames(
        frames
    ) {


        this.poseFrames =
            Array.isArray(frames)
            ?
            frames
            :
            [];


    }





    /*
    =====================================================
    Añadir frames anatómicos
    =====================================================
    */


    setAnatomicalFrames(
        frames
    ) {


        this.anatomicalFrames =
            Array.isArray(frames)
            ?
            frames
            :
            [];


    }





    /*
    =====================================================
    Añadir resultados biomecánicos
    =====================================================
    */


    setBiomechanicalFrames(
        results
    ) {


        this.biomechanicalFrames =
            Array.isArray(results)
            ?
            results
            :
            [];


    }





    /*
    =====================================================
    Exportación simple
    =====================================================
    */


    asObject() {


        return {


            metadata:
                this.metadata,


            numPoseFrames:
                this.poseFrames.length,


            numAnatomicalFrames:
                this.anatomicalFrames.length,


            numBiomechanicalFrames:
                this.biomechanicalFrames.length,



            postureResults:
                this.postureResults,


            movementResults:
                this.movementResults,


            ocra:
                this.ocra


        };


    }



}
