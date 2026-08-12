"use strict";

/*
=========================================================
OCRA VIDEO ANALYZER
SUSTAINED POSTURE UI
=========================================================

Presenta:
1. Episodios >4 s por vídeo.
2. Resumen global por franja angular.

El detalle de cada episodio incluye:
- postura/franja;
- ángulo inicial, medio y final;
- inicio en el vídeo;
- final en el vídeo;
- duración.
=========================================================
*/

(function () {

    function formatSeconds(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return "-";
        return number.toFixed(2) + " s";
    }

    function formatAngle(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return "-";
        return number.toFixed(1) + "°";
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderSustainedPostures() {

        const container = document.getElementById("postureResults");
        if (!container) return;

        const run = Array.isArray(window.__sustainedPostureRun)
            ? window.__sustainedPostureRun
            : [];

        let panel = document.getElementById("sustainedPosturePanel");

        if (!panel) {
            panel = document.createElement("div");
            panel.id = "sustainedPosturePanel";
            panel.className = "sustained-posture-panel";
            container.appendChild(panel);
        }

        const episodesByVideo = [];

        run.forEach((videoResult, index) => {
            const episodes = Array.isArray(videoResult.sustainedPostures)
                ? videoResult.sustainedPostures
                : [];

            episodesByVideo.push({
                videoNumber: index + 1,
                episodes
            });
        });

        const allEpisodes = episodesByVideo.flatMap(video =>
            video.episodes.map(episode => ({
                ...episode,
                videoNumber: video.videoNumber
            }))
        );

        let html = `
            <div class="sustained-posture-header">
                <h3>Posturas mantenidas durante más de 4 segundos continuados</h3>
                <p>
                    Se analizan episodios en los que una postura permanece más de 4 segundos dentro de la misma franja angular.
                    <br>
                    <strong>Tronco:</strong> flexión/extensión en franjas de 10°, inclinación lateral y rotación axial en franjas de 2°.
                    <br>
                    <strong>Cabeza:</strong> flexión/extensión en franjas de 5°, lateralización y rotación axial en franjas de 2°.
                    <br>
                    <strong>Rodillas:</strong> flexión en franjas de 10°. <strong>Tobillos:</strong> en franjas de 2°.
                    <br>
                    Se muestran únicamente episodios estrictamente superiores a 4 segundos continuados.
                </p>
            </div>
        `;

        if (allEpisodes.length === 0) {
            html += `
                <div class="sustained-posture-empty">
                    No se han detectado episodios de posturas mantenidas durante más de 4 segundos continuados
                    en ninguna de las posturas analizadas: tronco, cabeza, rodillas o tobillos.
                </div>
            `;
            panel.innerHTML = html;
            return;
        }

        html += `
            <h4>Detalle por vídeo</h4>
            <div class="table-wrapper">
                <table class="sustained-posture-table">
                    <thead>
                        <tr>
                            <th>Vídeo</th>
                            <th>Postura</th>
                            <th>Franja angular</th>
                            <th>Ángulo</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Tiempo mantenido</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        allEpisodes.forEach(episode => {
            html += `
                <tr>
                    <td>${episode.videoNumber}</td>
                    <td>${escapeHtml(SustainedPostures.getLabel(episode.measurement))}</td>
                    <td>${escapeHtml(episode.bandLabel)}</td>
                    <td>
                        inicio ${formatAngle(episode.startAngle)}<br>
                        medio ${formatAngle(episode.averageAngle)}<br>
                        final ${formatAngle(episode.endAngle)}
                    </td>
                    <td>${formatSeconds(episode.startTime)}</td>
                    <td>${formatSeconds(episode.endTime)}</td>
                    <td><strong>${formatSeconds(episode.duration)}</strong></td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>

            <h4>Resumen global</h4>
            <div class="table-wrapper">
                <table class="sustained-posture-global-table">
                    <thead>
                        <tr>
                            <th>Postura</th>
                            <th>Franja angular</th>
                            <th>Vídeos</th>
                            <th>Veces</th>
                            <th>Tiempo total</th>
                            <th>Detalle de episodios</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        const globalGroups = {};

        allEpisodes.forEach(episode => {
            const key = `${episode.measurement}|${episode.bandLower}|${episode.bandUpper}`;

            if (!globalGroups[key]) {
                globalGroups[key] = {
                    measurement: episode.measurement,
                    bandLabel: episode.bandLabel,
                    totalTime: 0,
                    occurrences: 0,
                    videos: new Set(),
                    episodes: []
                };
            }

            const group = globalGroups[key];
            group.totalTime += episode.duration;
            group.occurrences++;
            group.videos.add(episode.videoNumber);
            group.episodes.push(episode);
        });

        Object.values(globalGroups)
            .sort((a, b) => b.totalTime - a.totalTime)
            .forEach(group => {

                const details = group.episodes.map(episode =>
                    `V${episode.videoNumber}: ${formatSeconds(episode.startTime)}–${formatSeconds(episode.endTime)} ` +
                    `(${formatAngle(episode.averageAngle)}, ${formatSeconds(episode.duration)})`
                ).join("<br>");

                html += `
                    <tr>
                        <td>${escapeHtml(SustainedPostures.getLabel(group.measurement))}</td>
                        <td>${escapeHtml(group.bandLabel)}</td>
                        <td>${Array.from(group.videos).sort((a, b) => a - b).join(", ")}</td>
                        <td>${group.occurrences}</td>
                        <td><strong>${formatSeconds(group.totalTime)}</strong></td>
                        <td>${details}</td>
                    </tr>
                `;
            });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        panel.innerHTML = html;
    }

    function resetSustainedRun() {
        window.__sustainedPostureRun = [];
        const panel = document.getElementById("sustainedPosturePanel");
        if (panel) panel.remove();
    }

    function init() {

        window.__sustainedPostureRun = [];

        const status = document.getElementById("status");
        const results = document.getElementById("postureResults");

        if (!status || !results) return;

        const observer = new MutationObserver(() => {
            const text = status.textContent || "";

            if (/Analizando Vídeo 1 de/i.test(text)) {
                if (!window.__sustainedRunStarted) {
                    window.__sustainedRunStarted = true;
                    resetSustainedRun();
                }
            }

            if (/Análisis completado/i.test(text)) {
                window.__sustainedRunStarted = false;
            }

            renderSustainedPostures();
        });

        observer.observe(status, {
            childList: true,
            subtree: true,
            characterData: true
        });

        /*
        El PostureAnalyzer termina cada vídeo antes de que el texto
        de estado cambie. Este pequeño ciclo solo actualiza la tabla
        cuando ya existen resultados y no modifica ningún cálculo.
        */
        window.setInterval(() => {
            if (Array.isArray(window.__sustainedPostureRun) &&
                window.__sustainedPostureRun.length > 0) {
                renderSustainedPostures();
            }
        }, 250);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    }
    else {
        init();
    }

})();
