/**
 * ==========================================================
 * OCRA Video Analyzer v5
 * Archivo: config.js
 * Configuración global de la aplicación
 * ==========================================================
 */

export const APP_CONFIG = {

    APP_NAME: "OCRA Video Analyzer",

    VERSION: "5.0.0",

    AUTOR: "Casandra + ChatGPT",

    DEBUG: false,

    AUTOSAVE: true,

    AUTOSAVE_INTERVAL: 30000

};


/* ==========================================================
   VIDEO
========================================================== */

export const VIDEO_CONFIG = {

    DEFAULT_SPEED: 1,

    MIN_SPEED: 0.25,

    MAX_SPEED: 4,

    SPEED_STEP: 0.25,

    FRAME_STEP: 1,

    SEEK_SMALL: 1,

    SEEK_MEDIUM: 5,

    SEEK_LARGE: 10

};


/* ==========================================================
   ATAJOS DE TECLADO
========================================================== */

export const KEYBOARD = {

    PLAY_PAUSE: "Space",

    NEXT_FRAME: "ArrowRight",

    PREVIOUS_FRAME: "ArrowLeft",

    FORWARD_5: "KeyD",

    BACKWARD_5: "KeyA",

    FORWARD_10: "KeyF",

    BACKWARD_10: "KeyS"

};


/* ==========================================================
   LADOS
========================================================== */

export const SIDE = {

    RIGHT: "right",

    LEFT: "left"

};


/* ==========================================================
   TIPOS DE ACCIONES
========================================================== */

export const ACTION_TYPES = [

    {

        id: "technical",

        name: "Acción Técnica",

        color: "#1976d2"

    },

    {

        id: "force",

        name: "Fuerza",

        color: "#e53935"

    },

    {

        id: "posture",

        name: "Postura",

        color: "#fb8c00"

    },

    {

        id: "recovery",

        name: "Recuperación",

        color: "#43a047"

    }

];


/* ==========================================================
   CLASIFICACIÓN OCRA
========================================================== */

export const OCRA_CLASSES = [

    "AGARRAR",

    "COGER",

    "SOLTAR",

    "COLOCAR",

    "EMPUJAR",

    "TIRAR",

    "GIRAR",

    "PRESIONAR",

    "PALANCA",

    "TRANSPORTAR",

    "OTRA"

];


/* ==========================================================
   ESTADO INICIAL
========================================================== */

export const DEFAULT_STATE = {

    video: {

        loaded: false,

        duration: 0,

        fps: 25,

        currentFrame: 0,

        currentTime: 0,

        playbackRate: 1

    },

    counters: {

        right: [],

        left: []

    },

    session: {

        analyst: "",

        company: "",

        workstation: "",

        task: "",

        observations: ""

    }

};


/* ==========================================================
   COLORES
========================================================== */

export const COLORS = {

    primary: "#1565C0",

    secondary: "#00897B",

    success: "#43A047",

    warning: "#F9A825",

    danger: "#E53935",

    background: "#F4F6F8",

    panel: "#FFFFFF",

    border: "#DADCE0"

};


/* ==========================================================
   EXPORTACIÓN
========================================================== */

export const EXPORT_CONFIG = {

    EXCEL_FILENAME: "OCRA_Analysis",

    JSON_FILENAME: "OCRA_Project",

    CSV_SEPARATOR: ";"

};


/* ==========================================================
   MENSAJES
========================================================== */

export const MESSAGES = {

    VIDEO_REQUIRED: "Debe cargar un vídeo.",

    PROJECT_SAVED: "Proyecto guardado.",

    PROJECT_LOADED: "Proyecto cargado.",

    EXPORT_OK: "Exportación completada.",

    EXPORT_ERROR: "No se pudo exportar."

};
