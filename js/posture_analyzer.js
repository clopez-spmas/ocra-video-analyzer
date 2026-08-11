"use strict";

/*
=========================================================
OCRA Video Analyzer
Posture Analyzer
=========================================================

Responsabilidades:

- Recibir biomechanicalFrames.
- Agrupar mediciones por tipo.
- Aplicar el umbral correspondiente.
- Calcular tiempo acumulado.
- Calcular porcentaje del vídeo.
- Detectar episodios.
- Calcular resultados por ciclo.
- Funcionar sin ciclo.
- No contar intervalos en los que faltan landmarks.

IMPORTANTE:

Cada llamada a PostureAnalyzer.analyze()
corresponde EXCLUSIVAMENTE a un vídeo.

No se mezclan datos entre vídeos.

NO realiza:

- puntuación OCRA
- clasificación de riesgo
- interpretación ergonómica
=========================================================
*/


const PostureAnalyzer = {

    /*
    =====================================================
    ANALIZAR UN VÍDEO
    =====================================================
    */

    analyze(
        biomechanicalFrames,
        cycleConfig
    ) {

        if (
            !Array.isArray(
                biomechanicalFrames
            )
        ) {

            return {

                videoDuration: 0,

                measurements: []

            };

        }


        /*
        -------------------------------------------------
        Duración del vídeo
        -------------------------------------------------
        */

        const videoDuration =
            getVideoDuration(
                biomechanicalFrames
            );


        /*
        -------------------------------------------------
        Agrupar mediciones
        -------------------------------------------------
        */

        const grouped =
            groupMeasurements(
                biomechanicalFrames
            );


        const results = [];


        /*
        =================================================
        UNA FILA POR MEDICIÓN
        =================================================
        */

        Object.keys(grouped)
        .forEach(
            name => {

                const frames =
                    grouped[name];


                /*
                -------------------------------------------------
                Obtener umbral global
                -------------------------------------------------
                */

                const threshold =
                    getThreshold(
                        name
                    );


                if (
                    threshold === null
                ) {

                    return;

                }


                /*
                =================================================
                RESULTADO SOBRE TODO EL VÍDEO
                =================================================
                */

                const videoResult =
                    analyzePeriod(
                        frames,
                        0,
                        videoDuration,
                        threshold
                    );


                /*
                =================================================
                RESULTADO DE CICLO
                =================================================
                */

                let cycleResult = {

                    enabled:
                        false,

                    mode:
                        "video",

                    duration:
                        null,

                    startTime:
                        null,

                    endTime:
                        null,

                    exposureTime:
                        null,

                    exposurePercentage:
                        null,

                    episodes:
                        null,

                    cycles:
                        0

                };


                /*
                -------------------------------------------------
                No hay ciclo:
                cycle queda desactivado.
                -------------------------------------------------
                */

                if (
                    cycleConfig
                    &&
                    cycleConfig.enabled === true
                ) {

                    /*
                    =============================================
                    CICLO FIJO
                    =============================================
                    */

                    if (
                        cycleConfig.mode ===
                        "fixed"
                    ) {

                        cycleResult =
                            analyzeFixedCycles(
                                frames,
                                videoDuration,
                                threshold,
                                cycleConfig.cycleTime
                            );

                    }


                    /*
                    =============================================
                    CICLO MANUAL
                    =============================================
                    */

                    else if (
                        cycleConfig.mode ===
                        "manual"
                    ) {

                        cycleResult =
                            analyzeManualCycle(
                                frames,
                                threshold,
                                cycleConfig.startTime,
                                cycleConfig.endTime
                            );

                    }

                }


                /*
                =================================================
                RESULTADO INDIVIDUAL
                =================================================
                */

                results.push({

                    name:
                        name,

                    label:
                        getMeasurementLabel(
                            name
                        ),

                    description:
                        getMeasurementDescription(
                            name
                        ),

                    threshold:
                        threshold,

                    unit:
                        "deg",

                    videoDuration:
                        videoDuration,

                    videoExposureTime:
                        videoResult.exposureTime,

                    videoExposurePercentage:
                        videoResult.exposurePercentage,

                    videoEpisodes:
                        videoResult.episodes,

                    cycle:
                        cycleResult

                });

            }
        );


        /*
        =================================================
        DEVOLVER RESULTADO EXCLUSIVO DE ESTE VÍDEO
        =================================================
        */

        return {

            videoDuration:
                videoDuration,

            measurements:
                results

        };

    }

};


/*
=========================================================
AGRUPAR MEDICIONES
=========================================================
*/

function groupMeasurements(
    frames
) {

    const groups = {};


    frames.forEach(
        frame => {

            if (
                !frame
                ||
                !frame.name
            ) {

                return;

            }


            const name =
                frame.name;


            if (
                !groups[name]
            ) {

                groups[name] = [];

            }


            groups[name].push(
                frame
            );

        }
    );


    /*
    -----------------------------------------------------
    Orden temporal
    -----------------------------------------------------
    */

    Object.keys(groups)
    .forEach(
        name => {

            groups[name].sort(
                (
                    a,
                    b
                ) => {

                    return (
                        Number(
                            a.timestamp
                        )
                        -
                        Number(
                            b.timestamp
                        )
                    );

                }
            );

        }
    );


    return groups;

}


/*
=========================================================
DURACIÓN DEL VÍDEO
=========================================================
*/

function getVideoDuration(
    frames
) {

    let maxTime = 0;


    frames.forEach(
        frame => {

            if (
                !frame
            ) {

                return;

            }


            const time =
                Number(
                    frame.timestamp
                );


            if (
                Number.isFinite(
                    time
                )
                &&
                time > maxTime
            ) {

                maxTime =
                    time;

            }

        }
    );


    return maxTime;

}


/*
=========================================================
OBTENER UMBRAL GLOBAL
=========================================================
*/

function getThreshold(
    name
) {

    /*
    -----------------------------------------------------
    Los umbrales son comunes a todos los vídeos.
    -----------------------------------------------------
    */

    if (
        typeof Thresholds ===
        "undefined"
    ) {

        return null;

    }


    const definition =
        Thresholds[name];


    if (
        !definition
    ) {

        return null;

    }


    const value =
        Number(
            definition.value
        );


    if (
        !Number.isFinite(
            value
        )
    ) {

        return null;

    }


    return value;

}


/*
=========================================================
NOMBRE VISIBLE
=========================================================
*/

function getMeasurementLabel(
    name
) {

    if (
        typeof Thresholds !==
        "undefined"
        &&
        Thresholds[name]
        &&
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

function getMeasurementDescription(
    name
) {

    if (
        typeof Thresholds !==
        "undefined"
        &&
        Thresholds[name]
        &&
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

Calcula:

- tiempo por encima del umbral
- porcentaje
- episodios

IMPORTANTE:

NO se acumula el intervalo entre dos frames
si alguno de los dos frames no es válido.

Esto evita atravesar huecos de tracking.
=========================================================
*/

function analyzePeriod(
    frames,
    startTime,
    endTime,
    threshold
) {

    const start =
        Number(
            startTime
        );


    const end =
        Number(
            endTime
        );


    if (
        !Number.isFinite(start)
        ||
        !Number.isFinite(end)
        ||
        end <= start
    ) {

        return {

            exposureTime:
                0,

            exposurePercentage:
                0,

            episodes:
                0

        };

    }


    /*
    -----------------------------------------------------
    Seleccionar únicamente frames del período
    -----------------------------------------------------
    */

    const selected =
        frames.filter(
            frame => {

                if (
                    !frame
                ) {

                    return false;

                }


                const time =
                    Number(
                        frame.timestamp
                    );


                return (
                    Number.isFinite(
                        time
                    )
                    &&
                    time >= start
                    &&
                    time <= end
                );

            }
        );


    if (
        selected.length === 0
    ) {

        return {

            exposureTime:
                0,

            exposurePercentage:
                0,

            episodes:
                0

        };

    }


    let exposureTime =
        0;


    let episodes =
        0;


    let inExposure =
        false;


    /*
    =====================================================
    RECORRER FRAMES
    =====================================================
    */

    for (
        let i = 0;
        i < selected.length;
        i++
    ) {

        const current =
            selected[i];


        const currentTime =
            Number(
                current.timestamp
            );


        const currentValue =
            Number(
                current.value
            );


        /*
        -------------------------------------------------
        Frame válido
        -------------------------------------------------
        */

        const currentValid =
            current.valid === true
            &&
            Number.isFinite(
                currentValue
            )
            &&
            Number.isFinite(
                currentTime
            );


        /*
        -------------------------------------------------
        Si falta el dato:

        - termina episodio
        - no acumula tiempo
        -------------------------------------------------
        */

        if (
            !currentValid
        ) {

            inExposure =
                false;

            continue;

        }


        const isAbove =
            currentValue >= threshold;


        /*
        -------------------------------------------------
        Inicio de episodio
        -------------------------------------------------
        */

        if (
            isAbove
            &&
            !inExposure
        ) {

            episodes++;

            inExposure =
                true;

        }


        /*
        -------------------------------------------------
        Final de episodio
        -------------------------------------------------
        */

        if (
            !isAbove
        ) {

            inExposure =
                false;

        }


        /*
        -------------------------------------------------
        Intervalo hasta siguiente frame
        -------------------------------------------------
        */

        if (
            i <
            selected.length - 1
        ) {

            const next =
                selected[i + 1];


            const nextTime =
                Number(
                    next.timestamp
                );


            const nextValue =
                Number(
                    next.value
                );


            const nextValid =
                next.valid === true
                &&
                Number.isFinite(
                    nextValue
                )
                &&
                Number.isFinite(
                    nextTime
                );


            /*
            -------------------------------------------------
            SOLO se cuenta si ambos frames son válidos.
            -------------------------------------------------
            */

            if (
                isAbove
                &&
                nextValid
            ) {

                let interval =
                    nextTime -
                    currentTime;


                interval =
                    Math.max(
                        0,
                        interval
                    );


                /*
                No salir del período.
                */

                const remaining =
                    Math.max(
                        0,
                        end -
                        currentTime
                    );


                interval =
                    Math.min(
                        interval,
                        remaining
                    );


                exposureTime +=
                    interval;

            }

        }

    }


    /*
    =====================================================
    LIMITAR EXPOSICIÓN
    =====================================================
    */

    const periodDuration =
        Math.max(
            0,
            end -
            start
        );


    exposureTime =
        Math.min(
            exposureTime,
            periodDuration
        );


    /*
    =====================================================
    PORCENTAJE
    =====================================================
    */

    const exposurePercentage =
        periodDuration > 0
            ? (
                exposureTime /
                periodDuration
            ) * 100
            : 0;


    return {

        exposureTime:
            exposureTime,

        exposurePercentage:
            exposurePercentage,

        episodes:
            episodes

    };

}


/*
=========================================================
CICLOS FIJOS
=========================================================
*/

function analyzeFixedCycles(
    frames,
    videoDuration,
    threshold,
    cycleTime
) {

    const duration =
        Number(
            cycleTime
        );


    if (
        !Number.isFinite(
            duration
        )
        ||
        duration <= 0
    ) {

        return {

            enabled:
                false,

            mode:
                "fixed",

            duration:
                null,

            startTime:
                null,

            endTime:
                null,

            exposureTime:
                null,

            exposurePercentage:
                null,

            episodes:
                null,

            cycles:
                0

        };

    }


    /*
    -----------------------------------------------------
    Número de ciclos completos
    -----------------------------------------------------
    */

    const cycleCount =
        Math.floor(
            videoDuration /
            duration
        );


    if (
        cycleCount <= 0
    ) {

        return {

            enabled:
                true,

            mode:
                "fixed",

            duration:
                duration,

            startTime:
                0,

            endTime:
                0,

            exposureTime:
                0,

            exposurePercentage:
                0,

            episodes:
                0,

            cycles:
                0,

            totalExposureTime:
                0,

            totalEpisodes:
                0

        };

    }


    let totalExposure =
        0;


    let totalEpisodes =
        0;


    /*
    =====================================================
    ANALIZAR CADA CICLO
    =====================================================
    */

    for (
        let i = 0;
        i < cycleCount;
        i++
    ) {

        const start =
            i *
            duration;


        const end =
            Math.min(
                start +
                duration,
                videoDuration
            );


        const result =
            analyzePeriod(
                frames,
                start,
                end,
                threshold
            );


        totalExposure +=
            result.exposureTime;


        totalEpisodes +=
            result.episodes;

    }


    /*
    =====================================================
    MEDIA POR CICLO
    =====================================================
    */

    const averageExposure =
        totalExposure /
        cycleCount;


    const averagePercentage =
        duration > 0
            ? (
                averageExposure /
                duration
            ) * 100
            : 0;


    return {

        enabled:
            true,

        mode:
            "fixed",

        duration:
            duration,

        startTime:
            0,

        endTime:
            cycleCount *
            duration,

        exposureTime:
            averageExposure,

        exposurePercentage:
            averagePercentage,

        episodes:
            totalEpisodes,

        cycles:
            cycleCount,

        totalExposureTime:
            totalExposure,

        totalEpisodes:
            totalEpisodes

    };

}


/*
=========================================================
CICLO MANUAL
=========================================================
*/

function analyzeManualCycle(
    frames,
    threshold,
    startTime,
    endTime
) {

    const start =
        Number(
            startTime
        );


    const end =
        Number(
            endTime
        );


    if (
        !Number.isFinite(start)
        ||
        !Number.isFinite(end)
        ||
        end <= start
    ) {

        return {

            enabled:
                false,

            mode:
                "manual",

            duration:
                null,

            startTime:
                null,

            endTime:
                null,

            exposureTime:
                null,

            exposurePercentage:
                null,

            episodes:
                null,

            cycles:
                0

        };

    }


    const result =
        analyzePeriod(
            frames,
            start,
            end,
            threshold
        );


    return {

        enabled:
            true,

        mode:
            "manual",

        duration:
            end -
            start,

        startTime:
            start,

        endTime:
            end,

        exposureTime:
            result.exposureTime,

        exposurePercentage:
            result.exposurePercentage,

        episodes:
            result.episodes,

        cycles:
            1

    };

}


/*
=========================================================
EXPORTACIÓN
=========================================================
*/

window.PostureAnalyzer =
    PostureAnalyzer;