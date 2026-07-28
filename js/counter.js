/**
 * ==========================================================
 * OCRA Video Analyzer v5
 * Archivo: counter.js
 * Gestión de acciones técnicas
 * ==========================================================
 */

'use strict';

import { appState } from "./state.js";
import { uuid } from "./utils.js";

export class CounterManager {

    constructor(videoController) {

        this.video = videoController;

    }

    /* ======================================================
       CREAR ACCIÓN
    ====================================================== */

    add(side, data = {}) {

        const action = {

            id: uuid(),

            side,

            frame: this.video.currentFrame,

            time: this.video.currentTime,

            type: data.type || "technical",

            class: data.class || "",

            force: data.force || 0,

            posture: data.posture || 0,

            recovery: data.recovery || 0,

            notes: data.notes || "",

            created: Date.now()

        };

        appState.addAction(side, action);

        return action;

    }

    /* ======================================================
       ELIMINAR
    ====================================================== */

    remove(side, id) {

        appState.removeAction(side, id);

    }

    /* ======================================================
       EDITAR
    ====================================================== */

    update(side, id, values) {

        const list = appState.value(`counters.${side}`);

        const action = list.find(a => a.id === id);

        if (!action)
            return false;

        Object.assign(action, values);

        return true;

    }

    /* ======================================================
       OBTENER
    ====================================================== */

    get(side) {

        return appState.value(`counters.${side}`);

    }

    getAll() {

        return [

            ...this.get("right"),

            ...this.get("left")

        ].sort((a, b) => a.frame - b.frame);

    }

    /* ======================================================
       BUSCAR
    ====================================================== */

    find(id) {

        return this.getAll().find(a => a.id === id);

    }

    /* ======================================================
       ESTADÍSTICAS
    ====================================================== */

    count(side = null) {

        if (!side)

            return this.getAll().length;

        return this.get(side).length;

    }

    countByClass(classification) {

        return this.getAll()

            .filter(a => a.class === classification)

            .length;

    }

    countByType(type) {

        return this.getAll()

            .filter(a => a.type === type)

            .length;

    }

    /* ======================================================
       HISTORIAL
    ====================================================== */

    history() {

        return this.getAll();

    }

    /* ======================================================
       LIMPIAR
    ====================================================== */

    clear() {

        appState.clearCounters();

    }

    /* ======================================================
       EXPORTACIÓN
    ====================================================== */

    export() {

        return {

            right: this.get("right"),

            left: this.get("left")

        };

    }

    import(data) {

        appState.set("counters.right", data.right || []);

        appState.set("counters.left", data.left || []);

    }

    /* ======================================================
       RESUMEN
    ====================================================== */

    summary() {

        return {

            total: this.count(),

            right: this.count("right"),

            left: this.count("left"),

            technical: this.countByType("technical"),

            force: this.countByType("force"),

            posture: this.countByType("posture"),

            recovery: this.countByType("recovery")

        };

    }

}
