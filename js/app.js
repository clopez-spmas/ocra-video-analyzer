
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
- Convertir ángulos del motor biomecánico
  en BiomechanicalMeasurement para visualización.
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



    function resetStatistics() {


        fileName.textContent = "-";

        fileSize.textContent = "-";

        frameCount.textContent = "-";

        landmarkCount.textContent = "-";

        fps.textContent = "-";

        duration.textContent = "-";


    }


});



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


                    biomechanicalMeasurements:
                        extractBiomechanicalMeasurements(
                            frames
                        ),


                    angles: [],

                    movements: [],

                    ocra: null


                };



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



                document.getElementById("fileName")
                    .textContent =
                    file.name;



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
Conversión de ángulos a mediciones biomecánicas
=========================================================
*/


function extractBiomechanicalMeasurements(frames) {


    const measurements = [];



    frames.forEach(
        frame => {


            if (
                !frame.angles
            ) {

                return;

            }



            Object.entries(
                frame.angles
            ).forEach(
                ([name, value]) => {



                    if (
                        value === null
                        ||
                        value === undefined
                    ) {

                        return;

                    }



                    let side = null;


                    if (
                        name.includes("left")
                    ) {

                        side = "left";

                    }


                    if (
                        name.includes("right")
                    ) {

                        side = "right";

                    }



                    measurements.push({

                        name: name,


                        value: Number(value),


                        unit: "deg",


                        category: null,


                        side: side,


                        body_region:
                            "upper_limb",


                        frame_index:
                            frame.frameIndex
                            ??
                            frame.frame_index
                            ??
                            null,


                        timestamp:
                            frame.timestamp
                            ??
                            null,


                        valid: true,


                        confidence: null,


                        reason: null,


                        calculation_method:
                            "JointAngleCalculator"


                    });


                }
            );


        }
    );



    return measurements;


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
        frames[
            frames.length - 1
        ].timestamp || 0;



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
Panel biomecánico
=========================================================
*/


function showBiomechanicalResults(result) {


    const container =
        document.getElementById(
            "biomechanics"
        );


    if (!container) {

        return;

    }



    const measurements =
        result.biomechanicalMeasurements;



    if (
        !measurements
        ||
        measurements.length === 0
    ) {


        container.textContent =
            "No hay mediciones biomecánicas disponibles.";


        return;

    }



    let html = `

        <table>

            <thead>

                <tr>

                    <th>Frame</th>

                    <th>Medición</th>

                    <th>Valor</th>

                    <th>Unidad</th>

                    <th>Lado</th>

                    <th>Región</th>

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
                            measurement.frame_index
                        }
                    </td>


                    <td>
                        ${
                            measurement.name
                        }
                    </td>


                    <td>
                        ${
                            measurement.value.toFixed(2)
                        }
                    </td>


                    <td>
                        ${
                            measurement.unit
                        }
                    </td>


                    <td>
                        ${
                            measurement.side ?? "-"
                        }
                    </td>


                    <td>
                        ${
                            measurement.body_region
                        }
                    </td>


                    <td>
                        ${
                            measurement.timestamp ?? "-"
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
Paneles pendientes
=========================================================
*/


function showPostureResults(result) {


    const element =
        document.getElementById(
            "postureResults"
        );


    if (element) {

        element.textContent =
            "Pendiente de integración con PostureAnalyzer.";

    }

}



function showMovementResults(result) {


    const element =
        document.getElementById(
            "movementResults"
        );


    if (element) {

        element.textContent =
            "Pendiente de integración con MovementManager.";

    }

}



function showAnalysisMetrics(result) {


    const element =
        document.getElementById(
            "analysisMetrics"
        );


    if (element) {

        element.textContent =
            "Pendiente de cálculo de métricas.";

    }

}



function showOcraEvaluation(result) {


    const element =
        document.getElementById(
            "ocraResults"
        );


    if (element) {

        element.textContent =
            "Pendiente de evaluación OCRA.";

    }

}
