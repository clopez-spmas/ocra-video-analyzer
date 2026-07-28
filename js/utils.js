/**
 * ==========================================================
 * OCRA Video Analyzer v5
 * Archivo: utils.js
 * Funciones auxiliares reutilizables
 * ==========================================================
 */

'use strict';

/* ==========================================================
   FECHA Y HORA
========================================================== */

export function now() {
    return new Date();
}

export function timestamp() {
    return Date.now();
}

export function formatDate(date = new Date()) {

    return date.toLocaleDateString("es-ES") + " " +
           date.toLocaleTimeString("es-ES");

}

/* ==========================================================
   TIEMPO
========================================================== */

export function formatTime(seconds = 0) {

    const hrs = Math.floor(seconds / 3600);

    const min = Math.floor((seconds % 3600) / 60);

    const sec = Math.floor(seconds % 60);

    return [
        hrs.toString().padStart(2, "0"),
        min.toString().padStart(2, "0"),
        sec.toString().padStart(2, "0")
    ].join(":");

}

export function secondsToFrames(seconds, fps) {

    return Math.round(seconds * fps);

}

export function framesToSeconds(frames, fps) {

    return frames / fps;

}

/* ==========================================================
   UUID
========================================================== */

export function uuid() {

    return crypto.randomUUID();

}

/* ==========================================================
   NÚMEROS
========================================================== */

export function clamp(value, min, max) {

    return Math.min(Math.max(value, min), max);

}

export function round(value, decimals = 2) {

    return Number(value.toFixed(decimals));

}

/* ==========================================================
   VALIDACIONES
========================================================== */

export function isNumber(value) {

    return !isNaN(value);

}

export function isEmpty(value) {

    return value === null ||
           value === undefined ||
           value === "";

}

export function exists(value) {

    return value !== undefined &&
           value !== null;

}

/* ==========================================================
   DOM
========================================================== */

export function $(selector) {

    return document.querySelector(selector);

}

export function $$(selector) {

    return document.querySelectorAll(selector);

}

export function create(tag, className = "") {

    const el = document.createElement(tag);

    if (className)
        el.className = className;

    return el;

}

/* ==========================================================
   EVENTOS
========================================================== */

export function on(element, event, callback) {

    element.addEventListener(event, callback);

}

export function off(element, event, callback) {

    element.removeEventListener(event, callback);

}

/* ==========================================================
   DEBOUNCE
========================================================== */

export function debounce(fn, delay = 250) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            fn(...args);

        }, delay);

    };

}

/* ==========================================================
   THROTTLE
========================================================== */

export function throttle(fn, delay = 100) {

    let wait = false;

    return (...args) => {

        if (wait)
            return;

        fn(...args);

        wait = true;

        setTimeout(() => {

            wait = false;

        }, delay);

    };

}

/* ==========================================================
   DESCARGAS
========================================================== */

export function download(filename, content, type = "text/plain") {

    const blob = new Blob([content], { type });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = filename;

    a.click();

    URL.revokeObjectURL(url);

}

/* ==========================================================
   LOCAL STORAGE
========================================================== */

export function save(key, value) {

    localStorage.setItem(key, JSON.stringify(value));

}

export function load(key, defaultValue = null) {

    const data = localStorage.getItem(key);

    if (!data)
        return defaultValue;

    return JSON.parse(data);

}

export function remove(key) {

    localStorage.removeItem(key);

}

/* ==========================================================
   COPIA PROFUNDA
========================================================== */

export function clone(obj) {

    return structuredClone(obj);

}

/* ==========================================================
   LOG
========================================================== */

export function log(...args) {

    console.log("[OCRA]", ...args);

}

export function warn(...args) {

    console.warn("[OCRA]", ...args);

}

export function error(...args) {

    console.error("[OCRA]", ...args);

}
