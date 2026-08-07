"use strict";

/*
=========================================================
Marker Mapping
OCRA Video Analyzer

Responsabilidades:
- Asociar marcadores Kinovea con puntos anatómicos.
- Mantener Kinovea independiente del modelo biomecánico.
- Preparar cálculo angular.

Ejemplo:

Kinovea:
"Marcador 1"

Modelo:
"right_shoulder"

=========================================================
*/


/*
=========================================================
Mapa actual
=========================================================
*/


let markerMapping = {

    right_shoulder: null,

    right_elbow: null,

    right_wrist: null,


    left_shoulder: null,

    left_elbow: null,

    left_wrist: null,


    neck: null,

    head: null,


    pelvis: null,


    right_knee: null,

    left_knee: null,


    right_ankle: null,

    left_ankle: null

};





/*
=========================================================
Cargar mapa
=========================================================
*/


function loadMarkerMapping(mapping) {


    if (!mapping) {

        return markerMapping;

    }



    Object.keys(markerMapping)
        .forEach(
            joint => {


                if (
                    mapping[joint] !== undefined
                ) {


                    markerMapping[joint] =
                        mapping[joint];


                }


            }
        );



    return markerMapping;

}





/*
=========================================================
Guardar mapa
=========================================================
*/


function saveMarkerMapping() {


    return {

        ...markerMapping

    };

}





/*
=========================================================
Asignar marcador a articulación
=========================================================
*/


function mapMarkerToJoint(
    joint,
    markerName
) {


    if (
        !(joint in markerMapping)
    ) {


        throw new Error(
            "Articulación no válida: "
            +
            joint
        );


    }



    markerMapping[joint] =
        markerName;



    return markerMapping;

}





/*
=========================================================
Obtener posición anatómica
=========================================================
*/


function getJointPosition(
    frame,
    joint
) {


    const marker =
        markerMapping[joint];



    if (
        !marker
    ) {

        return null;

    }



    if (
        !frame ||
        !frame.landmarks
    ) {

        return null;

    }



    return (
        frame.landmarks[marker]
        ??
        null
    );

}





/*
=========================================================
Obtener todos los puntos anatómicos
=========================================================
*/


function extractAnatomicalFrame(
    frame
) {


    const anatomical = {};



    Object.keys(markerMapping)
        .forEach(
            joint => {


                anatomical[joint] =
                    getJointPosition(
                        frame,
                        joint
                    );


            }
        );



    return anatomical;

}





/*
=========================================================
Comprobar mapa completo
=========================================================
*/


function validateMarkerMapping() {


    const missing = [];



    Object.entries(
        markerMapping
    )
    .forEach(
        ([joint, marker]) => {


            if (
                marker === null
            ) {

                missing.push(joint);

            }


        }
    );



    return {


        valid:
            missing.length === 0,


        missing

    };

}
