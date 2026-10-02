"use strict";

let pmfProject = null;

document.addEventListener("DOMContentLoaded", () => {
    pmfProject = PMFStorage.createEmptyProject();
    buildVideoCountSelector();
    bindIdentification();
    bindProjectActions();
    renderProject();
});

function buildVideoCountSelector() {
    const container = document.getElementById("videoCountConfiguration");
    if (!container) return;

    container.innerHTML = "";
    for (let i = 1; i <= 12; i++) {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="pmfVideoCount" value="${i}" ${i === 1 ? "checked" : ""}> ${i} vídeo${i === 1 ? "" : "s"}`;
        container.appendChild(label);
    }

    container.querySelectorAll('input[name="pmfVideoCount"]').forEach(input => {
        input.addEventListener("change", () => {
            const count = Number(document.querySelector('input[name="pmfVideoCount"]:checked')?.value || 1);
            pmfProject.configuration.videoCount = count;
            resizeKinoveaRecords(count);
            renderVideoInputs();
            touchProject();
        });
    });
}

function bindIdentification() {
    const fields = {
        projectCompany: "company",
        projectWorkstation: "workstation",
        projectTask: "task",
        projectAnalyst: "analyst",
        projectNotes: "notes"
    };

    Object.entries(fields).forEach(([id, key]) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.addEventListener("input", () => {
            pmfProject.identification[key] = element.value;
            touchProject(false);
        });
    });
}

function bindProjectActions() {
    document.getElementById("saveProjectButton")?.addEventListener("click", saveProject);

    document.getElementById("loadProjectInput")?.addEventListener("change", async event => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const json = await PMFStorage.readJsonFile(file);
            pmfProject = PMFStorage.normalizeProject(json);
            renderProject();
            setStatus(`Proyecto abierto: ${file.name}. Los datos Kinovea guardados están disponibles sin volver a cargarlos.`, "ok");
        } catch (error) {
            setStatus(error.message, "error");
        } finally {
            event.target.value = "";
        }
    });
}

function resizeKinoveaRecords(count) {
    const existing = Array.isArray(pmfProject.kinoveaFiles) ? pmfProject.kinoveaFiles : [];
    pmfProject.kinoveaFiles = existing.filter(record => Number(record.videoIndex) < count);
}

function renderProject() {
    renderIdentification();
    renderVideoCount();
    renderVideoInputs();
    renderAnalysisSummary();
}

function renderIdentification() {
    const mapping = {
        projectCompany: pmfProject.identification.company,
        projectWorkstation: pmfProject.identification.workstation,
        projectTask: pmfProject.identification.task,
        projectAnalyst: pmfProject.identification.analyst,
        projectNotes: pmfProject.identification.notes
    };
    Object.entries(mapping).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value || "";
    });
}

function renderVideoCount() {
    const count = Math.max(1, Math.min(12, Number(pmfProject.configuration.videoCount) || 1));
    const radio = document.querySelector(`input[name="pmfVideoCount"][value="${count}"]`);
    if (radio) radio.checked = true;
}

function renderVideoInputs() {
    const container = document.getElementById("videoInputsContainer");
    if (!container) return;
    container.innerHTML = "";

    const count = Math.max(1, Math.min(12, Number(pmfProject.configuration.videoCount) || 1));

    for (let i = 0; i < count; i++) {
        const record = pmfProject.kinoveaFiles.find(item => Number(item.videoIndex) === i);
        const block = document.createElement("div");
        block.className = "video-input-block pmf-video-card";

        const persistedText = record
            ? `<div class="pmf-persisted"><strong>Guardado en el proyecto:</strong> ${escapeHtml(record.source?.fileName || "Kinovea sin nombre")} · ${formatFrames(record)} · SHA-256: ${escapeHtml(shortHash(record.source?.sha256))}</div>`
            : `<div class="pmf-empty">Todavía no hay datos Kinovea guardados para este vídeo.</div>`;

        block.innerHTML = `
            <h3>Vídeo ${i + 1}</h3>
            ${persistedText}
            <input type="file" id="pmfKinovea_${i}" accept=".json,application/json">
            <div class="pmf-inline-actions">
                ${record ? `<button type="button" data-remove-video="${i}">Eliminar datos guardados</button>` : ""}
            </div>
        `;
        container.appendChild(block);

        block.querySelector(`#pmfKinovea_${i}`)?.addEventListener("change", event => importKinovea(event, i));
        block.querySelector(`[data-remove-video="${i}"]`)?.addEventListener("click", () => removeKinovea(i));
    }
}

async function importKinovea(event, videoIndex) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        setStatus(`Leyendo Kinovea del vídeo ${videoIndex + 1}...`);
        const rawJson = await PMFStorage.readJsonFile(file);

        if (typeof parseKinoveaJSON !== "function") {
            throw new Error("No está disponible el conversor Kinovea.");
        }

        const parsedData = parseKinoveaJSON(rawJson);
        if (!parsedData || !Array.isArray(parsedData.frames) || parsedData.frames.length === 0) {
            throw new Error("El archivo no contiene frames Kinovea válidos.");
        }

        const record = await PMFStorage.buildKinoveaRecord(file, rawJson, parsedData, videoIndex);
        const pos = pmfProject.kinoveaFiles.findIndex(item => Number(item.videoIndex) === videoIndex);
        if (pos >= 0) pmfProject.kinoveaFiles[pos] = record;
        else pmfProject.kinoveaFiles.push(record);

        pmfProject.kinoveaFiles.sort((a, b) => Number(a.videoIndex) - Number(b.videoIndex));
        touchProject();
        renderVideoInputs();
        renderAnalysisSummary();
        setStatus(`Vídeo ${videoIndex + 1}: Kinovea incorporado al proyecto. No será necesario volver a cargarlo al reabrir este JSON.`, "ok");
    } catch (error) {
        setStatus(error.message, "error");
    } finally {
        event.target.value = "";
    }
}

function removeKinovea(videoIndex) {
    pmfProject.kinoveaFiles = pmfProject.kinoveaFiles.filter(item => Number(item.videoIndex) !== videoIndex);
    touchProject();
    renderVideoInputs();
    renderAnalysisSummary();
    setStatus(`Se han eliminado del proyecto los datos Kinovea del vídeo ${videoIndex + 1}.`);
}

function renderAnalysisSummary() {
    const container = document.getElementById("bodySectionResults");
    if (!container) return;

    const count = Number(pmfProject.configuration.videoCount) || 1;
    const loaded = pmfProject.kinoveaFiles.length;

    container.innerHTML = `
        <div class="pmf-summary">
            <p><strong>Vídeos configurados:</strong> ${count}</p>
            <p><strong>Kinovea persistidos:</strong> ${loaded} de ${count}</p>
            <p><strong>Resultado global:</strong> desactivado por diseño.</p>
            <p><strong>Salida prevista:</strong> Aceptable / No aceptable por sección corporal, con trazabilidad y confirmación manual cuando proceda.</p>
        </div>
    `;
}

function saveProject() {
    syncIdentificationFromUI();
    touchProject(false);

    const task = (pmfProject.identification.task || "Tarea")
        .trim()
        .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, "_")
        .replace(/^_+|_+$/g, "");

    PMFStorage.downloadProject(pmfProject, `PMF_${task || "Proyecto"}.json`);
    setStatus("Proyecto guardado con los Kinovea y los datos procesados disponibles hasta este punto.", "ok");
}

function syncIdentificationFromUI() {
    const get = id => document.getElementById(id)?.value || "";
    pmfProject.identification.company = get("projectCompany");
    pmfProject.identification.workstation = get("projectWorkstation");
    pmfProject.identification.task = get("projectTask");
    pmfProject.identification.analyst = get("projectAnalyst");
    pmfProject.identification.notes = get("projectNotes");
}

function touchProject(updateStatus = true) {
    pmfProject.updatedAt = new Date().toISOString();
    if (updateStatus) setStatus("Proyecto modificado. Guarda el JSON para conservar los cambios.");
}

function setStatus(message, type = "") {
    const element = document.getElementById("projectStatus");
    if (!element) return;
    element.textContent = message;
    element.className = `pmf-status ${type ? "pmf-status-" + type : ""}`;
}

function formatFrames(record) {
    const count = Array.isArray(record?.extracted?.frames) ? record.extracted.frames.length : 0;
    return `${count} frames`;
}

function shortHash(hash) {
    return hash ? `${hash.slice(0, 10)}…` : "no disponible";
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.getPMFProject = () => PMFStorage.deepClone(pmfProject);
