"use strict";

/*
=========================================================
OCRA VIDEO ANALYZER
Archivo: markerMapping.js

VERSIÓN:
12 VÍDEOS + TABLA MAESTRA ANATÓMICA

RESPONSABILIDADES
---------------------------------------------------------
- Definir los puntos anatómicos disponibles.
- Mantener un mapping independiente para cada vídeo.
- Relacionar marcadores Kinovea con puntos anatómicos.
- Obtener coordenadas de un punto anatómico.
- Crear la interfaz de asignación.
- Validar cada mapping.
- Permitir trabajar con 1 a 12 vídeos.
- Preparar los landmarks necesarios para:
    · Tronco
    · Cuello
    · Cabeza
    · Hombros
    · Codos
    · Antebrazos
    · Muñecas
    · Caderas
    · Rodillas
    · Tobillos
    · Pies

IMPORTANTE
---------------------------------------------------------
NO utiliza import/export.

Se carga mediante index.html antes de app.js.

Cada vídeo conserva su propio mapping:

mapping[0]  → Vídeo 1
mapping[1]  → Vídeo 2
...
mapping[11] → Vídeo 12
=========================================================
*/


/* =====================================================
   CONFIGURACIÓN
   ===================================================== */

const MARKER_MAPPING_MAX_VIDEOS = 12;


/* =====================================================
   PUNTOS ANATÓMICOS
   =====================================================

   Estos son los puntos que estarán disponibles en la
   interfaz de asignación.

   NO es obligatorio asignarlos todos.

   El usuario solamente asignará los marcadores que
   realmente existan en cada vídeo.

   La disponibilidad de determinados cálculos dependerá
   posteriormente de los puntos necesarios y del plano
   de grabación.
   ===================================================== */

const anatomicalPoints = {


    /* =================================================
       CABEZA
       ================================================= */

    head:
        "Cabeza",

    head_front:
        "Punto anterior de cabeza",

    head_back:
        "Punto posterior de cabeza",


    /* =================================================
       OREJAS / REFERENCIAS LATERALES DE CABEZA
       ================================================= */

    right_ear:
        "Oreja derecha",

    left_ear:
        "Oreja izquierda",


    /* =================================================
       CUELLO
       ================================================= */

    neck:
        "Cuello",

    neck_base:
        "Base del cuello / C7",


    /* =================================================
       HOMBROS
       ================================================= */

    right_shoulder:
        "Hombro derecho",

    left_shoulder:
        "Hombro izquierdo",


    /* =================================================
       CODOS
       ================================================= */

    right_elbow:
        "Codo derecho",

    left_elbow:
        "Codo izquierdo",


    /* =================================================
       MUÑECAS
       ================================================= */

    right_wrist:
        "Muñeca derecha",

    left_wrist:
        "Muñeca izquierda",


    /* =================================================
       MANOS / ÍNDICES
       ================================================= */

    right_index:
        "Índice derecho",

    left_index:
        "Índice izquierdo",


    /* =================================================
       PELVIS
       ================================================= */

    pelvis:
        "Pelvis",


    /* =================================================
       CADERAS
       ================================================= */

    right_hip:
        "Cadera derecha",

    left_hip:
        "Cadera izquierda",


    /* =================================================
       RODILLAS
       ================================================= */

    right_knee:
        "Rodilla derecha",

    left_knee:
        "Rodilla izquierda",


    /* =================================================
       TOBILLOS
       ================================================= */

    right_ankle:
        "Tobillo derecho",

    left_ankle:
        "Tobillo izquierdo",


    /* =================================================
       PIES
       ================================================= */

    right_foot:
        "Pie derecho",

    left_foot:
        "Pie izquierdo"

};


/* =====================================================
   CREAR MAPPING VACÍO
   ===================================================== */

function createEmptyMarkerMapping() {

    const mapping = {};


    Object.keys(
        anatomicalPoints
    ).forEach(
        key => {

            mapping[key] =
                null;

        }
    );


    return mapping;
}


/* =====================================================
   MAPPINGS INDEPENDIENTES

   markerMappings[0]  → Vídeo 1
   markerMappings[1]  → Vídeo 2
   markerMappings[2]  → Vídeo 3
   markerMappings[3]  → Vídeo 4
   markerMappings[4]  → Vídeo 5
   markerMappings[5]  → Vídeo 6
   markerMappings[6]  → Vídeo 7
   markerMappings[7]  → Vídeo 8
   markerMappings[8]  → Vídeo 9
   markerMappings[9]  → Vídeo 10
   markerMappings[10] → Vídeo 11
   markerMappings[11] → Vídeo 12
   ===================================================== */

const markerMappings = [];


for (
    let i = 0;
    i < MARKER_MAPPING_MAX_VIDEOS;
    i++
) {

    markerMappings.push(
        createEmptyMarkerMapping()
    );

}


/* =====================================================
   COMPATIBILIDAD CON CÓDIGO ANTIGUO
   ===================================================== */

let markerMapping =
    markerMappings[0];


/* =====================================================
   VALIDAR ÍNDICE DE VÍDEO
   ===================================================== */

function isValidVideoIndex(
    videoIndex
) {

    const index =
        Number(
            videoIndex
        );


    return (
        Number.isInteger(
            index
        )
        &&
        index >= 0
        &&
        index < MARKER_MAPPING_MAX_VIDEOS
    );

}


/* =====================================================
   OBTENER MAPPING
   ===================================================== */

function getMarkerMapping(
    videoIndex = 0
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        return null;

    }


    return {
        ...markerMappings[index]
    };

}


/* =====================================================
   RESTABLECER UN MAPPING
   ===================================================== */

function resetMarkerMapping(
    videoIndex = 0
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        return false;

    }


    markerMappings[index] =
        createEmptyMarkerMapping();


    if (
        index === 0
    ) {

        markerMapping =
            markerMappings[0];

    }


    return true;

}


/* =====================================================
   RESTABLECER TODOS LOS MAPPINGS
   ===================================================== */

function resetAllMarkerMappings() {

    for (
        let i = 0;
        i < MARKER_MAPPING_MAX_VIDEOS;
        i++
    ) {

        markerMappings[i] =
            createEmptyMarkerMapping();

    }


    markerMapping =
        markerMappings[0];


    return true;

}


/* =====================================================
   CARGAR MAPPING
   ===================================================== */

function loadMarkerMapping(
    mapping,
    videoIndex = 0
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        return null;

    }


    resetMarkerMapping(
        index
    );


    if (
        !mapping
        ||
        typeof mapping !==
            "object"
    ) {

        return getMarkerMapping(
            index
        );

    }


    Object.keys(
        anatomicalPoints
    ).forEach(
        joint => {

            if (
                !Object.prototype.hasOwnProperty.call(
                    mapping,
                    joint
                )
            ) {

                return;

            }


            const value =
                mapping[joint];


            if (
                value === null
                ||
                value === undefined
            ) {

                return;

            }


            const normalizedValue =
                String(
                    value
                ).trim();


            if (
                normalizedValue === ""
            ) {

                return;

            }


            markerMappings[index][joint] =
                normalizedValue;

        }
    );


    if (
        index === 0
    ) {

        markerMapping =
            markerMappings[0];

    }


    return getMarkerMapping(
        index
    );

}


/* =====================================================
   GUARDAR MAPPING
   ===================================================== */

function saveMarkerMapping(
    videoIndex = 0
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        return null;

    }


    return {
        ...markerMappings[index]
    };

}


/* =====================================================
   ASIGNAR MARCADOR A PUNTO ANATÓMICO
   ===================================================== */

function mapMarkerToJoint(
    joint,
    markerName,
    videoIndex = 0
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        throw new Error(
            "Índice de vídeo no válido: " +
            videoIndex
        );

    }


    if (
        !Object.prototype.hasOwnProperty.call(
            anatomicalPoints,
            joint
        )
    ) {

        throw new Error(
            "Punto anatómico no válido: " +
            joint
        );

    }


    const mapping =
        markerMappings[index];


    let normalizedMarker =
        null;


    if (
        markerName !== null
        &&
        markerName !== undefined
    ) {

        normalizedMarker =
            String(
                markerName
            ).trim();


        if (
            normalizedMarker === ""
        ) {

            normalizedMarker =
                null;

        }

    }


    /*
    -----------------------------------------------------
    UN MARCADOR NO PUEDE ESTAR ASIGNADO A DOS PUNTOS
    DENTRO DEL MISMO VÍDEO
    -----------------------------------------------------
    */

    Object.keys(
        mapping
    ).forEach(
        existingJoint => {

            if (
                existingJoint !== joint
                &&
                normalizedMarker !== null
                &&
                mapping[existingJoint] ===
                    normalizedMarker
            ) {

                mapping[existingJoint] =
                    null;

            }

        }
    );


    mapping[joint] =
        normalizedMarker;


    if (
        index === 0
    ) {

        markerMapping =
            markerMappings[0];

    }


    return saveMarkerMapping(
        index
    );

}


/* =====================================================
   OBTENER POSICIÓN DE UN PUNTO ANATÓMICO
   ===================================================== */

function getJointPosition(
    frame,
    joint,
    videoIndex = 0
) {

    if (
        !frame
        ||
        !joint
    ) {

        return null;

    }


    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        return null;

    }


    if (
        !Object.prototype.hasOwnProperty.call(
            anatomicalPoints,
            joint
        )
    ) {

        return null;

    }


    const mapping =
        markerMappings[index];


    if (!mapping) {

        return null;

    }


    const markerName =
        mapping[joint];


    if (
        markerName === null
        ||
        markerName === undefined
        ||
        String(
            markerName
        ).trim() === ""
    ) {

        return null;

    }


    /*
    -----------------------------------------------------
    BUSCAR LANDMARKS
    -----------------------------------------------------
    */

    const landmarks =
        frame.landmarks;


    if (
        !landmarks
        ||
        typeof landmarks !==
            "object"
    ) {

        return null;

    }


    /*
    -----------------------------------------------------
    BUSCAR MARCADOR
    -----------------------------------------------------
    */

    const point =
        landmarks[markerName];


    if (!point) {

        return null;

    }


    /*
    -----------------------------------------------------
    VALIDAR COORDENADAS
    -----------------------------------------------------
    */

    const x =
        Number(
            point.x
        );


    const y =
        Number(
            point.y
        );


    if (
        !Number.isFinite(x)
        ||
        !Number.isFinite(y)
    ) {

        return null;

    }


    return {
        x: x,
        y: y
    };

}


/* =====================================================
   OBTENER TODAS LAS POSICIONES ANATÓMICAS
   =====================================================

   Función auxiliar para los módulos biomecánicos.

   Devuelve únicamente los puntos que existen realmente
   en el frame.
   ===================================================== */

function getAllJointPositions(
    frame,
    videoIndex = 0
) {

    const positions = {};


    Object.keys(
        anatomicalPoints
    ).forEach(
        joint => {

            const position =
                getJointPosition(
                    frame,
                    joint,
                    videoIndex
                );


            if (
                position
            ) {

                positions[joint] =
                    position;

            }

        }
    );


    return positions;

}


/* =====================================================
   ACTUALIZAR MAPPING DESDE SELECT
   ===================================================== */

function updateMarkerMapping(
    select,
    videoIndex = 0
) {

    if (!select) {

        return;

    }


    const marker =
        select.dataset.marker;


    if (
        marker === undefined
        ||
        marker === null
        ||
        String(
            marker
        ).trim() === ""
    ) {

        return;

    }


    const joint =
        select.value;


    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        return;

    }


    /*
    -----------------------------------------------------
    NO ASIGNAR
    -----------------------------------------------------
    */

    if (!joint) {

        const mapping =
            markerMappings[index];


        Object.keys(
            mapping
        ).forEach(
            key => {

                if (
                    mapping[key] ===
                    marker
                ) {

                    mapping[key] =
                        null;

                }

            }
        );


        updateMappingSelects(
            index
        );


        return;

    }


    /*
    -----------------------------------------------------
    ASIGNAR
    -----------------------------------------------------
    */

    mapMarkerToJoint(
        joint,
        marker,
        index
    );


    updateMappingSelects(
        index
    );

}


/* =====================================================
   ACTUALIZAR SELECTS
   ===================================================== */

function updateMappingSelects(
    videoIndex
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        return;

    }


    const target =
        document.getElementById(
            "markerMappingContainer"
        );


    if (!target) {

        return;

    }


    const mapping =
        markerMappings[index];


    if (!mapping) {

        return;

    }


    const selects =
        target.querySelectorAll(
            `.marker-joint-select[data-video-index="${index}"]`
        );


    selects.forEach(
        select => {

            const marker =
                select.dataset.marker;


            let assignedJoint =
                "";


            Object.keys(
                mapping
            ).forEach(
                joint => {

                    if (
                        mapping[joint] ===
                        marker
                    ) {

                        assignedJoint =
                            joint;

                    }

                }
            );


            select.value =
                assignedJoint;

        }
    );

}


/* =====================================================
   VALIDAR MAPPING
   ===================================================== */

function validateMarkerMapping(
    videoIndex = 0
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        return {

            valid:
                false,

            assigned:
                0

        };

    }


    const mapping =
        markerMappings[index];


    const assignedMarkers =
        Object.values(
            mapping
        ).filter(
            value =>
                value !== null
                &&
                value !== undefined
                &&
                String(
                    value
                ).trim() !== ""
        );


    return {

        valid:
            assignedMarkers.length > 0,

        assigned:
            assignedMarkers.length

    };

}


/* =====================================================
   VALIDAR TODOS LOS VÍDEOS
   ===================================================== */

function validateAllMarkerMappings(
    videoCount
) {

    const count =
        Number(
            videoCount
        );


    const results = [];


    if (
        !Number.isInteger(
            count
        )
        ||
        count < 1
        ||
        count >
            MARKER_MAPPING_MAX_VIDEOS
    ) {

        return results;

    }


    for (
        let i = 0;
        i < count;
        i++
    ) {

        results.push({

            videoIndex:
                i,

            videoNumber:
                i + 1,

            ...validateMarkerMapping(
                i
            )

        });

    }


    return results;

}


/* =====================================================
   ESCAPAR TEXTO HTML
   ===================================================== */

function escapeMarkerText(
    value
) {

    return String(
        value
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* =====================================================
   ESCAPAR ATRIBUTOS
   ===================================================== */

function escapeAttribute(
    value
) {

    return escapeMarkerText(
        value
    );

}


/* =====================================================
   OBTENER NOMBRE DEL MARCADOR
   ===================================================== */

function getMarkerName(
    marker
) {

    if (
        marker === null
        ||
        marker === undefined
    ) {

        return "";

    }


    if (
        typeof marker === "string"
        ||
        typeof marker === "number"
    ) {

        return String(
            marker
        ).trim();

    }


    if (
        typeof marker === "object"
    ) {

        const candidates = [

            marker.name,

            marker.label,

            marker.id,

            marker.markerName,

            marker.title

        ];


        for (
            const candidate of
            candidates
        ) {

            if (
                candidate !== null
                &&
                candidate !== undefined
                &&
                String(
                    candidate
                ).trim() !== ""
            ) {

                return String(
                    candidate
                ).trim();

            }

        }

    }


    return "";

}


/* =====================================================
   CREAR SECCIÓN DE UN VÍDEO
   ===================================================== */

function createMarkerMappingSection(
    markers,
    videoIndex
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        return "";

    }


    if (
        !Array.isArray(
            markers
        )
    ) {

        return "";

    }


    let html = `

        <div
            class="marker-mapping-dialog"
            data-video-index="${index}"
        >

            <h3>
                Vídeo ${index + 1}
            </h3>

            <p>
                Seleccione qué marcador Kinovea
                corresponde a cada punto anatómico.
            </p>

            <p>
                No es necesario asignar todos los puntos.
                Seleccione únicamente los marcadores que
                haya colocado en este vídeo.
            </p>

    `;


    /*
    -----------------------------------------------------
    SIN MARCADORES
    -----------------------------------------------------
    */

    if (
        markers.length === 0
    ) {

        html += `

            <p>
                Este vídeo no contiene marcadores.
            </p>

        `;


        html += `

        </div>

        `;


        return html;

    }


    /*
    -----------------------------------------------------
    MARCADORES
    -----------------------------------------------------
    */

    markers.forEach(
        marker => {

            const markerName =
                getMarkerName(
                    marker
                );


            if (
                !markerName
            ) {

                return;

            }


            html += `

                <div class="marker-row">

                    <label>
                        ${escapeMarkerText(
                            markerName
                        )}
                    </label>

                    <select
                        data-marker="${escapeAttribute(
                            markerName
                        )}"
                        data-video-index="${index}"
                        class="marker-joint-select"
                    >

                        <option value="">
                            -- no asignar --
                        </option>

            `;


            /*
            -------------------------------------------------
            AGRUPAR LOS PUNTOS POR REGIÓN
            -------------------------------------------------
            */

            const groups = [

                {
                    label:
                        "Cabeza y cuello",

                    keys: [

                        "head",

                        "head_front",

                        "head_back",

                        "right_ear",

                        "left_ear",

                        "neck",

                        "neck_base"

                    ]

                },


                {
                    label:
                        "Hombros",

                    keys: [

                        "right_shoulder",

                        "left_shoulder"

                    ]

                },


                {
                    label:
                        "Codos",

                    keys: [

                        "right_elbow",

                        "left_elbow"

                    ]

                },


                {
                    label:
                        "Muñecas",

                    keys: [

                        "right_wrist",

                        "left_wrist"

                    ]

                },


                {
                    label:
                        "Manos",

                    keys: [

                        "right_index",

                        "left_index"

                    ]

                },


                {
                    label:
                        "Tronco y pelvis",

                    keys: [

                        "pelvis",

                        "right_hip",

                        "left_hip"

                    ]

                },


                {
                    label:
                        "Rodillas",

                    keys: [

                        "right_knee",

                        "left_knee"

                    ]

                },


                {
                    label:
                        "Tobillos",

                    keys: [

                        "right_ankle",

                        "left_ankle"

                    ]

                },


                {
                    label:
                        "Pies",

                    keys: [

                        "right_foot",

                        "left_foot"

                    ]

                }

            ];


            groups.forEach(
                group => {

                    html += `

                        <optgroup
                            label="${escapeAttribute(
                                group.label
                            )}"
                        >

                    `;


                    group.keys.forEach(
                        key => {

                            if (
                                !Object.prototype.hasOwnProperty.call(
                                    anatomicalPoints,
                                    key
                                )
                            ) {

                                return;

                            }


                            html += `

                                <option
                                    value="${escapeAttribute(
                                        key
                                    )}"
                                >
                                    ${escapeMarkerText(
                                        anatomicalPoints[key]
                                    )}
                                </option>

                            `;

                        }
                    );


                    html += `

                        </optgroup>

                    `;

                }
            );


            html += `

                    </select>

                </div>

            `;

        }
    );


    html += `

        </div>

    `;


    return html;

}


/* =====================================================
   CREAR INTERFAZ DE TODOS LOS VÍDEOS
   ===================================================== */

function createAllMarkerMappingUI(
    videoMarkers
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {


            console.log(
                "===== createAllMarkerMappingUI() ====="
            );


            /*
            -------------------------------------------------
            CONTENEDOR
            -------------------------------------------------
            */

            const container =
                document.getElementById(
                    "markerMappingContainer"
                );


            if (!container) {

                reject(
                    new Error(
                        "No existe #markerMappingContainer en index.html."
                    )
                );

                return;

            }


            /*
            -------------------------------------------------
            VALIDAR DATOS
            -------------------------------------------------
            */

            if (
                !Array.isArray(
                    videoMarkers
                )
            ) {

                reject(
                    new Error(
                        "Lista de marcadores de vídeos inválida."
                    )
                );

                return;

            }


            if (
                videoMarkers.length < 1
                ||
                videoMarkers.length >
                    MARKER_MAPPING_MAX_VIDEOS
            ) {

                reject(
                    new Error(
                        "El número de vídeos debe estar entre 1 y 12."
                    )
                );

                return;

            }


            /*
            -------------------------------------------------
            RESTABLECER MAPPINGS
            -------------------------------------------------
            */

            resetAllMarkerMappings();


            /*
            -------------------------------------------------
            CONSTRUIR INTERFAZ
            -------------------------------------------------
            */

            let html = `

                <div class="all-marker-mapping">

                    <h3>
                        Asignación de marcadores
                    </h3>

                    <p>
                        Configure cada vídeo de forma
                        independiente.
                    </p>

                    <p>
                        Los marcadores de cada vídeo
                        solamente se utilizarán para
                        calcular ese vídeo.
                    </p>

            `;


            videoMarkers.forEach(
                (
                    markers,
                    videoIndex
                ) => {

                    html +=
                        createMarkerMappingSection(
                            markers,
                            videoIndex
                        );

                }
            );


            html += `

                    <div class="mapping-buttons">

                        <button
                            id="cancelAllMappingButton"
                            type="button"
                        >
                            Cancelar
                        </button>

                        <button
                            id="confirmAllMappingButton"
                            type="button"
                        >
                            Confirmar marcadores
                        </button>

                    </div>

                </div>

            `;


            container.innerHTML =
                html;


            /*
            -------------------------------------------------
            SELECTS
            -------------------------------------------------
            */

            const selects =
                container.querySelectorAll(
                    ".marker-joint-select"
                );


            selects.forEach(
                select => {

                    select.addEventListener(
                        "change",
                        function () {

                            updateMarkerMapping(
                                this,
                                Number(
                                    this.dataset.videoIndex
                                )
                            );

                        }
                    );

                }
            );


            /*
            -------------------------------------------------
            CANCELAR
            -------------------------------------------------
            */

            const cancelButton =
                document.getElementById(
                    "cancelAllMappingButton"
                );


            if (cancelButton) {

                cancelButton.addEventListener(
                    "click",
                    () => {

                        resetAllMarkerMappings();


                        container.innerHTML =
                            "";


                        reject(
                            new Error(
                                "Asignación de marcadores cancelada."
                            )
                        );

                    }
                );

            }


            /*
            -------------------------------------------------
            CONFIRMAR
            -------------------------------------------------
            */

            const confirmButton =
                document.getElementById(
                    "confirmAllMappingButton"
                );


            if (confirmButton) {

                confirmButton.addEventListener(
                    "click",
                    () => {


                        const validations =
                            validateAllMarkerMappings(
                                videoMarkers.length
                            );


                        const invalidVideos =
                            validations.filter(
                                item =>
                                    !item.valid
                            );


                        if (
                            invalidVideos.length > 0
                        ) {

                            const videoNumbers =
                                invalidVideos
                                    .map(
                                        item =>
                                            `Vídeo ${item.videoNumber}`
                                    )
                                    .join(
                                        ", "
                                    );


                            alert(
                                "Debe asignar al menos un marcador en: " +
                                videoNumbers +
                                "."
                            );


                            return;

                        }


                        /*
                        -------------------------------------
                        COPIA INDEPENDIENTE
                        -------------------------------------
                        */

                        const mappings = [];


                        for (
                            let i = 0;
                            i < videoMarkers.length;
                            i++
                        ) {

                            mappings.push(
                                saveMarkerMapping(
                                    i
                                )
                            );

                        }


                        console.log(
                            "Mappings finales:",
                            mappings
                        );


                        /*
                        -------------------------------------
                        LIMPIAR INTERFAZ
                        -------------------------------------
                        */

                        container.innerHTML =
                            "";


                        /*
                        -------------------------------------
                        DEVOLVER RESULTADOS
                        -------------------------------------
                        */

                        resolve(
                            mappings
                        );

                    }
                );

            }

        }
    );

}


/* =====================================================
   INTERFAZ DE UN SOLO VÍDEO
   ===================================================== */

function createMarkerMappingUI(
    markers,
    videoIndex = 0
) {

    const index =
        Number(
            videoIndex
        );


    if (
        !isValidVideoIndex(
            index
        )
    ) {

        return Promise.reject(
            new Error(
                "Índice de vídeo no válido."
            )
        );

    }


    resetMarkerMapping(
        index
    );


    return new Promise(
        (
            resolve,
            reject
        ) => {


            const container =
                document.getElementById(
                    "markerMappingContainer"
                );


            if (!container) {

                reject(
                    new Error(
                        "No existe #markerMappingContainer en index.html."
                    )
                );

                return;

            }


            if (
                !Array.isArray(
                    markers
                )
            ) {

                reject(
                    new Error(
                        "Lista de marcadores inválida."
                    )
                );

                return;

            }


            let html =
                createMarkerMappingSection(
                    markers,
                    index
                );


            html += `

                <div class="mapping-buttons">

                    <button
                        id="cancelMappingButton"
                        type="button"
                    >
                        Cancelar
                    </button>

                    <button
                        id="confirmMappingButton"
                        type="button"
                    >
                        Analizar
                    </button>

                </div>

            `;


            container.innerHTML =
                html;


            /*
            -------------------------------------------------
            SELECTS
            -------------------------------------------------
            */

            const selects =
                container.querySelectorAll(
                    ".marker-joint-select"
                );


            selects.forEach(
                select => {

                    select.addEventListener(
                        "change",
                        function () {

                            updateMarkerMapping(
                                this,
                                index
                            );

                        }
                    );

                }
            );


            /*
            -------------------------------------------------
            CANCELAR
            -------------------------------------------------
            */

            const cancelButton =
                document.getElementById(
                    "cancelMappingButton"
                );


            if (cancelButton) {

                cancelButton.addEventListener(
                    "click",
                    () => {

                        resetMarkerMapping(
                            index
                        );


                        container.innerHTML =
                            "";


                        reject(
                            new Error(
                                "Asignación cancelada."
                            )
                        );

                    }
                );

            }


            /*
            -------------------------------------------------
            CONFIRMAR
            -------------------------------------------------
            */

            const confirmButton =
                document.getElementById(
                    "confirmMappingButton"
                );


            if (confirmButton) {

                confirmButton.addEventListener(
                    "click",
                    () => {


                        const validation =
                            validateMarkerMapping(
                                index
                            );


                        if (
                            !validation.valid
                        ) {

                            alert(
                                `Debe asignar al menos un marcador en el Vídeo ${index + 1}.`
                            );


                            return;

                        }


                        const mapping =
                            saveMarkerMapping(
                                index
                            );


                        container.innerHTML =
                            "";


                        resolve(
                            mapping
                        );

                    }
                );

            }

        }
    );

}


/* =====================================================
   EXPORTACIÓN GLOBAL
   ===================================================== */

window.MarkerMapping = {

    anatomicalPoints,

    markerMappings,

    getMarkerMapping,

    loadMarkerMapping,

    saveMarkerMapping,

    resetMarkerMapping,

    resetAllMarkerMappings,

    mapMarkerToJoint,

    getJointPosition,

    getAllJointPositions,

    createMarkerMappingUI,

    createAllMarkerMappingUI,

    updateMarkerMapping,

    validateMarkerMapping,

    validateAllMarkerMappings

};


/* =====================================================
   FUNCIONES GLOBALES
   ===================================================== */

window.anatomicalPoints =
    anatomicalPoints;


window.markerMappings =
    markerMappings;


window.getMarkerMapping =
    getMarkerMapping;


window.saveMarkerMapping =
    saveMarkerMapping;


window.loadMarkerMapping =
    loadMarkerMapping;


window.resetMarkerMapping =
    resetMarkerMapping;


window.resetAllMarkerMappings =
    resetAllMarkerMappings;


window.mapMarkerToJoint =
    mapMarkerToJoint;


window.getJointPosition =
    getJointPosition;


window.getAllJointPositions =
    getAllJointPositions;


window.createMarkerMappingUI =
    createMarkerMappingUI;


window.createAllMarkerMappingUI =
    createAllMarkerMappingUI;


window.updateMarkerMapping =
    updateMarkerMapping;


window.validateMarkerMapping =
    validateMarkerMapping;


window.validateAllMarkerMappings =
    validateAllMarkerMappings;


/* =====================================================
   INFORMACIÓN GLOBAL
   ===================================================== */

window.MARKER_MAPPING_MAX_VIDEOS =
    MARKER_MAPPING_MAX_VIDEOS;


/* =====================================================
   COMPROBACIÓN FINAL
   ===================================================== */

console.log(
    "OCRA Video Analyzer: markerMapping.js cargado correctamente"
);


console.log(
    "createAllMarkerMappingUI disponible:",
    typeof window.createAllMarkerMappingUI ===
        "function"
);


console.log(
    "getAllJointPositions disponible:",
    typeof window.getAllJointPositions ===
        "function"
);


console.log(
    "Número máximo de vídeos:",
    MARKER_MAPPING_MAX_VIDEOS
);


console.log(
    "Puntos anatómicos disponibles:",
    Object.keys(
        anatomicalPoints
    ).length
);