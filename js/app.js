"use strict";

/*
=========================================================
OCRA VIDEO ANALYZER
APP.JS

ANÁLISIS DE 1 A 12 VÍDEOS

Cada vídeo tiene independientemente:

- Archivo Kinovea
- Marcadores Kinovea
- Mapping de marcadores
- Frames anatómicos
- Frames biomecánicos
- Configuración de ciclo
- Resultados temporales

IMPORTANTE:

Los marcadores de TODOS los vídeos se muestran
simultáneamente para su asignación.

Cada vídeo conserva su propio mapping:

mapping[0]  -> Vídeo 1
mapping[1]  -> Vídeo 2
mapping[2]  -> Vídeo 3
mapping[3]  -> Vídeo 4
mapping[4]  -> Vídeo 5
mapping[5]  -> Vídeo 6
mapping[6]  -> Vídeo 7
mapping[7]  -> Vídeo 8
mapping[8]  -> Vídeo 9
mapping[9]  -> Vídeo 10
mapping[10] -> Vídeo 11
mapping[11] -> Vídeo 12

Los umbrales son comunes a todos los vídeos.

Cada AnalysisResult representa UN SOLO vídeo.

analysisResults contiene todos los resultados
individuales.

=========================================================
*/

let analysisResults = [];


/*
=========================================================
INICIO
=========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const videoCountRadios =
            document.querySelectorAll(
                'input[name="videoCount"]'
            );


        const videoInputsContainer =
            document.getElementById(
                "videoInputsContainer"
            );


        const analyzeButton =
            document.getElementById(
                "analyzeButton"
            );


        const status =
            document.getElementById(
                "status"
            );


        if (!videoInputsContainer) {

            console.error(
                "No existe #videoInputsContainer"
            );

            return;

        }


        if (!analyzeButton) {

            console.error(
                "No existe #analyzeButton"
            );

            return;

        }


        /*
        -------------------------------------------------
        CREAR CAMPOS DE VÍDEO
        -------------------------------------------------
        */

        updateVideoInputs();


        /*
        -------------------------------------------------
        CAMBIO DE NÚMERO DE VÍDEOS
        -------------------------------------------------
        */

        videoCountRadios.forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    () => {

                        updateVideoInputs();


                        if (status) {

                            status.textContent =
                                "Seleccione los vídeos.";

                        }

                    }
                );

            }
        );


        /*
        -------------------------------------------------
        BOTÓN ANALIZAR
        -------------------------------------------------
        */

        analyzeButton.addEventListener(
            "click",
            async () => {

                console.log(
                    "===== INICIO ANÁLISIS TODOS LOS VÍDEOS ====="
                );


                await analyzeAllVideos();


                console.log(
                    "===== FIN ANÁLISIS TODOS LOS VÍDEOS ====="
                );

            }
        );


        /*
        -------------------------------------------------
        FUNCIONES GLOBALES
        -------------------------------------------------
        */

        window.updateVideoInputs =
            updateVideoInputs;


        window.analyzeAllVideos =
            analyzeAllVideos;


        console.log(
            "OCRA Video Analyzer: app.js inicializado"
        );

    }

);


/*
=========================================================
NÚMERO DE VÍDEOS
=========================================================
*/

function getSelectedVideoCount() {

    const selected =
        document.querySelector(
            'input[name="videoCount"]:checked'
        );


    if (!selected) {

        return 1;

    }


    const count =
        Number(
            selected.value
        );


    /*
    -----------------------------------------------------
    AHORA EL MÁXIMO ES 12
    -----------------------------------------------------
    */

    if (
        !Number.isInteger(count)
        ||
        count < 1
        ||
        count > 12
    ) {

        return 1;

    }


    return count;

}


/*
=========================================================
CREAR CAMPOS DE ARCHIVO
=========================================================
*/

function updateVideoInputs() {

    const container =
        document.getElementById(
            "videoInputsContainer"
        );


    const analyzeButton =
        document.getElementById(
            "analyzeButton"
        );


    if (!container) {

        console.error(
            "No existe #videoInputsContainer"
        );

        return;

    }


    const videoCount =
        getSelectedVideoCount();


    /*
    -----------------------------------------------------
    LIMPIAR
    -----------------------------------------------------
    */

    container.innerHTML =
        "";


    /*
    -----------------------------------------------------
    CREAR BLOQUES
    -----------------------------------------------------
    */

    for (
        let i = 0;
        i < videoCount;
        i++
    ) {

        const videoNumber =
            i + 1;


        const block =
            document.createElement(
                "div"
            );


        block.className =
            "video-input-block";


        block.innerHTML = `

            <h3>
                Vídeo ${videoNumber}
            </h3>

            <input
                type="file"
                id="jsonFile_${i}"
                data-video-index="${i}"
                accept=".json,application/json"
            >

            <div class="file-info">

                <p>

                    <strong>
                        Archivo:
                    </strong>

                    <span id="fileName_${i}">
                        Ningún archivo seleccionado.
                    </span>

                </p>

                <p>

                    <strong>
                        Tamaño:
                    </strong>

                    <span id="fileSize_${i}">
                        -
                    </span>

                </p>

            </div>

        `;


        container.appendChild(
            block
        );


        const input =
            document.getElementById(
                `jsonFile_${i}`
            );


        if (input) {

            input.addEventListener(
                "change",
                event => {

                    handleVideoFileSelection(
                        event,
                        i
                    );

                }
            );

        }

    }


    /*
    -----------------------------------------------------
    BOTÓN ANALIZAR
    -----------------------------------------------------
    */

    if (analyzeButton) {

        analyzeButton.disabled =
            !allVideoFilesSelected();

    }


    /*
    -----------------------------------------------------
    CONFIGURACIÓN DE CICLOS
    -----------------------------------------------------
    */

    if (
        typeof initializeCycleUI ===
        "function"
    ) {

        initializeCycleUI(
            videoCount
        );

    }


    /*
    -----------------------------------------------------
    LIMPIAR MAPPING ANTERIOR
    -----------------------------------------------------
    */

    const mappingContainer =
        document.getElementById(
            "markerMappingContainer"
        );


    if (mappingContainer) {

        mappingContainer.innerHTML =
            "Pendiente de selección de vídeos.";

    }

}


/*
=========================================================
ARCHIVO SELECCIONADO
=========================================================
*/

function handleVideoFileSelection(
    event,
    videoIndex
) {

    const input =
        event.target;


    if (
        !input.files
        ||
        input.files.length === 0
    ) {

        return;

    }


    const file =
        input.files[0];


    /*
    -----------------------------------------------------
    VALIDAR JSON
    -----------------------------------------------------
    */

    if (
        !file.name
            .toLowerCase()
            .endsWith(".json")
    ) {

        input.value =
            "";


        alert(
            `El archivo del Vídeo ${videoIndex + 1} no es un JSON válido.`
        );


        return;

    }


    /*
    -----------------------------------------------------
    INFORMACIÓN
    -----------------------------------------------------
    */

    updateFileInfo(
        file,
        videoIndex
    );


    /*
    -----------------------------------------------------
    BOTÓN
    -----------------------------------------------------
    */

    const analyzeButton =
        document.getElementById(
            "analyzeButton"
        );


    if (analyzeButton) {

        analyzeButton.disabled =
            !allVideoFilesSelected();

    }


    /*
    -----------------------------------------------------
    ESTADO
    -----------------------------------------------------
    */

    const status =
        document.getElementById(
            "status"
        );


    if (status) {

        if (
            allVideoFilesSelected()
        ) {

            status.textContent =
                "Todos los vídeos seleccionados. Puede analizarlos.";

        }
        else {

            status.textContent =
                "Seleccione todos los vídeos configurados.";

        }

    }

}


/*
=========================================================
COMPROBAR ARCHIVOS
=========================================================
*/

function allVideoFilesSelected() {

    const videoCount =
        getSelectedVideoCount();


    for (
        let i = 0;
        i < videoCount;
        i++
    ) {

        const input =
            document.getElementById(
                `jsonFile_${i}`
            );


        if (
            !input
            ||
            !input.files
            ||
            input.files.length === 0
        ) {

            return false;

        }

    }


    return true;

}


/*
=========================================================
ANALIZAR TODOS LOS VÍDEOS
=========================================================
*/

async function analyzeAllVideos() {

    console.log(
        "===== analyzeAllVideos() INICIO ====="
    );


    const videoCount =
        getSelectedVideoCount();


    console.log(
        "Número de vídeos seleccionado:",
        videoCount
    );


    const analyzeButton =
        document.getElementById(
            "analyzeButton"
        );


    const status =
        document.getElementById(
            "status"
        );


    /*
    =====================================================
    COMPROBAR ARCHIVOS
    =====================================================
    */

    if (!allVideoFilesSelected()) {

        alert(
            "Debe seleccionar todos los vídeos configurados."
        );


        return;

    }


    /*
    =====================================================
    UMBRALES COMUNES
    =====================================================
    */

    try {

        console.log(
            "Aplicando umbrales comunes..."
        );


        applyUserThresholds();


        console.log(
            "Umbrales comunes aplicados correctamente."
        );

    }
    catch (error) {

        console.error(
            error
        );


        if (status) {

            status.textContent =
                "❌ Error en los umbrales: "
                +
                error.message;

        }


        return;

    }


    /*
    =====================================================
    DESACTIVAR BOTÓN
    =====================================================
    */

    if (analyzeButton) {

        analyzeButton.disabled =
            true;

    }


    /*
    =====================================================
    LIMPIAR RESULTADOS
    =====================================================
    */

    analysisResults =
        [];


    clearResults();


    /*
    =====================================================
    FASE 1
    LEER TODOS LOS VÍDEOS
    =====================================================
    */

    if (status) {

        status.textContent =
            "Leyendo archivos Kinovea...";

    }


    const videoData =
        [];


    try {

        for (
            let videoIndex = 0;
            videoIndex < videoCount;
            videoIndex++
        ) {

            const input =
                document.getElementById(
                    `jsonFile_${videoIndex}`
                );


            if (
                !input
                ||
                !input.files
                ||
                !input.files[0]
            ) {

                throw new Error(
                    `Falta el archivo del Vídeo ${videoIndex + 1}.`
                );

            }


            const file =
                input.files[0];


            console.log(
                `Vídeo ${videoIndex + 1}: leyendo ${file.name}`
            );


            if (status) {

                status.textContent =
                    `Leyendo Vídeo ${videoIndex + 1} de ${videoCount}...`;

            }


            const json =
                await readJsonFile(
                    file
                );


            /*
            ---------------------------------------------
            KINOVEA
            ---------------------------------------------
            */

            if (
                typeof parseKinoveaJSON !==
                "function"
            ) {

                throw new Error(
                    "kinovea.js no está cargado."
                );

            }


            const kinoveaData =
                parseKinoveaJSON(
                    json
                );


            if (!kinoveaData) {

                throw new Error(
                    `No se pudieron interpretar los datos de Kinovea del Vídeo ${videoIndex + 1}.`
                );

            }


            if (
                !Array.isArray(
                    kinoveaData.frames
                )
                ||
                kinoveaData.frames.length === 0
            ) {

                throw new Error(
                    `El Vídeo ${videoIndex + 1} no contiene frames Kinovea.`
                );

            }


            const markers =
                Array.isArray(
                    kinoveaData.markers
                )
                    ? kinoveaData.markers
                    : [];


            console.log(
                `Vídeo ${videoIndex + 1} - marcadores:`,
                markers
            );


            /*
            ---------------------------------------------
            GUARDAR DATOS DEL VÍDEO
            ---------------------------------------------
            */

            videoData.push({

                videoIndex:
                    videoIndex,

                videoNumber:
                    videoIndex + 1,

                file:
                    file,

                json:
                    json,

                kinoveaData:
                    kinoveaData,

                markers:
                    markers

            });

        }

    }
    catch (error) {

        console.error(
            "Error leyendo vídeos:",
            error
        );


        if (status) {

            status.textContent =
                "❌ Error leyendo vídeos: "
                +
                error.message;

        }


        if (analyzeButton) {

            analyzeButton.disabled =
                false;

        }


        return;

    }


    /*
    =====================================================
    FASE 2
    MAPPING DE TODOS LOS VÍDEOS A LA VEZ
    =====================================================
    */

    console.log(
        "===== MOSTRANDO TODOS LOS MAPPINGS ====="
    );


    const allMarkers =
        videoData.map(
            video =>
                video.markers
        );


    let mappings;


    try {

        if (
            typeof createAllMarkerMappingUI !==
            "function"
        ) {

            throw new Error(
                "markerMapping.js no contiene createAllMarkerMappingUI()."
            );

        }


        if (status) {

            status.textContent =
                "Asigne los marcadores de todos los vídeos.";

        }


        mappings =
            await createAllMarkerMappingUI(
                allMarkers
            );


        console.log(
            "Mappings recibidos:",
            mappings
        );


        if (
            !Array.isArray(mappings)
            ||
            mappings.length !== videoCount
        ) {

            throw new Error(
                "Los mappings recibidos no corresponden con todos los vídeos."
            );

        }

    }
    catch (error) {

        console.error(
            "Error en asignación de marcadores:",
            error
        );


        if (status) {

            status.textContent =
                "❌ "
                +
                error.message;

        }


        if (analyzeButton) {

            analyzeButton.disabled =
                false;

        }


        return;

    }


    /*
    =====================================================
    ASOCIAR MAPPING A CADA VÍDEO
    =====================================================
    */

    videoData.forEach(
        (
            video,
            index
        ) => {

            video.mapping =
                mappings[index];


            console.log(
                `Vídeo ${index + 1} - mapping definitivo:`,
                video.mapping
            );

        }
    );


    /*
    =====================================================
    FASE 3
    ANALIZAR CADA VÍDEO
    =====================================================
    */

    for (
        let videoIndex = 0;
        videoIndex < videoData.length;
        videoIndex++
    ) {

        const video =
            videoData[videoIndex];


        console.log(
            "========================================"
        );


        console.log(
            `ANALIZANDO VÍDEO ${video.videoNumber}`
        );


        console.log(
            "Archivo:",
            video.file.name
        );


        console.log(
            "Mapping:",
            video.mapping
        );


        console.log(
            "========================================"
        );


        if (status) {

            status.textContent =
                `Analizando Vídeo ${video.videoNumber} de ${videoCount}...`;

        }


        try {

            const result =
                await analyzeSingleVideo(
                    video.file,
                    video.videoIndex,
                    video.kinoveaData,
                    video.mapping
                );


            /*
            ---------------------------------------------
            SEGURIDAD
            ---------------------------------------------
            */

            if (!result) {

                throw new Error(
                    `No se obtuvo resultado del Vídeo ${video.videoNumber}.`
                );

            }


            /*
            ---------------------------------------------
            GUARDAR RESULTADO
            ---------------------------------------------
            */

            analysisResults.push(
                result
            );


            console.log(
                `Vídeo ${video.videoNumber} terminado.`
            );


            console.log(
                "Resultados acumulados:",
                analysisResults.length
            );

        }
        catch (error) {

            console.error(
                `Error en Vídeo ${video.videoNumber}:`,
                error
            );


            console.error(
                error.stack
            );


            if (status) {

                status.textContent =
                    `❌ Error en Vídeo ${video.videoNumber}: `
                    +
                    error.message;

            }


            if (analyzeButton) {

                analyzeButton.disabled =
                    false;

            }


            return;

        }

    }


    /*
    =====================================================
    FASE 4
    RESULTADOS
    =====================================================
    */

    console.log(
        "===== TODOS LOS VÍDEOS ANALIZADOS ====="
    );


    console.log(
        "Resultados:",
        analysisResults
    );


    showAnalysisInformation(
        analysisResults
    );


    showIndividualResults(
        analysisResults
    );


    showGlobalResults(
        analysisResults
    );


    showCombinedPostureResults(
        analysisResults
    );


    if (status) {

        status.textContent =
            `✔ Análisis completado: ${videoCount} vídeo(s).`;

    }


    if (analyzeButton) {

        analyzeButton.disabled =
            false;

    }

}
/*
=========================================================
LEER JSON
=========================================================
*/

function readJsonFile(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    try {

                        const json =
                            JSON.parse(
                                event.target.result
                            );


                        resolve(
                            json
                        );

                    }
                    catch (error) {

                        reject(
                            new Error(
                                `El archivo "${file.name}" no contiene un JSON válido.`
                            )
                        );

                    }

                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            `No se pudo leer el archivo "${file.name}".`
                        )
                    );

                };


            reader.readAsText(
                file
            );

        }
    );

}


/*
=========================================================
ANALIZAR UN VÍDEO
=========================================================

IMPORTANTE:

Ahora recibe directamente:

- kinoveaData
- mapping

Por tanto NO vuelve a abrir la interfaz de
asignación de marcadores.

Cada llamada trabaja exclusivamente con
los datos del vídeo correspondiente.

=========================================================
*/

async function analyzeSingleVideo(
    file,
    videoIndex,
    kinoveaData = null,
    mapping = null
) {

    console.log(
        `========== analyzeSingleVideo() VÍDEO ${videoIndex + 1} ==========`
    );


    /*
    =====================================================
    KINOVEA
    =====================================================
    */

    if (!kinoveaData) {

        throw new Error(
            `No existen datos Kinovea para el Vídeo ${videoIndex + 1}.`
        );

    }


    if (!mapping) {

        throw new Error(
            `No existe mapping para el Vídeo ${videoIndex + 1}.`
        );

    }


    console.log(
        `Vídeo ${videoIndex + 1} - mapping recibido:`,
        mapping
    );


    /*
    =====================================================
    FRAMES
    =====================================================
    */

    if (
        !kinoveaData.frames
        ||
        kinoveaData.frames.length === 0
    ) {

        throw new Error(
            `No hay frames Kinovea en el Vídeo ${videoIndex + 1}.`
        );

    }


    /*
    =====================================================
    ADAPTADOR ANATÓMICO
    =====================================================
    */

    if (
        typeof adaptKinoveaFrames !==
        "function"
    ) {

        throw new Error(
            "biomechanical_adapter.js no cargado."
        );

    }


    console.log(
        `Vídeo ${videoIndex + 1} - adaptando frames anatómicos...`
    );


    /*
    -----------------------------------------------------
    IMPORTANTE:

    El mapping utilizado aquí pertenece
    exclusivamente al vídeo actual.
    -----------------------------------------------------
    */

    const anatomicalFrames =
        adaptKinoveaFrames(
            kinoveaData.frames,
            mapping
        );


    if (
        !anatomicalFrames
        ||
        anatomicalFrames.length === 0
    ) {

        throw new Error(
            `No se pudieron generar frames anatómicos en el Vídeo ${videoIndex + 1}.`
        );

    }


    console.log(
        `Vídeo ${videoIndex + 1} - frames anatómicos:`,
        anatomicalFrames.length
    );


    /*
    =====================================================
    ANALYSIS RESULT
    =====================================================
    */

    if (
        typeof AnalysisResult !==
        "function"
    ) {

        throw new Error(
            "AnalysisResult no está disponible."
        );

    }


    const result =
        new AnalysisResult();


    result.videoIndex =
        videoIndex;


    result.videoNumber =
        videoIndex + 1;


    result.fileName =
        file.name;


    /*
    =====================================================
    METADATA
    =====================================================
    */

    const metadata = {

        fileName:
            file.name,

        videoIndex:
            videoIndex,

        videoNumber:
            videoIndex + 1,

        created:
            new Date().toISOString(),

        landmarkCount:
            countMappedLandmarks(
                mapping
            )

    };


    if (
        typeof result.setMetadata ===
        "function"
    ) {

        result.setMetadata(
            metadata
        );

    }
    else {

        result.metadata =
            metadata;

    }


    /*
    =====================================================
    POSE FRAMES
    =====================================================
    */

    if (
        typeof result.setPoseFrames ===
        "function"
    ) {

        result.setPoseFrames(
            kinoveaData.frames
        );

    }
    else {

        result.poseFrames =
            kinoveaData.frames;

    }


    /*
    =====================================================
    ANATOMICAL FRAMES
    =====================================================
    */

    if (
        typeof result.setAnatomicalFrames ===
        "function"
    ) {

        result.setAnatomicalFrames(
            anatomicalFrames
        );

    }
    else {

        result.anatomicalFrames =
            anatomicalFrames;

    }


    /*
    =====================================================
    BIOMECÁNICA
    =====================================================
    */

    let biomechanicalResults =
        [];


    if (
        typeof Biomechanics !==
        "undefined"
        &&
        Biomechanics
        &&
        typeof Biomechanics.analyzeBiomechanics ===
            "function"
        &&
        anatomicalFrames.length > 0
    ) {

        biomechanicalResults =
            Biomechanics.analyzeBiomechanics(
                anatomicalFrames
            );

    }


    console.log(
        `Vídeo ${videoIndex + 1} - frames biomecánicos:`,
        biomechanicalResults.length
    );


    if (
        typeof result.setBiomechanicalFrames ===
        "function"
    ) {

        result.setBiomechanicalFrames(
            biomechanicalResults
        );

    }
    else {

        result.biomechanicalFrames =
            biomechanicalResults;

    }


    /*
    =====================================================
    CICLO
    =====================================================
    */

    let cycleConfig = {

        enabled:
            false,

        mode:
            "video",

        cycleTime:
            null,

        startTime:
            null,

        endTime:
            null

    };


    if (
        typeof getCycleConfig ===
        "function"
    ) {

        cycleConfig =
            getCycleConfig(
                videoIndex
            );

    }
    else if (
        typeof getSelectedCycleConfig ===
        "function"
    ) {

        cycleConfig =
            getSelectedCycleConfig(
                videoIndex
            );

    }


    console.log(
        `Vídeo ${videoIndex + 1} - cycleConfig:`,
        cycleConfig
    );


    /*
    =====================================================
    POSTURE ANALYZER
    =====================================================
    */

    /*
    IMPORTANTE:

    El archivo utilizado por el proyecto es:

        posture_analyzer

    La clase debe estar disponible globalmente
    como PostureAnalyzer.
    */

    if (
        typeof PostureAnalyzer ===
        "undefined"
        ||
        typeof PostureAnalyzer.analyze !==
            "function"
    ) {

        throw new Error(
            "PostureAnalyzer no está cargado."
        );

    }


    const postureResults =
        PostureAnalyzer.analyze(
            result.biomechanicalFrames ||
            [],
            cycleConfig
        );


    result.postureResults =
        postureResults;


    /*
    =====================================================
    CICLO EN RESULTADO
    =====================================================
    */

    result.cycleConfig = {

        enabled:
            cycleConfig.enabled ===
            true,

        mode:
            cycleConfig.mode ||
            "video",

        cycleTime:
            cycleConfig.cycleTime,

        startTime:
            cycleConfig.startTime,

        endTime:
            cycleConfig.endTime

    };


    /*
    =====================================================
    METADATA COMPLETA
    =====================================================
    */

    if (!result.metadata) {

        result.metadata =
            {};

    }


    result.metadata = {

        ...result.metadata,

        landmarkCount:
            countMappedLandmarks(
                mapping
            ),

        biomechanicalFrameCount:
            biomechanicalResults.length

    };


    /*
    =====================================================
    GUARDAR MAPPING

    Muy importante para poder identificar
    posteriormente qué marcadores pertenecen
    a cada vídeo.
    =====================================================
    */

    result.markerMapping =
        {
            ...mapping
        };


    /*
    =====================================================
    FINAL
    =====================================================
    */

    console.log(
        `Vídeo ${videoIndex + 1} - resultado preparado:`,
        result
    );


    return result;

}


/*
=========================================================
CONTAR LANDMARKS
=========================================================
*/

function countMappedLandmarks(
    mapping
) {

    if (
        !mapping
        ||
        typeof mapping !==
            "object"
    ) {

        return 0;

    }


    return Object.values(
        mapping
    )
    .filter(
        value =>
            value !== null
            &&
            value !== undefined
            &&
            String(
                value
            ).trim() !== ""
    )
    .length;

}


/*
=========================================================
APLICAR UMBRALES
=========================================================
*/

function applyUserThresholds() {

    if (
        typeof setThreshold !==
        "function"
    ) {

        throw new Error(
            "thresholds.js no cargado correctamente."
        );

    }


    const thresholdFields = {

        trunk_flexion:
            "threshold_trunk_flexion",

        trunk_lateral:
            "threshold_trunk_lateral",

        neck_flexion:
            "threshold_neck_flexion",

        shoulder_flexion_left:
            "threshold_shoulder_flexion_left",

        shoulder_flexion_right:
            "threshold_shoulder_flexion_right",

        elbow_flexion_left:
            "threshold_elbow_flexion_left",

        elbow_flexion_right:
            "threshold_elbow_flexion_right"

    };


    Object.entries(
        thresholdFields
    )
    .forEach(
        (
            [
                thresholdId,
                elementId
            ]
        ) => {

            const input =
                document.getElementById(
                    elementId
                );


            if (!input) {

                console.warn(
                    "No existe campo de umbral:",
                    elementId
                );

                return;

            }


            let rawValue =
                input.value;


            if (
                typeof rawValue ===
                "string"
            ) {

                rawValue =
                    rawValue
                        .trim()
                        .replace(
                            ",",
                            "."
                        );

            }


            const value =
                Number(
                    rawValue
                );


            if (
                !Number.isFinite(
                    value
                )
                ||
                value < 0
            ) {

                throw new Error(
                    "Umbral inválido para: "
                    +
                    thresholdId
                );

            }


            const success =
                setThreshold(
                    thresholdId,
                    value
                );


            if (!success) {

                throw new Error(
                    "No se pudo guardar el umbral: "
                    +
                    thresholdId
                );

            }

        }
    );


    console.log(
        "Umbrales comunes aplicados:",
        typeof getAllThresholds ===
        "function"
            ? getAllThresholds()
            : (
                typeof Thresholds !==
                "undefined"
                    ? Thresholds
                    : null
            )
    );

}


/*
=========================================================
LIMPIAR RESULTADOS
=========================================================
*/

function clearResults() {

    const individualResults =
        document.getElementById(
            "individualResults"
        );


    const globalResults =
        document.getElementById(
            "globalResults"
        );


    const analysisInformation =
        document.getElementById(
            "analysisInformation"
        );


    const postureResults =
        document.getElementById(
            "postureResults"
        );


    if (individualResults) {

        individualResults.innerHTML =
            "";

    }


    if (globalResults) {

        globalResults.innerHTML =
            "";

    }


    if (analysisInformation) {

        analysisInformation.innerHTML =
            "";

    }


    if (postureResults) {

        postureResults.innerHTML =
            "";

    }

}


/*
=========================================================
INFORMACIÓN DEL ANÁLISIS
=========================================================
*/

function showAnalysisInformation(
    results
) {

    const container =
        document.getElementById(
            "analysisInformation"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(
            results
        )
        ||
        results.length === 0
    ) {

        container.innerHTML =
            "<p>Sin resultados.</p>";

        return;

    }


    let html = `

        <table class="biomechanics-table">

            <thead>

                <tr>

                    <th>
                        Vídeo
                    </th>

                    <th>
                        Archivo
                    </th>

                    <th>
                        Frames
                    </th>

                    <th>
                        Marcadores
                    </th>

                    <th>
                        Duración
                    </th>

                    <th>
                        Ciclo
                    </th>

                </tr>

            </thead>

            <tbody>

    `;


    results.forEach(
        result => {

            const frames =
                result.poseFrames ||
                [];


            const markers =
                result.metadata
                &&
                Number.isFinite(
                    Number(
                        result.metadata.landmarkCount
                    )
                )
                    ? result.metadata.landmarkCount
                    : "-";


            const duration =
                result.postureResults
                &&
                Number.isFinite(
                    Number(
                        result.postureResults.videoDuration
                    )
                )
                    ? Number(
                        result.postureResults.videoDuration
                    )
                    : 0;


            const cycle =
                result.cycleConfig ||
                {};


            let cycleText =
                "Todo el vídeo";


            if (
                cycle.enabled ===
                true
            ) {

                if (
                    cycle.mode ===
                    "fixed"
                ) {

                    cycleText =
                        `Fijo: ${Number(cycle.cycleTime).toFixed(3)} s`;

                }
                else if (
                    cycle.mode ===
                    "manual"
                ) {

                    cycleText =
                        `Manual: ${Number(cycle.startTime).toFixed(3)} - ${Number(cycle.endTime).toFixed(3)} s`;

                }

            }


            html += `

                <tr>

                    <td>
                        Vídeo ${result.videoNumber}
                    </td>

                    <td>
                        ${escapeHtml(
                            result.fileName ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${frames.length}
                    </td>

                    <td>
                        ${markers}
                    </td>

                    <td>
                        ${duration.toFixed(3)} s
                    </td>

                    <td>
                        ${escapeHtml(
                            cycleText
                        )}
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
RESULTADOS INDIVIDUALES
=========================================================
*/

function showIndividualResults(
    results
) {

    const container =
        document.getElementById(
            "individualResults"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(
            results
        )
        ||
        results.length === 0
    ) {

        container.innerHTML =
            "<p>Sin resultados.</p>";

        return;

    }


    let html =
        "";


    results.forEach(
        result => {

            html += `

                <div
                    class="individual-video-result"
                >

                    <h3>
                        Vídeo ${result.videoNumber}
                    </h3>

                    <p>

                        <strong>
                            Archivo:
                        </strong>

                        ${escapeHtml(
                            result.fileName ||
                            "-"
                        )}

                    </p>

            `;


            const postureResults =
                result.postureResults;


            if (
                postureResults
                &&
                Array.isArray(
                    postureResults.measurements
                )
            ) {

                html +=
                    createResultsTable(
                        postureResults,
                        result.videoNumber
                    );

            }
            else {

                html +=
                    "<p>Sin resultados temporales.</p>";

            }


            html += `

                </div>

                <hr>

            `;

        }
    );


    container.innerHTML =
        html;

}


/*
=========================================================
TABLA INDIVIDUAL
=========================================================
*/

function createResultsTable(
    postureResults,
    videoNumber
) {

    const measurements =
        Array.isArray(
            postureResults.measurements
        )
            ? postureResults.measurements
            : [];


    const videoDuration =
        Number(
            postureResults.videoDuration
        );


    let html = `

        <p>

            Duración del vídeo:

            <strong>

                ${
                    Number.isFinite(
                        videoDuration
                    )
                        ? videoDuration.toFixed(3)
                        : "0.000"
                }

                s

            </strong>

        </p>


        <table class="biomechanics-table">

            <thead>

                <tr>

                    <th>
                        Medición
                    </th>

                    <th>
                        Umbral
                    </th>

                    <th>
                        Tiempo acumulado
                    </th>

                    <th>
                        % vídeo
                    </th>

                    <th>
                        Episodios vídeo
                    </th>

                    <th>
                        Tiempo ciclo
                    </th>

                    <th>
                        % ciclo
                    </th>

                    <th>
                        Episodios ciclo
                    </th>

                </tr>

            </thead>

            <tbody>

    `;


    if (
        measurements.length ===
        0
    ) {

        html += `

            <tr>

                <td colspan="8">
                    Sin mediciones disponibles.
                </td>

            </tr>

        `;

    }


    measurements.forEach(
        measurement => {

            const videoTime =
                Number(
                    measurement.videoExposureTime
                );


            const videoPercentage =
                Number(
                    measurement.videoExposurePercentage
                );


            const videoEpisodes =
                Number(
                    measurement.videoEpisodes
                );


            const cycle =
                measurement.cycle ||
                {};


            const cycleEnabled =
                cycle.enabled ===
                true;


            const cycleTime =
                cycleEnabled
                &&
                Number.isFinite(
                    Number(
                        cycle.exposureTime
                    )
                )
                    ? Number(
                        cycle.exposureTime
                    )
                    : null;


            const cyclePercentage =
                cycleEnabled
                &&
                Number.isFinite(
                    Number(
                        cycle.exposurePercentage
                    )
                )
                    ? Number(
                        cycle.exposurePercentage
                    )
                    : null;


            const cycleEpisodes =
                cycleEnabled
                &&
                Number.isFinite(
                    Number(
                        cycle.episodes
                    )
                )
                    ? Number(
                        cycle.episodes
                    )
                    : null;


            const threshold =
                Number(
                    measurement.threshold
                );


            html += `

                <tr>

                    <td>
                        ${escapeHtml(
                            measurement.label ||
                            measurement.name ||
                            "-"
                        )}
                    </td>

                    <td>

                        ${
                            Number.isFinite(
                                threshold
                            )
                                ? threshold.toFixed(2)
                                : "-"
                        }

                        °

                    </td>

                    <td>

                        ${
                            Number.isFinite(
                                videoTime
                            )
                                ? videoTime.toFixed(3)
                                : "0.000"
                        }

                        s

                    </td>

                    <td>

                        ${
                            Number.isFinite(
                                videoPercentage
                            )
                                ? videoPercentage.toFixed(2)
                                : "0.00"
                        }

                        %

                    </td>

                    <td>

                        ${
                            Number.isFinite(
                                videoEpisodes
                            )
                                ? videoEpisodes
                                : 0
                        }

                    </td>

                    <td>

                        ${
                            cycleTime !== null
                                ? cycleTime.toFixed(3)
                                    + " s"
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            cyclePercentage !== null
                                ? cyclePercentage.toFixed(2)
                                    + " %"
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            cycleEpisodes !== null
                                ? cycleEpisodes
                                : "-"
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


    return html;

}


/*
=========================================================
RESULTADOS GLOBALES
=========================================================
*/

function showGlobalResults(
    results
) {

    const container =
        document.getElementById(
            "globalResults"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(
            results
        )
        ||
        results.length === 0
    ) {

        container.innerHTML =
            "<p>Sin resultados globales.</p>";

        return;

    }


    const groups =
        {};


    /*
    -----------------------------------------------------
    AGRUPAR MEDICIONES
    -----------------------------------------------------
    */

    results.forEach(
        result => {

            if (
                !result
                ||
                !result.postureResults
                ||
                !Array.isArray(
                    result.postureResults.measurements
                )
            ) {

                return;

            }


            result.postureResults.measurements
                .forEach(
                    measurement => {

                        const name =
                            measurement.name;


                        if (!name) {

                            return;

                        }


                        if (!groups[name]) {

                            groups[name] = {

                                name:
                                    name,

                                label:
                                    measurement.label ||
                                    name,

                                threshold:
                                    Number(
                                        measurement.threshold
                                    ),

                                videoTimes:
                                    [],

                                videoPercentages:
                                    [],

                                videoEpisodes:
                                    [],

                                cycleTimes:
                                    [],

                                cyclePercentages:
                                    [],

                                cycleEpisodes:
                                    []

                            };

                        }


                        const group =
                            groups[name];


                        const videoTime =
                            Number(
                                measurement.videoExposureTime
                            );


                        const videoPercentage =
                            Number(
                                measurement.videoExposurePercentage
                            );


                        const videoEpisodes =
                            Number(
                                measurement.videoEpisodes
                            );


                        if (
                            Number.isFinite(
                                videoTime
                            )
                        ) {

                            group.videoTimes.push(
                                videoTime
                            );

                        }


                        if (
                            Number.isFinite(
                                videoPercentage
                            )
                        ) {

                            group.videoPercentages.push(
                                videoPercentage
                            );

                        }


                        if (
                            Number.isFinite(
                                videoEpisodes
                            )
                        ) {

                            group.videoEpisodes.push(
                                videoEpisodes
                            );

                        }


                        const cycle =
                            measurement.cycle ||
                            {};


                        if (
                            cycle.enabled ===
                            true
                        ) {

                            const cycleTime =
                                Number(
                                    cycle.exposureTime
                                );


                            const cyclePercentage =
                                Number(
                                    cycle.exposurePercentage
                                );


                            const cycleEpisodes =
                                Number(
                                    cycle.episodes
                                );


                            if (
                                Number.isFinite(
                                    cycleTime
                                )
                            ) {

                                group.cycleTimes.push(
                                    cycleTime
                                );

                            }


                            if (
                                Number.isFinite(
                                    cyclePercentage
                                )
                            ) {

                                group.cyclePercentages.push(
                                    cyclePercentage
                                );

                            }


                            if (
                                Number.isFinite(
                                    cycleEpisodes
                                )
                            ) {

                                group.cycleEpisodes.push(
                                    cycleEpisodes
                                );

                            }

                        }

                    }
                );

        }
    );


    /*
    -----------------------------------------------------
    CABECERA
    -----------------------------------------------------
    */

    let html = `

        <h3>
            Resultados globales
        </h3>

        <p>

            Comparación de ${results.length}
            vídeo(s).

            La media y el máximo se calculan
            exclusivamente a partir de los
            resultados individuales.

        </p>


        <table class="biomechanics-table">

            <thead>

                <tr>

                    <th rowspan="2">
                        Medición
                    </th>

                    <th rowspan="2">
                        Umbral
                    </th>

                    <th colspan="4">
                        RESULTADOS SOBRE EL VÍDEO
                    </th>

                    <th colspan="4">
                        RESULTADOS SOBRE CICLO
                    </th>

                </tr>

                <tr>

                    <th>
                        Media tiempo
                    </th>

                    <th>
                        Máximo tiempo
                    </th>

                    <th>
                        Media %
                    </th>

                    <th>
                        Máximo %
                    </th>

                    <th>
                        Media tiempo
                    </th>

                    <th>
                        Máximo tiempo
                    </th>

                    <th>
                        Media %
                    </th>

                    <th>
                        Máximo %
                    </th>

                </tr>

            </thead>

            <tbody>

    `;


    const groupNames =
        Object.keys(
            groups
        );


    if (
        groupNames.length ===
        0
    ) {

        html += `

            <tr>

                <td colspan="10">
                    No hay mediciones disponibles.
                </td>

            </tr>

        `;

    }


    groupNames.forEach(
        name => {

            const group =
                groups[name];


            const meanVideoTime =
                calculateMean(
                    group.videoTimes
                );


            const maxVideoTime =
                calculateMax(
                    group.videoTimes
                );


            const meanVideoPercentage =
                calculateMean(
                    group.videoPercentages
                );


            const maxVideoPercentage =
                calculateMax(
                    group.videoPercentages
                );


            const meanCycleTime =
                calculateMean(
                    group.cycleTimes
                );


            const maxCycleTime =
                calculateMax(
                    group.cycleTimes
                );


            const meanCyclePercentage =
                calculateMean(
                    group.cyclePercentages
                );


            const maxCyclePercentage =
                calculateMax(
                    group.cyclePercentages
                );


            html += `

                <tr>

                    <td>
                        ${escapeHtml(
                            group.label
                        )}
                    </td>

                    <td>

                        ${
                            Number.isFinite(
                                group.threshold
                            )
                                ? group.threshold.toFixed(2)
                                : "-"
                        }

                        °

                    </td>

                    <td>

                        ${
                            meanVideoTime !== null
                                ? meanVideoTime.toFixed(3)
                                    + " s"
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            maxVideoTime !== null
                                ? maxVideoTime.toFixed(3)
                                    + " s"
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            meanVideoPercentage !== null
                                ? meanVideoPercentage.toFixed(2)
                                    + " %"
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            maxVideoPercentage !== null
                                ? maxVideoPercentage.toFixed(2)
                                    + " %"
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            meanCycleTime !== null
                                ? meanCycleTime.toFixed(3)
                                    + " s"
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            maxCycleTime !== null
                                ? maxCycleTime.toFixed(3)
                                    + " s"
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            meanCyclePercentage !== null
                                ? meanCyclePercentage.toFixed(2)
                                    + " %"
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            maxCyclePercentage !== null
                                ? maxCyclePercentage.toFixed(2)
                                    + " %"
                                : "-"
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
MEDIA
=========================================================
*/

function calculateMean(
    values
) {

    if (
        !Array.isArray(
            values
        )
        ||
        values.length === 0
    ) {

        return null;

    }


    const valid =
        values
            .filter(
                value =>
                    Number.isFinite(
                        Number(value)
                    )
            )
            .map(
                Number
            );


    if (
        valid.length ===
        0
    ) {

        return null;

    }


    const total =
        valid.reduce(
            (
                sum,
                value
            ) =>
                sum + value,
            0
        );


    return (
        total /
        valid.length
    );

}


/*
=========================================================
MÁXIMO
=========================================================
*/

function calculateMax(
    values
) {

    if (
        !Array.isArray(
            values
        )
        ||
        values.length === 0
    ) {

        return null;

    }


    const valid =
        values
            .filter(
                value =>
                    Number.isFinite(
                        Number(value)
                    )
            )
            .map(
                Number
            );


    if (
        valid.length ===
        0
    ) {

        return null;

    }


    return Math.max(
        ...valid
    );

}


/*
=========================================================
RESULTADOS TEMPORALES
=========================================================
*/

function showCombinedPostureResults(
    results
) {

    const container =
        document.getElementById(
            "postureResults"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(
            results
        )
        ||
        results.length === 0
    ) {

        container.innerHTML =
            "<p>Sin resultados temporales.</p>";

        return;

    }


    let html = `

        <h3>
            Resumen de análisis temporal
        </h3>

    `;


    results.forEach(
        result => {

            const posture =
                result.postureResults;


            if (!posture) {

                return;

            }


            const duration =
                Number(
                    posture.videoDuration
                );


            const cycle =
                result.cycleConfig ||
                {};


            let cycleText =
                "Análisis de todo el vídeo";


            if (
                cycle.enabled ===
                true
            ) {

                if (
                    cycle.mode ===
                    "manual"
                ) {

                    cycleText =
                        `Ciclo manual: ${Number(cycle.startTime).toFixed(3)} - ${Number(cycle.endTime).toFixed(3)} s`;

                }
                else if (
                    cycle.mode ===
                    "fixed"
                ) {

                    cycleText =
                        `Ciclo fijo: ${Number(cycle.cycleTime).toFixed(3)} s`;

                }

            }


            html += `

                <div>

                    <h4>
                        Vídeo ${result.videoNumber}
                    </h4>

                    <p>

                        Duración:

                        <strong>

                            ${
                                Number.isFinite(
                                    duration
                                )
                                    ? duration.toFixed(3)
                                    : "0.000"
                            }

                            s

                        </strong>

                    </p>

                    <p>
                        ${escapeHtml(
                            cycleText
                        )}
                    </p>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


/*
=========================================================
ESCAPAR HTML
=========================================================
*/

function escapeHtml(
    value
) {

    return String(
        value
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/*
=========================================================
INFORMACIÓN DEL ARCHIVO
=========================================================
*/

function updateFileInfo(
    file,
    videoIndex = 0
) {

    const fileName =
        document.getElementById(
            `fileName_${videoIndex}`
        );


    const fileSize =
        document.getElementById(
            `fileSize_${videoIndex}`
        );


    if (fileName) {

        fileName.textContent =
            file.name;

    }


    if (fileSize) {

        fileSize.textContent =
            (
                file.size /
                1024
            )
            .toFixed(2)
            +
            " KB";

    }

}


/*
=========================================================
FIN
=========================================================
*/

console.log(
    "OCRA Video Analyzer: app.js cargado correctamente"
);
/*
=========================================================
RESULTADOS TEMPORALES
=========================================================
*/

function showCombinedPostureResults(
    results
) {

    const container =
        document.getElementById(
            "postureResults"
        );


    if (!container) {

        return;

    }


    if (
        !Array.isArray(
            results
        )
        ||
        results.length === 0
    ) {

        container.innerHTML =
            "<p>Sin resultados temporales.</p>";

        return;

    }


    let html = `

        <h3>
            Resumen de análisis temporal
        </h3>

    `;


    results.forEach(
        result => {

            const posture =
                result.postureResults;


            if (!posture) {

                return;

            }


            const duration =
                Number(
                    posture.videoDuration
                );


            const cycle =
                result.cycleConfig ||
                {};


            let cycleText =
                "Análisis de todo el vídeo";


            if (
                cycle.enabled ===
                true
            ) {

                if (
                    cycle.mode ===
                    "manual"
                ) {

                    cycleText =
                        `Ciclo manual: ${Number(
                            cycle.startTime
                        ).toFixed(3)} - ${Number(
                            cycle.endTime
                        ).toFixed(3)} s`;

                }
                else if (
                    cycle.mode ===
                    "fixed"
                ) {

                    cycleText =
                        `Ciclo fijo: ${Number(
                            cycle.cycleTime
                        ).toFixed(3)} s`;

                }

            }


            html += `

                <div
                    class="combined-posture-video"
                >

                    <h4>
                        Vídeo ${result.videoNumber}
                    </h4>

                    <p>

                        <strong>
                            Archivo:
                        </strong>

                        ${escapeHtml(
                            result.fileName ||
                            "-"
                        )}

                    </p>

                    <p>

                        <strong>
                            Duración:
                        </strong>

                        ${
                            Number.isFinite(
                                duration
                            )
                                ? duration.toFixed(3)
                                : "0.000"
                        }

                        s

                    </p>

                    <p>

                        ${escapeHtml(
                            cycleText
                        )}

                    </p>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

}


/*
=========================================================
EXPORTAR RESULTADOS
=========================================================
*/

function exportAnalysisResults() {

    if (
        !Array.isArray(
            analysisResults
        )
        ||
        analysisResults.length === 0
    ) {

        alert(
            "No existen resultados para exportar."
        );

        return;

    }


    const exportData =
        analysisResults.map(
            result => ({

                videoNumber:
                    result.videoNumber,

                fileName:
                    result.fileName,

                videoIndex:
                    result.videoIndex,

                markerMapping:
                    result.markerMapping,

                cycleConfig:
                    result.cycleConfig,

                metadata:
                    result.metadata,

                postureResults:
                    result.postureResults

            })
        );


    const json =
        JSON.stringify(
            exportData,
            null,
            4
        );


    const blob =
        new Blob(
            [
                json
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "OCRA_Video_Analyzer_Resultados.json";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/*
=========================================================
LIMPIEZA COMPLETA
=========================================================
*/

function resetAnalysis() {

    analysisResults =
        [];


    clearResults();


    const status =
        document.getElementById(
            "status"
        );


    if (status) {

        status.textContent =
            "Seleccione los vídeos.";

    }


    const analyzeButton =
        document.getElementById(
            "analyzeButton"
        );


    if (analyzeButton) {

        analyzeButton.disabled =
            !allVideoFilesSelected();

    }

}


/*
=========================================================
FUNCIONES GLOBALES
=========================================================
*/

window.analysisResults =
    analysisResults;


window.analyzeAllVideos =
    analyzeAllVideos;


window.showIndividualResults =
    showIndividualResults;


window.showGlobalResults =
    showGlobalResults;


window.showCombinedPostureResults =
    showCombinedPostureResults;


window.exportAnalysisResults =
    exportAnalysisResults;


window.resetAnalysis =
    resetAnalysis;


/*
=========================================================
COMPATIBILIDAD
=========================================================
*/

if (
    typeof window.OCRAVideoAnalyzer ===
    "undefined"
) {

    window.OCRAVideoAnalyzer =
        {};

}


window.OCRAVideoAnalyzer.analysisResults =
    analysisResults;


window.OCRAVideoAnalyzer.analyzeAllVideos =
    analyzeAllVideos;


window.OCRAVideoAnalyzer.exportResults =
    exportAnalysisResults;


window.OCRAVideoAnalyzer.reset =
    resetAnalysis;


/*
=========================================================
CONFIRMACIÓN FINAL
=========================================================
*/

console.log(
    "================================================="
);

console.log(
    "OCRA VIDEO ANALYZER"
);

console.log(
    "app.js cargado correctamente"
);

console.log(
    "Soporte configurado para hasta 12 vídeos"
);

console.log(
    "================================================="
);
