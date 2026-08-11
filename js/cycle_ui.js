"use strict";

/*
==========================================================
OCRA Video Analyzer v5
Archivo: cycle_ui.js

INTERFAZ DE CONFIGURACIÓN DE CICLOS

Cada vídeo dispone de una configuración independiente:

    1. Todo el vídeo
    2. Ciclo fijo
    3. Ciclo manual

IMPORTANTE:

Este archivo NO es el gestor central.

El gestor central es:

    cycle_config.js

cycle_ui.js solamente:

    - crea la interfaz
    - recoge los valores
    - actualiza cycle_config.js
    - muestra el estado
==========================================================
*/


/*
==========================================================
ESTADO DE LA INTERFAZ
==========================================================
*/

let cycleUIConfigs =
    [];


/*
==========================================================
CONFIGURACIÓN LOCAL DE INTERFAZ
==========================================================
*/

function createUICycleConfig() {

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
 OBTENER CONFIGURACIÓN CENTRAL
==========================================================
*/

function getCentralCycleConfig(
    videoIndex
) {

    if (
        typeof window.getCycleConfig ===
        "function"
    ) {

        return window.getCycleConfig(
            videoIndex
        );

    }


    return createUICycleConfig();

}


/*
==========================================================
GUARDAR CONFIGURACIÓN CENTRAL
==========================================================
*/

function saveCentralCycleConfig(
    videoIndex,
    config
) {

    if (
        typeof window.setCycleConfig ===
        "function"
    ) {

        return window.setCycleConfig(
            videoIndex,
            config
        );

    }


    console.error(
        "cycle_config.js no está cargado."
    );


    return false;

}


/*
==========================================================
INICIALIZAR INTERFAZ
==========================================================
*/

function initializeCycleUI(
    videoCount = 1
) {

    const container =
        document.getElementById(
            "cycleConfiguration"
        );


    if (
        !container
    ) {

        console.error(
            "No existe #cycleConfiguration"
        );

        return;

    }


    let count =
        Number(
            videoCount
        );


    if (
        !Number.isFinite(count)
        ||
        count < 1
    ) {

        count =
            1;

    }


    count =
        Math.min(
            4,
            Math.floor(
                count
            )
        );


    /*
    ------------------------------------------------------
    Conservar configuraciones existentes
    ------------------------------------------------------
    */

    const previousConfigs =
        Array.isArray(
            cycleUIConfigs
        )
            ? cycleUIConfigs
            : [];


    cycleUIConfigs =
        [];


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const centralConfig =
            getCentralCycleConfig(
                i
            );


        const previous =
            previousConfigs[i];


        cycleUIConfigs.push({

            enabled:
                centralConfig
                    ? centralConfig.enabled
                    : (
                        previous
                            ? previous.enabled
                            : false
                    ),

            mode:
                centralConfig
                    ? centralConfig.mode
                    : (
                        previous
                            ? previous.mode
                            : "video"
                    ),

            cycleTime:
                centralConfig
                    ? centralConfig.cycleTime
                    : (
                        previous
                            ? previous.cycleTime
                            : null
                    ),

            startTime:
                centralConfig
                    ? centralConfig.startTime
                    : (
                        previous
                            ? previous.startTime
                            : null
                    ),

            endTime:
                centralConfig
                    ? centralConfig.endTime
                    : (
                        previous
                            ? previous.endTime
                            : null
                    )

        });

    }


    /*
    ------------------------------------------------------
    Crear HTML
    ------------------------------------------------------
    */

    let html = `

        <div class="cycle-config-panel">

            <h2>
                Configuración de ciclos
            </h2>

            <p>
                Seleccione independientemente cómo desea
                analizar cada vídeo.
            </p>

    `;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const config =
            cycleUIConfigs[i];


        const videoNumber =
            i + 1;


        const isVideo =
            config.mode ===
            "video";


        const isFixed =
            config.mode ===
            "fixed";


        const isManual =
            config.mode ===
            "manual";


        const fixedValue =
            Number.isFinite(
                Number(
                    config.cycleTime
                )
            )
                ? config.cycleTime
                : "";


        const startValue =
            Number.isFinite(
                Number(
                    config.startTime
                )
            )
                ? config.startTime
                : "";


        const endValue =
            Number.isFinite(
                Number(
                    config.endTime
                )
            )
                ? config.endTime
                : "";


        html += `

            <div
                class="video-cycle-config"
                data-video-index="${i}"
            >

                <h3>
                    Vídeo ${videoNumber}
                </h3>


                <!-- =================================
                     TODO EL VÍDEO
                     ================================= -->

                <div>

                    <label>

                        <input
                            type="radio"
                            id="cycleModeVideo_${i}"
                            name="cycleMode_${i}"
                            value="video"
                            ${isVideo ? "checked" : ""}
                        >

                        Todo el vídeo

                    </label>

                </div>


                <!-- =================================
                     CICLO FIJO
                     ================================= -->

                <div>

                    <label>

                        <input
                            type="radio"
                            id="cycleModeFixed_${i}"
                            name="cycleMode_${i}"
                            value="fixed"
                            ${isFixed ? "checked" : ""}
                        >

                        Ciclo fijo

                    </label>


                    <input
                        type="number"
                        id="fixedCycleTime_${i}"
                        min="0.001"
                        step="0.001"
                        placeholder="segundos"
                        value="${fixedValue}"
                        ${isFixed ? "" : "disabled"}
                    >

                    <span>
                        segundos
                    </span>

                </div>


                <!-- =================================
                     CICLO MANUAL
                     ================================= -->

                <div>

                    <label>

                        <input
                            type="radio"
                            id="cycleModeManual_${i}"
                            name="cycleMode_${i}"
                            value="manual"
                            ${isManual ? "checked" : ""}
                        >

                        Marcar inicio y fin de ciclo

                    </label>

                </div>


                <div>

                    <label
                        for="manualCycleStart_${i}"
                    >

                        Inicio:

                    </label>


                    <input
                        type="number"
                        id="manualCycleStart_${i}"
                        min="0"
                        step="0.001"
                        placeholder="segundos"
                        value="${startValue}"
                        ${isManual ? "" : "disabled"}
                    >

                    <span>
                        segundos
                    </span>

                </div>


                <div>

                    <label
                        for="manualCycleEnd_${i}"
                    >

                        Final:

                    </label>


                    <input
                        type="number"
                        id="manualCycleEnd_${i}"
                        min="0"
                        step="0.001"
                        placeholder="segundos"
                        value="${endValue}"
                        ${isManual ? "" : "disabled"}
                    >

                    <span>
                        segundos
                    </span>

                </div>


                <!-- =================================
                     ESTADO
                     ================================= -->

                <div
                    id="cycleUIStatus_${i}"
                    class="status"
                >

                    ${getCycleStatusText(config)}

                </div>


            </div>

        `;

    }


    html += `

        </div>

    `;


    container.innerHTML =
        html;


    /*
    ------------------------------------------------------
    Inicializar controles
    ------------------------------------------------------
    */

    for (
        let i = 0;
        i < count;
        i++
    ) {

        initializeVideoCycleControls(
            i
        );

    }

}


/*
==========================================================
ESTADO DE CONFIGURACIÓN
==========================================================
*/

function getCycleStatusText(
    config
) {

    if (
        !config
        ||
        config.mode === "video"
        ||
        config.enabled !== true
    ) {

        if (
            config
            &&
            config.mode ===
                "fixed"
        ) {

            return "Introduzca la duración del ciclo.";

        }


        if (
            config
            &&
            config.mode ===
                "manual"
        ) {

            return "Introduzca inicio y final válidos.";

        }


        return "Análisis de todo el vídeo.";

    }


    if (
        config.mode ===
            "fixed"
    ) {

        return (
            "Ciclo fijo de "
            +
            Number(
                config.cycleTime
            ).toFixed(3)
            +
            " segundos."
        );

    }


    if (
        config.mode ===
            "manual"
    ) {

        return (
            "Ciclo manual: "
            +
            Number(
                config.startTime
            ).toFixed(3)
            +
            " - "
            +
            Number(
                config.endTime
            ).toFixed(3)
            +
            " segundos."
        );

    }


    return "Análisis de todo el vídeo.";

}


/*
==========================================================
CONTROLES DE UN VÍDEO
==========================================================
*/

function initializeVideoCycleControls(
    videoIndex
) {

    const videoRadio =
        document.getElementById(
            `cycleModeVideo_${videoIndex}`
        );


    const fixedRadio =
        document.getElementById(
            `cycleModeFixed_${videoIndex}`
        );


    const manualRadio =
        document.getElementById(
            `cycleModeManual_${videoIndex}`
        );


    const fixedInput =
        document.getElementById(
            `fixedCycleTime_${videoIndex}`
        );


    const startInput =
        document.getElementById(
            `manualCycleStart_${videoIndex}`
        );


    const endInput =
        document.getElementById(
            `manualCycleEnd_${videoIndex}`
        );


    const status =
        document.getElementById(
            `cycleUIStatus_${videoIndex}`
        );


    if (
        !videoRadio
        ||
        !fixedRadio
        ||
        !manualRadio
        ||
        !fixedInput
        ||
        !startInput
        ||
        !endInput
    ) {

        console.error(
            "No se pudieron crear correctamente los controles del ciclo para el vídeo:",
            videoIndex + 1
        );

        return;

    }


    /*
    ======================================================
    ACTUALIZAR
    ======================================================
    */

    function updateControls() {

        const selectedMode =
            document.querySelector(
                `input[name="cycleMode_${videoIndex}"]:checked`
            );


        const mode =
            selectedMode
                ? selectedMode.value
                : "video";


        /*
        ================================================
        TODO EL VÍDEO
        ================================================
        */

        if (
            mode === "video"
        ) {

            fixedInput.disabled =
                true;

            startInput.disabled =
                true;

            endInput.disabled =
                true;


            fixedInput.removeAttribute(
                "aria-invalid"
            );

            startInput.removeAttribute(
                "aria-invalid"
            );

            endInput.removeAttribute(
                "aria-invalid"
            );


            const config = {

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


            cycleUIConfigs[
                videoIndex
            ] =
                config;


            saveCentralCycleConfig(
                videoIndex,
                config
            );


            if (
                status
            ) {

                status.textContent =
                    "Análisis de todo el vídeo.";

            }


            return;

        }


        /*
        ================================================
        CICLO FIJO
        ================================================
        */

        if (
            mode === "fixed"
        ) {

            fixedInput.disabled =
                false;

            startInput.disabled =
                true;

            endInput.disabled =
                true;


            const rawValue =
                String(
                    fixedInput.value ||
                    ""
                )
                .trim()
                .replace(
                    ",",
                    "."
                );


            const value =
                Number(
                    rawValue
                );


            if (
                Number.isFinite(value)
                &&
                value > 0
            ) {

                const config = {

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


                cycleUIConfigs[
                    videoIndex
                ] =
                    config;


                saveCentralCycleConfig(
                    videoIndex,
                    config
                );


                if (
                    status
                ) {

                    status.textContent =
                        "Ciclo fijo de "
                        +
                        value.toFixed(3)
                        +
                        " segundos.";

                }

            }
            else {

                const config = {

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


                cycleUIConfigs[
                    videoIndex
                ] =
                    config;


                saveCentralCycleConfig(
                    videoIndex,
                    config
                );


                if (
                    status
                ) {

                    status.textContent =
                        "Introduzca la duración del ciclo.";

                }

            }


            return;

        }


        /*
        ================================================
        CICLO MANUAL
        ================================================
        */

        if (
            mode === "manual"
        ) {

            fixedInput.disabled =
                true;

            startInput.disabled =
                false;

            endInput.disabled =
                false;


            const rawStart =
                String(
                    startInput.value ||
                    ""
                )
                .trim()
                .replace(
                    ",",
                    "."
                );


            const rawEnd =
                String(
                    endInput.value ||
                    ""
                )
                .trim()
                .replace(
                    ",",
                    "."
                );


            const start =
                Number(
                    rawStart
                );


            const end =
                Number(
                    rawEnd
                );


            if (
                Number.isFinite(start)
                &&
                Number.isFinite(end)
                &&
                start >= 0
                &&
                end > start
            ) {

                const config = {

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


                cycleUIConfigs[
                    videoIndex
                ] =
                    config;


                saveCentralCycleConfig(
                    videoIndex,
                    config
                );


                if (
                    status
                ) {

                    status.textContent =
                        "Ciclo manual: "
                        +
                        start.toFixed(3)
                        +
                        " - "
                        +
                        end.toFixed(3)
                        +
                        " segundos.";

                }

            }
            else {

                const config = {

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


                cycleUIConfigs[
                    videoIndex
                ] =
                    config;


                saveCentralCycleConfig(
                    videoIndex,
                    config
                );


                if (
                    status
                ) {

                    status.textContent =
                        "Introduzca inicio y final válidos.";

                }

            }

        }

    }


    /*
    ======================================================
    CAMBIO DE MODO
    ======================================================
    */

    videoRadio.addEventListener(
        "change",
        updateControls
    );


    fixedRadio.addEventListener(
        "change",
        updateControls
    );


    manualRadio.addEventListener(
        "change",
        updateControls
    );


    /*
    ======================================================
    CAMBIO CICLO FIJO
    ======================================================
    */

    fixedInput.addEventListener(
        "input",
        () => {

            if (
                fixedRadio.checked
            ) {

                updateControls();

            }

        }
    );


    /*
    ======================================================
    CAMBIO INICIO MANUAL
    ======================================================
    */

    startInput.addEventListener(
        "input",
        () => {

            if (
                manualRadio.checked
            ) {

                updateControls();

            }

        }
    );


    /*
    ======================================================
    CAMBIO FINAL MANUAL
    ======================================================
    */

    endInput.addEventListener(
        "input",
        () => {

            if (
                manualRadio.checked
            ) {

                updateControls();

            }

        }
    );


    /*
    ======================================================
    ESTADO INICIAL
    ======================================================
    */

    const existingConfig =
        getCentralCycleConfig(
            videoIndex
        );


    if (
        existingConfig
    ) {

        cycleUIConfigs[
            videoIndex
        ] =
            {

                enabled:
                    existingConfig.enabled,

                mode:
                    existingConfig.mode,

                cycleTime:
                    existingConfig.cycleTime,

                startTime:
                    existingConfig.startTime,

                endTime:
                    existingConfig.endTime

            };

    }


    /*
    Importante:

    Aquí NO se fuerza "video".

    Se conserva la configuración
    correspondiente a este vídeo.
    */

    applyVisualState(
        videoIndex
    );

}


/*
==========================================================
ACTUALIZAR ESTADO VISUAL SIN GUARDAR
==========================================================
*/

function applyVisualState(
    videoIndex
) {

    const videoRadio =
        document.getElementById(
            `cycleModeVideo_${videoIndex}`
        );


    const fixedRadio =
        document.getElementById(
            `cycleModeFixed_${videoIndex}`
        );


    const manualRadio =
        document.getElementById(
            `cycleModeManual_${videoIndex}`
        );


    const fixedInput =
        document.getElementById(
            `fixedCycleTime_${videoIndex}`
        );


    const startInput =
        document.getElementById(
            `manualCycleStart_${videoIndex}`
        );


    const endInput =
        document.getElementById(
            `manualCycleEnd_${videoIndex}`
        );


    const status =
        document.getElementById(
            `cycleUIStatus_${videoIndex}`
        );


    if (
        !videoRadio
        ||
        !fixedRadio
        ||
        !manualRadio
        ||
        !fixedInput
        ||
        !startInput
        ||
        !endInput
    ) {

        return;

    }


    const config =
        cycleUIConfigs[
            videoIndex
        ]
        ||
        createUICycleConfig();


    videoRadio.checked =
        config.mode ===
        "video";


    fixedRadio.checked =
        config.mode ===
        "fixed";


    manualRadio.checked =
        config.mode ===
        "manual";


    fixedInput.disabled =
        config.mode !==
        "fixed";


    startInput.disabled =
        config.mode !==
        "manual";


    endInput.disabled =
        config.mode !==
        "manual";


    if (
        config.cycleTime !== null
        &&
        config.cycleTime !== undefined
    ) {

        fixedInput.value =
            config.cycleTime;

    }


    if (
        config.startTime !== null
        &&
        config.startTime !== undefined
    ) {

        startInput.value =
            config.startTime;

    }


    if (
        config.endTime !== null
        &&
        config.endTime !== undefined
    ) {

        endInput.value =
            config.endTime;

    }


    if (
        status
    ) {

        status.textContent =
            getCycleStatusText(
                config
            );

    }

}


/*
==========================================================
OBTENER CONFIGURACIÓN DE UN VÍDEO
==========================================================

Esta función NO vuelve a definir el gestor.

Simplemente delega en cycle_config.js.
==========================================================
*/

function getSelectedCycleConfig(
    videoIndex = 0
) {

    return getCentralCycleConfig(
        videoIndex
    );

}


/*
==========================================================
OBTENER TODAS
==========================================================
*/

function getSelectedCycleConfigs() {

    const configs =
        [];


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        configs.push(
            getCentralCycleConfig(
                i
            )
        );

    }


    return configs;

}


/*
==========================================================
CAMBIAR NÚMERO DE VÍDEOS
==========================================================
*/

function setCycleUIVideoCount(
    videoCount
) {

    initializeCycleUI(
        videoCount
    );

}


/*
==========================================================
EXPORTACIÓN

IMPORTANTE:

No se sobrescribe:

    window.getSelectedCycleConfig

La función central pertenece a cycle_config.js.

Aquí únicamente se exportan las funciones propias
de la interfaz.
==========================================================
*/

window.initializeCycleUI =
    initializeCycleUI;

window.getSelectedCycleConfigs =
    getSelectedCycleConfigs;

window.setCycleUIVideoCount =
    setCycleUIVideoCount;


/*
==========================================================
INICIALIZACIÓN
==========================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
        -----------------------------------------------
        Inicialmente un vídeo.

        app.js lo cambiará al seleccionar
        2, 3 o 4.
        -----------------------------------------------
        */

        initializeCycleUI(
            1
        );

    }
);


console.log(
    "OCRA Video Analyzer: cycle_ui.js cargado correctamente"
);