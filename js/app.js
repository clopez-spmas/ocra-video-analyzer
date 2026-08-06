"use strict";

/*
=========================================================
OCRA Video Analyzer
Main Application Controller
=========================================================

Responsabilidades:
- Seleccionar archivo JSON de Kinovea.
- Leer y validar JSON.
- Convertir datos al modelo interno.
- Crear analysisResult.
- Mostrar resultados biomecánicos reales.
- Preparar futuras fases:
    - detección movimientos
    - análisis OCRA
=========================================================
*/

let analysisResult = null;


document.addEventListener("DOMContentLoaded", () => {


    const fileInput =
        document.getElementById("jsonFile");


    const analyzeButton =
        document.getElementById("analyzeButton");


    const status =
        document.getElementById("status");


    const fileName =
        document.getElementById("fileName");


    const fileSize =
        document.getElementById("fileSize");


    const frameCount =
        document.getElementById("frameCount");


    const landmarkCount =
        document.getElementById("landmarkCount");


    const fps =
        document.getElementById("fps");


    const duration =
        document.getElementById("duration");


    let selectedFile = null;



    //-----------------------------------------------------
    // Selección archivo
    //-----------------------------------------------------

    fileInput.addEventListener(
        "change",
        (event) => {


            if (!event.target.files.length) {


                selectedFile = null;

                analyzeButton.disabled = true;


                status.textContent =
                    "Esperando un archivo JSON...";


                resetStatistics();


                return;

            }


            selectedFile =
                event.target.files[0];


            fileName.textContent =
                selectedFile.name;


            fileSize.textContent =
                (
                    selectedFile.size / 1024
                ).toFixed(2)
                +
                " KB";


            status.textContent =
                "Archivo cargado correctamente.";


            analyzeButton.disabled =
                false;


        }
    );



    //-----------------------------------------------------
    // Analizar
    //-----------------------------------------------------

    analyzeButton.addEventListener(
        "click",
        () => {


            if (!selectedFile) {


                alert(
                    "Seleccione primero un archivo JSON."
                );


                return;

            }


            status.textContent =
                "Leyendo archivo...";


            readKinoveaJSON(selectedFile);


        }
    );



    //-----------------------------------------------------
    // Reset pantalla
    //-----------------------------------------------------

    function resetStatistics() {


        fileName.textContent = "-";

        fileSize.textContent = "-";

        frameCount.textContent = "-";

        landmarkCount.textContent = "-";

        fps.textContent = "-";

        duration.textContent = "-";


    }


});



/*
=========================================================
Lectura JSON Kinovea
=========================================================
*/


function readKinoveaJSON(file) {


    const reader =
        new FileReader();



    reader.onload =
        (event) => {


            try {


                const json =
                    JSON.parse(
                        event.target.result
                    );



                if (typeof Kinovea === "undefined") {


                    throw new Error(
                        "kinovea.js no está cargado."
                    );


                }



                const frames =
                    Kinovea.parse(json);



                if (
                    !Array.isArray(frames)
                    ||
                    frames.length === 0
                ) {


                    throw new Error(
                        "El JSON no contiene frames válidos."
                    );


                }



                //-------------------------------------------------
                // Crear modelo análisis
                //-------------------------------------------------

                analysisResult = {


                    metadata: {


                        fileName:
                            file.name,


                        created:
                            new Date().toISOString()


                    },


                    frames: frames,


                    totalFrames:
                        frames.length,


                    /*
                    Reservado para resultados
                    generados por el motor biomecánico
                    */


                    biomechanicalMeasurements: [],


                    angles: [],


                    movements: [],


                    ocra: null


                };



                //-------------------------------------------------
                // Estadísticas
                //-------------------------------------------------

                let totalLandmarks = 0;



                frames.forEach(
                    frame => {


                        if (
                            Array.isArray(
                                frame.landmarks
                            )
                        ) {


                            totalLandmarks +=
                                frame.landmarks.length;


                        }


                    }
                );



                const timing =
                    calculateTiming(frames);



                //-------------------------------------------------
                // Actualizar interfaz
                //-------------------------------------------------

                document.getElementById("fileName")
                    .textContent =
                    file.name;



                document.getElementById("fileSize")
                    .textContent =
                    (
                        file.size / 1024 / 1024
                    ).toFixed(2)
                    +
                    " MB";



                document.getElementById("frameCount")
                    .textContent =
                    frames.length;



                document.getElementById("landmarkCount")
                    .textContent =
                    totalLandmarks;



                document.getElementById("fps")
                    .textContent =
                    timing.fps;



                document.getElementById("duration")
                    .textContent =
                    timing.duration;



                document.getElementById("status")
                    .textContent =
                    "✔ JSON procesado correctamente.";



                //-------------------------------------------------
                // Mostrar resultados
                //-------------------------------------------------

                showBiomechanicalResults(
                    analysisResult
                );


                showPostureResults(
                    analysisResult
                );


                showMovementResults(
                    analysisResult
                );


                showAnalysisMetrics(
                    analysisResult
                );


                showOcraEvaluation(
                    analysisResult
                );



                console.log(
                    "Analysis Result:",
                    analysisResult
                );



            }

            catch(error) {


                console.error(error);


                document.getElementById("status")
                    .textContent =
                    "❌ Error leyendo el archivo: "
                    +
                    error.message;


            }


        };



    reader.readAsText(file);


}



/*
=========================================================
Cálculo FPS y duración
=========================================================
*/


function calculateTiming(frames) {


    if (frames.length < 2) {


        return {

            fps: "-",

            duration: "-"

        };


    }



    let t0 =
        frames[0].timestamp || 0;



    let t1 =
        frames[frames.length - 1].timestamp || 0;



    let seconds =
        t1 - t0;



    if (seconds > 100) {


        seconds =
            seconds / 1000;


    }



    if (seconds <= 0) {


        return {

            fps: "-",

            duration: "-"

        };


    }



    return {


        fps:
            (
                frames.length / seconds
            ).toFixed(2),



        duration:

            Math.floor(seconds / 60)
            +
            " min "
            +
            Math.floor(seconds % 60)
            +
            " s"


    };


}
/*
=========================================================
Visualización de resultados biomecánicos
=========================================================
*/


function showBiomechanicalResults(result) {


    const container =
        document.getElementById(
            "biomechanics"
        );


    if (!container) {

        console.warn(
            "Panel biomechanics no encontrado."
        );

        return;

    }



    const measurements =
        result.biomechanicalMeasurements;



    //-----------------------------------------------------
    // Todavía no hay datos reales
    //-----------------------------------------------------

    if (
        !Array.isArray(measurements)
        ||
        measurements.length === 0
    ) {


        container.textContent =
            "No existen mediciones biomecánicas disponibles.";


        return;

    }



    //-----------------------------------------------------
    // Crear tabla resultados reales
    //-----------------------------------------------------

    let html = `

        <table class="biomechanical-table">

            <thead>

                <tr>

                    <th>Frame</th>

                    <th>Articulación</th>

                    <th>Lado</th>

                    <th>Ángulo</th>

                    <th>Categoría</th>

                    <th>Tiempo</th>

                </tr>

            </thead>

            <tbody>

    `;



    measurements.forEach(
        measurement => {


            html += `

                <tr>

                    <td>
                        ${
                            measurement.frame ??
                            "-"
                        }
                    </td>


                    <td>
                        ${
                            measurement.joint ??
                            measurement.name ??
                            "-"
                        }
                    </td>


                    <td>
                        ${
                            measurement.side ??
                            "-"
                        }
                    </td>


                    <td>
                        ${
                            measurement.angle !== undefined
                            ?
                            Number(
                                measurement.angle
                            ).toFixed(2)
                            :
                            "-"
                        }
                        °
                    </td>


                    <td>
                        ${
                            measurement.category ??
                            "-"
                        }
                    </td>


                    <td>
                        ${
                            measurement.time ??
                            "-"
                        }
                    </td>


                </tr>

            `;


        }
    );



    html += `

            </tbody>

        </table>

    `;



    container.innerHTML =
        html;


}





/*
=========================================================
Visualización postura
=========================================================
*/


function showPostureResults(result) {


    const container =
        document.getElementById(
            "postureResults"
        );


    if (!container) {

        return;

    }



    container.textContent =
        "Pendiente de integración con PostureAnalyzer.";

}



/*
=========================================================
Visualización movimientos
=========================================================
*/


function showMovementResults(result) {


    const container =
        document.getElementById(
            "movementResults"
        );


    if (!container) {

        return;

    }



    container.textContent =
        "Pendiente de integración con MovementManager.";

}



/*
=========================================================
Métricas análisis
=========================================================
*/


function showAnalysisMetrics(result) {


    const container =
        document.getElementById(
            "analysisMetrics"
        );


    if (!container) {

        return;

    }



    container.textContent =
        "Pendiente de cálculo de métricas.";

}



/*
=========================================================
Evaluación OCRA
=========================================================
*/


function showOcraEvaluation(result) {


    const container =
        document.getElementById(
            "ocraResults"
        );


    if (!container) {

        return;

    }



    container.textContent =
        "Pendiente de evaluación OCRA.";

}
