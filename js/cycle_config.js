"use strict";

/*
==========================================================
OCRA Video Analyzer v5
Archivo: cycle_config.js

GESTOR CENTRAL DE CICLOS

Cada vídeo dispone de su propia configuración:

    Vídeo 1 -> configuración 0
    Vídeo 2 -> configuración 1
    Vídeo 3 -> configuración 2
    Vídeo 4 -> configuración 3

Modos:

    video
        Todo el vídeo.

    fixed
        Ciclo fijo.

    manual
        Intervalo inicio - final.

Los umbrales NO se gestionan aquí.
==========================================================
*/


const CycleConfig = {

    videos: {}

};


/*
==========================================================
CONFIGURACIÓN POR DEFECTO
==========================================================
*/

function createDefaultCycleConfig() {

    return {

        enabled:
            false,

        mode:
            "video",

        cycleTime:
            null,

        startTime:
            null,

        endTime:
            null

    };

}


/*
==========================================================
 VALIDAR ÍNDICE
==========================================================
*/

function isValidVideoIndex(
    videoIndex
) {

    const index =
        Number(
            videoIndex
        );


    return (
        Number.isInteger(index)
        &&
        index >= 0
        &&
        index < 4
    );

}


/*
==========================================================
 NORMALIZAR CONFIGURACIÓN
==========================================================
*/

function normalizeCycleConfig(
    config
) {

    if (
        !config
        ||
        typeof config !==
            "object"
    ) {

        return createDefaultCycleConfig();

    }


    let mode =
        config.mode;


    if (
        mode !== "video"
        &&
        mode !== "fixed"
        &&
        mode !== "manual"
    ) {

        mode =
            "video";

    }


    let cycleTime =
        null;

    let startTime =
        null;

    let endTime =
        null;


    /*
    ------------------------------------------------------
    CICLO FIJO
    ------------------------------------------------------
    */

    if (
        config.cycleTime !== null
        &&
        config.cycleTime !== undefined
        &&
        config.cycleTime !== ""
    ) {

        const value =
            Number(
                String(
                    config.cycleTime
                )
                .replace(
                    ",",
                    "."
                )
            );


        if (
            Number.isFinite(value)
            &&
            value > 0
        ) {

            cycleTime =
                value;

        }

    }


    /*
    ------------------------------------------------------
    INICIO
    ------------------------------------------------------
    */

    if (
        config.startTime !== null
        &&
        config.startTime !== undefined
        &&
        config.startTime !== ""
    ) {

        const value =
            Number(
                String(
                    config.startTime
                )
                .replace(
                    ",",
                    "."
                )
            );


        if (
            Number.isFinite(value)
            &&
            value >= 0
        ) {

            startTime =
                value;

        }

    }


    /*
    ------------------------------------------------------
    FINAL
    ------------------------------------------------------
    */

    if (
        config.endTime !== null
        &&
        config.endTime !== undefined
        &&
        config.endTime !== ""
    ) {

        const value =
            Number(
                String(
                    config.endTime
                )
                .replace(
                    ",",
                    "."
                )
            );


        if (
            Number.isFinite(value)
            &&
            value > 0
        ) {

            endTime =
                value;

        }

    }


    /*
    ------------------------------------------------------
    MODO VÍDEO
    ------------------------------------------------------
    */

    if (
        mode === "video"
    ) {

        return {

            enabled:
                false,

            mode:
                "video",

            cycleTime:
                null,

            startTime:
                null,

            endTime:
                null

        };

    }


    /*
    ------------------------------------------------------
    MODO FIJO
    ------------------------------------------------------
    */

    if (
        mode === "fixed"
    ) {

        if (
            !Number.isFinite(
                cycleTime
            )
            ||
            cycleTime <= 0
        ) {

            return {

                enabled:
                    false,

                mode:
                    "fixed",

                cycleTime:
                    null,

                startTime:
                    null,

                endTime:
                    null

            };

        }


        return {

            enabled:
                config.enabled !== false,

            mode:
                "fixed",

            cycleTime:
                cycleTime,

            startTime:
                null,

            endTime:
                null

        };

    }


    /*
    ------------------------------------------------------
    MODO MANUAL
    ------------------------------------------------------
    */

    if (
        mode === "manual"
    ) {

        if (
            !Number.isFinite(
                startTime
            )
            ||
            !Number.isFinite(
                endTime
            )
            ||
            startTime < 0
            ||
            endTime <= startTime
        ) {

            return {

                enabled:
                    false,

                mode:
                    "manual",

                cycleTime:
                    null,

                startTime:
                    null,

                endTime:
                    null

            };

        }


        return {

            enabled:
                config.enabled !== false,

            mode:
                "manual",

            cycleTime:
                endTime -
                startTime,

            startTime:
                startTime,

            endTime:
                endTime

        };

    }


    return createDefaultCycleConfig();

}


/*
==========================================================
OBTENER CONFIGURACIÓN
==========================================================
*/

function getCycleConfig(
    videoIndex = 0
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(index)
    ) {

        return createDefaultCycleConfig();

    }


    if (
        !CycleConfig.videos[index]
    ) {

        CycleConfig.videos[index] =
            createDefaultCycleConfig();

    }


    const config =
        CycleConfig.videos[index];


    return {

        enabled:
            config.enabled === true,

        mode:
            config.mode,

        cycleTime:
            config.cycleTime,

        startTime:
            config.startTime,

        endTime:
            config.endTime

    };

}


/*
==========================================================
ESTABLECER CONFIGURACIÓN
==========================================================
*/

function setCycleConfig(
    videoIndex,
    config
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(index)
    ) {

        return false;

    }


    const normalized =
        normalizeCycleConfig(
            config
        );


    CycleConfig.videos[index] =
        normalized;


    return true;

}


/*
==========================================================
TODO EL VÍDEO
==========================================================
*/

function setVideoMode(
    videoIndex = 0
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(index)
    ) {

        return false;

    }


    CycleConfig.videos[index] =
        createDefaultCycleConfig();


    return true;

}


/*
==========================================================
CICLO FIJO
==========================================================
*/

function setFixedCycle(
    videoIndex,
    cycleTime
) {

    /*
    Compatibilidad:

        setFixedCycle(cycleTime)

    significa:

        Vídeo 1
    */

    if (
        cycleTime === undefined
    ) {

        cycleTime =
            videoIndex;

        videoIndex =
            0;

    }


    const index =
        Number(
            videoIndex
        );


    const value =
        Number(
            String(
                cycleTime
            )
            .replace(
                ",",
                "."
            )
        );


    if (
        !isValidVideoIndex(index)
        ||
        !Number.isFinite(value)
        ||
        value <= 0
    ) {

        if (
            isValidVideoIndex(index)
        ) {

            setVideoMode(
                index
            );

        }


        return false;

    }


    CycleConfig.videos[index] = {

        enabled:
            true,

        mode:
            "fixed",

        cycleTime:
            value,

        startTime:
            null,

        endTime:
            null

    };


    return true;

}


/*
==========================================================
CICLO MANUAL
==========================================================
*/

function setManualCycle(
    videoIndex,
    startTime,
    endTime
) {

    /*
    Compatibilidad:

        setManualCycle(
            startTime,
            endTime
        )

    significa:

        Vídeo 1
    */

    if (
        endTime === undefined
    ) {

        endTime =
            startTime;

        startTime =
            videoIndex;

        videoIndex =
            0;

    }


    const index =
        Number(
            videoIndex
        );


    const start =
        Number(
            String(
                startTime
            )
            .replace(
                ",",
                "."
            )
        );


    const end =
        Number(
            String(
                endTime
            )
            .replace(
                ",",
                "."
            )
        );


    if (
        !isValidVideoIndex(index)
        ||
        !Number.isFinite(start)
        ||
        !Number.isFinite(end)
        ||
        start < 0
        ||
        end <= start
    ) {

        if (
            isValidVideoIndex(index)
        ) {

            setVideoMode(
                index
            );

        }


        return false;

    }


    CycleConfig.videos[index] = {

        enabled:
            true,

        mode:
            "manual",

        cycleTime:
            end -
            start,

        startTime:
            start,

        endTime:
            end

    };


    return true;

}


/*
==========================================================
COMPATIBILIDAD
==========================================================
*/

function getSelectedCycleConfig(
    videoIndex = 0
) {

    return getCycleConfig(
        videoIndex
    );

}


/*
==========================================================
TODOS LOS CICLOS
==========================================================
*/

function getAllCycleConfigs() {

    const result =
        {};


    Object.keys(
        CycleConfig.videos
    )
    .forEach(
        index => {

            result[index] =
                getCycleConfig(
                    Number(index)
                );

        }
    );


    return result;

}


/*
==========================================================
REINICIAR
==========================================================
*/

function resetCycleConfig(
    videoIndex
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(index)
    ) {

        return false;

    }


    CycleConfig.videos[index] =
        createDefaultCycleConfig();


    return true;

}


/*
==========================================================
SINCRONIZACIÓN
==========================================================
*/

function syncCycleConfig(
    videoIndex,
    config
) {

    return setCycleConfig(
        videoIndex,
        config
    );

}


function syncAllCycleConfigs(
    configs
) {

    if (
        !Array.isArray(configs)
    ) {

        return false;

    }


    configs.forEach(
        (
            config,
            index
        ) => {

            if (
                index < 4
            ) {

                setCycleConfig(
                    index,
                    config
                );

            }

        }
    );


    return true;

}


/*
==========================================================
EXPORTACIÓN NAVEGADOR
==========================================================
*/

window.CycleConfig =
    CycleConfig;

window.createDefaultCycleConfig =
    createDefaultCycleConfig;

window.getCycleConfig =
    getCycleConfig;

window.setCycleConfig =
    setCycleConfig;

window.setVideoMode =
    setVideoMode;

window.setFixedCycle =
    setFixedCycle;

window.setManualCycle =
    setManualCycle;

window.getSelectedCycleConfig =
    getSelectedCycleConfig;

window.getAllCycleConfigs =
    getAllCycleConfigs;

window.resetCycleConfig =
    resetCycleConfig;

window.syncCycleConfig =
    syncCycleConfig;

window.syncAllCycleConfigs =
    syncAllCycleConfigs;


/*
==========================================================
INICIALIZACIÓN
==========================================================
*/

console.log(
    "OCRA Video Analyzer: cycle_config.js cargado correctamente"
);