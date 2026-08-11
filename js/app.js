"use strict";

/*
=========================================================
OCRA VIDEO ANALYZER
APP.JS

ANÁLISIS DE 1 A 12 VÍDEOS
=========================================================
*/

let analysisResults = [];


document.addEventListener("DOMContentLoaded", () => {

    const videoCountRadios = document.querySelectorAll('input[name="videoCount"]');
    const videoInputsContainer = document.getElementById("videoInputsContainer");
    const analyzeButton = document.getElementById("analyzeButton");
    const status = document.getElementById("status");

    if (!videoInputsContainer || !analyzeButton) {
        console.error("No existe la interfaz principal de análisis.");
        return;
    }

    updateVideoInputs();

    videoCountRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            updateVideoInputs();
            if (status) status.textContent = "Seleccione los vídeos.";
        });
    });

    analyzeButton.addEventListener("click", async () => {
        await analyzeAllVideos();
    });

    window.updateVideoInputs = updateVideoInputs;
    window.analyzeAllVideos = analyzeAllVideos;
});


function getSelectedVideoCount() {
    const selected = document.querySelector('input[name="videoCount"]:checked');
    if (!selected) return 1;

    const count = Number(selected.value);
    return Number.isInteger(count) && count >= 1 && count <= 12
        ? count
        : 1;
}


function updateVideoInputs() {
    const container = document.getElementById("videoInputsContainer");
    const analyzeButton = document.getElementById("analyzeButton");

    if (!container) return;

    const videoCount = getSelectedVideoCount();
    container.innerHTML = "";

    for (let i = 0; i < videoCount; i++) {
        const block = document.createElement("div");
        block.className = "video-input-block";

        block.innerHTML = `
            <h3>Vídeo ${i + 1}</h3>
            <input type="file" id="jsonFile_${i}" data-video-index="${i}" accept=".json,application/json">
            <div class="file-info">
                <p><strong>Archivo:</strong> <span id="fileName_${i}">Ningún archivo seleccionado.</span></p>
                <p><strong>Tamaño:</strong> <span id="fileSize_${i}">-</span></p>
            </div>
        `;

        container.appendChild(block);

        const input = document.getElementById(`jsonFile_${i}`);
        if (input) {
            input.addEventListener("change", event => {
                handleVideoFileSelection(event, i);
            });
        }
    }

    if (analyzeButton) {
        analyzeButton.disabled = !allVideoFilesSelected();
    }

    if (typeof initializeCycleUI === "function") {
        initializeCycleUI(videoCount);
    }
}


function handleVideoFileSelection(event, videoIndex) {
    const input = event.target;
    if (!input || !input.files || !input.files[0]) return;

    updateFileInfo(input.files[0], videoIndex);

    const analyzeButton = document.getElementById("analyzeButton");
    const status = document.getElementById("status");

    if (analyzeButton) {
        analyzeButton.disabled = !allVideoFilesSelected();
    }

    if (status) {
        status.textContent = allVideoFilesSelected()
            ? "Todos los vídeos seleccionados. Puede analizarlos."
            : "Seleccione todos los vídeos configurados.";
    }
}


function allVideoFilesSelected() {
    const videoCount = getSelectedVideoCount();

    for (let i = 0; i < videoCount; i++) {
        const input = document.getElementById(`jsonFile_${i}`);
        if (!input || !input.files || input.files.length === 0) return false;
    }

    return true;
}


async function analyzeAllVideos() {

    const videoCount = getSelectedVideoCount();
    const analyzeButton = document.getElementById("analyzeButton");
    const status = document.getElementById("status");

    if (!allVideoFilesSelected()) {
        alert("Debe seleccionar todos los vídeos configurados.");
        return;
    }

    /*
    =====================================================
    RESTABLECER UMBRALES ANTES DE CADA NUEVO ANÁLISIS
    =====================================================

    Primero se restauran los valores originales en memoria.
    Después se leen las casillas actuales de la interfaz.

    De esta forma un cambio realizado en un análisis anterior
    nunca se arrastra al siguiente análisis.
    */
    try {
        if (typeof resetThresholds === "function") {
            resetThresholds();
        }

        resetThresholdInputsToDefaults();
        applyUserThresholds();
    }
    catch (error) {
        console.error(error);
        if (status) {
            status.textContent = "❌ Error en los umbrales: " + error.message;
        }
        return;
    }

    if (analyzeButton) analyzeButton.disabled = true;
    analysisResults = [];
    clearResults();

    if (status) status.textContent = "Leyendo archivos Kinovea...";

    const videoData = [];

    try {
        for (let videoIndex = 0; videoIndex < videoCount; videoIndex++) {

            const input = document.getElementById(`jsonFile_${videoIndex}`);
            if (!input || !input.files || !input.files[0]) {
                throw new Error(`Falta el archivo del Vídeo ${videoIndex + 1}.`);
            }

            const file = input.files[0];
            const json = await readJsonFile(file);
            const kinoveaData = parseKinoveaJSON(json);

            if (!kinoveaData || !Array.isArray(kinoveaData.frames) || kinoveaData.frames.length === 0) {
                throw new Error(`El Vídeo ${videoIndex + 1} no contiene frames Kinovea válidos.`);
            }

            videoData.push({
                videoIndex,
                videoNumber: videoIndex + 1,
                file,
                json,
                kinoveaData,
                markers: Array.isArray(kinoveaData.markers) ? kinoveaData.markers : []
            });
        }
    }
    catch (error) {
        console.error("Error leyendo vídeos:", error);
        if (status) status.textContent = "❌ Error leyendo vídeos: " + error.message;
        if (analyzeButton) analyzeButton.disabled = false;
        return;
    }

    let mappings;

    try {
        if (typeof createAllMarkerMappingUI !== "function") {
            throw new Error("markerMapping.js no contiene createAllMarkerMappingUI().");
        }

        if (status) status.textContent = "Asigne los marcadores de todos los vídeos.";

        mappings = await createAllMarkerMappingUI(videoData.map(video => video.markers));

        if (!Array.isArray(mappings) || mappings.length !== videoCount) {
            throw new Error("Los mappings recibidos no corresponden con todos los vídeos.");
        }
    }
    catch (error) {
        console.error("Error en asignación de marcadores:", error);
        if (status) status.textContent = "❌ " + error.message;
        if (analyzeButton) analyzeButton.disabled = false;
        return;
    }

    videoData.forEach((video, index) => {
        video.mapping = mappings[index];
    });

    for (const video of videoData) {
        try {
            if (status) status.textContent = `Analizando Vídeo ${video.videoNumber} de ${videoCount}...`;

            const result = await analyzeSingleVideo(
                video.file,
                video.videoIndex,
                video.kinoveaData,
                video.mapping
            );

            if (!result) {
                throw new Error(`No se obtuvo resultado del Vídeo ${video.videoNumber}.`);
            }

            analysisResults.push(result);
        }
        catch (error) {
            console.error(`Error en Vídeo ${video.videoNumber}:`, error);
            if (status) status.textContent = `❌ Error en Vídeo ${video.videoNumber}: ${error.message}`;
            if (analyzeButton) analyzeButton.disabled = false;
            return;
        }
    }

    showAnalysisInformation(analysisResults);
    showIndividualResults(analysisResults);
    showGlobalResults(analysisResults);
    showCombinedPostureResults(analysisResults);

    if (status) status.textContent = `✔ Análisis completado: ${videoCount} vídeo(s).`;
    if (analyzeButton) analyzeButton.disabled = false;
}


function resetThresholdInputsToDefaults() {

    if (typeof DEFAULT_THRESHOLDS === "undefined") {
        return;
    }

    const thresholdFields = {
        trunk_flexion: "threshold_trunk_flexion",
        trunk_lateral: "threshold_trunk_lateral",
        neck_flexion: "threshold_neck_flexion",
        shoulder_flexion_left: "threshold_shoulder_flexion_left",
        shoulder_flexion_right: "threshold_shoulder_flexion_right",
        elbow_flexion_left: "threshold_elbow_flexion_left",
        elbow_flexion_right: "threshold_elbow_flexion_right"
    };

    Object.entries(thresholdFields).forEach(([thresholdId, elementId]) => {
        const input = document.getElementById(elementId);
        if (input && Object.prototype.hasOwnProperty.call(DEFAULT_THRESHOLDS, thresholdId)) {
            input.value = DEFAULT_THRESHOLDS[thresholdId];
        }
    });
}


function readJsonFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = event => {
            try {
                resolve(JSON.parse(event.target.result));
            }
            catch (error) {
                reject(new Error(`El archivo "${file.name}" no contiene un JSON válido.`));
            }
        };

        reader.onerror = () => {
            reject(new Error(`No se pudo leer el archivo "${file.name}".`));
        };

        reader.readAsText(file);
    });
}


async function analyzeSingleVideo(file, videoIndex, kinoveaData = null, mapping = null) {

    if (!kinoveaData) {
        throw new Error(`No existen datos Kinovea para el Vídeo ${videoIndex + 1}.`);
    }

    if (!mapping) {
        throw new Error(`No existe mapping para el Vídeo ${videoIndex + 1}.`);
    }

    if (!Array.isArray(kinoveaData.frames) || kinoveaData.frames.length === 0) {
        throw new Error(`No hay frames Kinovea en el Vídeo ${videoIndex + 1}.`);
    }

    if (typeof adaptKinoveaFrames !== "function") {
        throw new Error("biomechanical_adapter.js no cargado.");
    }

    const anatomicalFrames = adaptKinoveaFrames(kinoveaData.frames, mapping);

    if (!anatomicalFrames || anatomicalFrames.length === 0) {
        throw new Error(`No se pudieron generar frames anatómicos en el Vídeo ${videoIndex + 1}.`);
    }

    if (typeof AnalysisResult !== "function") {
        throw new Error("AnalysisResult no está disponible.");
    }

    const result = new AnalysisResult();
    result.videoIndex = videoIndex;
    result.videoNumber = videoIndex + 1;
    result.fileName = file.name;

    const metadata = {
        fileName: file.name,
        videoIndex,
        videoNumber: videoIndex + 1,
        created: new Date().toISOString(),
        landmarkCount: countMappedLandmarks(mapping)
    };

    if (typeof result.setMetadata === "function") result.setMetadata(metadata);
    else result.metadata = metadata;

    if (typeof result.setPoseFrames === "function") result.setPoseFrames(kinoveaData.frames);
    else result.poseFrames = kinoveaData.frames;

    if (typeof result.setAnatomicalFrames === "function") result.setAnatomicalFrames(anatomicalFrames);
    else result.anatomicalFrames = anatomicalFrames;

    let biomechanicalResults = [];

    if (
        typeof Biomechanics !== "undefined" &&
        Biomechanics &&
        typeof Biomechanics.analyzeBiomechanics === "function" &&
        anatomicalFrames.length > 0
    ) {
        biomechanicalResults = Biomechanics.analyzeBiomechanics(anatomicalFrames);
    }

    if (typeof result.setBiomechanicalFrames === "function") {
        result.setBiomechanicalFrames(biomechanicalResults);
    }
    else {
        result.biomechanicalFrames = biomechanicalResults;
    }

    let cycleConfig = {
        enabled: false,
        mode: "video",
        cycleTime: null,
        startTime: null,
        endTime: null
    };

    if (typeof getCycleConfig === "function") {
        cycleConfig = getCycleConfig(videoIndex);
    }
    else if (typeof getSelectedCycleConfig === "function") {
        cycleConfig = getSelectedCycleConfig(videoIndex);
    }

    if (
        typeof PostureAnalyzer === "undefined" ||
        typeof PostureAnalyzer.analyze !== "function"
    ) {
        throw new Error("PostureAnalyzer no está cargado.");
    }

    result.postureResults = PostureAnalyzer.analyze(
        result.biomechanicalFrames || [],
        cycleConfig
    );

    result.cycleConfig = {
        enabled: cycleConfig.enabled === true,
        mode: cycleConfig.mode || "video",
        cycleTime: cycleConfig.cycleTime,
        startTime: cycleConfig.startTime,
        endTime: cycleConfig.endTime
    };

    result.metadata = {
        ...(result.metadata || {}),
        landmarkCount: countMappedLandmarks(mapping),
        biomechanicalFrameCount: biomechanicalResults.length
    };

    result.markerMapping = { ...mapping };

    return result;
}


function countMappedLandmarks(mapping) {
    if (!mapping || typeof mapping !== "object") return 0;

    return Object.values(mapping).filter(value =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    ).length;
}


function applyUserThresholds() {

    if (typeof setThreshold !== "function") {
        throw new Error("thresholds.js no cargado correctamente.");
    }

    const thresholdFields = {
        trunk_flexion: "threshold_trunk_flexion",
        trunk_lateral: "threshold_trunk_lateral",
        neck_flexion: "threshold_neck_flexion",
        shoulder_flexion_left: "threshold_shoulder_flexion_left",
        shoulder_flexion_right: "threshold_shoulder_flexion_right",
        elbow_flexion_left: "threshold_elbow_flexion_left",
        elbow_flexion_right: "threshold_elbow_flexion_right"
    };

    Object.entries(thresholdFields).forEach(([thresholdId, elementId]) => {
        const input = document.getElementById(elementId);

        if (!input) {
            console.warn("No existe campo de umbral:", elementId);
            return;
        }

        let rawValue = input.value;
        if (typeof rawValue === "string") {
            rawValue = rawValue.trim().replace(",", ".");
        }

        const value = Number(rawValue);

        if (!Number.isFinite(value) || value < 0) {
            throw new Error("Umbral inválido para: " + thresholdId);
        }

        if (!setThreshold(thresholdId, value)) {
            throw new Error("No se pudo guardar el umbral: " + thresholdId);
        }
    });
}


function clearResults() {
    const ids = [
        "analysisInformation",
        "individualResults",
        "globalResults",
        "postureResults"
    ];

    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = "";
    });
}
