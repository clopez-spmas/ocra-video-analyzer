"use strict";

/*
==========================================================
OCRA Video Analyzer v5
Archivo: utils.js
Utilidades generales
==========================================================
*/


/* ==========================================================
   CONVERSIÓN NUMÉRICA
   ========================================================== */

/**
 * Convierte un valor a número de forma segura.
 *
 * Devuelve null cuando el valor no es numérico.
 */
function toNumber(value, fallback = null) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return fallback;

    }


    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return fallback;

    }


    return number;

}



/* ==========================================================
   NÚMERO SEGURO
   ========================================================== */

/**
 * Devuelve un número válido.
 */
function safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return fallback;

    }


    return number;

}



/* ==========================================================
   REDONDEO
   ========================================================== */

/**
 * Redondea un número a los decimales indicados.
 */
function roundNumber(
    value,
    decimals = 2
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return null;

    }


    const factor =
        Math.pow(
            10,
            decimals
        );


    return (
        Math.round(
            number * factor
        ) / factor
    );

}



/* ==========================================================
   LIMITAR VALOR
   ========================================================== */

function clamp(
    value,
    min,
    max
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return min;

    }


    return Math.min(
        max,
        Math.max(
            min,
            number
        )
    );

}



/* ==========================================================
   COMPROBAR NÚMERO
   ========================================================== */

function isNumber(value) {

    return (
        typeof value === "number" &&
        Number.isFinite(value)
    );

}



/* ==========================================================
   COMPROBAR OBJETO
   ========================================================== */

function isObject(value) {

    return (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
    );

}



/* ==========================================================
   COMPROBAR ARRAY
   ========================================================== */

function isArray(value) {

    return Array.isArray(value);

}



/* ==========================================================
   VALOR POR DEFECTO
   ========================================================== */

function defaultValue(
    value,
    fallback
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return fallback;

    }


    return value;

}



/* ==========================================================
   COPIA PROFUNDA
   ========================================================== */

function deepClone(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return value;

    }


    try {

        return JSON.parse(
            JSON.stringify(value)
        );

    } catch (error) {

        console.error(
            "Error realizando deepClone:",
            error
        );

        return value;

    }

}



/* ==========================================================
   FORMATEAR TIEMPO
   ========================================================== */

/**
 * Convierte segundos a HH:MM:SS.mmm
 */
function formatTime(
    seconds
) {

    const value =
        Number(seconds);


    if (
        !Number.isFinite(value) ||
        value < 0
    ) {

        return "00:00:00.000";

    }


    const hours =
        Math.floor(
            value / 3600
        );


    const minutes =
        Math.floor(
            (
                value % 3600
            ) / 60
        );


    const secs =
        value % 60;


    return (

        String(hours)
            .padStart(2, "0")

        + ":" +

        String(minutes)
            .padStart(2, "0")

        + ":" +

        secs
            .toFixed(3)
            .padStart(6, "0")

    );

}



/* ==========================================================
   FORMATEAR SEGUNDOS SIMPLES
   ========================================================== */

function formatSeconds(
    seconds,
    decimals = 3
) {

    const value =
        Number(seconds);


    if (
        !Number.isFinite(value)
    ) {

        return "0";

    }


    return value.toFixed(
        decimals
    );

}



/* ==========================================================
   PORCENTAJE
   ========================================================== */

function percentage(
    value,
    total
) {

    const v =
        Number(value);

    const t =
        Number(total);


    if (
        !Number.isFinite(v) ||
        !Number.isFinite(t) ||
        t === 0
    ) {

        return 0;

    }


    return (
        v / t
    ) * 100;

}



/* ==========================================================
   FORMATEAR PORCENTAJE
   ========================================================== */

function formatPercentage(
    value,
    decimals = 2
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0.00 %";

    }


    return (
        number.toFixed(
            decimals
        )
        + " %"
    );

}



/* ==========================================================
   SUMA ARRAY
   ========================================================== */

function sumArray(
    values
) {

    if (
        !Array.isArray(values)
    ) {

        return 0;

    }


    return values.reduce(
        (
            total,
            value
        ) => {

            const number =
                Number(value);


            if (
                !Number.isFinite(number)
            ) {

                return total;

            }


            return total + number;

        },
        0
    );

}



/* ==========================================================
   MEDIA ARRAY
   ========================================================== */

function averageArray(
    values
) {

    if (
        !Array.isArray(values) ||
        values.length === 0
    ) {

        return null;

    }


    const validValues =
        values.filter(
            value =>
                Number.isFinite(
                    Number(value)
                )
        )
        .map(
            value =>
                Number(value)
        );


    if (
        validValues.length === 0
    ) {

        return null;

    }


    return (
        sumArray(
            validValues
        ) /
        validValues.length
    );

}



/* ==========================================================
   MÁXIMO ARRAY
   ========================================================== */

function maxArray(
    values
) {

    if (
        !Array.isArray(values)
    ) {

        return null;

    }


    const validValues =
        values.filter(
            value =>
                Number.isFinite(
                    Number(value)
                )
        )
        .map(
            value =>
                Number(value)
        );


    if (
        validValues.length === 0
    ) {

        return null;

    }


    return Math.max(
        ...validValues
    );

}



/* ==========================================================
   MÍNIMO ARRAY
   ========================================================== */

function minArray(
    values
) {

    if (
        !Array.isArray(values)
    ) {

        return null;

    }


    const validValues =
        values.filter(
            value =>
                Number.isFinite(
                    Number(value)
                )
        )
        .map(
            value =>
                Number(value)
        );


    if (
        validValues.length === 0
    ) {

        return null;

    }


    return Math.min(
        ...validValues
    );

}



/* ==========================================================
   GENERAR ID
   ========================================================== */

function generateId(
    prefix = "id"
) {

    let randomPart;


    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {

        randomPart =
            crypto.randomUUID();

    } else {

        randomPart =
            Date.now()
            .toString(36)
            +
            "-"
            +
            Math.random()
                .toString(36)
                .substring(2);

    }


    return (
        prefix +
        "-" +
        randomPart
    );

}



/* ==========================================================
   LOG
   ========================================================== */

function logInfo(
    ...args
) {

    console.log(
        "[OCRA]",
        ...args
    );

}



/* ==========================================================
   ADVERTENCIA
   ========================================================== */

function logWarning(
    ...args
) {

    console.warn(
        "[OCRA]",
        ...args
    );

}



/* ==========================================================
   ERROR
   ========================================================== */

function logError(
    ...args
) {

    console.error(
        "[OCRA]",
        ...args
    );

}



/* ==========================================================
   EXPORTACIÓN GLOBAL
   ==========================================================

   IMPORTANTE:
   Este proyecto carga los archivos mediante <script>.
   Por tanto NO utilizamos export/import.
   ========================================================== */

window.toNumber =
    toNumber;

window.safeNumber =
    safeNumber;

window.roundNumber =
    roundNumber;

window.clamp =
    clamp;

window.isNumber =
    isNumber;

window.isObject =
    isObject;

window.isArray =
    isArray;

window.defaultValue =
    defaultValue;

window.deepClone =
    deepClone;

window.formatTime =
    formatTime;

window.formatSeconds =
    formatSeconds;

window.percentage =
    percentage;

window.formatPercentage =
    formatPercentage;

window.sumArray =
    sumArray;

window.averageArray =
    averageArray;

window.maxArray =
    maxArray;

window.minArray =
    minArray;

window.generateId =
    generateId;

window.logInfo =
    logInfo;

window.logWarning =
    logWarning;

window.logError =
    logError;


/* ==========================================================
   OBJETO GLOBAL DE UTILIDADES
   ========================================================== */

window.OCRAUtils = {

    toNumber,
    safeNumber,
    roundNumber,
    clamp,
    isNumber,
    isObject,
    isArray,
    defaultValue,
    deepClone,
    formatTime,
    formatSeconds,
    percentage,
    formatPercentage,
    sumArray,
    averageArray,
    maxArray,
    minArray,
    generateId,
    logInfo,
    logWarning,
    logError

};


console.log(
    "OCRA Video Analyzer: utils.js cargado correctamente"
);