"use strict";

/* =========================================================
OCRA VIDEO ANALYZER
SUSTAINED POSTURES

Detecta posturas mantenidas > 4 s dentro de franjas angulares.
La continuidad se calcula con timestamp del JSON de Kinovea.
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
    getBand: getSustainedPostureBand,
    getLabel: getSustainedPostureLabel,
    minimumSeconds: SUSTAINED_POSTURE_LIMIT_SECONDS,
    bandSizes: SUSTAINED_BAND_SIZES
};
