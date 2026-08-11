"use strict";

/*
=========================================================
OCRA VIDEO ANALYZER
CYCLE_CONFIGURATION.JS

Cada vídeo puede utilizar UNO de estos tres modos:

1. video  -> analizar todo el vídeo.
2. manual -> analizar desde un instante inicial hasta
             un instante final indicados por el usuario.
3. fixed  -> analizar un ciclo de duración X segundos
             comenzando en un instante indicado por el usuario.

La configuración es independiente para cada vídeo.
=========================================================
*/

let cycleConfigurations = [];

function createDefaultCycleConfiguration(videoIndex) {
    return {
        videoIndex,
        mode: "video",
        startTime: 0,
        endTime: null,
        cycleTime: null
    };
}

function ensureCycleConfigurations(videoCount) {
    const count = Number.isInteger(videoCount) && videoCount > 0
        ? videoCount
        : 1;

    const previous = Array.isArray(cycleConfigurations)
        ? cycleConfigurations
        : [];

    cycleConfigurations = new Array(count).fill(null).map((_, index) => {
        const existing = previous[index];

        if (!existing) {
            return createDefaultCycleConfiguration(index);
        }

        return {
            videoIndex: index,
            mode: ["video", "manual", "fixed"].includes(existing.mode)
                ? existing.mode
                : "video",
            startTime: Number.isFinite(Number(existing.startTime))
                ? Number(existing.startTime)
                : 0,
            endTime: existing.endTime === null || existing.endTime === "" || existing.endTime === undefined
                ? null
                : Number(existing.endTime),
            cycleTime: existing.cycleTime === null || existing.cycleTime === "" || existing.cycleTime === undefined
                ? null
                : Number(existing.cycleTime)
        };
    });
}

function formatCycleTime(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(3) : "";
}

function updateCycleConfigurationFromUI(videoIndex) {
    const configuration = cycleConfigurations[videoIndex];
    if (!configuration) return;

    const modeInput = document.getElementById(`cycleMode_${videoIndex}`);
    const startInput = document.getElementById(`cycleStart_${videoIndex}`);
    const endInput = document.getElementById(`cycleEnd_${videoIndex}`);
    const durationInput = document.getElementById(`cycleDuration_${videoIndex}`);

    configuration.mode = modeInput?.value || "video";

    const start = Number(startInput?.value);
    configuration.startTime = Number.isFinite(start) && start >= 0 ? start : 0;

    if (endInput && endInput.value !== "") {
        const end = Number(endInput.value);
        configuration.endTime = Number.isFinite(end) && end >= 0 ? end : null;
    } else {
        configuration.endTime = null;
    }

    if (durationInput && durationInput.value !== "") {
        const duration = Number(durationInput.value);
        configuration.cycleTime = Number.isFinite(duration) && duration > 0 ? duration : null;
    } else {
        configuration.cycleTime = null;
    }
}

function validateCycleConfiguration(videoIndex) {
    const configuration = cycleConfigurations[videoIndex];

    if (!configuration || configuration.mode === "video") {
        return {
            valid: true,
            mode: "video",
            usesFullVideo: true,
            startTime: 0,
            endTime: null,
            cycleTime: null
        };
    }

    const start = Number(configuration.startTime);

    if (!Number.isFinite(start) || start < 0) {
        return {
            valid: false,
            message: `El inicio del Vídeo ${videoIndex + 1} debe ser un tiempo >= 0 segundos.`
        };
    }

    if (configuration.mode === "manual") {
        const end = Number(configuration.endTime);

        if (!Number.isFinite(end) || end <= start) {
            return {
                valid: false,
                message: `El Vídeo ${videoIndex + 1} necesita un fin mayor que el inicio.`
            };
        }

        return {
            valid: true,
            mode: "manual",
            usesFullVideo: false,
            startTime: start,
            endTime: end,
            cycleTime: null
        };
    }

    const duration = Number(configuration.cycleTime);

    if (!Number.isFinite(duration) || duration <= 0) {
        return {
            valid: false,
            message: `El Vídeo ${videoIndex + 1} necesita una duración de ciclo mayor que 0 segundos.`
        };
    }

    return {
        valid: true,
        mode: "fixed",
        usesFullVideo: false,
        startTime: start,
        endTime: start + duration,
        cycleTime: duration
    };
}

function renderCycleConfigurationUI(videoCount) {
    const container = document.getElementById("cycleConfiguration");
    if (!container) return;

    ensureCycleConfigurations(videoCount);
    container.innerHTML = "";

    for (let index = 0; index < videoCount; index++) {
        const configuration = cycleConfigurations[index];
        const block = document.createElement("div");
        block.className = "cycle-video-block";

        block.innerHTML = `
            <h3>Vídeo ${index + 1}</h3>

            <div class="cycle-mode-row">
                <label for="cycleMode_${index}">Modo de análisis temporal</label>
                <select id="cycleMode_${index}">
                    <option value="video" ${configuration.mode === "video" ? "selected" : ""}>
                        Todo el vídeo
                    </option>
                    <option value="manual" ${configuration.mode === "manual" ? "selected" : ""}>
                        Desde un momento inicial hasta un momento final
                    </option>
                    <option value="fixed" ${configuration.mode === "fixed" ? "selected" : ""}>
                        Ciclo de X segundos desde un punto temporal
                    </option>
                </select>
            </div>

            <div class="cycle-time-row cycle-manual-fields">
                <label for="cycleStart_${index}">Momento inicial (s)</label>
                <input
                    type="number"
                    id="cycleStart_${index}"
                    min="0"
                    step="0.001"
                    value="${formatCycleTime(configuration.startTime)}"
                >
            </div>

            <div class="cycle-time-row cycle-manual-fields">
                <label for="cycleEnd_${index}">Momento final (s)</label>
                <input
                    type="number"
                    id="cycleEnd_${index}"
                    min="0"
                    step="0.001"
                    value="${configuration.endTime === null ? "" : formatCycleTime(configuration.endTime)}"
                    placeholder="Fin del intervalo"
                >
            </div>

            <div class="cycle-time-row cycle-fixed-fields">
                <label for="cycleDuration_${index}">Duración del ciclo (s)</label>
                <input
                    type="number"
                    id="cycleDuration_${index}"
                    min="0.001"
                    step="0.001"
                    value="${configuration.cycleTime === null ? "" : formatCycleTime(configuration.cycleTime)}"
                    placeholder="Ej.: 12"
                >
            </div>

            <p class="cycle-help cycle-video-help">
                Se analizará desde el primer frame hasta el último del vídeo.
            </p>

            <p class="cycle-help cycle-manual-help">
                Se analizará únicamente el intervalo comprendido entre el momento inicial y el momento final.
            </p>

            <p class="cycle-help cycle-fixed-help">
                Se analizará un único ciclo cuya duración comienza exactamente en el momento inicial indicado.
            </p>
        `;

        container.appendChild(block);

        const modeInput = document.getElementById(`cycleMode_${index}`);
        const startInput = document.getElementById(`cycleStart_${index}`);
        const endInput = document.getElementById(`cycleEnd_${index}`);
        const durationInput = document.getElementById(`cycleDuration_${index}`);

        const videoHelp = block.querySelector(".cycle-video-help");
        const manualHelp = block.querySelector(".cycle-manual-help");
        const fixedHelp = block.querySelector(".cycle-fixed-help");
        const manualFields = block.querySelectorAll(".cycle-manual-fields");
        const fixedFields = block.querySelectorAll(".cycle-fixed-fields");

        const update = () => {
            const mode = modeInput?.value || "video";

            manualFields.forEach(element => {
                element.style.display = mode === "manual" ? "flex" : "none";
            });

            fixedFields.forEach(element => {
                element.style.display = mode === "fixed" ? "flex" : "none";
            });

            if (videoHelp) videoHelp.style.display = mode === "video" ? "block" : "none";
            if (manualHelp) manualHelp.style.display = mode === "manual" ? "block" : "none";
            if (fixedHelp) fixedHelp.style.display = mode === "fixed" ? "block" : "none";

            updateCycleConfigurationFromUI(index);
        };

        modeInput?.addEventListener("change", update);
        startInput?.addEventListener("input", update);
        endInput?.addEventListener("input", update);
        durationInput?.addEventListener("input", update);

        update();
    }
}

function initializeCycleUI(videoCount) {
    const count = Number.isInteger(videoCount) && videoCount > 0 ? videoCount : 1;
    renderCycleConfigurationUI(count);
}

function getCycleConfiguration(videoIndex) {
    if (!Number.isInteger(videoIndex)) return null;
    const configuration = cycleConfigurations[videoIndex];
    return configuration
        ? { ...configuration }
        : createDefaultCycleConfiguration(videoIndex);
}

function getAllCycleConfigurations() {
    return cycleConfigurations.map(configuration => ({ ...configuration }));
}

function getEffectiveCycleConfiguration(videoIndex) {
    return validateCycleConfiguration(videoIndex);
}

window.initializeCycleUI = initializeCycleUI;
window.getCycleConfiguration = getCycleConfiguration;
window.getAllCycleConfigurations = getAllCycleConfigurations;
window.getEffectiveCycleConfiguration = getEffectiveCycleConfiguration;

console.log("OCRA Video Analyzer: cycle_configuration.js cargado correctamente");