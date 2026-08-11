
"use strict";

/*
=========================================================
OCRA VIDEO ANALYZER v5
Archivo: video.js

Gestión de vídeos y archivos Kinovea.

IMPORTANTE:
Este archivo NO utiliza import/export.
Se carga directamente mediante index.html.

Responsabilidades:

- Crear los selectores de archivos.
- Gestionar los vídeos seleccionados.
- Obtener archivos JSON de Kinovea.
- Proporcionar información básica del vídeo.
- Mantener compatibilidad con app.js.
=========================================================
*/


/* =====================================================
   ESTADO
   ===================================================== */

let selectedVideoFiles = [];


/* =====================================================
   OBTENER NÚMERO DE VÍDEOS
   ===================================================== */

function getSelectedVideoCount() {

    const selected =
        document.querySelector(
            'input[name="videoCount"]:checked'
        );


    if (!selected) {

        return 1;

    }


    const count =
        parseInt(
            selected.value,
            10
        );


    if (
        !Number.isFinite(count) ||
        count < 1
    ) {

        return 1;

    }


    return count;

}


/* =====================================================
   CREAR INPUTS DE VÍDEO
   ===================================================== */

function createVideoInputs() {

    const container =
        document.getElementById(
            "videoInputsContainer"
        );


    if (!container) {

        console.error(
            "video.js: no existe videoInputsContainer"
        );

        return;

    }


    const count =
        getSelectedVideoCount();


    selectedVideoFiles =
        new Array(count).fill(null);


    let html = "";


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const number =
            i + 1;


        html += `

            <div
                class="video-input-row"
                data-video-index="${i}"
            >

                <label
                    for="videoFile_${i}"
                >

                    Vídeo ${number}

                </label>


                <input
                    type="file"
                    id="videoFile_${i}"
                    class="video-file-input"
                    data-video-index="${i}"
                    accept=".json,application/json"
                >


                <span
                    id="videoFileName_${i}"
                    class="video-file-name"
                >

                    Ningún archivo seleccionado

                </span>

            </div>

        `;

    }


    container.innerHTML =
        html;


    const inputs =
        container.querySelectorAll(
            ".video-file-input"
        );


    inputs.forEach(
        input => {

            input.addEventListener(
                "change",
                handleVideoFileChange
            );

        }
    );


    updateAnalyzeButton();

}


/* =====================================================
   CAMBIO DE ARCHIVO
   ===================================================== */

function handleVideoFileChange(
    event
) {

    const input =
        event.target;


    const index =
        parseInt(
            input.dataset.videoIndex,
            10
        );


    if (
        !Number.isFinite(index)
    ) {

        return;

    }


    const file =
        input.files &&
        input.files.length > 0
            ? input.files[0]
            : null;


    selectedVideoFiles[index] =
        file;


    const nameElement =
        document.getElementById(
            `videoFileName_${index}`
        );


    if (nameElement) {

        nameElement.textContent =
            file
                ? file.name
                : "Ningún archivo seleccionado";

    }


    updateAnalyzeButton();

}


/* =====================================================
   OBTENER ARCHIVO DE UN VÍDEO
   ===================================================== */

function getVideoFile(
    index
) {

    if (
        !Number.isInteger(index)
    ) {

        return null;

    }


    return (
        selectedVideoFiles[index]
        ?? null
    );

}


/* =====================================================
   OBTENER TODOS LOS ARCHIVOS
   ===================================================== */

function getSelectedVideoFiles() {

    return [
        ...selectedVideoFiles
    ];

}


/* =====================================================
   COMPROBAR SI TODOS LOS VÍDEOS ESTÁN SELECCIONADOS
   ===================================================== */

function allVideosSelected() {

    const count =
        getSelectedVideoCount();


    if (
        selectedVideoFiles.length !== count
    ) {

        return false;

    }


    for (
        let i = 0;
        i < count;
        i++
    ) {

        if (
            !selectedVideoFiles[i]
        ) {

            return false;

        }

    }


    return true;

}


/* =====================================================
   ACTUALIZAR BOTÓN ANALIZAR
   ===================================================== */

function updateAnalyzeButton() {

    const button =
        document.getElementById(
            "analyzeButton"
        );


    if (!button) {

        return;

    }


    button.disabled =
        !allVideosSelected();


    const status =
        document.getElementById(
            "status"
        );


    if (!status) {

        return;

    }


    const count =
        getSelectedVideoCount();


    const selected =
        selectedVideoFiles.filter(
            file => !!file
        ).length;


    if (
        selected === 0
    ) {

        status.textContent =
            "Seleccione los vídeos.";

        return;

    }


    if (
        selected < count
    ) {

        status.textContent =
            `Vídeos seleccionados: ${selected} de ${count}.`;

        return;

    }


    status.textContent =
        "Todos los vídeos están preparados para el análisis.";

}


/* =====================================================
   LEER ARCHIVO COMO TEXTO
   ===================================================== */

function readVideoFile(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (!file) {

                reject(
                    new Error(
                        "No se ha seleccionado ningún archivo."
                    )
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    try {

                        const text =
                            event.target.result;


                        if (
                            typeof text !== "string"
                        ) {

                            throw new Error(
                                "El contenido del archivo no es texto."
                            );

                        }


                        resolve(
                            text
                        );

                    }
                    catch (error) {

                        reject(
                            error
                        );

                    }

                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "No se pudo leer el archivo."
                        )
                    );

                };


            reader.readAsText(
                file
            );

        }
    );

}


/* =====================================================
   LEER JSON KINOVEA
   ===================================================== */

async function readKinoveaFile(
    file
) {

    const text =
        await readVideoFile(
            file
        );


    let json;


    try {

        json =
            JSON.parse(
                text
            );

    }
    catch (error) {

        throw new Error(
            "El archivo seleccionado no contiene un JSON válido."
        );

    }


    return json;

}


/* =====================================================
   INFORMACIÓN BÁSICA DEL ARCHIVO
   ===================================================== */

function getVideoFileInfo(
    file
) {

    if (!file) {

        return {

            name:
                "",

            size:
                0,

            type:
                "",

            lastModified:
                null

        };

    }


    return {

        name:
            file.name
            ?? "",

        size:
            file.size
            ?? 0,

        type:
            file.type
            ?? "",

        lastModified:
            file.lastModified
            ?? null

    };

}


/* =====================================================
   CAMBIO DEL NÚMERO DE VÍDEOS
   ===================================================== */

function handleVideoCountChange() {

    createVideoInputs();


    /*
    -----------------------------------------------------
    Reiniciar configuración de ciclos si existe.
    -----------------------------------------------------
    */

    if (
        typeof createCycleConfigurationUI ===
        "function"
    ) {

        try {

            createCycleConfigurationUI();

        }
        catch (error) {

            console.warn(
                "No se pudo actualizar la configuración de ciclos:",
                error
            );

        }

    }

}


/* =====================================================
   INICIALIZACIÓN
   ===================================================== */

function initializeVideoManager() {

    const radios =
        document.querySelectorAll(
            'input[name="videoCount"]'
        );


    radios.forEach(
        radio => {

            radio.addEventListener(
                "change",
                handleVideoCountChange
            );

        }
    );


    createVideoInputs();

}


/* =====================================================
   EXPORTACIÓN GLOBAL
   =====================================================

   IMPORTANTE:

   No utilizamos:

       export
       import

   Este proyecto utiliza scripts clásicos cargados
   desde index.html.
   ===================================================== */

window.VideoManager = {

    getSelectedVideoCount,

    createVideoInputs,

    handleVideoFileChange,

    getVideoFile,

    getSelectedVideoFiles,

    allVideosSelected,

    updateAnalyzeButton,

    readVideoFile,

    readKinoveaFile,

    getVideoFileInfo,

    handleVideoCountChange,

    initializeVideoManager

};


/* =====================================================
   COMPATIBILIDAD GLOBAL
   ===================================================== */

window.getSelectedVideoCount =
    getSelectedVideoCount;


window.createVideoInputs =
    createVideoInputs;


window.handleVideoFileChange =
    handleVideoFileChange;


window.getVideoFile =
    getVideoFile;


window.getSelectedVideoFiles =
    getSelectedVideoFiles;


window.allVideosSelected =
    allVideosSelected;


window.updateAnalyzeButton =
    updateAnalyzeButton;


window.readVideoFile =
    readVideoFile;


window.readKinoveaFile =
    readKinoveaFile;


window.getVideoFileInfo =
    getVideoFileInfo;


window.handleVideoCountChange =
    handleVideoCountChange;


window.initializeVideoManager =
    initializeVideoManager;


/* =====================================================
   INICIALIZACIÓN DOM
   ===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeVideoManager
    );

}
else {

    initializeVideoManager();

}


/* =====================================================
   CONFIRMACIÓN
   ===================================================== */

console.log(
    "OCRA Video Analyzer: video.js cargado correctamente"
);