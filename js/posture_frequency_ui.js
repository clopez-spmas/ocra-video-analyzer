"use strict";

/* =========================================================
OCRA VIDEO ANALYZER
POSTURE FREQUENCY UI
========================================================= */

(function () {

    const STUDY = [
        ["Tronco - flexión / extensión", "0° a 90°", "10°"],
        ["Tronco - inclinación lateral", "-25° a +25°", "2°"],
        ["Tronco - rotación axial", "-30° a +30°", "2°"],
        ["Cabeza - flexión / extensión", "-70° a +80°", "5°"],
        ["Cabeza - lateralización", "-45° a +45°", "2°"],
        ["Cabeza - rotación axial", "-90° a +90°", "2°"],
        ["Rodilla izquierda - flexión", "0° a 150°", "10°"],
        ["Rodilla derecha - flexión", "0° a 150°", "10°"],
        ["Tobillo izquierdo - flexión dorsal / plantar", "-30° a +50°", "2°"],
        ["Tobillo derecho - flexión dorsal / plantar", "-30° a +50°", "2°"]
    ];

    function esc(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function frequencyStudyTable(status) {
        const rows = STUDY.map(item => `
            <tr>
                <td>${esc(item[0])}</td>
                <td>${item[1]}</td>
                <td>${item[2]}</td>
                <td>${esc(status)}</td>
            </tr>
        `).join("");

        return `
            <h3>Frecuencia de adopción de posturas por minuto</h3>
            <p>Se estudia cuántas veces se adopta cada postura dentro de las franjas angulares indicadas. La frecuencia se expresa en número de adopciones por minuto y se calcula utilizando los tiempos del JSON de Kinovea.</p>
            <div class="table-wrapper">
                <table class="sustained-posture-table">
                    <thead>
                        <tr>
                            <th>Zona / movimiento</th>
                            <th>Rango anatómico estudiado</th>
                            <th>Tamaño de franja</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    function appendPending() {
        const container = document.getElementById("postureResults");
        if (!container || container.querySelector(".posture-frequency-section")) return;
        const section = document.createElement("div");
        section.className = "posture-frequency-section";
        section.innerHTML = frequencyStudyTable("Pendiente de análisis");
        container.appendChild(section);
    }

    function renderFrequency(results) {
        const container = document.getElementById("postureResults");
        if (!container) return;

        const frequencyRows = [];
        const globalGroups = {};
        const measurementVideoDurations = {};

        (Array.isArray(results) ? results : []).forEach(result => {
            const posture = result.postureResults || {};
            const duration = Number(posture.analysisDuration) || 0;
            const rows = Array.isArray(posture.postureFrequency) ? posture.postureFrequency : [];
            const measurementsInVideo = new Set();

            rows.forEach(row => {
                frequencyRows.push({
                    ...row,
                    videoNumber: result.videoNumber,
                    fileName: result.fileName
                });

                measurementsInVideo.add(row.measurement);

                const key = `${row.measurement}|${row.bandLower}|${row.bandUpper}`;
                if (!globalGroups[key]) {
                    globalGroups[key] = {
                        measurement: row.measurement,
                        label: row.label,
                        bandLabel: row.bandLabel,
                        occurrences: 0,
                        analysisDuration: 0,
                        videos: new Set()
                    };
                }
                globalGroups[key].occurrences += Number(row.occurrences) || 0;
                globalGroups[key].videos.add(String(result.videoNumber));
            });

            measurementsInVideo.forEach(measurement => {
                if (!measurementVideoDurations[measurement]) measurementVideoDurations[measurement] = 0;
                measurementVideoDurations[measurement] += duration;
            });
        });

        Object.values(globalGroups).forEach(group => {
            group.analysisDuration = measurementVideoDurations[group.measurement] || 0;
        });

        const frequencySection = document.createElement("div");
        frequencySection.className = "posture-frequency-section";

        if (!frequencyRows.length) {
            frequencySection.innerHTML = `
                ${frequencyStudyTable("Analizado")}
                <p><strong>No se han detectado adopciones de posturas en las franjas estudiadas durante el período analizado.</strong></p>
            `;
            container.appendChild(frequencySection);
            return;
        }

        frequencyRows.sort((a, b) =>
            (Number(a.videoNumber) || 0) - (Number(b.videoNumber) || 0) ||
            (Number(b.occurrencesPerMinute) || 0) - (Number(a.occurrencesPerMinute) || 0)
        );

        const detailRows = frequencyRows.map(row => `
            <tr>
                <td>${esc(row.videoNumber)}</td>
                <td>${esc(row.label)}</td>
                <td>${esc(row.bandLabel)}</td>
                <td>${Number(row.occurrences || 0)}</td>
                <td>${(Number(row.occurrencesPerMinute) || 0).toFixed(2)}</td>
            </tr>
        `).join("");

        const globalRows = Object.values(globalGroups)
            .map(group => ({
                ...group,
                frequency: group.analysisDuration > 0
                    ? group.occurrences / group.analysisDuration * 60
                    : 0
            }))
            .sort((a, b) => b.frequency - a.frequency)
            .map(group => `
                <tr>
                    <td>${esc(group.label)}</td>
                    <td>${esc(group.bandLabel)}</td>
                    <td>${group.occurrences}</td>
                    <td>${group.frequency.toFixed(2)}</td>
                    <td>${esc(Array.from(group.videos).sort((a, b) => Number(a) - Number(b)).join(", "))}</td>
                </tr>
            `).join("");

        frequencySection.innerHTML = `
            <h3>Frecuencia de adopción de posturas por minuto</h3>
            <p>Se calcula cuántas veces se adopta cada postura dentro de las franjas angulares estudiadas. Cada entrada en una franja cuenta como una adopción; si se mantiene en la misma franja, no se vuelve a contar hasta que se abandona y se vuelve a adoptar.</p>
            <h4>Detalle por vídeo</h4>
            <div class="table-wrapper"><table>
                <thead><tr><th>Vídeo</th><th>Postura</th><th>Franja</th><th>N.º adopciones</th><th>Adopciones por minuto</th></tr></thead>
                <tbody>${detailRows}</tbody>
            </table></div>
            <h4>Resumen global</h4>
            <div class="table-wrapper"><table>
                <thead><tr><th>Postura</th><th>Franja</th><th>N.º adopciones</th><th>Adopciones por minuto</th><th>Vídeos</th></tr></thead>
                <tbody>${globalRows}</tbody>
            </table></div>
            <h4>Rangos y franjas estudiados</h4>
            ${frequencyStudyTable("Analizado")}
        `;

        container.appendChild(frequencySection);
    }

    const originalShowCombined = window.showCombinedPostureResults;

    window.showCombinedPostureResults = function (results) {
        const container = document.getElementById("postureResults");
        if (container) {
            container.querySelectorAll(".posture-frequency-section").forEach(element => element.remove());
        }

        if (typeof originalShowCombined === "function") {
            originalShowCombined(results);
        }

        renderFrequency(results);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", appendPending);
    } else {
        appendPending();
    }

})();
