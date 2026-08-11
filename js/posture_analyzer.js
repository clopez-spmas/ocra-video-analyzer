"use strict";

/*
=========================================================
OCRA VIDEO ANALYZER
POSTURE ANALYZER
=========================================================

Analiza la exposición temporal de cada medición.

REGLA PRINCIPAL:

- "Todo el vídeo" -> se analiza todo el vídeo.
- "Manual" -> se analiza exclusivamente el intervalo indicado.
- "Fijo" -> se analiza exclusivamente el intervalo que comienza
  en el momento indicado y dura lo indicado.

El vídeo completo se sigue leyendo y se conserva su duración real,
pero los resultados temporales nunca utilizan frames fuera del
período seleccionado.

No realiza puntuación OCRA ni clasificación de riesgo.
=========================================================
*/

const PostureAnalyzer = {

    analyze(biomechanicalFrames, cycleConfig) {

        if (!Array.isArray(biomechanicalFrames)) {
            return {
                videoDuration: 0,
                analysisStartTime: 0,
                analysisEndTime: 0,
                analysisDuration: 0,
                measurements: []
            };
        }

        const videoDuration = getVideoDuration(biomechanicalFrames);
        const period = resolveAnalysisPeriod(videoDuration, cycleConfig);
        const grouped = groupMeasurements(biomechanicalFrames);
        const results = [];

        Object.keys(grouped).forEach(name => {

            const frames = grouped[name];
            const threshold = getThreshold(name);

            if (threshold === null) {
                return;
            }

            /*
            =================================================
            RESULTADO DEL PERÍODO SELECCIONADO
            =================================================
            */
            const analysisResult = analyzePeriod(
                frames,
                period.startTime,
                period.endTime,
                threshold
            );

            /*
            =================================================
            RESULTADO DE CICLO
            =================================================

            Cuando se selecciona un período concreto, el ciclo
            representa exactamente ese período. Así no se vuelve
            a introducir accidentalmente todo el vídeo.
            */
            let cycleResult = {
                enabled: false,
                mode: "video",
                duration: null,
                startTime: null,
                endTime: null,
                exposureTime: null,
                exposurePercentage: null,
                episodes: null,
                cycles: 0
            };

            if (period.mode !== "video") {
                cycleResult = {
                    enabled: true,
                    mode: period.mode,
                    duration: period.endTime - period.startTime,
                    startTime: period.startTime,
                    endTime: period.endTime,
                    exposureTime: analysisResult.exposureTime,
                    exposurePercentage: analysisResult.exposurePercentage,
                    episodes: analysisResult.episodes,
                    cycles: 1
                };
            }

            results.push({
                name,
                label: getMeasurementLabel(name),
                description: getMeasurementDescription(name),
                threshold,
                unit: "deg",

                /* Duración real del archivo/vídeo. */
                videoDuration,

                /* Período que realmente se ha analizado. */
                analysisStartTime: period.startTime,
                analysisEndTime: period.endTime,
                analysisDuration: period.endTime - period.startTime,

                /* Campos históricos utilizados por la interfaz. */
                videoExposureTime: analysisResult.exposureTime,
                videoExposurePercentage: analysisResult.exposurePercentage,
                videoEpisodes: analysisResult.episodes,

                cycle: cycleResult
            });
        });

        return {
            videoDuration,
            analysisStartTime: period.startTime,
            analysisEndTime: period.endTime,
            analysisDuration: period.endTime - period.startTime,
            analysisMode: period.mode,
            measurements: results
        };
    }
};


/*
=========================================================
RESOLVER PERÍODO DE ANÁLISIS
=========================================================
*/
function resolveAnalysisPeriod(videoDuration, cycleConfig) {

    const duration = Math.max(0, Number(videoDuration) || 0);

    if (!cycleConfig || cycleConfig.enabled !== true) {
        return {
            mode: "video",
            startTime: 0,
            endTime: duration
        };
    }

    const mode = ["manual", "fixed"].includes(cycleConfig.mode)
        ? cycleConfig.mode
        : "video";

    if (mode === "manual") {
        const start = clampTime(cycleConfig.startTime, 0, duration);
        const requestedEnd = Number(cycleConfig.endTime);

        if (!Number.isFinite(requestedEnd) || requestedEnd <= start) {
            return {
                mode: "video",
                startTime: 0,
                endTime: duration
            };
        }

        return {
            mode: "manual",
            startTime: start,
            endTime: Math.min(requestedEnd, duration)
        };
    }

    const start = clampTime(cycleConfig.startTime, 0, duration);
    const cycleTime = Number(cycleConfig.cycleTime);

    if (!Number.isFinite(cycleTime) || cycleTime <= 0 || start >= duration) {
        return {
            mode: "video",
            startTime: 0,
            endTime: duration
        };
    }

    return {
        mode: "fixed",
        startTime: start,
        endTime: Math.min(start + cycleTime, duration)
    };
}

function clampTime(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        return min;
    }
    return Math.min(Math.max(number, min), max);
}


/*
=========================================================
AGRUPAR MEDICIONES
=========================================================
*/
function groupMeasurements(frames) {

    const groups = {};

    frames.forEach(frame => {
        if (!frame || !frame.name) {
            return;
        }

        const name = frame.name;

        if (!groups[name]) {
            groups[name] = [];
        }

        groups[name].push(frame);
    });

    Object.keys(groups).forEach(name => {
        groups[name].sort((a, b) =>
            Number(a.timestamp) - Number(b.timestamp)
        );
    });

    return groups;
}


/*
=========================================================
DURACIÓN DEL VÍDEO
=========================================================
*/
function getVideoDuration(frames) {

    let maxTime = 0;

    frames.forEach(frame => {
        if (!frame) {
            return;
        }

        const time = Number(frame.timestamp);

        if (Number.isFinite(time) && time > maxTime) {
            maxTime = time;
        }
    });

    return maxTime;
}


/*
=========================================================
UMBRAL
=========================================================
*/
function getThreshold(name) {

    if (typeof Thresholds === "undefined") {
        return null;
    }

    const definition = Thresholds[name];

    if (!definition) {
        return null;
    }

    const value = Number(definition.value);

    return Number.isFinite(value) ? value : null;
}


/*
=========================================================
NOMBRE VISIBLE
=========================================================
*/
function getMeasurementLabel(name) {

    if (
        typeof Thresholds !== "undefined" &&
        Thresholds[name] &&
        Thresholds[name].label
    ) {
        return Thresholds[name].label;
    }

    return name;
}


/*
=========================================================
DESCRIPCIÓN
=========================================================
*/
function getMeasurementDescription(name) {

    if (
        typeof Thresholds !== "undefined" &&
        Thresholds[name] &&
        Thresholds[name].description
    ) {
        return Thresholds[name].description;
    }

    return name;
}


/*
=========================================================
ANALIZAR PERÍODO
=========================================================

Solo se seleccionan frames cuyo timestamp está dentro del
intervalo solicitado.

El tiempo acumulado solo se suma cuando el frame actual y el
siguiente son válidos. Esto evita atravesar huecos de tracking.
=========================================================
*/
function analyzePeriod(frames, startTime, endTime, threshold) {

    const start = Number(startTime);
    const end = Number(endTime);

    if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        end <= start
    ) {
        return {
            exposureTime: 0,
            exposurePercentage: 0,
            episodes: 0
        };
    }

    const selected = frames.filter(frame => {
        if (!frame) {
            return false;
        }

        const time = Number(frame.timestamp);

        return (
            Number.isFinite(time) &&
            time >= start &&
            time <= end
        );
    });

    if (selected.length === 0) {
        return {
            exposureTime: 0,
            exposurePercentage: 0,
            episodes: 0
        };
    }

    let exposureTime = 0;
    let episodes = 0;
    let inExposure = false;

    for (let i = 0; i < selected.length; i++) {

        const current = selected[i];
        const currentTime = Number(current.timestamp);
        const currentValue = Number(current.value);

        const currentValid =
            current.valid === true &&
            Number.isFinite(currentValue) &&
            Number.isFinite(currentTime);

        if (!currentValid) {
            inExposure = false;
            continue;
        }

        const isAbove = currentValue >= threshold;

        if (isAbove && !inExposure) {
            episodes++;
            inExposure = true;
        }

        if (!isAbove) {
            inExposure = false;
        }

        if (i < selected.length - 1 && isAbove) {

            const next = selected[i + 1];
            const nextTime = Number(next.timestamp);
            const nextValue = Number(next.value);

            const nextValid =
                next.valid === true &&
                Number.isFinite(nextValue) &&
                Number.isFinite(nextTime);

            if (nextValid) {
                let interval = nextTime - currentTime;
                interval = Math.max(0, interval);

                const remaining = Math.max(0, end - currentTime);
                interval = Math.min(interval, remaining);

                exposureTime += interval;
            }
        }
    }

    const periodDuration = Math.max(0, end - start);

    exposureTime = Math.min(exposureTime, periodDuration);

    const exposurePercentage =
        periodDuration > 0
            ? (exposureTime / periodDuration) * 100
            : 0;

    return {
        exposureTime,
        exposurePercentage,
        episodes
    };
}


/*
=========================================================
EXPORTACIÓN
=========================================================
*/
window.PostureAnalyzer = PostureAnalyzer;

console.log("OCRA Video Analyzer: posture_analyzer.js cargado correctamente");