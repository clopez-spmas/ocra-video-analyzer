"use strict";

/* =========================================================
OCRA VIDEO ANALYZER
SUSTAINED POSTURES / POSTURE FREQUENCY

Detecta posturas mantenidas > 4 s dentro de franjas angulares
 y calcula cuántas veces por minuto se adopta cada franja.
La continuidad y la frecuencia se calculan con timestamp del JSON de Kinovea.
========================================================= */

const SUSTAINED_POSTURE_LIMIT_SECONDS = 4;

const SUSTAINED_BAND_SIZES = {
    trunk_flexion: 10,
    trunk_lateral: 2,
    trunk_axial_rotation: 2,
    neck_flexion: 5,
    head_lateral: 2,
    head_axial_rotation: 2,
    knee_flexion_left: 10,
    knee_flexion_right: 10,
    ankle_left: 2,
    ankle_right: 2
};

const SUSTAINED_LABELS = {
    trunk_flexion: "Tronco - flexión / extensión",
    trunk_lateral: "Tronco - inclinación lateral",
    trunk_axial_rotation: "Tronco - rotación axial",
    neck_flexion: "Cabeza - flexión / extensión",
    head_lateral: "Cabeza - lateralización",
    head_axial_rotation: "Cabeza - rotación axial",
    knee_flexion_left: "Rodilla izquierda - flexión",
    knee_flexion_right: "Rodilla derecha - flexión",
    ankle_left: "Tobillo izquierdo",
    ankle_right: "Tobillo derecho"
};

function getSustainedPostureBand(measurementName, value) {
    const numericValue = Number(value);
    const bandSize = SUSTAINED_BAND_SIZES[measurementName];

    if (!Number.isFinite(numericValue) || !bandSize) return null;

    const magnitude = Math.abs(numericValue);
    const lower = Math.floor(magnitude / bandSize) * bandSize;
    const upper = lower + bandSize;

    return {
        lower,
        upper,
        size: bandSize,
        label: `${lower}°–${upper}°`
    };
}

function analyzeSustainedPostures(frames, measurementName, minimumSeconds = SUSTAINED_POSTURE_LIMIT_SECONDS) {
    if (!Array.isArray(frames) || frames.length === 0) return [];

    const bandSize = SUSTAINED_BAND_SIZES[measurementName];
    if (!bandSize) return [];

    const orderedFrames = frames
        .filter(frame => frame && Number.isFinite(Number(frame.timestamp)))
        .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

    if (orderedFrames.length === 0) return [];

    const episodes = [];
    let current = null;

    function startEpisode(time, value, band) {
        current = {
            band,
            startTime: time,
            startAngle: value,
            lastAngle: value,
            angleSum: value,
            angleCount: 1,
            previousTime: time
        };
    }

    function closeEpisode(endTime) {
        if (!current) return;

        const duration = Math.max(0, Number(endTime) - current.startTime);

        if (duration > minimumSeconds) {
            episodes.push({
                measurement: measurementName,
                label: SUSTAINED_LABELS[measurementName] || measurementName,
                bandLower: current.band.lower,
                bandUpper: current.band.upper,
                bandLabel: current.band.label,
                bandSize: current.band.size,
                startTime: current.startTime,
                endTime: Number(endTime),
                duration,
                averageAngle: current.angleSum / current.angleCount,
                startAngle: current.startAngle,
                endAngle: current.lastAngle
            });
        }

        current = null;
    }

    for (let i = 0; i < orderedFrames.length; i++) {
        const frame = orderedFrames[i];
        const time = Number(frame.timestamp);
        const valid = frame.valid === true && Number.isFinite(Number(frame.value));

        if (!valid) {
            if (current) {
                closeEpisode(i > 0 ? Number(orderedFrames[i - 1].timestamp) : time);
            }
            continue;
        }

        const value = Number(frame.value);
        const band = getSustainedPostureBand(measurementName, value);

        if (!band) {
            closeEpisode(time);
            continue;
        }

        if (!current) {
            startEpisode(time, value, band);
            continue;
        }

        const sameBand = current.band.lower === band.lower && current.band.upper === band.upper;
        const gap = time - current.previousTime;

        if (!sameBand || !Number.isFinite(gap) || gap <= 0) {
            closeEpisode(current.previousTime);
            startEpisode(time, value, band);
            continue;
        }

        current.lastAngle = value;
        current.angleSum += value;
        current.angleCount++;
        current.previousTime = time;
    }

    if (current) closeEpisode(current.previousTime);

    return episodes;
}

function analyzeAllSustainedPostures(biomechanicalFrames) {
    const grouped = {};
    if (!Array.isArray(biomechanicalFrames)) return [];

    biomechanicalFrames.forEach(frame => {
        if (!frame || !frame.name) return;
        if (!SUSTAINED_BAND_SIZES[frame.name]) return;
        if (!grouped[frame.name]) grouped[frame.name] = [];
        grouped[frame.name].push(frame);
    });

    const allEpisodes = [];

    Object.keys(grouped).forEach(name => {
        allEpisodes.push(...analyzeSustainedPostures(grouped[name], name));
    });

    return allEpisodes.sort((a, b) => a.startTime - b.startTime);
}

function analyzePostureFrequency(frames, measurementName) {
    if (!Array.isArray(frames) || frames.length === 0) return [];

    const orderedFrames = frames
        .filter(frame => frame && Number.isFinite(Number(frame.timestamp)))
        .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

    if (orderedFrames.length === 0) return [];

    const counts = {};
    let previousBandKey = null;
    let previousTime = null;

    orderedFrames.forEach(frame => {
        const time = Number(frame.timestamp);
        const valid = frame.valid === true && Number.isFinite(Number(frame.value));

        if (!valid) {
            previousBandKey = null;
            previousTime = null;
            return;
        }

        const band = getSustainedPostureBand(measurementName, frame.value);
        if (!band) {
            previousBandKey = null;
            previousTime = time;
            return;
        }

        const gap = previousTime === null ? 0 : time - previousTime;
        const bandKey = `${band.lower}|${band.upper}`;

        if (previousBandKey !== bandKey || !Number.isFinite(gap) || gap <= 0) {
            if (!counts[bandKey]) {
                counts[bandKey] = {
                    measurement: measurementName,
                    label: SUSTAINED_LABELS[measurementName] || measurementName,
                    bandLower: band.lower,
                    bandUpper: band.upper,
                    bandLabel: band.label,
                    bandSize: band.size,
                    occurrences: 0
                };
            }
            counts[bandKey].occurrences++;
        }

        previousBandKey = bandKey;
        previousTime = time;
    });

    return Object.values(counts);
}

function analyzeAllPostureFrequency(biomechanicalFrames, startTime = null, endTime = null) {
    const grouped = {};
    if (!Array.isArray(biomechanicalFrames)) return { analysisDuration: 0, rows: [] };

    biomechanicalFrames.forEach(frame => {
        if (!frame || !frame.name || !SUSTAINED_BAND_SIZES[frame.name]) return;
        const time = Number(frame.timestamp);
        if (!Number.isFinite(time)) return;
        if (startTime !== null && time < Number(startTime)) return;
        if (endTime !== null && time > Number(endTime)) return;
        if (!grouped[frame.name]) grouped[frame.name] = [];
        grouped[frame.name].push(frame);
    });

    const times = biomechanicalFrames
        .map(frame => Number(frame?.timestamp))
        .filter(Number.isFinite)
        .filter(time => (startTime === null || time >= Number(startTime)) && (endTime === null || time <= Number(endTime)));

    const durationStart = startTime !== null ? Number(startTime) : (times.length ? Math.min(...times) : 0);
    const durationEnd = endTime !== null ? Number(endTime) : (times.length ? Math.max(...times) : 0);
    const analysisDuration = Number.isFinite(durationStart) && Number.isFinite(durationEnd)
        ? Math.max(0, durationEnd - durationStart)
        : 0;

    const rows = [];
    Object.keys(grouped).forEach(name => {
        analyzePostureFrequency(grouped[name], name).forEach(row => {
            rows.push({
                ...row,
                analysisDuration,
                occurrencesPerMinute: analysisDuration > 0
                    ? (row.occurrences / analysisDuration) * 60
                    : 0
            });
        });
    });

    return {
        analysisDuration,
        rows: rows.sort((a, b) => b.occurrencesPerMinute - a.occurrencesPerMinute)
    };
}

function summarizeSustainedPostures(episodes) {
    const summary = {};
    if (!Array.isArray(episodes)) return summary;

    episodes.forEach(episode => {
        const key = `${episode.measurement}|${episode.bandLower}|${episode.bandUpper}`;

        if (!summary[key]) {
            summary[key] = {
                measurement: episode.measurement,
                label: episode.label,
                bandLower: episode.bandLower,
                bandUpper: episode.bandUpper,
                bandLabel: episode.bandLabel,
                bandSize: episode.bandSize,
                totalTime: 0,
                occurrences: 0,
                episodes: []
            };
        }

        summary[key].totalTime += episode.duration;
        summary[key].occurrences++;
        summary[key].episodes.push(episode);
    });

    return Object.values(summary).sort((a, b) => b.totalTime - a.totalTime);
}

function getSustainedPostureLabel(measurement) {
    return SUSTAINED_LABELS[measurement] || measurement;
}

window.SustainedPostures = {
    analyze: analyzeSustainedPostures,
    analyzeAll: analyzeAllSustainedPostures,
    summarize: summarizeSustainedPostures,
    analyzeFrequency: analyzePostureFrequency,
    analyzeAllFrequency: analyzeAllPostureFrequency,
    getBand: getSustainedPostureBand,
    getLabel: getSustainedPostureLabel,
    minimumSeconds: SUSTAINED_POSTURE_LIMIT_SECONDS,
    bandSizes: SUSTAINED_BAND_SIZES
};
