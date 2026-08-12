"use strict";

/*
=========================================================
OCRA VIDEO ANALYZER
SUSTAINED POSTURES
=========================================================

Detecta posturas mantenidas durante más de 4 segundos
continuados dentro de franjas angulares.

TRONCO  -> franjas de 10 grados
CABEZA  -> franjas de 5 grados

No utiliza el umbral de exposición. La clasificación se hace
por franja angular y el episodio debe permanecer dentro de la
misma franja durante más de 4 segundos continuados.
=========================================================
*/

const SUSTAINED_POSTURE_LIMIT_SECONDS = 4;
const TRUNK_BAND_SIZE = 10;
const HEAD_BAND_SIZE = 5;


function getSustainedPostureBand(measurementName, value) {

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return null;
    }

    let bandSize = null;

    if (measurementName === "trunk_flexion" || measurementName === "trunk_lateral") {
        bandSize = TRUNK_BAND_SIZE;
    }
    else if (measurementName === "neck_flexion") {
        bandSize = HEAD_BAND_SIZE;
    }
    else {
        return null;
    }

    /*
    Las franjas se expresan por el valor absoluto del ángulo.
    Ejemplo para tronco: 0-10, 10-20, 20-30...
    */
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

    if (!Array.isArray(frames) || frames.length === 0) {
        return [];
    }

    const validFrames = frames
        .filter(frame => {
            if (!frame || frame.valid !== true) return false;

            const time = Number(frame.timestamp);
            const value = Number(frame.value);

            return Number.isFinite(time) && Number.isFinite(value);
        })
        .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

    if (validFrames.length === 0) {
        return [];
    }

    const episodes = [];
    let current = null;

    function closeEpisode(endTime) {

        if (!current) return;

        const duration = Math.max(0, endTime - current.startTime);

        if (duration > minimumSeconds) {
            const averageAngle = current.angleSum / current.angleCount;

            episodes.push({
                measurement: measurementName,
                bandLower: current.band.lower,
                bandUpper: current.band.upper,
                bandLabel: current.band.label,
                startTime: current.startTime,
                endTime,
                duration,
                averageAngle,
                startAngle: current.startAngle,
                endAngle: current.lastAngle
            });
        }

        current = null;
    }

    for (let i = 0; i < validFrames.length; i++) {

        const frame = validFrames[i];
        const time = Number(frame.timestamp);
        const value = Number(frame.value);
        const band = getSustainedPostureBand(measurementName, value);

        if (!band) {
            closeEpisode(time);
            continue;
        }

        if (!current) {
            current = {
                band,
                startTime: time,
                startAngle: value,
                lastAngle: value,
                angleSum: value,
                angleCount: 1
            };
            continue;
        }

        const sameBand =
            current.band.lower === band.lower &&
            current.band.upper === band.upper;

        /*
        Si hay un salto temporal grande o se pierde continuidad,
        no se considera una postura mantenida durante ese hueco.
        */
        const previousTime = Number(validFrames[i - 1].timestamp);
        const gap = time - previousTime;

        if (!sameBand || !Number.isFinite(gap) || gap <= 0) {
            closeEpisode(previousTime);

            current = {
                band,
                startTime: time,
                startAngle: value,
                lastAngle: value,
                angleSum: value,
                angleCount: 1
            };

            continue;
        }

        current.lastAngle = value;
        current.angleSum += value;
        current.angleCount++;
    }

    if (current) {
        const lastTime = Number(validFrames[validFrames.length - 1].timestamp);
        closeEpisode(lastTime);
    }

    return episodes;
}


function analyzeAllSustainedPostures(biomechanicalFrames) {

    const grouped = {};

    if (!Array.isArray(biomechanicalFrames)) {
        return [];
    }

    biomechanicalFrames.forEach(frame => {
        if (!frame || !frame.name) return;

        if (
            frame.name !== "trunk_flexion" &&
            frame.name !== "trunk_lateral" &&
            frame.name !== "neck_flexion"
        ) {
            return;
        }

        if (!grouped[frame.name]) {
            grouped[frame.name] = [];
        }

        grouped[frame.name].push(frame);
    });

    const allEpisodes = [];

    Object.keys(grouped).forEach(name => {
        const episodes = analyzeSustainedPostures(grouped[name], name);
        allEpisodes.push(...episodes);
    });

    return allEpisodes.sort((a, b) => a.startTime - b.startTime);
}


function summarizeSustainedPostures(episodes) {

    const summary = {};

    if (!Array.isArray(episodes)) {
        return summary;
    }

    episodes.forEach(episode => {
        const key = `${episode.measurement}|${episode.bandLower}|${episode.bandUpper}`;

        if (!summary[key]) {
            summary[key] = {
                measurement: episode.measurement,
                bandLower: episode.bandLower,
                bandUpper: episode.bandUpper,
                bandLabel: episode.bandLabel,
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

    if (measurement === "trunk_flexion") return "Tronco - flexión";
    if (measurement === "trunk_lateral") return "Tronco - inclinación lateral";
    if (measurement === "neck_flexion") return "Cabeza - flexión cervical";

    return measurement;
}


window.SustainedPostures = {
    analyze: analyzeSustainedPostures,
    analyzeAll: analyzeAllSustainedPostures,
    summarize: summarizeSustainedPostures,
    getBand: getSustainedPostureBand,
    getLabel: getSustainedPostureLabel,
    minimumSeconds: SUSTAINED_POSTURE_LIMIT_SECONDS
};
