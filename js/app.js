"use strict";

/*
=========================================================
OCRA Video Analyzer
Main Application Controller
=========================================================

Responsabilidades:

- Seleccionar archivo JSON de Kinovea.
- Leer y validar JSON.
- Convertir mediante kinovea.js.
- Crear analysisResult.
- Preparar datos para:
  - biomecánica
  - postura
  - movimientos
  - métricas
  - evaluación OCRA

=========================================================
*/

let analysisResult = null;


document.addEventListener(
    "DOMContentLoaded",
    () => {

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


        let selectedFile = null;


        if (!fileInput) {

            console.error(
                "No existe jsonFile en HTML"
            );

            return;
        }



        fileInput.addEventListener(
            "change",
            (event) => {


                if (!event.target.files.length) {

                    selectedFile = null;


                    if (analyzeButton) {

                        analyzeButton.disabled = true;

                    }


                    if (status) {

                        status.textContent =
                            "Esperando un archivo JSON...";

                    }


                    resetStatistics();

                    return;
                }



                selectedFile =
                    event.target.files[0];



                if (fileName) {

                    fileName.textContent =
                        selectedFile.name;

                }



                if (fileSize) {

                    fileSize.textContent =
                        (
                            selectedFile.size / 1024
                        )
                        .toFixed(2)
                        +
                        " KB";

                }



                if (status) {

                    status.textContent =
                        "Archivo cargado correctamente.";

                }



                if (analyzeButton) {

                    analyzeButton.disabled =
                        false;

                }


            }
        );



        if (analyzeButton) {


            analyzeButton.addEventListener(
                "click",
                () => {


                    if (!selectedFile) {

                        alert(
                            "Seleccione primero un archivo JSON."
                        );

                        return;
                    }



                    if (status) {

                        status.textContent =
                            "Leyendo archivo...";

                    }



                    readKinoveaJSON(
                        selectedFile
                    );


                }
            );

        }



        function resetStatistics() {


            if (fileName) {

                fileName.textContent = "-";

            }


            if (fileSize) {

                fileSize.textContent = "-";

            }


            if (frameCount) {

                frameCount.textContent = "-";

            }


            if (landmarkCount) {

                landmarkCount.textContent = "-";

            }

        }


    }
);
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



                if (
                    typeof parseKinoveaJSON !== "function"
                ) {

                    throw new Error(
                        "kinovea.js no está cargado."
                    );

                }



                const kinoveaData =
                    parseKinoveaJSON(
                        json
                    );



                if (
                    typeof createMarkerMappingUI === "function"
                ) {

                    createMarkerMappingUI(
                        kinoveaData.markers
                    );

                }



                if (
                    !kinoveaData.frames ||
                    kinoveaData.frames.length === 0
                ) {

                    throw new Error(
                        "No se encontraron frames válidos."
                    );

                }



                let biomechanicalMeasurements = [];


                if (
                    typeof Biomechanics !== "undefined" &&
                    typeof Biomechanics.analyzeBiomechanics === "function"
                ) {

                    biomechanicalMeasurements =
                        Biomechanics.analyzeBiomechanics(
                            kinoveaData.frames
                        );

                }



                analysisResult = {


                    metadata: {

                        fileName:
                            file.name,

                        created:
                            new Date()
                            .toISOString()

                    },


                    kinovea:
                        kinoveaData,


                    frames:
                        kinoveaData.frames,


                    totalFrames:
                        kinoveaData.frameCount,


                    biomechanicalMeasurements,


                    angles: [],


                    movements: [],


                    ocra: null


                };



                updateStatistics(
                    kinoveaData,
                    file
                );



                const status =
                    document.getElementById(
                        "status"
                    );


                if (status) {

                    status.textContent =
                        "✔ JSON Kinovea procesado correctamente.";

                }



                showBiomechanicalResults(
                    analysisResult
                );


                showPostureResults();


                showMovementResults();


                showAnalysisMetrics();


                showOcraEvaluation();



                console.log(
                    "Analysis Result:",
                    analysisResult
                );


            }

            catch(error) {


                console.error(
                    error
                );


                const status =
                    document.getElementById(
                        "status"
                    );


                if (status) {

                    status.textContent =
                        "❌ Error leyendo archivo: "
                        +
                        error.message;

                }

            }


        };



    reader.readAsText(file);

}



/*
=========================================================
Actualización estadísticas
=========================================================
*/

function updateStatistics(
    kinoveaData,
    file
) {


    const fileName =
        document.getElementById(
            "fileName"
        );


    const fileSize =
        document.getElementById(
            "fileSize"
        );


    const frameCount =
        document.getElementById(
            "frameCount"
        );


    const landmarkCount =
        document.getElementById(
            "landmarkCount"
        );



    if (fileName) {

        fileName.textContent =
            file.name;

    }



    if (fileSize) {

        fileSize.textContent =
            (
                file.size / 1024
            )
            .toFixed(2)
            +
            " KB";

    }



    if (frameCount) {

        frameCount.textContent =
            kinoveaData.frameCount;

    }



    if (landmarkCount) {

        landmarkCount.textContent =
            kinoveaData.markers.length;

    }

}



/*
=========================================================
Panel biomecánico
=========================================================
*/

function showBiomechanicalResults(
    result
) {


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
        !measurements ||
        measurements.length === 0
    ) {

        container.textContent =
            "Pendiente de cálculo biomecánico.";

        return;

    }



    let html =
        "<table>";



    html +=
        `
        <tr>
            <th>Medición</th>
            <th>Valor</th>
        </tr>
        `;



    measurements.forEach(
        item => {

            html +=
            `
            <tr>
                <td>${item.name}</td>
                <td>${item.value}</td>
            </tr>
            `;

        }
    );



    html +=
        "</table>";



    container.innerHTML =
        html;

}



/*
=========================================================
Paneles pendientes
=========================================================
*/

function showPostureResults() {


    const element =
        document.getElementById(
            "postureResults"
        );


    if (element) {

        element.textContent =
            "Pendiente de integración con PostureAnalyzer.";

    }

}



function showMovementResults() {


    const element =
        document.getElementById(
            "movementResults"
        );


    if (element) {

        element.textContent =
            "Pendiente de integración con MovementManager.";

    }

}



function showAnalysisMetrics() {


    const element =
        document.getElementById(
            "analysisMetrics"
        );


    if (element) {

        element.textContent =
            "Pendiente de cálculo de métricas.";

    }

}



function showOcraEvaluation() {


    const element =
        document.getElementById(
            "ocraResults"
        );


    if (element) {

        element.textContent =
            "Pendiente de evaluación OCRA.";

    }

}
