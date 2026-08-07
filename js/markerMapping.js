"use strict";

/*
=========================================================
Marker Mapping

Responsabilidades:
- Asociar marcadores de Kinovea con partes anatómicas.
- Mantener una única lista anatómica.
- Generar interfaz de selección.
- Preparar datos para cálculo biomecánico.

=========================================================
*/


/*
=========================================================
Lista anatómica única
=========================================================
*/


const anatomicalPoints = {


    right_shoulder:
        "Hombro derecho",


    right_elbow:
        "Codo derecho",


    right_wrist:
        "Muñeca derecha",



    left_shoulder:
        "Hombro izquierdo",


    left_elbow:
        "Codo izquierdo",


    left_wrist:
        "Muñeca izquierda",



    neck:
        "Cuello",


    head:
        "Cabeza",



    pelvis:
        "Pelvis",



    right_knee:
        "Rodilla derecha",


    left_knee:
        "Rodilla izquierda",



    right_ankle:
        "Tobillo derecho",


    left_ankle:
        "Tobillo izquierdo"


};





/*
=========================================================
Mapa actual
=========================================================
*/


let markerMapping = {};


Object.keys(
    anatomicalPoints
)
.forEach(
    point => {

        markerMapping[point] =
            null;

    }
);






/*
=========================================================
Cargar mapa
=========================================================
*/


function loadMarkerMapping(
    mapping
) {


    if (!mapping) {

        return markerMapping;

    }



    Object.keys(
        markerMapping
    )
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
        !marker ||
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
Crear interfaz de asignación
=========================================================
*/


function createMarkerMappingUI(
    markers
) {


    const container =
        document.getElementById(
            "markerMappingContainer"
        );



    if (!container) {

        console.warn(
            "No existe markerMappingContainer"
        );

        return;

    }



    let html = "";



    markers.forEach(
        marker => {


            html += `

            <div class="marker-row">


                <label>

                    ${marker}

                </label>


                <select
                    data-marker="${marker}"
                    onchange="updateMarkerMapping(this)"
                >


                    <option value="">
                        -- seleccionar --
                    </option>


            `;



            Object.entries(
                anatomicalPoints
            )
            .forEach(
                ([key,label]) => {


                    html += `

                    <option value="${key}">
                        ${label}
                    </option>

                    `;


                }
            );



            html += `

                </select>


            </div>

            `;


        }
    );



    container.innerHTML =
        html;


}






/*
=========================================================
Actualizar selección usuario
=========================================================
*/


function updateMarkerMapping(
    select
) {


    const marker =
        select.dataset.marker;



    const joint =
        select.value;



    if (!joint) {

        return;

    }



    mapMarkerToJoint(
        joint,
        marker
    );



    console.log(
        "Mapping actualizado:",
        saveMarkerMapping()
    );


}






/*
=========================================================
Validación
=========================================================
*/


function validateMarkerMapping() {


    const missing = [];



    Object.entries(
        markerMapping
    )
    .forEach(
        ([joint,marker]) => {


            if (
                marker === null
            ) {

                missing.push(
                    joint
                );

            }


        }
    );



    return {


        valid:
            missing.length === 0,


        missing

    };


}
