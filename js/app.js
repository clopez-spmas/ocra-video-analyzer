"use strict";

/*
=========================================================
OCRA Video Analyzer
Main Application Controller
=========================================================
*/

document.addEventListener("DOMContentLoaded", () => {

    const fileInput = document.getElementById("jsonFile");
    const analyzeButton = document.getElementById("analyzeButton");

    const status = document.getElementById("status");

    const fileName = document.getElementById("fileName");
    const fileSize = document.getElementById("fileSize");

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

            console.log(json);

            document.getElementById("status").textContent =
                "JSON leído correctamente.";

        }

        catch (error) {

            console.error(error);

            document.getElementById("status").textContent =
                "El archivo no contiene un JSON válido.";

        }

    };

    reader.readAsText(file);

}
