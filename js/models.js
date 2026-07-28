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

        /* Ángulos */

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

        /* IA */

        this.ai = {

            detected: data.ai?.detected ?? false,

            confidence: data.ai?.confidence ?? 0,

            model: data.ai?.model ?? "",

            validated: data.ai?.validated ?? false

        };

        /* Usuario */

        this.notes = data.notes ?? "";

    }

}

/* ==========================================================
   SESSION
========================================================== */

export class Session {

    constructor() {

        this.analyst = "";

        this.company = "";

        this.workstation = "";

        this.task = "";

        this.worker = "";

        this.date = new Date();

        this.comments = "";

    }

}

/* ==========================================================
   VIDEO
========================================================== */

export class VideoInfo {

    constructor() {

        this.name = "";

        this.duration = 0;

        this.fps = 25;

        this.width = 0;

        this.height = 0;

        this.currentFrame = 0;

        this.currentTime = 0;

    }

}

/* ==========================================================
   ANALYSIS
========================================================== */

export class Analysis {

    constructor() {

        this.actions = [];

        this.ocraIndex = 0;

        this.ocraClass = "";

        this.frequency = 0;

        this.force = 0;

        this.posture = 0;

        this.recovery = 0;

    }

}

/* ==========================================================
   PROJECT
========================================================== */

export class Project {

    constructor() {

        this.version = "5.0";

        this.created = new Date();

        this.session = new Session();

        this.video = new VideoInfo();

        this.analysis = new Analysis();

    }

}
