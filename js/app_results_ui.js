"use strict";

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

    const escapeHtml = value => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#039;");
    const number = (value, decimals = 2) => Number.isFinite(Number(value)) ? Number(value).toFixed(decimals) : "-";
    const seconds = value => Number.isFinite(Number(value)) ? `${Number(value).toFixed(2)} s` : "-";
    const getPostureResults = result => result?.postureResults && Array.isArray(result.postureResults.measurements) ? result.postureResults.measurements : [];
    const getSustainedResults = result => result?.postureResults && Array.isArray(result.postureResults.sustainedPostures) ? result.postureResults.sustainedPostures : [];
    const getFrequencyResults = result => result?.postureResults && Array.isArray(result.postureResults.postureFrequency) ? result.postureResults.postureFrequency : [];

    function studyTable(statusText) {
        return `<div class="table-wrapper"><table class="sustained-posture-table"><thead><tr><th>Zona / movimiento</th><th>Rango anatómico estudiado</th><th>Tamaño de franja</th><th>Estado</th></tr></thead><tbody>${STUDY.map(item => `<tr><td>${escapeHtml(item[0])}</td><td>${item[1]}</td><td>${item[2]}</td><td>${escapeHtml(statusText)}</td></tr>`).join("")}</tbody></table></div>`;
    }

    function frequencyTable(rows, defaultText = "No se ha detectado") {
        return `<div class="table-wrapper"><table class="sustained-posture-table"><thead><tr><th>Zona / movimiento</th><th>Rango anatómico estudiado</th><th>Tamaño de franja</th><th>Frecuencia</th></tr></thead><tbody>${STUDY.map(item => {
            const matches = (rows || []).filter(row => row.label === item[0]);
            const frequency = matches.length ? Math.max(...matches.map(row => Number(row.occurrencesPerMinute) || 0)) : null;
            return `<tr><td>${escapeHtml(item[0])}</td><td>${item[1]}</td><td>${item[2]}</td><td>${frequency === null ? defaultText : `<strong>${frequency.toFixed(2)} / min</strong>`}</td></tr>`;
        }).join("")}</tbody></table></div>`;
    }

    function sustainedIntro() {
        return `<h3>Posturas mantenidas durante más de 4 segundos continuados</h3><p>Se analizan episodios en los que una postura permanece más de 4 segundos dentro de la misma franja angular.<br><strong>Tronco:</strong> flexión/extensión en franjas de 10°, inclinación lateral y rotación axial en franjas de 2°.<br><strong>Cabeza:</strong> flexión/extensión en franjas de 5°, lateralización y rotación axial en franjas de 2°.<br><strong>Rodillas:</strong> flexión en franjas de 10°. <strong>Tobillos:</strong> en franjas de 2°.<br>Se muestran únicamente episodios estrictamente superiores a 4 segundos continuados.</p>`;
    }

    function renderPending() {
        const container = document.getElementById("postureResults");
        if (!container) return;
        container.innerHTML = sustainedIntro() + studyTable("Pendiente de análisis") + `<p><strong>Criterio:</strong> solo se consideran episodios estrictamente superiores a 4 segundos continuados dentro de la misma franja angular.</p><hr><h3>Frecuencia de adopción de posturas</h3><p>Se calcula cuántas veces se adopta cada postura dentro de las franjas angulares estudiadas. Cada adopción se contabiliza al entrar en una franja; mientras se permanece en la misma franja no se vuelve a contar. La frecuencia se expresa en número de adopciones por minuto y se calcula utilizando los tiempos del JSON de Kinovea.</p>${frequencyTable([], "Pendiente de análisis")}`;
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

    window.showAnalysisInformation = function (results) {
        const container = document.getElementById("analysisInformation");
        if (!container) return;
        const rows = (Array.isArray(results) ? results : []).map(result => { const p = result.postureResults || {}; return `<tr><td>${escapeHtml(result.videoNumber)}</td><td>${escapeHtml(result.fileName)}</td><td>${seconds(p.analysisStartTime ?? 0)}</td><td>${seconds(p.analysisEndTime ?? p.videoDuration)}</td><td>${seconds(p.analysisDuration ?? p.videoDuration)}</td></tr>`; }).join("");
        container.innerHTML = `<div class="table-wrapper"><table><thead><tr><th>Vídeo</th><th>Archivo</th><th>Inicio análisis</th><th>Fin análisis</th><th>Duración analizada</th></tr></thead><tbody>${rows || `<tr><td colspan="5">Sin resultados.</td></tr>`}</tbody></table></div>`;
    };

    window.showIndividualResults = function (results) {
        const container = document.getElementById("individualResults");
        if (!container) return;
        let html = "";
        (Array.isArray(results) ? results : []).forEach(result => {
            const measurements = getPostureResults(result);
            html += `<h3>Vídeo ${escapeHtml(result.videoNumber)} — ${escapeHtml(result.fileName)}</h3><div class="table-wrapper"><table><thead><tr><th>Medición</th><th>Umbral</th><th>Tiempo exposición</th><th>% exposición</th><th>Episodios</th></tr></thead><tbody>`;
            measurements.forEach(item => { html += `<tr><td>${escapeHtml(item.label || item.name)}</td><td>${number(item.threshold,1)}°</td><td>${seconds(item.videoExposureTime)}</td><td>${number(item.videoExposurePercentage,2)}%</td><td>${number(item.videoEpisodes,0)}</td></tr>`; });
            if (!measurements.length) html += `<tr><td colspan="5">No hay mediciones válidas para este vídeo.</td></tr>`;
            html += `</tbody></table></div>`;
        });
        container.innerHTML = html || "Sin resultados.";
    };

    window.showGlobalResults = function (results) {
        const container = document.getElementById("globalResults");
        if (!container) return;
        const groups = {};
        (Array.isArray(results) ? results : []).forEach(result => getPostureResults(result).forEach(item => { const key = item.name || item.label; if (!groups[key]) groups[key] = {label:item.label||item.name,exposure:0,percentages:[],episodes:0,videos:0,max:0}; const g=groups[key]; g.exposure += Number(item.videoExposureTime)||0; g.percentages.push(Number(item.videoExposurePercentage)||0); g.episodes += Number(item.videoEpisodes)||0; g.videos++; g.max=Math.max(g.max,Number(item.videoExposureTime)||0); }));
        const rows = Object.values(groups).map(g => `<tr><td>${escapeHtml(g.label)}</td><td>${seconds(g.exposure)}</td><td>${number(g.percentages.length ? g.percentages.reduce((a,b)=>a+b,0)/g.percentages.length : 0,2)}%</td><td>${seconds(g.max)}</td><td>${g.episodes}</td><td>${g.videos}</td></tr>`).join("");
        container.innerHTML = `<div class="table-wrapper"><table><thead><tr><th>Medición</th><th>Tiempo total</th><th>Media % exposición</th><th>Máximo tiempo</th><th>Episodios</th><th>Vídeos</th></tr></thead><tbody>${rows || `<tr><td colspan="6">Sin resultados.</td></tr>`}</tbody></table></div>`;
    };

    function renderTemporalResults(results) {
        const safeResults = Array.isArray(results) ? results : [];
        let html = sustainedIntro();
        const allEpisodes = [];

        safeResults.forEach(result => {
            const episodes = getSustainedResults(result);
            episodes.forEach(e => allEpisodes.push({...e, videoNumber: result.videoNumber}));
            html += `<h4>Vídeo ${escapeHtml(result.videoNumber)} — ${escapeHtml(result.fileName)}</h4>`;
            if (!episodes.length) {
                html += `<p><strong>No se han detectado posturas mantenidas durante más de 4 segundos continuados en este vídeo.</strong></p>`;
            } else {
                html += `<div class="table-wrapper"><table class="sustained-posture-table"><thead><tr><th>Postura</th><th>Franja angular</th><th>Ángulo inicio / medio / final</th><th>Inicio</th><th>Fin</th><th>Tiempo mantenido</th></tr></thead><tbody>`;
                episodes.sort((a,b)=>Number(a.startTime)-Number(b.startTime)).forEach(e => { html += `<tr><td>${escapeHtml(e.label||e.measurement)}</td><td>${escapeHtml(e.bandLabel)}</td><td>${number(e.startAngle,1)}° / ${number(e.averageAngle,1)}° / ${number(e.endAngle,1)}°</td><td>${seconds(e.startTime)}</td><td>${seconds(e.endTime)}</td><td><strong>${seconds(e.duration)}</strong></td></tr>`; });
                html += `</tbody></table></div>`;
            }
        });

        if (!allEpisodes.length) {
            html += `<p><strong>No se han detectado episodios de posturas mantenidas durante más de 4 segundos continuados en ninguna de las posturas analizadas: tronco, cabeza, rodillas o tobillos.</strong></p>`;
        } else {
            const groups = {};
            allEpisodes.forEach(e => { const key=`${e.measurement}|${e.bandLower}|${e.bandUpper}`; if(!groups[key]) groups[key]={label:e.label||e.measurement,bandLabel:e.bandLabel,occurrences:0,totalTime:0,maxTime:0,videos:new Set(),details:[]}; const g=groups[key]; g.occurrences++; g.totalTime+=Number(e.duration)||0; g.maxTime=Math.max(g.maxTime,Number(e.duration)||0); g.videos.add(String(e.videoNumber)); g.details.push(`V${e.videoNumber}: ${seconds(e.startTime)}–${seconds(e.endTime)} (${number(e.averageAngle,1)}°)`); });
            html += `<h3>Resultados globales</h3><div class="table-wrapper"><table class="sustained-posture-global-table"><thead><tr><th>Postura</th><th>Franja angular</th><th>Veces</th><th>Tiempo total</th><th>Máximo episodio</th><th>Vídeos</th><th>Detalle</th></tr></thead><tbody>`;
            Object.values(groups).sort((a,b)=>b.totalTime-a.totalTime).forEach(g=> { html += `<tr><td>${escapeHtml(g.label)}</td><td>${escapeHtml(g.bandLabel)}</td><td>${g.occurrences}</td><td>${seconds(g.totalTime)}</td><td>${seconds(g.maxTime)}</td><td>${escapeHtml(Array.from(g.videos).sort((a,b)=>Number(a)-Number(b)).join(", "))}</td><td>${escapeHtml(g.details.join(" | "))}</td></tr>`; });
            html += `</tbody></table></div>`;
        }

        html += `<h4>Rangos y franjas estudiados</h4>${studyTable("Analizado")}<p><strong>Criterio:</strong> solo se consideran episodios estrictamente superiores a 4 segundos continuados dentro de la misma franja angular.</p><hr><h3>Frecuencia de adopción de posturas</h3><p>Se calcula cuántas veces se adopta cada postura dentro de las franjas angulares estudiadas. Cada adopción se contabiliza al entrar en una franja; mientras se permanece en la misma franja no se vuelve a contar. La frecuencia se expresa en número de adopciones por minuto y se calcula utilizando los tiempos del JSON de Kinovea.</p>`;

        const allFrequencyRows = [];
        safeResults.forEach(result => {
            const rows = getFrequencyResults(result);
            rows.forEach(row => allFrequencyRows.push({...row,videoNumber:result.videoNumber}));
            html += `<h4>Vídeo ${escapeHtml(result.videoNumber)} — ${escapeHtml(result.fileName)}</h4>${frequencyTable(rows)}${rows.length ? "" : `<p><strong>No se han detectado adopciones de posturas en las franjas estudiadas durante el período analizado.</strong></p>`}`;
        });

        const groupsF = {};
        allFrequencyRows.forEach(row => { const key=`${row.measurement}|${row.bandLower}|${row.bandUpper}`; if(!groupsF[key]) groupsF[key]={label:row.label,bandLabel:row.bandLabel,occurrences:0,duration:0,videos:new Set()}; groupsF[key].occurrences += Number(row.occurrences)||0; groupsF[key].videos.add(String(row.videoNumber)); });
        safeResults.forEach(result => {
            const duration = Number(result.postureResults?.analysisDuration)||0;
            const measurements = new Set(getFrequencyResults(result).map(row=>row.measurement));
            measurements.forEach(measurement => getFrequencyResults(result).filter(row=>row.measurement===measurement).forEach(row=> { const key=`${row.measurement}|${row.bandLower}|${row.bandUpper}`; if(groupsF[key]) groupsF[key].duration += duration; }));
        });

        html += `<h3>Resultados globales</h3>`;
        if (!allFrequencyRows.length) {
            html += frequencyTable([], "No se ha detectado");
            html += `<p><strong>No se han detectado adopciones de posturas en las franjas estudiadas durante el conjunto de vídeos analizados.</strong></p>`;
        } else {
            html += `<div class="table-wrapper"><table class="sustained-posture-global-table"><thead><tr><th>Postura</th><th>Franja angular</th><th>N.º adopciones</th><th>Frecuencia</th><th>Vídeos</th></tr></thead><tbody>`;
            Object.values(groupsF).sort((a,b)=>(b.duration?b.occurrences/b.duration:0)-(a.duration?a.occurrences/a.duration:0)).forEach(g=> { const f=g.duration>0?g.occurrences/g.duration*60:0; html += `<tr><td>${escapeHtml(g.label)}</td><td>${escapeHtml(g.bandLabel)}</td><td>${g.occurrences}</td><td><strong>${f.toFixed(2)} / min</strong></td><td>${escapeHtml(Array.from(g.videos).sort((a,b)=>Number(a)-Number(b)).join(", "))}</td></tr>`; });
            html += `</tbody></table></div>`;
        }

        html += `<h4>Rangos y franjas estudiados</h4>${frequencyTable(allFrequencyRows.length ? allFrequencyRows : [], allFrequencyRows.length ? "No se ha detectado" : "No se ha detectado")}`;
        return html;
    }

    window.showCombinedPostureResults = function (results) {
        const container = document.getElementById("postureResults");
        if (container) container.innerHTML = renderTemporalResults(results);
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderPending); else renderPending();
})();
