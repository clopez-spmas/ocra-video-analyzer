"use strict";

/*
=========================================================
OCRA Video Analyzer
Analysis Result Model
=========================================================

Cada instancia de AnalysisResult representa
EXCLUSIVAMENTE UN VÍDEO.

No contiene resultados globales.

Los resultados globales se calculan en app.js
a partir del array analysisResults.
=========================================================
*/


class AnalysisResult {

    constructor() {

        /*
        -----------------------------------------
        Identificación del vídeo
        -----------------------------------------
        */

        this.videoIndex =
            0;

        this.videoNumber =
            1;

        this.fileName =
            "";


        /*
        -----------------------------------------
        Metadatos
        -----------------------------------------
        */

        this.metadata =
            {};


        /*
        -----------------------------------------
        Datos originales Kinovea
        -----------------------------------------
        */

        this.poseFrames =
            [];


        /*
        -----------------------------------------
        Datos anatómicos
        -----------------------------------------
        */

        this.anatomicalFrames =
            [];


        /*
        -----------------------------------------
        Resultados biomecánicos
        -----------------------------------------
        */

        this.biomechanicalFrames =
            [];


        /*
        -----------------------------------------
        Resultados temporales
        -----------------------------------------
        */

        this.postureResults =
            {};

        this.movementResults =
            {};


        /*
        -----------------------------------------
        Configuración de ciclo de ESTE vídeo
        -----------------------------------------
        */

        this.cycleConfig = {

            enabled:
                false,

            mode:
                "video",

            cycleTime:
                null,

            startTime:
                null,

            endTime:
                null

        };


        /*
        -----------------------------------------
        Evaluación OCRA

        No se calcula aquí.
        -----------------------------------------
        */

        this.ocra =
            null;

    }


    /*
    =====================================================
    METADATOS
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
    FRAMES KINOVEA
    =====================================================
    */

    setPoseFrames(
        frames
    ) {

        this.poseFrames =
            Array.isArray(
                frames
            )
                ? frames
                : [];

    }


    /*
    =====================================================
    FRAMES ANATÓMICOS
    =====================================================
    */

    setAnatomicalFrames(
        frames
    ) {

        this.anatomicalFrames =
            Array.isArray(
                frames
            )
                ? frames
                : [];

    }


    /*
    =====================================================
    FRAMES BIOMECÁNICOS
    =====================================================
    */

    setBiomechanicalFrames(
        results
    ) {

        this.biomechanicalFrames =
            Array.isArray(
                results
            )
                ? results
                : [];

    }


    /*
    =====================================================
    CONFIGURACIÓN DE CICLO
    =====================================================
    */

    setCycleConfig(
        config
    ) {

        if (
            !config
            ||
            typeof config !==
            "object"
        ) {

            this.cycleConfig = {

                enabled:
                    false,

                mode:
                    "video",

                cycleTime:
                    null,

                startTime:
                    null,

                endTime:
                    null

            };

            return;

        }


        this.cycleConfig = {

            enabled:
                config.enabled === true,

            mode:
                config.mode ||
                "video",

            cycleTime:
                Number.isFinite(
                    Number(
                        config.cycleTime
                    )
                )
                    ? Number(
                        config.cycleTime
                    )
                    : null,

            startTime:
                Number.isFinite(
                    Number(
                        config.startTime
                    )
                )
                    ? Number(
                        config.startTime
                    )
                    : null,

            endTime:
                Number.isFinite(
                    Number(
                        config.endTime
                    )
                )
                    ? Number(
                        config.endTime
                    )
                    : null

        };

    }


    /*
    =====================================================
    EXPORTACIÓN
    =====================================================
    */

    asObject() {

        return {

            metadata:
                this.metadata,

            videoIndex:
                this.videoIndex,

            videoNumber:
                this.videoNumber,

            fileName:
                this.fileName,

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

            cycleConfig:
                this.cycleConfig,

            ocra:
                this.ocra

        };

    }

}


/*
=========================================================
EXPORTACIÓN GLOBAL
=========================================================
*/

window.AnalysisResult =
    AnalysisResult;