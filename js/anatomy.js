"use strict";

/*
=========================================================
OCRA Video Analyzer
Anatomical Landmarks Catalog
=========================================================

Responsabilidades:
- Definir todos los puntos anatómicos admitidos.
- Proporcionar un catálogo único para toda la aplicación.
- Evitar cadenas de texto duplicadas en el código.

No realiza cálculos.
No contiene lógica biomecánica.
No depende de Kinovea.

=========================================================
*/

const AnatomicalLandmarks = [

    //-----------------------------------------------------
    // Cabeza
    //-----------------------------------------------------

    {
        id: "HEAD",
        name: "Cabeza"
    },

    {
        id: "FOREHEAD",
        name: "Frente"
    },

    {
        id: "CHIN",
        name: "Mentón"
    },

    //-----------------------------------------------------
    // Cuello
    //-----------------------------------------------------

    {
        id: "C1",
        name: "C1"
    },

    {
        id: "C7",
        name: "C7"
    },

    //-----------------------------------------------------
    // Tronco
    //-----------------------------------------------------

    {
        id: "STERNUM",
        name: "Esternón"
    },

    {
        id: "T8",
        name: "T8"
    },

    {
        id: "L5",
        name: "L5"
    },

    {
        id: "PELVIS",
        name: "Pelvis"
    },

    //-----------------------------------------------------
    // Miembro superior izquierdo
    //-----------------------------------------------------

    {
        id: "LEFT_SHOULDER",
        name: "Hombro izquierdo"
    },

    {
        id: "LEFT_ELBOW",
        name: "Codo izquierdo"
    },

    {
        id: "LEFT_WRIST",
        name: "Muñeca izquierda"
    },

    {
        id: "LEFT_HAND",
        name: "Mano izquierda"
    },

    //-----------------------------------------------------
    // Miembro superior derecho
    //-----------------------------------------------------

    {
        id: "RIGHT_SHOULDER",
        name: "Hombro derecho"
    },

    {
        id: "RIGHT_ELBOW",
        name: "Codo derecho"
    },

    {
        id: "RIGHT_WRIST",
        name: "Muñeca derecha"
    },

    {
        id: "RIGHT_HAND",
        name: "Mano derecha"
    },

    //-----------------------------------------------------
    // Miembro inferior izquierdo
    //-----------------------------------------------------

    {
        id: "LEFT_HIP",
        name: "Cadera izquierda"
    },

    {
        id: "LEFT_KNEE",
        name: "Rodilla izquierda"
    },

    {
        id: "LEFT_ANKLE",
        name: "Tobillo izquierdo"
    },

    {
        id: "LEFT_FOOT",
        name: "Pie izquierdo"
    },

    //-----------------------------------------------------
    // Miembro inferior derecho
    //-----------------------------------------------------

    {
        id: "RIGHT_HIP",
        name: "Cadera derecha"
    },

    {
        id: "RIGHT_KNEE",
        name: "Rodilla derecha"
    },

    {
        id: "RIGHT_ANKLE",
        name: "Tobillo derecho"
    },

    {
        id: "RIGHT_FOOT",
        name: "Pie derecho"
    }

];

/*
=========================================================
Utilidades
=========================================================
*/

function getLandmarkById(id) {

    return AnatomicalLandmarks.find(
        landmark => landmark.id === id
    );

}

function getLandmarkName(id) {

    const landmark =
        getLandmarkById(id);

    return landmark
        ? landmark.name
        : id;

}

function getAllLandmarks() {

    return [...AnatomicalLandmarks];

}
