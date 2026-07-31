"use strict";

/*
=========================================================
OCRA Video Analyzer
Main Application Controller
=========================================================

Responsabilidades:
- Seleccionar el archivo JSON de Kinovea.
- Leer y validar el JSON.
- Crear el objeto analysisResult.
- Preparar la aplicación para las siguientes fases.
=========================================================
*/

let analysisResult = null;

document.addEventListener("DOMContentLoaded", () => {

    const fileInput = document.getElementById("jsonFile");
    const analyzeButton = document.getElementById("analyzeButton");

    const status = document.getElementById("status");

    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");
    const frameCount = document.getElementById("frameCount");
    const landmarkCount = document.getElementById("landmarkCount");

    let selectedFile = null;

    //-----------------------------------------------------
    // Selección del archivo
    //-----------------------------------------------------

    fileInput.addEventListener("change", (event) => {

        if (event.target.files.length === 0) {

            selectedFile = null;

            analyzeButton.disabled = true;

            status.textContent = "Esperando un archivo JSON...";

            fileName.textContent = "-";
            fileSize.textContent = "-";
            frameCount.textContent = "-";
            landmarkCount.textContent = "-";

            return;

        }

        selectedFile = event.target.files[0];

        fileName.textContent = selectedFile.name;
        fileSize.textContent =
            (selectedFile.size / 1024).toFixed(2) + " KB";

        status.textContent = "Archivo cargado correctamente.";

        analyzeButton.disabled = false;

    });

    //-----------------------------------------------------
    // Botón Analizar
    //-----------------------------------------------------

    analyzeButton.addEventListener("click", () => {

        if (!selectedFile) {

            alert("Seleccione primero un archivo JSON.");

            return;

        }

        status.textContent = "Leyendo archivo...";

        readKinoveaJSON(selectedFile);

    });

});


/*
=========================================================
Lectura del JSON
=========================================================
*/

function readKinoveaJSON(file) {

    const reader = new FileReader();

    reader.onload = function (event) {

        try {

            const json = JSON.parse(event.target.result);

            //-------------------------------------------------
            // Comprobar que el módulo Kinovea está cargado
            //-------------------------------------------------

            if (typeof Kinovea === "undefined") {

                throw new Error("El módulo kinovea.js no está cargado.");

            }

            //-------------------------------------------------
            // Procesar JSON
            //-------------------------------------------------

            const result = Kinovea.parse(json);

            //-------------------------------------------------
            // Guardar resultado del análisis
            //-------------------------------------------------

            analysisResult = {

                frames: result.frames,
                totalFrames: result.frameCount,
                totalLandmarks: result.landmarkCount

            };

            //-------------------------------------------------
            // Actualizar interfaz
            //-------------------------------------------------

            document.getElementById("frameCount").textContent =
                result.frameCount;

            document.getElementById("landmarkCount").textContent =
                result.landmarkCount;

            document.getElementById("status").textContent =
                "JSON procesado: " +
                result.frameCount +
                " fotogramas.";

            //-------------------------------------------------
            // Consola
            //-------------------------------------------------

            console.log("====================================");
            console.log("Kinovea JSON cargado");
            console.log("Frames:", result.frameCount);
            console.log("Landmarks:", result.landmarkCount);
            console.log(result);
            console.log("====================================");

        }

        catch (error) {

            console.error(error);

            document.getElementById("status").textContent =
                "Error: " + error.message;

        }

    };

    reader.readAsText(file);

}
