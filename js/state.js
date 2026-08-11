"use strict";

/*
==========================================================
OCRA Video Analyzer v5
Archivo: state.js
Estado global de la aplicación
==========================================================
*/


/* ==========================================================
   ESTADO GLOBAL
   ========================================================== */

const OCRAState = {

    /* ------------------------------------------------------
       Configuración general
       ------------------------------------------------------ */

    videoCount: 1,

    currentVideoIndex: 0,

    isAnalyzing: false,

    analysisCompleted: false,


    /* ------------------------------------------------------
       Archivos seleccionados
       ------------------------------------------------------ */

    videoFiles: [],


    /* ------------------------------------------------------
       Resultados individuales
       ------------------------------------------------------ */

    analysisResults: [],


    /* ------------------------------------------------------
       Resultados globales
       ------------------------------------------------------ */

    globalResults: null,


    /* ------------------------------------------------------
       Umbrales
       ------------------------------------------------------ */

    thresholds: {},


    /* ------------------------------------------------------
       Mapping independiente por vídeo
       ------------------------------------------------------ */

    markerMappings: {},


    /* ------------------------------------------------------
       Configuración de ciclos independiente por vídeo
       ------------------------------------------------------ */

    cycleConfigurations: {},


    /* ------------------------------------------------------
       Información temporal
       ------------------------------------------------------ */

    cycleResults: {},


    /* ------------------------------------------------------
       Estado de la interfaz
       ------------------------------------------------------ */

    status: "",

    error: null

};



/* ==========================================================
   OBTENER ESTADO
   ========================================================== */

function getAppState() {

    return OCRAState;

}



/* ==========================================================
   ACTUALIZAR ESTADO
   ========================================================== */

function setAppState(
    updates = {}
) {

    if (
        !updates ||
        typeof updates !== "object"
    ) {

        return OCRAState;

    }


    Object.assign(
        OCRAState,
        updates
    );


    return OCRAState;

}



/* ==========================================================
   REINICIAR ESTADO
   ========================================================== */

function resetAppState() {

    OCRAState.videoCount =
        1;

    OCRAState.currentVideoIndex =
        0;

    OCRAState.isAnalyzing =
        false;

    OCRAState.analysisCompleted =
        false;

    OCRAState.videoFiles =
        [];

    OCRAState.analysisResults =
        [];

    OCRAState.globalResults =
        null;

    OCRAState.thresholds =
        {};

    OCRAState.markerMappings =
        {};

    OCRAState.cycleConfigurations =
        {};

    OCRAState.cycleResults =
        {};

    OCRAState.status =
        "";

    OCRAState.error =
        null;


    return OCRAState;

}



/* ==========================================================
   VÍDEOS
   ========================================================== */

function setVideoCount(
    count
) {

    const number =
        Number(count);


    if (
        !Number.isFinite(number) ||
        number < 1
    ) {

        OCRAState.videoCount =
            1;

    } else {

        OCRAState.videoCount =
            Math.floor(number);

    }


    return OCRAState.videoCount;

}



function getVideoCount() {

    return OCRAState.videoCount;

}



/* ==========================================================
   ARCHIVOS
   ========================================================== */

function setVideoFiles(
    files
) {

    if (
        !Array.isArray(files)
    ) {

        OCRAState.videoFiles =
            [];

        return OCRAState.videoFiles;

    }


    OCRAState.videoFiles =
        files.slice();


    return OCRAState.videoFiles;

}



function getVideoFiles() {

    return OCRAState.videoFiles;

}



/* ==========================================================
   RESULTADOS
   ========================================================== */

function setAnalysisResults(
    results
) {

    if (
        !Array.isArray(results)
    ) {

        OCRAState.analysisResults =
            [];

        return OCRAState.analysisResults;

    }


    OCRAState.analysisResults =
        results.slice();


    return OCRAState.analysisResults;

}



function addAnalysisResult(
    result
) {

    if (
        !result
    ) {

        return OCRAState.analysisResults;

    }


    OCRAState.analysisResults.push(
        result
    );


    return OCRAState.analysisResults;

}



function getAnalysisResults() {

    return OCRAState.analysisResults;

}



/* ==========================================================
   RESULTADOS GLOBALES
   ========================================================== */

function setGlobalResults(
    results
) {

    OCRAState.globalResults =
        results ?? null;


    return OCRAState.globalResults;

}



function getGlobalResults() {

    return OCRAState.globalResults;

}



/* ==========================================================
   UMBRALES
   ========================================================== */

function setThresholds(
    thresholds
) {

    if (
        !thresholds ||
        typeof thresholds !== "object"
    ) {

        OCRAState.thresholds =
            {};

        return OCRAState.thresholds;

    }


    OCRAState.thresholds = {

        ...thresholds

    };


    return OCRAState.thresholds;

}



function getThresholds() {

    return OCRAState.thresholds;

}



/* ==========================================================
   MAPPING POR VÍDEO
   ========================================================== */

function setMarkerMapping(
    videoIndex,
    mapping
) {

    const index =
        Number(videoIndex);


    if (
        !Number.isInteger(index) ||
        index < 0
    ) {

        return null;

    }


    OCRAState.markerMappings[index] = {

        ...(mapping || {})

    };


    return OCRAState.markerMappings[index];

}



function getMarkerMapping(
    videoIndex
) {

    const index =
        Number(videoIndex);


    if (
        !Number.isInteger(index) ||
        index < 0
    ) {

        return null;

    }


    return (
        OCRAState.markerMappings[index] ??
        null
    );

}



/* ==========================================================
   CONFIGURACIÓN DE CICLO POR VÍDEO
   ========================================================== */

function setCycleConfiguration(
    videoIndex,
    configuration
) {

    const index =
        Number(videoIndex);


    if (
        !Number.isInteger(index) ||
        index < 0
    ) {

        return null;

    }


    OCRAState.cycleConfigurations[index] = {

        ...(configuration || {})

    };


    return (
        OCRAState.cycleConfigurations[index]
    );

}



function getCycleConfiguration(
    videoIndex
) {

    const index =
        Number(videoIndex);


    if (
        !Number.isInteger(index) ||
        index < 0
    ) {

        return null;

    }


    return (
        OCRAState.cycleConfigurations[index] ??
        null
    );

}



/* ==========================================================
   RESULTADOS DE CICLO
   ========================================================== */

function setCycleResult(
    videoIndex,
    result
) {

    const index =
        Number(videoIndex);


    if (
        !Number.isInteger(index) ||
        index < 0
    ) {

        return null;

    }


    OCRAState.cycleResults[index] =
        result ?? null;


    return OCRAState.cycleResults[index];

}



function getCycleResult(
    videoIndex
) {

    const index =
        Number(videoIndex);


    if (
        !Number.isInteger(index) ||
        index < 0
    ) {

        return null;

    }


    return (
        OCRAState.cycleResults[index] ??
        null
    );

}



/* ==========================================================
   ESTADO DE ANÁLISIS
   ========================================================== */

function setAnalyzing(
    value
) {

    OCRAState.isAnalyzing =
        Boolean(value);


    return OCRAState.isAnalyzing;

}



function isAnalyzing() {

    return OCRAState.isAnalyzing;

}



function setAnalysisCompleted(
    value
) {

    OCRAState.analysisCompleted =
        Boolean(value);


    return OCRAState.analysisCompleted;

}



/* ==========================================================
   ÍNDICE DEL VÍDEO ACTUAL
   ========================================================== */

function setCurrentVideoIndex(
    index
) {

    const number =
        Number(index);


    if (
        Number.isInteger(number) &&
        number >= 0
    ) {

        OCRAState.currentVideoIndex =
            number;

    }


    return OCRAState.currentVideoIndex;

}



function getCurrentVideoIndex() {

    return OCRAState.currentVideoIndex;

}



/* ==========================================================
   STATUS
   ========================================================== */

function setStatus(
    message
) {

    OCRAState.status =
        message ?? "";


    return OCRAState.status;

}



function getStatus() {

    return OCRAState.status;

}



/* ==========================================================
   ERROR
   ========================================================== */

function setStateError(
    error
) {

    OCRAState.error =
        error ?? null;


    return OCRAState.error;

}



function getStateError() {

    return OCRAState.error;

}



/* ==========================================================
   EXPORTACIÓN GLOBAL
   ==========================================================

   No usamos export/import.
   Los demás archivos acceden mediante window.
   ========================================================== */

window.OCRAState =
    OCRAState;

window.getAppState =
    getAppState;

window.setAppState =
    setAppState;

window.resetAppState =
    resetAppState;

window.setVideoCount =
    setVideoCount;

window.getVideoCount =
    getVideoCount;

window.setVideoFiles =
    setVideoFiles;

window.getVideoFiles =
    getVideoFiles;

window.setAnalysisResults =
    setAnalysisResults;

window.addAnalysisResult =
    addAnalysisResult;

window.getAnalysisResults =
    getAnalysisResults;

window.setGlobalResults =
    setGlobalResults;

window.getGlobalResults =
    getGlobalResults;

window.setThresholds =
    setThresholds;

window.getThresholds =
    getThresholds;

window.setMarkerMapping =
    setMarkerMapping;

window.getMarkerMapping =
    getMarkerMapping;

window.setCycleConfiguration =
    setCycleConfiguration;

window.getCycleConfiguration =
    getCycleConfiguration;

window.setCycleResult =
    setCycleResult;

window.getCycleResult =
    getCycleResult;

window.setAnalyzing =
    setAnalyzing;

window.isAnalyzing =
    isAnalyzing;

window.setAnalysisCompleted =
    setAnalysisCompleted;

window.setCurrentVideoIndex =
    setCurrentVideoIndex;

window.getCurrentVideoIndex =
    getCurrentVideoIndex;

window.setStatus =
    setStatus;

window.getStatus =
    getStatus;

window.setStateError =
    setStateError;

window.getStateError =
    getStateError;


/* ==========================================================
   COMPATIBILIDAD
   ========================================================== */

window.AppState =
    OCRAState;


console.log(
    "OCRA Video Analyzer: state.js cargado correctamente"
);