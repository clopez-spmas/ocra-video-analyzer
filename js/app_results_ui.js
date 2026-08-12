"use strict";

(function () {

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function number(value, decimals = 2) {
        const n = Number(value);
        return Number.isFinite(n) ? n.toFixed(decimals) : "-";
    }

    function seconds(value) {
        const n = Number(value);
        return Number.isFinite(n) ? `${n.toFixed(2)} s` : "-";
    }

    window.updateFileInfo = function (file, videoIndex) {
        if (!file) return;
        const nameElement = document.getElementById(`fileName_${videoIndex}`);
        const sizeElement = document.getElementById(`fileSize_${videoIndex}`);
        if (nameElement) nameElement.textContent = file.name;
        if (sizeElement) {
            const size = Number(file.size);
            if (!Number.isFinite(size)) sizeElement.textContent = "-";
            else if (size < 1024) sizeElement.textContent = `${size} bytes`;
            else if (size < 1024 * 1024) sizeElement.textContent = `${(size / 1024).toFixed(1)} KB`;
            else sizeElement.textContent = `${(size / (1024 * 1024)).toFixed(2)} MB`;
        }
    };

    function getPostureResults(result) {
        return result && result.postureResults && Array.isArray(result.postureResults.measurements)
            ? result.postureResults.measurements : [];
    }

    function getSustainedResults(result) {
        return result && result.postureResults && Array.isArray(result.postureResults.sustainedPostures)
            ? result.postureResults.sustainedPostures : [];
    }

    window.showAnalysisInformation = function (results) {
        const container = document.getElementById("analysisInformation");
        if (!container) return;
        const rows = (Array.isArray(results) ? results : []).map(result => {
            const posture = result.postureResults || {};
            return `<tr><td>${escapeHtml(result.videoNumber)}</td><td>${escapeHtml(result.fileName)}</td><td>${seconds(posture.analysisStartTime ?? 0)}</td><td>${seconds(posture.analysisEndTime ?? posture.videoDuration)}</td><td>${seconds(posture.analysisDuration ?? posture.videoDuration)}</td></tr>`;
        }).join("");
        container.innerHTML = `<div class="table-wrapper"><table><thead><tr><th>Vídeo</th><th>Archivo</th><th>Inicio análisis</th><th>Fin análisis</th><th>Duración analizada</th></tr></thead><tbody>${rows || `<tr><td colspan="5">Sin resultados.</td></tr>`}</tbody></table></div>`;
    };

    window.showIndividualResults = function (results) {
        const container = document.getElementById("individualResults");
        if (!container) return;
        let html = "";
        (Array.isArray(results) ? results : []).forEach(result => {
            const measurements = getPostureResults(result);
            html += `<h3>Vídeo ${escapeHtml(result.videoNumber)} — ${escapeHtml(result.fileName)}</h3>`;
            html += `<div class="table-wrapper"><table><thead><tr><th>Medición</th><th>Umbral</th><th>Tiempo exposición</th><th>% exposición</th><th>Episodios</th></tr></thead><tbody>`;
            measurements.forEach(item => {
                html += `<tr><td>${escapeHtml(item.label || item.name)}</td><td>${number(item.threshold, 1)}°</td><td>${seconds(item.videoExposureTime)}</td><td>${number(item.videoExposurePercentage, 2)}%</td><td>${number(item.videoEpisodes, 0)}</td></tr>`;
            });
            if (!measurements.length) html += `<tr><td colspan="5">No hay mediciones válidas para este vídeo.</td></tr>`;
            html += `</tbody></table></div>`;
        });
        container.innerHTML = html || "Sin resultados.";
    };

    window.showGlobalResults = function (results) {
        const container = document.getElementById("globalResults");
        if (!container) return;
        const groups = {};
        (Array.isArray(results) ? results : []).forEach(result => {
            getPostureResults(result).forEach(item => {
                const key = item.name || item.label;
                if (!groups[key]) groups[key] = { label: item.label || item.name, exposure: 0, percentages: [], episodes: 0, videos: 0, max: 0 };
                const group = groups[key];
                group.exposure += Number(item.videoExposureTime) || 0;
                group.percentages.push(Number(item.videoExposurePercentage) || 0);
                group.episodes += Number(item.videoEpisodes) || 0;
                group.videos++;
                group.max = Math.max(group.max, Number(item.videoExposureTime) || 0);
            });
        });
        const rows = Object.values(groups).map(group => {
            const averagePercentage = group.percentages.length ? group.percentages.reduce((a, b) => a + b, 0) / group.percentages.length : 0;
            return `<tr><td>${escapeHtml(group.label)}</td><td>${seconds(group.exposure)}</td><td>${number(averagePercentage, 2)}%</td><td>${seconds(group.max)}</td><td>${group.episodes}</td><td>${group.videos}</td></tr>`;
        }).join("");
        container.innerHTML = `<div class="table-wrapper"><table><thead><tr><th>Medición</th><th>Tiempo total</th><th>Media % exposición</th><th>Máximo tiempo</th><th>Episodios</th><th>Vídeos</th></tr></thead><tbody>${rows || `<tr><td colspan="6">Sin resultados.</td></tr>`}</tbody></table></div>`;
    };

    window.showCombinedPostureResults = function (results) {
        const container = document.getElementById("postureResults");
        if (!container) return;

        const episodes = [];
        (Array.isArray(results) ? results : []).forEach(result => {
            getSustainedResults(result).forEach(episode => {
                episodes.push({ ...episode, videoNumber: result.videoNumber, fileName: result.fileName });
            });
        });

        if (!episodes.length) {
            container.innerHTML = `<div class="table-wrapper"><table><thead><tr><th>Resultado</th></tr></thead><tbody><tr><td>No se han detectado posturas mantenidas durante más de 4 segundos en el período analizado.</td></tr></tbody></table></div>`;
            return;
        }

        episodes.sort((a, b) => (Number(a.videoNumber) || 0) - (Number(b.videoNumber) || 0) || Number(a.startTime) - Number(b.startTime));

        const detailRows = episodes.map(episode => `<tr>
            <td>${escapeHtml(episode.videoNumber)}</td>
            <td>${escapeHtml(episode.label)}</td>
            <td>${escapeHtml(episode.bandLabel)}</td>
            <td>${number(episode.startAngle, 2)}°</td>
            <td>${number(episode.averageAngle, 2)}°</td>
            <td>${number(episode.endAngle, 2)}°</td>
            <td>${seconds(episode.startTime)}</td>
            <td>${seconds(episode.endTime)}</td>
            <td>${seconds(episode.duration)}</td>
        </tr>`).join("");

        const groups = {};
        episodes.forEach(episode => {
            const key = `${episode.measurement}|${episode.bandLower}|${episode.bandUpper}`;
            if (!groups[key]) groups[key] = { label: episode.label, bandLabel: episode.bandLabel, occurrences: 0, totalTime: 0, maxTime: 0, videos: new Set() };
            groups[key].occurrences++;
            groups[key].totalTime += Number(episode.duration) || 0;
            groups[key].maxTime = Math.max(groups[key].maxTime, Number(episode.duration) || 0);
            groups[key].videos.add(String(episode.videoNumber));
        });

        const globalRows = Object.values(groups).sort((a, b) => b.totalTime - a.totalTime).map(group => `<tr>
            <td>${escapeHtml(group.label)}</td>
            <td>${escapeHtml(group.bandLabel)}</td>
            <td>${group.occurrences}</td>
            <td>${seconds(group.totalTime)}</td>
            <td>${seconds(group.maxTime)}</td>
            <td>${escapeHtml(Array.from(group.videos).sort((a, b) => Number(a) - Number(b)).join(", "))}</td>
        </tr>`).join("");

        container.innerHTML = `
            <h3>Detalle de posturas mantenidas por vídeo</h3>
            <div class="table-wrapper"><table>
                <thead><tr><th>Vídeo</th><th>Postura</th><th>Franja</th><th>Ángulo inicial</th><th>Ángulo medio</th><th>Ángulo final</th><th>Inicio</th><th>Fin</th><th>Tiempo mantenido</th></tr></thead>
                <tbody>${detailRows}</tbody>
            </table></div>
            <h3>Resumen global de posturas mantenidas</h3>
            <div class="table-wrapper"><table>
                <thead><tr><th>Postura</th><th>Franja</th><th>N.º veces</th><th>Tiempo total</th><th>Mayor episodio</th><th>Vídeos</th></tr></thead>
                <tbody>${globalRows}</tbody>
            </table></div>`;
    };

    window.renderSustainedPostures = function () { return true; };

})();
