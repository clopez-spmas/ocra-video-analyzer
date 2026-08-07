"use strict";

/*
=========================================================
OCRA Video Analyzer
Kinovea JSON Provider
=========================================================

Responsabilidades:

- Leer el JSON exportado por Kinovea.
- Detectar automáticamente la estructura.
- Obtener la lista de frames.
- Calcular información básica del archivo.
- Detectar automáticamente los marcadores existentes.

NO realiza cálculos biomecánicos.
NO calcula OCRA.
NO cuenta movimientos.

=========================================================
*/

const Kinovea = {

    //-----------------------------------------------------
    // Obtener lista de frames
    //-----------------------------------------------------

    getFrames(json) {

        // Formato 1

        if (Array.isArray(json)) {

            return json;

        }

        // Formato 2

        if (
            json.Frames &&
            Array.isArray(json.Frames)
        ) {

            return json.Frames;

        }

        // Formato 3

        if (
            json.frames &&
            Array.isArray(json.frames)
        ) {

            return json.frames;

        }

        throw new Error(
            "Formato JSON de Kinovea no reconocido."
        );

    },

    //-----------------------------------------------------
    // Analizar JSON
    //-----------------------------------------------------

    parse(json) {

        const frames =
            this.getFrames(json);

        return {

            frames: frames,

            frameCount:
                frames.length,

            landmarkCount:
                this.countLandmarks(frames),

            markerCount:
                this.getMarkerCount(json),

            markers:
                this.getMarkers(json)

        };

    },

    //-----------------------------------------------------
    // Contar landmarks
    //-----------------------------------------------------

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

    },

    //-----------------------------------------------------
    // Obtener lista de marcadores
    //-----------------------------------------------------

    getMarkers(json) {

        const frames =
            this.getFrames(json);

        const markers =
            new Map();

        for (const frame of frames) {

            const points =
                frame.Points ||
                frame.points ||
                frame.Landmarks ||
                frame.landmarks ||
                [];

            points.forEach((point, index) => {

                const id =
                    point.id ??
                    point.ID ??
                    point.name ??
                    point.Name ??
                    ("Marcador " + (index + 1));

                if (!markers.has(id)) {

                    markers.set(id, {

                        id: id,

                        name:
                            typeof id === "string"
                                ? id
                                : "Marcador " + id,

                        frames: 1

                    });

                }
                else {

                    markers.get(id).frames++;

                }

            });

        }

        return Array.from(markers.values());

    },

    //-----------------------------------------------------
    // Número de marcadores
    //-----------------------------------------------------

    getMarkerCount(json) {

        return this.getMarkers(json).length;

    }

};
