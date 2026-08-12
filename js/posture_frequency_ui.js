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

    function frequencyStudyTable(statusOrFrequency, analyzed = false) {
        const rows = STUDY.map(item => `
            <tr>
                <td>${esc(item[0])}</td>
                <td>${item[1]}</td>
                <td>${item[2]}</td>
                <td>${esc(typeof statusOrFrequency === "function" ? statusOrFrequency(item) : statusOrFrequency)}</td>
            </tr>
        `).join("");

        return `
            <div class="table-wrapper">
                <table class="sustained-posture-table">
                    <thead>
                        <tr>
                            <th>Zona / movimiento</th>
                            <th>Rango anatómico estudiado</th>
                            <th>Tamaño de franja</th>
                            <th>Frecuencia</th>
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
        section.innerHTML = `
            <h3>Frecuencia de adopción de posturas</h3>
            <p>Se estudia cuántas veces se adopta cada postura dentro de las franjas angulares indicadas. La frecuencia se expresa en número de adopciones por minuto y se calcula utilizando los tiempos del JSON de Kinovea.</p>
            ${frequencyStudyTable("Pendiente de análisis")}
        `;
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
                frequencyRows.push({ ...row, videoNumber: result.videoNumber, fileName: result.fileName });
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
                measurementVideoDurations[measurement] = (measurementVideoDurations[measurement] || 0) + duration;
            });
        });

        Object.values(globalGroups).forEach(group => {
            group.analysisDuration = measurementVideoDurations[group.measurement] || 0;
        });

        const section = document.createElement("div");
        section.className = "posture-frequency-section";

        if (!frequencyRows.length) {
            section.innerHTML = `
                <h3>Frecuencia de adopción de posturas</h3>
                <p>Se estudia cuántas veces se adopta cada postura dentro de las franjas angulares indicadas. La frecuencia se expresa en número de adopciones por minuto.</p>
                ${frequencyStudyTable("No se ha detectado")}
            `;
            container.appendChild(section);
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
                <td><strong>${(Number(row.occurrencesPerMinute) || 0).toFixed(2)} / min</strong></td>
            </tr>
        `).join("");

        const globalRows = Object.values(globalGroups)
            .map(group => ({
                ...group,
                frequency: group.analysisDuration > 0 ? group.occurrences / group.analysisDuration * 60 : 0
            }))
            .sort((a, b) => b.frequency - a.frequency)
            .map(group => `
                <tr>
                    <td>${esc(group.label)}</td>
                    <td>${esc(group.bandLabel)}</td>
                    <td>${group.occurrences}</td>
                    <td><strong>${group.frequency.toFixed(2)} / min</strong></td>
                    <td>${esc(Array.from(group.videos).sort((a, b) => Number(a) - Number(b)).join(", "))}</td>
                </tr>
            `).join("");

        const frequencyByStudy = item => {
            const matching = frequencyRows.filter(row => row.label === item[0]);
            if (!matching.length) return "No se ha detectado";
            const max = Math.max(...matching.map(row => Number(row.occurrencesPerMinute) || 0));
            return `${max.toFixed(2)} / min`;
        };

        section.innerHTML = `
            <h3>Frecuencia de adopción de posturas</h3>
            <p>Se calcula cuántas veces se adopta cada postura dentro de las franjas angulares estudiadas. Cada adopción se contabiliza cuando se entra en una franja; mientras se permanece en la misma franja no se vuelve a contar.</p>
            <h4>Detalle por vídeo</h4>
            <div class="table-wrapper"><table>
                <thead><tr><th>Vídeo</th><th>Postura</th><th>Franja</th><th>N.º adopciones</th><th>Frecuencia</th></tr></thead>
                <tbody>${detailRows}</tbody>
            </table></div>
            <h4>Resumen global</h4>
            <div class="table-wrapper"><table>
                <thead><tr><th>Postura</th><th>Franja</th><th>N.º adopciones</th><th>Frecuencia</th><th>Vídeos</th></tr></thead>
                <tbody>${globalRows}</tbody>
            </table></div>
            <h4>Rangos y franjas estudiados</h4>
            ${frequencyStudyTable(frequencyByStudy)}
        `;

        container.appendChild(section);
    }

    const originalShowCombined = window.showCombinedPostureResults;

    window.showCombinedPostureResults = function (results) {
        const container = document.getElementById("postureResults");
        if (container) {
            container.querySelectorAll(".posture-frequency-section").forEach(element => element.remove());
        }
        if (typeof originalShowCombined === "function") originalShowCombined(results);
        renderFrequency(results);
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", appendPending);
    } else {
        appendPending();
    }

})();
