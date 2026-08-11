"use strict";

/*
==========================================================
OCRA VIDEO ANALYZER
Archivo: catalog.js

CATÁLOGO MAESTRO DE 24 PUNTOS ANATÓMICOS

Este archivo define únicamente el catálogo de puntos
anatómicos utilizados por el analizador.

NO realiza cálculos.
NO realiza clasificación de riesgo.
NO calcula puntuación OCRA.

==========================================================
*/

const ANATOMICAL_POINTS = {

    head: {
        id: "head",
        name: "Cabeza",
        side: "center",
        region: "head",
        required_for: ["neck_flexion"]
    },

    neck: {
        id: "neck",
        name: "Cuello / base cervical",
        side: "center",
        region: "neck",
        required_for: ["neck_flexion"]
    },

    left_shoulder: {
        id: "left_shoulder",
        name: "Hombro izquierdo",
        side: "left",
        region: "upper_limb",
        required_for: ["shoulder_flexion_left", "elbow_flexion_left"]
    },

    right_shoulder: {
        id: "right_shoulder",
        name: "Hombro derecho",
        side: "right",
        region: "upper_limb",
        required_for: ["shoulder_flexion_right", "elbow_flexion_right"]
    },

    left_elbow: {
        id: "left_elbow",
        name: "Codo izquierdo",
        side: "left",
        region: "upper_limb",
        required_for: ["shoulder_flexion_left", "elbow_flexion_left", "wrist_flexion_left"]
    },

    right_elbow: {
        id: "right_elbow",
        name: "Codo derecho",
        side: "right",
        region: "upper_limb",
        required_for: ["shoulder_flexion_right", "elbow_flexion_right", "wrist_flexion_right"]
    },

    left_wrist: {
        id: "left_wrist",
        name: "Muñeca izquierda",
        side: "left",
        region: "upper_limb",
        required_for: ["wrist_flexion_left"]
    },

    right_wrist: {
        id: "right_wrist",
        name: "Muñeca derecha",
        side: "right",
        region: "upper_limb",
        required_for: ["wrist_flexion_right"]
    },

    left_index: {
        id: "left_index",
        name: "Índice izquierdo",
        side: "left",
        region: "hand",
        required_for: ["wrist_flexion_left"]
    },

    right_index: {
        id: "right_index",
        name: "Índice derecho",
        side: "right",
        region: "hand",
        required_for: ["wrist_flexion_right"]
    },

    left_hip: {
        id: "left_hip",
        name: "Cadera izquierda",
        side: "left",
        region: "pelvis",
        required_for: ["knee_flexion_left"]
    },

    right_hip: {
        id: "right_hip",
        name: "Cadera derecha",
        side: "right",
        region: "pelvis",
        required_for: ["knee_flexion_right"]
    },

    pelvis: {
        id: "pelvis",
        name: "Pelvis / centro de caderas",
        side: "center",
        region: "pelvis",
        required_for: ["trunk_flexion", "trunk_lateral"]
    },

    left_knee: {
        id: "left_knee",
        name: "Rodilla izquierda",
        side: "left",
        region: "lower_limb",
        required_for: ["knee_flexion_left", "ankle_left"]
    },

    right_knee: {
        id: "right_knee",
        name: "Rodilla derecha",
        side: "right",
        region: "lower_limb",
        required_for: ["knee_flexion_right", "ankle_right"]
    },

    left_ankle: {
        id: "left_ankle",
        name: "Tobillo izquierdo",
        side: "left",
        region: "lower_limb",
        required_for: ["ankle_left"]
    },

    right_ankle: {
        id: "right_ankle",
        name: "Tobillo derecho",
        side: "right",
        region: "lower_limb",
        required_for: ["ankle_right"]
    },

    left_heel: {
        id: "left_heel",
        name: "Talón izquierdo",
        side: "left",
        region: "foot",
        required_for: []
    },

    right_heel: {
        id: "right_heel",
        name: "Talón derecho",
        side: "right",
        region: "foot",
        required_for: []
    },

    left_foot: {
        id: "left_foot",
        name: "Pie izquierdo",
        side: "left",
        region: "foot",
        required_for: ["ankle_left"]
    },

    right_foot: {
        id: "right_foot",
        name: "Pie derecho",
        side: "right",
        region: "foot",
        required_for: ["ankle_right"]
    },

    shoulder_center: {
        id: "shoulder_center",
        name: "Centro de hombros",
        side: "center",
        region: "virtual",
        virtual: true,
        required_for: ["trunk_flexion", "trunk_lateral", "neck_flexion"]
    },

    hip_center: {
        id: "hip_center",
        name: "Centro de caderas",
        side: "center",
        region: "virtual",
        virtual: true,
        required_for: []
    },

    neck_base: {
        id: "neck_base",
        name: "Base del cuello",
        side: "center",
        region: "virtual",
        virtual: true,
        required_for: []
    },

    head_center: {
        id: "head_center",
        name: "Centro de cabeza",
        side: "center",
        region: "virtual",
        virtual: true,
        required_for: []
    }
};


/* ==========================================================
   CATÁLOGO DE MEDICIONES BIOMECÁNICAS
========================================================== */

const BIOMECHANICAL_CATALOG = {

    trunk_flexion: {
        name: "Flexión / extensión de tronco",
        type: "segment_angle",
        points: ["pelvis", "shoulder_center"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    trunk_lateral: {
        name: "Inclinación lateral de tronco",
        type: "segment_angle",
        points: ["pelvis", "shoulder_center"],
        plane: "frontal",
        unit: "deg",
        thresholds: null
    },

    neck_flexion: {
        name: "Flexión / extensión cervical",
        type: "angle",
        points: ["head", "neck", "shoulder_center"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    shoulder_flexion_left: {
        name: "Flexión hombro izquierdo",
        type: "angle",
        points: ["left_elbow", "left_shoulder", "pelvis"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    shoulder_flexion_right: {
        name: "Flexión hombro derecho",
        type: "angle",
        points: ["right_elbow", "right_shoulder", "pelvis"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    elbow_flexion_left: {
        name: "Flexión codo izquierdo",
        type: "angle",
        points: ["left_shoulder", "left_elbow", "left_wrist"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    elbow_flexion_right: {
        name: "Flexión codo derecho",
        type: "angle",
        points: ["right_shoulder", "right_elbow", "right_wrist"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    wrist_flexion_left: {
        name: "Flexión muñeca izquierda",
        type: "angle",
        points: ["left_elbow", "left_wrist", "left_index"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    wrist_flexion_right: {
        name: "Flexión muñeca derecha",
        type: "angle",
        points: ["right_elbow", "right_wrist", "right_index"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    knee_flexion_left: {
        name: "Flexión rodilla izquierda",
        type: "angle",
        points: ["left_hip", "left_knee", "left_ankle"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    knee_flexion_right: {
        name: "Flexión rodilla derecha",
        type: "angle",
        points: ["right_hip", "right_knee", "right_ankle"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    ankle_left: {
        name: "Movimiento tobillo izquierdo",
        type: "angle",
        points: ["left_knee", "left_ankle", "left_foot"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    },

    ankle_right: {
        name: "Movimiento tobillo derecho",
        type: "angle",
        points: ["right_knee", "right_ankle", "right_foot"],
        plane: "sagittal",
        unit: "deg",
        thresholds: null
    }
};


/* ==========================================================
   EXPORTACIÓN GLOBAL PARA NAVEGADOR
========================================================== */

window.AnatomicalPoints = ANATOMICAL_POINTS;
window.BIOMECHANICAL_CATALOG = BIOMECHANICAL_CATALOG;
window.BiomechanicalCatalog = BIOMECHANICAL_CATALOG;
window.CATALOG = BIOMECHANICAL_CATALOG;

console.log(
    "OCRA Video Analyzer: catalog.js cargado correctamente",
    "| puntos anatómicos:",
    Object.keys(ANATOMICAL_POINTS).length
);