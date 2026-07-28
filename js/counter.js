/**
 * ==========================================================
 * OCRA Video Analyzer v5
 * Archivo: state.js
 * Estado global de la aplicación
 * ==========================================================
 */

'use strict';

import { DEFAULT_STATE } from "./config.js";
import { clone } from "./utils.js";

class AppState {

    constructor() {

        this.reset();

    }

    /* ======================================================
       ESTADO
    ====================================================== */

    reset() {

        this.data = clone(DEFAULT_STATE);

    }

    get() {

        return this.data;

    }

    set(path, value) {

        const keys = path.split(".");

        let obj = this.data;

        while (keys.length > 1) {

            obj = obj[keys.shift()];

        }

        obj[keys[0]] = value;

    }

    value(path) {

        return path.split(".").reduce((o, key) => o[key], this.data);

    }

    /* ======================================================
       CONTADORES
    ====================================================== */

    addAction(side, action) {

        this.data.counters[side].push(action);

    }

    removeAction(side, id) {

        this.data.counters[side] =
            this.data.counters[side].filter(a => a.id !== id);

    }

    clearCounters() {

        this.data.counters.right = [];

        this.data.counters.left = [];

    }

    /* ======================================================
       SESIÓN
    ====================================================== */

    setSession(data) {

        Object.assign(this.data.session, data);

    }

    /* ======================================================
       IMPORTACIÓN / EXPORTACIÓN
    ====================================================== */

    export() {

        return clone(this.data);

    }

    import(data) {

        this.data = clone(data);

    }

}

export const appState = new AppState();
