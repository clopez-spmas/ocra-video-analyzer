"use strict";

/*
=========================================================
OCRA Video Analyzer
Marker Assignment
=========================================================

Responsabilidades:
- Gestionar la asignación entre los marcadores de Kinovea
  y los puntos anatómicos.
- Validar que un marcador no pueda asignarse dos veces.
- Permitir conocer qué marcador corresponde a cada punto.

No contiene interfaz gráfica.
No depende de Kinovea.
No realiza cálculos biomecánicos.

=========================================================
*/

class MarkerAssignment {

    constructor(markerCount) {

        this.markerCount = markerCount;

        this.mapping = {};

    }

    //-----------------------------------------------------
    // Asignar un marcador a un punto anatómico
    //-----------------------------------------------------

    assign(landmarkId, markerNumber) {

        if (
            markerNumber !== null &&
            markerNumber !== undefined &&
            markerNumber !== ""
        ) {

            markerNumber = Number(markerNumber);

            if (
                markerNumber < 1 ||
                markerNumber > this.markerCount
            ) {

                throw new Error(
                    "Número de marcador no válido."
                );

            }

        }

        this.mapping[landmarkId] = markerNumber;

    }

    //-----------------------------------------------------
    // Obtener marcador asociado
    //-----------------------------------------------------

    getMarker(landmarkId) {

        if (!(landmarkId in this.mapping)) {

            return null;

        }

        return this.mapping[landmarkId];

    }

    //-----------------------------------------------------
    // Eliminar asignación
    //-----------------------------------------------------

    remove(landmarkId) {

        delete this.mapping[landmarkId];

    }

    //-----------------------------------------------------
    // Comprobar si un marcador ya está utilizado
    //-----------------------------------------------------

    isMarkerAssigned(markerNumber) {

        return Object.values(this.mapping)
            .includes(markerNumber);

    }

    //-----------------------------------------------------
    // Validación
    //-----------------------------------------------------

    validate() {

        const used = new Set();

        for (const landmarkId in this.mapping) {

            const marker =
                this.mapping[landmarkId];

            if (
                marker === null ||
                marker === undefined ||
                marker === ""
            ) {

                continue;

            }

            if (used.has(marker)) {

                return {

                    valid: false,

                    message:
                        "El marcador "
                        + marker
                        + " está asignado más de una vez."

                };

            }

            used.add(marker);

        }

        return {

            valid: true,

            message: ""

        };

    }

    //-----------------------------------------------------
    // Obtener todas las asignaciones
    //-----------------------------------------------------

    getAssignments() {

        return { ...this.mapping };

    }

}
