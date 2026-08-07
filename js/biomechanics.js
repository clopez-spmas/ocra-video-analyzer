"use strict";

/*
=========================================================
OCRA Video Analyzer

Biomechanics Engine

Equivalente JavaScript de:

ocra/biomechanics/biomechanical_analyzer.py

Responsabilidades:
- Recorrer frames Kinovea.
- Obtener puntos anatómicos mediante markerMapping.
- Calcular ángulos.
- Generar resultados biomecánicos.

No realiza:
- clasificación de riesgo
- puntuación OCRA
- interpretación ergonómica

=========================================================
*/





/*
=========================================================
Obtener punto anatómico desde un frame

Usa marker_mapping.js

=========================================================
*/

function getAnatomicalPoint(
    frame,
    anatomicalName
) {


    if (
        typeof getJointPosition !== "function"
    ) {

        return null;

    }



    return getJointPosition(
        frame,
        anatomicalName
    );

}








/*
=========================================================
Calcular una medición angular

A - B - C

=========================================================
*/

function calculateAngleMeasurement(
    frame,
    definition
) {


    const points =
        definition.points;



    if (
        !points ||
        points.length !== 3
    ) {

        return {

            value:null,

            valid:false,

            reason:
                "invalid_definition"

        };

    }



    const a =
        getAnatomicalPoint(
            frame,
            points[0]
        );


    const b =
        getAnatomicalPoint(
            frame,
            points[1]
        );


    const c =
        getAnatomicalPoint(
            frame,
            points[2]
        );



    return Geometry.angleAtPoint(
        a,
        b,
        c
    );

}







/*
=========================================================
Analizar un frame

=========================================================
*/

function analyzeBiomechanicalFrame(
    frame
) {


    const results = [];



    Object.entries(
        BiomechanicalCatalog
    )
    .forEach(
        ([id, definition]) => {



            let measurement = {

                name:
                    id,

                description:
                    definition.name,

                value:
                    null,

                unit:
                    definition.unit,

                frame_index:
                    frame.index,

                timestamp:
                    frame.time,

                valid:
                    false,

                reason:
                    null

            };



            try {



                const result =
                    calculateAngleMeasurement(
                        frame,
                        definition
                    );



                measurement.value =
                    result.value;



                measurement.valid =
                    result.valid;



                measurement.reason =
                    result.reason;



            }

            catch(error) {


                measurement.valid =
                    false;


                measurement.reason =
                    "calculation_error";


            }




            results.push(
                measurement
            );



        }

    );



    return results;

}







/*
=========================================================
Analizar todos los frames

=========================================================
*/

function analyzeBiomechanics(
    frames
) {


    const measurements = [];



    if (
        !frames ||
        !Array.isArray(frames)
    ) {

        return measurements;

    }



    frames.forEach(
        frame => {


            const frameResults =
                analyzeBiomechanicalFrame(
                    frame
                );



            measurements.push(
                ...frameResults
            );


        }

    );



    return measurements;

}







/*
=========================================================
Exportación navegador

=========================================================
*/


window.Biomechanics = {


    analyzeBiomechanics,

    analyzeBiomechanicalFrame

};
