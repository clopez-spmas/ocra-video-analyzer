"use strict";

/* Configuración temporal independiente para cada vídeo. */

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
    const count = Number.isInteger(videoCount) && videoCount > 0 ? videoCount : 1;
    const previous = Array.isArray(cycleConfigurations) ? cycleConfigurations : [];

    cycleConfigurations = new Array(count).fill(null).map((_, index) => {
        const existing = previous[index];
        if (!existing) return createDefaultCycleConfiguration(index);

        return {
            videoIndex: index,
            mode: ["video", "manual", "fixed"].includes(existing.mode) ? existing.mode : "video",
            startTime: Number.isFinite(Number(existing.startTime)) ? Number(existing.startTime) : 0,
            endTime: existing.endTime == null || existing.endTime === "" ? null : Number(existing.endTime),
            cycleTime: existing.cycleTime == null || existing.cycleTime === "" ? null : Number(existing.cycleTime)
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
    const cycleStartInput = document.getElementById(`cycleCycleStart_${videoIndex}`);
    const durationInput = document.getElementById(`cycleDuration_${videoIndex}`);

    configuration.mode = modeInput?.value || "video";

    const start = Number(startInput?.value);
    configuration.startTime = Number.isFinite(start) && start >= 0 ? start : 0;

    const end = Number(endInput?.value);
    configuration.endTime = Number.isFinite(end) && end >= 0 ? end : null;

    const cycleStart = Number(cycleStartInput?.value);
    configuration.startTime = Number.isFinite(cycleStart) && cycleStart >= 0
        ? cycleStart
        : (configuration.mode === "fixed" ? 0 : configuration.startTime);

    const duration = Number(durationInput?.value);
    configuration.cycleTime = Number.isFinite(duration) && duration > 0 ? duration : null;
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
            message: `El inicio del Vídeo ${videoIndex + 1} debe ser >= 0 segundos.`
        };
    }

    if (configuration.mode === "manual") {
        const end = Number(configuration.endTime);

        if (!Number.isFinite(end) || end <= start) {
            return {
                valid: false,
                message: `El Vídeo ${videoIndex + 1} necesita un momento final mayor que el inicial.`
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
                    <option value="video" ${configuration.mode === "video" ? "selected" : ""}>Todo el vídeo</option>
                    <option value="manual" ${configuration.mode === "manual" ? "selected" : ""}>Desde un momento inicial hasta un momento final</option>
                    <option value="fixed" ${configuration.mode === "fixed" ? "selected" : ""}>Ciclo de x segundos desde el momento</option>
                </select>
            </div>

            <div id="manualCycleFields_${index}">
                <div class="cycle-time-row">
                    <label for="cycleStart_${index}">Momento inicial (s)</label>
                    <input type="number" id="cycleStart_${index}" min="0" step="0.001" value="${formatCycleTime(configuration.startTime)}">
                </div>

                <div class="cycle-time-row">
                    <label for="cycleEnd_${index}">Momento final (s)</label>
                    <input type="number" id="cycleEnd_${index}" min="0" step="0.001" value="${configuration.endTime === null ? "" : formatCycleTime(configuration.endTime)}" placeholder="Fin del intervalo">
                </div>
            </div>

            <div id="fixedCycleFields_${index}">
                <div class="cycle-time-row">
                    <label for="cycleCycleStart_${index}">Momento en que inicia el ciclo (s)</label>
                    <input type="number" id="cycleCycleStart_${index}" min="0" step="0.001" value="${formatCycleTime(configuration.startTime)}" placeholder="Ej.: 37">
                </div>

                <div class="cycle-time-row">
                    <label for="cycleDuration_${index}">Duración del ciclo (s)</label>
                    <input type="number" id="cycleDuration_${index}" min="0.001" step="0.001" value="${configuration.cycleTime === null ? "" : formatCycleTime(configuration.cycleTime)}" placeholder="Ej.: 12">
                </div>
            </div>

            <p id="cycleVideoHelp_${index}">Se analizará desde el primer frame hasta el último del vídeo.</p>
            <p id="cycleManualHelp_${index}">Se analizará únicamente entre el momento inicial y el momento final.</p>
            <p id="cycleFixedHelp_${index}">El ciclo comenzará en el momento indicado y tendrá exactamente la duración indicada.</p>
        `;

        container.appendChild(block);

        const modeInput = document.getElementById(`cycleMode_${index}`);
        const startInput = document.getElementById(`cycleStart_${index}`);
        const endInput = document.getElementById(`cycleEnd_${index}`);
        const cycleStartInput = document.getElementById(`cycleCycleStart_${index}`);
        const durationInput = document.getElementById(`cycleDuration_${index}`);

        const manualFields = document.getElementById(`manualCycleFields_${index}`);
        const fixedFields = document.getElementById(`fixedCycleFields_${index}`);
        const videoHelp = document.getElementById(`cycleVideoHelp_${index}`);
        const manualHelp = document.getElementById(`cycleManualHelp_${index}`);
        const fixedHelp = document.getElementById(`cycleFixedHelp_${index}`);

        const update = () => {
            const mode = modeInput?.value || "video";

            manualFields.style.display = mode === "manual" ? "block" : "none";
            fixedFields.style.display = mode === "fixed" ? "block" : "none";

            videoHelp.style.display = mode === "video" ? "block" : "none";
            manualHelp.style.display = mode === "manual" ? "block" : "none";
            fixedHelp.style.display = mode === "fixed" ? "block" : "none";

            updateCycleConfigurationFromUI(index);
        };

        modeInput?.addEventListener("change", update);
        startInput?.addEventListener("input", update);
        endInput?.addEventListener("input", update);
        cycleStartInput?.addEventListener("input", update);
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
    return configuration ? { ...configuration } : createDefaultCycleConfiguration(videoIndex);
}

function getAllCycleConfigurations() {
    return cycleConfigurations.map(configuration => ({ ...configuration }));
}

function getEffectiveCycleConfiguration(videoIndex) {
    return validateCycleConfiguration(videoIndex);
}

/*
Compatibilidad con app.js:
app.js utiliza getCycleConfig()/getSelectedCycleConfig().
La configuración efectiva es la que debe llegar al analizador.
*/
function getCycleConfig(videoIndex) {
    const effective = getEffectiveCycleConfiguration(videoIndex);

    if (!effective || effective.valid !== true) {
        throw new Error(
            effective?.message ||
            `Configuración temporal inválida para el Vídeo ${videoIndex + 1}.`
        );
    }

    return {
        enabled: effective.usesFullVideo !== true,
        mode: effective.mode,
        cycleTime: effective.cycleTime,
        startTime: effective.startTime,
        endTime: effective.endTime
    };
}

function getSelectedCycleConfig(videoIndex) {
    return getCycleConfig(videoIndex);
}

window.initializeCycleUI = initializeCycleUI;
window.getCycleConfiguration = getCycleConfiguration;
window.getAllCycleConfigurations = getAllCycleConfigurations;
window.getEffectiveCycleConfiguration = getEffectiveCycleConfiguration;
window.getCycleConfig = getCycleConfig;
window.getSelectedCycleConfig = getSelectedCycleConfig;

console.log("OCRA Video Analyzer: cycle_configuration.js cargado correctamente");