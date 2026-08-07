"use strict";

/*
=========================================================
Kinovea JSON Converter
Compatible with Kinovea 2024.1.1

Responsabilidades:
- Leer JSON exportado por Kinovea.
- Convertir timeseries a frames.
- Mantener tiempos reales.
- Crear modelo interno independiente de Kinovea.

Entrada:
Kinovea JSON 2024.1.1

Salida:
{
    source,
    fps,
    duration,
    imageSize,
    markers,
    frames[]
}

=========================================================
*/


function parseKinoveaJSON(json) {

    if (!json) {
        throw new Error("JSON vacío");
    }


    /*
    -----------------------------------------------------
    Validación estructura Kinovea
    -----------------------------------------------------
    */

    if (!json.metadata) {
        throw new Error(
            "JSON no contiene metadata de Kinovea"
        );
    }


    if (!json.data) {
        throw new Error(
            "JSON no contiene bloque data"
        );
    }


    const metadata = json.metadata;
    const data = json.data;



    /*
    -----------------------------------------------------
    Información general
    -----------------------------------------------------
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
    -----------------------------------------------------
    Localizar series temporales
    -----------------------------------------------------
    */


    const timeseries =
        data.timeseries ??
        [];


    if (!Array.isArray(timeseries)) {

        throw new Error(
            "Kinovea data.timeseries no es válido"
        );

    }



    /*
    -----------------------------------------------------
    Lista de marcadores
    -----------------------------------------------------
    */


    const markers =
        timeseries.map(series => series.name);



    /*
    -----------------------------------------------------
    Crear frames
    -----------------------------------------------------
    */


    const frames = [];


    if (timeseries.length > 0) {


        const frameCount =
            timeseries[0].time.length;



        for (let i = 0; i < frameCount; i++) {


            const frame = {

                index:i,

                time:
                    timeseries[0].time[i] ?? null,

                landmarks:{}

            };



            timeseries.forEach(series => {


                frame.landmarks[series.name] = {

                    x:
                        series.x?.[i] ?? null,

                    y:
                        series.y?.[i] ?? null

                };


            });



            frames.push(frame);


        }


    }



    /*
    -----------------------------------------------------
    Duración
    -----------------------------------------------------
    */


    let duration = 0;


    if (frames.length > 0) {

        duration =
            frames[frames.length - 1].time;

    }



    /*
    -----------------------------------------------------
    Resultado estándar
    -----------------------------------------------------
    */


    return {


        source:
            metadata.producer ??
            "Kinovea",


        fps,


        duration,


        imageSize,


        markers,


        frameCount:
            frames.length,


        frames

    };

}
