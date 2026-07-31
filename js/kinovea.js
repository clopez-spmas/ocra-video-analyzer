"use strict";

/*
=========================================================
Kinovea JSON Provider
=========================================================

Responsabilidad:

- Leer el JSON exportado por Kinovea.
- Detectar automáticamente la estructura.
- Obtener la lista de frames.
- Calcular información básica del archivo.

NO realiza cálculos biomecánicos.
NO calcula OCRA.
NO cuenta movimientos.

*/

const Kinovea = {

    parse(json) {

        let frames = [];

        // Formato 1
        if (Array.isArray(json)) {

            frames = json;

        }

        // Formato 2
        else if (json.Frames && Array.isArray(json.Frames)) {

            frames = json.Frames;

        }

        // Formato 3
        else if (json.frames && Array.isArray(json.frames)) {

            frames = json.frames;

        }

        else {

            throw new Error("Formato JSON de Kinovea no reconocido.");

        }

        return {

            frames: frames,

            frameCount: frames.length,

            landmarkCount: this.countLandmarks(frames)

        };

    },

    countLandmarks(frames) {

        let total = 0;

        for (const frame of frames) {

            const points =
                frame.Points ||
                frame.points ||
                frame.Landmarks ||
                frame.landmarks ||
                [];

            total += points.length;

        }

        return total;

    }

};
