
"use strict";

/*
=========================================================
OCRA VIDEO ANALYZER
Archivo: biomechanics.js

Responsabilidades:

- Recorrer frames Kinovea.
- Obtener puntos anatómicos.
- Resolver puntos virtuales.
- Calcular ángulos biomecánicos.
- Admitir mediciones de 2 puntos y de 3 puntos.
- Generar resultados.

TIPOS DE MEDICIÓN:

1. DOS PUNTOS
   Para orientación de segmentos:

       A
       |
       |
       B

   Ejemplo:
   - Flexión / extensión de tronco
   - Inclinación lateral de tronco

2. TRES PUNTOS
   Para ángulos articulares:

       A
        \
         B
          \
           C

   Ejemplo:
   - Hombro
   - Codo
   - Muñeca
   - Rodilla
   - Tobillo
   - Cuello

NO realiza:

- clasificación de riesgo
- puntuación OCRA
- interpretación ergonómica

=========================================================
*/


/* =========================================================
   OBTENER PUNTO ANATÓMICO
   ========================================================= */

function getPoint(
    frame,
    name
) {

    if (!frame) {

        return null;

    }


    /*
    ---------------------------------------------------------
    Primero utilizar el mapping de marcadores.

    Esto es especialmente importante porque los nombres
    anatómicos definidos en marker_mapping.js pueden estar
    asociados a marcadores Kinovea con nombres como:

        "Marcador 1"
        "Marcador 2"
        etc.

    Por tanto, para puntos anatómicos reales, el mapping
    debe tener prioridad.
    ---------------------------------------------------------
    */

    if (
        typeof getJointPosition ===
        "function"
    ) {

        const point =
            getJointPosition(
                frame,
                name
            );


        if (point) {

            return point;

        }

    }


    /*
    ---------------------------------------------------------
    Buscar directamente en landmarks.

    Se mantiene como mecanismo de compatibilidad para frames
    que ya contengan directamente nombres anatómicos.
    ---------------------------------------------------------
    */

    if (
        frame.landmarks &&
        frame.landmarks[name]
    ) {

        return frame.landmarks[name];

    }


    /*
    ---------------------------------------------------------
    Puntos virtuales
    ---------------------------------------------------------
    */

    return getVirtualPoint(
        frame,
        name
    );

}


/* =========================================================
   PUNTOS VIRTUALES
   ========================================================= */

function getVirtualPoint(
    frame,
    name
) {

    if (!frame) {

        return null;

    }


    /*
    ---------------------------------------------------------
    CENTRO DE PELVIS
    ---------------------------------------------------------
    */

    if (
        name ===
        "V_HIP_CENTER"
    ) {

        const left =
            getJointPosition(
                frame,
                "left_hip"
            );


        const right =
            getJointPosition(
                frame,
                "right_hip"
            );


        if (
            !left ||
            !right
        ) {

            return null;

        }


        return {

            x:
                (
                    left.x +
                    right.x
                ) / 2,

            y:
                (
                    left.y +
                    right.y
                ) / 2,

            z:
                (
                    (left.z || 0) +
                    (right.z || 0)
                ) / 2

        };

    }


    /*
    ---------------------------------------------------------
    CENTRO DE HOMBROS
    ---------------------------------------------------------
    */

    if (
        name ===
        "V_SHOULDER_CENTER"
    ) {

        const left =
            getJointPosition(
                frame,
                "left_shoulder"
            );


        const right =
            getJointPosition(
                frame,
                "right_shoulder"
            );


        if (
            !left ||
            !right
        ) {

            return null;

        }


        return {

            x:
                (
                    left.x +
                    right.x
                ) / 2,

            y:
                (
                    left.y +
                    right.y
                ) / 2,

            z:
                (
                    (left.z || 0) +
                    (right.z || 0)
                ) / 2

        };

    }


    /*
    ---------------------------------------------------------
    CENTRO DE CABEZA
    ---------------------------------------------------------
    */

    if (
        name ===
        "V_HEAD_CENTER"
    ) {

        const head =
            getJointPosition(
                frame,
                "head"
            );


        if (head) {

            return head;

        }


        const nose =
            getJointPosition(
                frame,
                "nose"
            );


        if (nose) {

            return nose;

        }


        return null;

    }


    /*
    ---------------------------------------------------------
    BASE DEL CUELLO
    ---------------------------------------------------------
    */

    if (
        name ===
        "V_NECK_BASE"
    ) {

        const head =
            getVirtualPoint(
                frame,
                "V_HEAD_CENTER"
            );


        const shoulders =
            getVirtualPoint(
                frame,
                "V_SHOULDER_CENTER"
            );


        if (
            !head ||
            !shoulders
        ) {

            return null;

        }


        return {

            x:
                (
                    head.x +
                    shoulders.x
                ) / 2,

            y:
                (
                    head.y +
                    shoulders.y
                ) / 2,

            z:
                (
                    (head.z || 0) +
                    (shoulders.z || 0)
                ) / 2

        };

    }


    return null;

}


/* =========================================================
   RESOLVER ALIAS DEL CATÁLOGO
   ========================================================= */

function resolvePointName(
    name
) {

    if (
        name ===
        "pelvis"
    ) {

        return "V_HIP_CENTER";

    }


    if (
        name ===
        "shoulder_center"
    ) {

        return "V_SHOULDER_CENTER";

    }


    if (
        name ===
        "neck"
    ) {

        return "V_NECK_BASE";

    }


    return name;

}


/* =========================================================
   CALCULAR ÁNGULO A-B-C
   ========================================================= */

function calculateAngle(
    a,
    b,
    c
) {

    if (
        !a ||
        !b ||
        !c
    ) {

        return {

            value:
                null,

            valid:
                false,

            reason:
                "landmarks_missing"

        };

    }


    if (
        typeof Geometry ===
        "undefined"
    ) {

        return {

            value:
                null,

            valid:
                false,

            reason:
                "geometry_missing"

        };

    }


    if (
        typeof Geometry.angleAtPoint !==
        "function"
    ) {

        return {

            value:
                null,

            valid:
                false,

            reason:
                "geometry_angle_missing"

        };

    }


    return Geometry.angleAtPoint(
        a,
        b,
        c
    );

}


/* =========================================================
   CALCULAR ORIENTACIÓN DE UN SEGMENTO

   Se utilizan únicamente dos puntos:

       A
       |
       |
       B

   El ángulo se calcula respecto a la vertical.

   0°  = segmento vertical
   90° = segmento horizontal

   Esto permite calcular el tronco sin necesitar
   un tercer punto.

   IMPORTANTE:

   En una imagen 2D, el resultado representa la
   orientación del segmento en el plano de la imagen.

   ========================================================= */

function calculateSegmentAngle(
    a,
    b
) {

    if (
        !a ||
        !b
    ) {

        return {

            value:
                null,

            valid:
                false,

            reason:
                "landmarks_missing"

        };

    }


    if (
        typeof a.x !== "number" ||
        typeof a.y !== "number" ||
        typeof b.x !== "number" ||
        typeof b.y !== "number"
    ) {

        return {

            value:
                null,

            valid:
                false,

            reason:
                "invalid_coordinates"

        };

    }


    const dx =
        b.x -
        a.x;


    /*
    En coordenadas de imagen:

    y aumenta hacia abajo.

    Por eso utilizamos:

        -dy

    para representar correctamente
    la dirección vertical.
    */

    const dy =
        -(b.y - a.y);


    const length =
        Math.sqrt(
            (
                dx * dx
            ) +
            (
                dy * dy
            )
        );


    if (
        length === 0
    ) {

        return {

            value:
                null,

            valid:
                false,

            reason:
                "zero_length_segment"

        };

    }


    let angle =
        Math.atan2(
            Math.abs(dx),
            Math.abs(dy)
        ) *
        180 /
        Math.PI;


    /*
    Limitar por seguridad.
    */

    angle =
        Math.max(
            0,
            Math.min(
                90,
                angle
            )
        );


    return {

        value:
            angle,

        valid:
            true,

        reason:
            null

    };

}


/* =========================================================
   CALCULAR MEDICIÓN
   ========================================================= */

function calculateMeasurement(
    frame,
    definition
) {

    if (
        !definition
    ) {

        return {

            value:
                null,

            valid:
                false,

            reason:
                "invalid_definition"

        };

    }


    const landmarks =
        definition.points;


    if (
        !Array.isArray(
            landmarks
        )
    ) {

        return {

            value:
                null,

            valid:
                false,

            reason:
                "invalid_definition"

        };

    }


    /*
    ---------------------------------------------------------
    RESOLVER NOMBRES
    ---------------------------------------------------------
    */

    const pointNames =
        landmarks.map(
            resolvePointName
        );


    /*
    =========================================================
    MEDICIONES DE DOS PUNTOS
    =========================================================
    */

    if (
        pointNames.length === 2
    ) {

        const a =
            getPoint(
                frame,
                pointNames[0]
            );


        const b =
            getPoint(
                frame,
                pointNames[1]
            );


        return calculateSegmentAngle(
            a,
            b
        );

    }


    /*
    =========================================================
    MEDICIONES DE TRES PUNTOS
    =========================================================
    */

    if (
        pointNames.length === 3
    ) {

        const a =
            getPoint(
                frame,
                pointNames[0]
            );


        const b =
            getPoint(
                frame,
                pointNames[1]
            );


        const c =
            getPoint(
                frame,
                pointNames[2]
            );


        return calculateAngle(
            a,
            b,
            c
        );

    }


    /*
    ---------------------------------------------------------
    Número de puntos no soportado
    ---------------------------------------------------------
    */

    return {

        value:
            null,

        valid:
            false,

        reason:
            "unsupported_point_count"

    };

}


/* =========================================================
   ANALIZAR UN FRAME
   ========================================================= */

function analyzeBiomechanicalFrame(
    frame
) {

    const results = [];


    if (
        !frame
    ) {

        return results;

    }


    if (
        typeof BiomechanicalCatalog ===
        "undefined"
    ) {

        console.error(
            "BiomechanicalCatalog no está disponible."
        );

        return results;

    }


    Object.entries(
        BiomechanicalCatalog
    )
    .forEach(
        (
            [
                id,
                definition
            ]
        ) => {

            const measurement = {

                name:
                    id,

                description:
                    definition.name,

                value:
                    null,

                unit:
                    definition.unit ||
                    "deg",

                frame_index:
                    frame.index ??
                    null,

                timestamp:
                    frame.time ??
                    null,

                valid:
                    false,

                reason:
                    null

            };


            const result =
                calculateMeasurement(
                    frame,
                    definition
                );


            measurement.value =
                result.value;


            measurement.valid =
                result.valid;


            measurement.reason =
                result.reason;


            results.push(
                measurement
            );

        }
    );


    return results;

}


/* =========================================================
   ANALIZAR TODOS LOS FRAMES
   ========================================================= */

function analyzeBiomechanics(
    frames
) {

    const measurements = [];


    if (
        !Array.isArray(
            frames
        )
    ) {

        return measurements;

    }


    frames.forEach(
        frame => {

            measurements.push(
                ...analyzeBiomechanicalFrame(
                    frame
                )
            );

        }
    );


    return measurements;

}


/* =========================================================
   EXPORTACIÓN GLOBAL PARA NAVEGADOR

   NO utilizar export/import.
   ========================================================= */

window.Biomechanics = {

    getPoint,

    getVirtualPoint,

    resolvePointName,

    calculateAngle,

    calculateSegmentAngle,

    calculateMeasurement,

    analyzeBiomechanicalFrame,

    analyzeBiomechanics

};


/* =========================================================
   COMPATIBILIDAD GLOBAL
   ========================================================= */

window.getPoint =
    getPoint;

window.getVirtualPoint =
    getVirtualPoint;

window.resolvePointName =
    resolvePointName;

window.calculateAngle =
    calculateAngle;

window.calculateSegmentAngle =
    calculateSegmentAngle;

window.calculateMeasurement =
    calculateMeasurement;

window.analyzeBiomechanicalFrame =
    analyzeBiomechanicalFrame;

window.analyzeBiomechanics =
    analyzeBiomechanics;


/* =========================================================
   CONFIRMACIÓN
   ========================================================= */

console.log(
    "OCRA Video Analyzer: biomechanics.js cargado correctamente"
);
