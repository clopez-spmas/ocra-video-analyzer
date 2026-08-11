"use strict";

/*
=========================================================
OCRA VIDEO ANALYZER
CYCLE_CONFIGURATION.JS

Configuración independiente del intervalo de análisis
para cada vídeo.

Reglas:
- Cada vídeo tiene su propia configuración.
- Por defecto se utiliza el vídeo completo.
- El usuario puede activar un ciclo e indicar inicio y fin.
- Los tiempos se expresan en segundos.
- No se guarda ninguna configuración entre sesiones.
=========================================================
*/

let cycleConfigurations = [];

function createDefaultCycleConfiguration(videoIndex) {
    return {
        videoIndex: videoIndex,
        enabled: false,
        startTime: 0,
        endTime: null
    };
}

function ensureCycleConfigurations(videoCount) {
    const count = Number.isInteger(videoCount) && videoCount > 0 ? videoCount : 1;
    const previous = Array.isArray(cycleConfigurations) ? cycleConfigurations : [];

    cycleConfigurations = new Array(count).fill(null).map((_, index) => {
        const existing = previous[index];

        if (existing) {
            return {
                videoIndex: index,
                enabled: !!existing.enabled,
                startTime: Number(existing.startTime) || 0,
                endTime:
                    existing.endTime === null ||
                    existing.endTime === "" ||
                    existing.endTime === undefined
                        ? null
                        : Number(existing.endTime)
            };
        }

        return createDefaultCycleConfiguration(index);
    });
}

function formatCycleTime(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(3) : "";
}

function updateCycleConfigurationFromUI(videoIndex) {
    const configuration = cycleConfigurations[videoIndex];
    if (!configuration) return;

    const enabledInput = document.getElementById(`cycleEnabled_${videoIndex}`);
    const startInput = document.getElementById(`cycleStart_${videoIndex}`);
    const endInput = document.getElementById(`cycleEnd_${videoIndex}`);

    configuration.enabled = !!enabledInput?.checked;

    const start = Number(startInput?.value);
    configuration.startTime = Number.isFinite(start) && start >= 0 ? start : 0;

    if (endInput && endInput.value !== "") {
        const end = Number(endInput.value);
        configuration.endTime = Number.isFinite(end) && end >= 0 ? end : null;
    } else {
        configuration.endTime = null;
    }
}

function validateCycleConfiguration(videoIndex) {
    const configuration = cycleConfigurations[videoIndex];

    if (!configuration || !configuration.enabled) {
        return {
            valid: true,
            usesFullVideo: true,
            startTime: 0,
            endTime: null
        };
    }

    const start = Number(configuration.startTime);
    const end = Number(configuration.endTime);

    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) {
        return {
            valid: false,
            usesFullVideo: false,
            message: `El ciclo del Vídeo ${videoIndex + 1} debe tener un inicio >= 0 y un fin mayor que el inicio.`
        };
    }

    return {
        valid: true,
        usesFullVideo: false,
        startTime: start,
        endTime: end
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

            <label class="cycle-mode-label">
                <input
                    type="checkbox"
                    id="cycleEnabled_${index}"
                    ${configuration.enabled ? "checked" : ""}
                >
                Utilizar un ciclo específico para este vídeo
            </label>

            <div class="cycle-time-row">
                <label for="cycleStart_${index}">Inicio (s)</label>
                <input
                    type="number"
                    id="cycleStart_${index}"
                    min="0"
                    step="0.001"
                    value="${formatCycleTime(configuration.startTime)}"
                    ${configuration.enabled ? "" : "disabled"}
                >
            </div>

            <div class="cycle-time-row">
                <label for="cycleEnd_${index}">Fin (s)</label>
                <input
                    type="number"
                    id="cycleEnd_${index}"
                    min="0"
                    step="0.001"
                    value="${configuration.endTime === null ? "" : formatCycleTime(configuration.endTime)}"
                    placeholder="Fin del vídeo"
                    ${configuration.enabled ? "" : "disabled"}
                >
            </div>

            <p class="cycle-help">
                Sin ciclo específico, se analiza el vídeo completo. Si se activa,
                indique el inicio y el fin del intervalo en segundos.
            </p>
        `;

        container.appendChild(block);

        const enabledInput = document.getElementById(`cycleEnabled_${index}`);
        const startInput = document.getElementById(`cycleStart_${index}`);
        const endInput = document.getElementById(`cycleEnd_${index}`);

        const update = () => {
            const enabled = !!enabledInput?.checked;
            if (startInput) startInput.disabled = !enabled;
            if (endInput) endInput.disabled = !enabled;
            updateCycleConfigurationFromUI(index);
        };

        enabledInput?.addEventListener("change", update);
        startInput?.addEventListener("input", update);
        endInput?.addEventListener("input", update);
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
    const validation = validateCycleConfiguration(videoIndex);
    if (!validation.valid) throw new Error(validation.message);
    return validation;
}

window.initializeCycleUI = initializeCycleUI;
window.getCycleConfiguration = getCycleConfiguration;
window.getAllCycleConfigurations = getAllCycleConfigurations;
window.getEffectiveCycleConfiguration = getEffectiveCycleConfiguration;

console.log("OCRA Video Analyzer: cycle_configuration.js cargado correctamente");
