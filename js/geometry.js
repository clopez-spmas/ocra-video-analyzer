"use strict";

/*
=========================================================
OCRA Video Analyzer

Geometry Engine

Responsabilidades:
- Operaciones vectoriales 3D.
- Cálculo de ángulos articulares.
- Equivalente JavaScript de:
    ocra/geometry/vector.py
    ocra/geometry/angles.py

Los puntos recibidos deben tener formato:

{
    x: Number,
    y: Number,
    z: Number (opcional)
}

=========================================================
*/


/*
=========================================================
Crear vector entre dos puntos

Resultado:
B - A

=========================================================
*/

function vectorBetween(a, b) {

    if (!a || !b) {

        return null;

    }


    return {

        x: b.x - a.x,

        y: b.y - a.y,

        z: (b.z ?? 0) - (a.z ?? 0)

    };

}







/*
=========================================================
Producto escalar

=========================================================
*/

function dotProduct(a, b) {

    if (!a || !b) {

        return null;

    }


    return (

        a.x * b.x +

        a.y * b.y +

        a.z * b.z

    );

}







/*
=========================================================
Módulo del vector

=========================================================
*/

function vectorLength(v) {

    if (!v) {

        return null;

    }


    return Math.sqrt(

        v.x * v.x +

        v.y * v.y +

        v.z * v.z

    );

}







/*
=========================================================
Normalizar vector

=========================================================
*/

function normalizeVector(v) {

    const length =
        vectorLength(v);


    if (!length || length === 0) {

        return null;

    }


    return {

        x: v.x / length,

        y: v.y / length,

        z: v.z / length

    };

}







/*
=========================================================
Ángulo entre dos vectores

Resultado en grados

=========================================================
*/

function angleBetweenVectors(a, b) {

    if (!a || !b) {

        return null;

    }


    const lengthA =
        vectorLength(a);


    const lengthB =
        vectorLength(b);



    if (
        !lengthA ||
        !lengthB
    ) {

        return null;

    }



    let cosAngle =
        dotProduct(a, b) /
        (
            lengthA *
            lengthB
        );



    /*
    Evita errores numéricos:
    acos(1.00000001)
    */


    cosAngle =
        Math.max(
            -1,
            Math.min(
                1,
                cosAngle
            )
        );



    return (

        Math.acos(cosAngle)
        *
        180
        /
        Math.PI

    );

}







/*
=========================================================
Ángulo articular ABC

Ejemplo:

Hombro ---- Codo ---- Muñeca


A = hombro
B = codo
C = muñeca


=========================================================
*/

function angleAtPoint(a, b, c) {


    if (
        !a ||
        !b ||
        !c
    ) {

        return {

            value: null,

            valid: false,

            reason:
                "landmarks_missing"

        };

    }



    const ba =
        vectorBetween(
            b,
            a
        );


    const bc =
        vectorBetween(
            b,
            c
        );



    const angle =
        angleBetweenVectors(
            ba,
            bc
        );



    if (angle === null) {

        return {

            value: null,

            valid: false,

            reason:
                "calculation_error"

        };

    }



    return {

        value:
            angle,

        valid:
            true,

        reason:
            null

    };


}







/*
=========================================================
Distancia entre puntos

=========================================================
*/

function distanceBetween(a, b) {

    const vector =
        vectorBetween(
            a,
            b
        );


    return vectorLength(
        vector
    );

}







/*
=========================================================
Exportación global

Necesario porque los scripts
se cargan directamente en HTML

=========================================================
*/

window.Geometry = {


    vectorBetween,

    dotProduct,

    vectorLength,

    normalizeVector,

    angleBetweenVectors,

    angleAtPoint,

    distanceBetween


};
