"use strict";

/*
=========================================================
KINOVEA JSON CONVERTER
Compatible con Kinovea 2024.1.1

Responsabilidades:
- Convertir JSON exportado por Kinovea.
- Transformar timeseries en frames.
- Mantener tiempos reales.
- Crear un modelo independiente de Kinovea.

Entrada:
Kinovea JSON 2024.1.1

Salida:
{
    source,
    fps,
    duration,
    imageSize,
    markers,
    frameCount,
    frames:[]
}

=========================================================
*/


/**
 * Convierte un JSON de Kinovea 2024.1.1
 * al modelo interno del analizador.
 *
 * @param {Object} json
 * @returns {Object}
 */
function parseKinoveaJSON(json) {


    if (!json) {
        throw new Error(
            "JSON vacío"
        );
    }



    if (!json.metadata) {
        throw new Error(
            "No existe metadata en el archivo Kinovea"
        );
    }



    if (!json.data) {
        throw new Error(
            "No existe bloque data en el archivo Kinovea"
        );
    }



    const metadata = json.metadata;
    const data = json.data;



    /*
    =====================================================
    Información del vídeo
    =====================================================
    */


    const fps =
        metadata.captureFramerate ??
        metadata.userFramerate ??
        null;



    const imageSize =
        metadata.imageSize ??
        {
            width:null,
            height:null
        };



    /*
    =====================================================
    Timeseries de Kinovea
    =====================================================
    */


    const timeseries =
        Array.isArray(data.timeseries)
            ? data.timeseries
            : [];



    if (timeseries.length === 0) {

        throw new Error(
            "El archivo no contiene timeseries de marcadores"
        );

    }



    /*
    =====================================================
    Validación de marcadores
    =====================================================
    */


    timeseries.forEach(series => {


        if (!series.name) {

            throw new Error(
                "Existe una serie sin nombre"
            );

        }



        if (!Array.isArray(series.time)) {

            throw new Error(
                `El marcador ${series.name} no contiene tiempos`
            );

        }



        if (!Array.isArray(series.x) ||
            !Array.isArray(series.y)) {


            throw new Error(
                `El marcador ${series.name} no contiene coordenadas x/y`
            );

        }


    });



    /*
    =====================================================
    Lista de marcadores
    =====================================================
    */


    const markers =
        timeseries.map(
            series => series.name
        );



    /*
    =====================================================
    Número de frames
    =====================================================
    */


    const frameCount =
        Math.max(
            ...timeseries.map(
                series => series.time.length
            )
        );



    /*
    =====================================================
    Construcción de frames
    =====================================================
    */


    const frames = [];



    for (
        let i = 0;
        i < frameCount;
        i++
    ) {


        let frameTime = null;



        const landmarks = {};



        timeseries.forEach(series => {



            if (
                series.time[i] !== undefined &&
                frameTime === null
            ) {

                frameTime =
                    series.time[i];

            }



            landmarks[series.name] = {


                x:
                    series.x[i] ??
                    null,


                y:
                    series.y[i] ??
                    null

            };


        });



        frames.push({

            index:i,

            time:
                frameTime,


            landmarks

        });


    }



    /*
    =====================================================
    Duración total
    =====================================================
    */


    const duration =
        frames.length > 0
            ? frames[frames.length - 1].time
            : 0;



    /*
    =====================================================
    Resultado estándar
    =====================================================
    */


    return {


        source:
            metadata.producer ??
            "Kinovea",



        originalFilename:
            metadata.originalFilename ??
            null,



        fps,



        duration,



        imageSize,



        markers,



        frameCount,



        frames

    };

}





/**
 * Devuelve información resumida
 * para mostrar en la interfaz.
 *
 * @param {Object} json
 * @returns {Object}
 */
function getKinoveaSummary(json) {


    const data =
        parseKinoveaJSON(json);



    return {


        source:
            data.source,


        filename:
            data.originalFilename,


        fps:
            data.fps,


        width:
            data.imageSize.width,


        height:
            data.imageSize.height,


        markers:
            data.markers.length,


        frameCount:
            data.frameCount,


        duration:
            data.duration


    };

}
