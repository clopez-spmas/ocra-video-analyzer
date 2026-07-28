/**
 * ==========================================================
 * OCRA Video Analyzer v5
 * Archivo: models.js
 * Modelos de datos
 * ==========================================================
 */

'use strict';

/* ==========================================================
   ACTION
========================================================== */

export class Action {

    constructor(data = {}) {

        /* Identificación */

        this.id = data.id ?? crypto.randomUUID();
        this.created = data.created ?? Date.now();

        /* Localización */

        this.side = data.side ?? "right";
        this.hand = data.hand ?? this.side;
        this.finger = data.finger ?? null;

        /* Vídeo */

        this.frame = data.frame ?? 0;
        this.time = data.time ?? 0;
        this.duration = data.duration ?? 0;

        this.cycle = data.cycle ?? 1;
        this.phase = data.phase ?? "";

        /* Acción */

        this.type = data.type ?? "technical";
        this.classification = data.classification ?? "";
        this.description = data.description ?? "";

        /* Factores OCRA */

        this.force = data.force ?? 0;
        this.posture = data.posture ?? 0;
        this.recovery = data.recovery ?? 0;
        this.frequency = data.frequency ?? 0;
        this.riskFactor = data.riskFactor ?? 0;

        /* Ángulos articulares */

        this.shoulder = {
            right: data.shoulder?.right ?? null,
            left: data.shoulder?.left ?? null
        };

        this.elbow = {
            right: data.elbow?.right ?? null,
            left: data.elbow?.left ?? null
        };

        this.wrist = {
            right: data.wrist?.right ?? null,
            left: data.wrist?.left ?? null
        };

        this.trunk = data.trunk ?? null;
        this.neck = data.neck ?? null;

        /* Información IA */

        this.ai = {

            detected: data.ai?.detected ?? false,
            confidence: data.ai?.confidence ?? 0,
            model: data.ai?.model ?? "",
            validated: data.ai?.validated ?? false

        };

        /* Observaciones */

        this.notes = data.notes ?? "";

    }

}

/* ==========================================================
   SESSION
========================================================== */

export class Session {

    constructor(data = {}) {

        this.analyst = data.analyst ?? "";
        this.company = data.company ?? "";
        this.workstation = data.workstation ?? "";
        this.task = data.task ?? "";
        this.date = data.date ?? new Date().toISOString();
        this.comments = data.comments ?? "";

    }

}

/* ==========================================================
   VIDEO
========================================================== */

export class VideoInfo {

    constructor(data = {}) {

        this.name = data.name ?? "";
        this.file = data.file ?? "";
        this.duration = data.duration ?? 0;
        this.fps = data.fps ?? 25;
        this.width = data.width ?? 0;
        this.height = data.height ?? 0;

    }

}

/* ==========================================================
   PROJECT
========================================================== */

export class Project {

    constructor() {

        this.version = "5.0.0";

        this.created = new Date().toISOString();

        this.session = new Session();

        this.video = new VideoInfo();

        this.actions = [];

        this.results = {

            totalActions: 0,

            rightActions: 0,

            leftActions: 0,

            frequencyFactor: 0,

            forceFactor: 0,

            postureFactor: 0,

            recoveryFactor: 0,

            ocraIndex: 0,

            ocraClass: ""

        };

    }

}
