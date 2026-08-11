"use strict";

/*
==========================================================
OCRA Video Analyzer v5
Archivo: counter.js
Contadores de acciones y movimientos
==========================================================
*/


/* ==========================================================
   CONTADOR DE ACCIONES
   ========================================================== */

class ActionCounter {

    constructor() {

        this.total =
            0;

        this.right =
            0;

        this.left =
            0;

        this.byType =
            {};

        this.byCycle =
            {};

        this.actions =
            [];

    }


    /* ------------------------------------------------------
       Registrar acción
       ------------------------------------------------------ */

    add(
        action
    ) {

        if (
            !action
        ) {

            return;

        }


        this.total++;


        /* ----------------------------------------------
           Lado
           ---------------------------------------------- */

        const side =
            action.side ??
            "";


        if (
            side === "right"
        ) {

            this.right++;

        }


        if (
            side === "left"
        ) {

            this.left++;

        }


        /* ----------------------------------------------
           Tipo
           ---------------------------------------------- */

        const type =
            action.type ??
            "unknown";


        if (
            !this.byType[type]
        ) {

            this.byType[type] =
                0;

        }


        this.byType[type]++;


        /* ----------------------------------------------
           Ciclo
           ---------------------------------------------- */

        const cycle =
            action.cycle ??
            1;


        if (
            !this.byCycle[cycle]
        ) {

            this.byCycle[cycle] =
                0;

        }


        this.byCycle[cycle]++;


        /* ----------------------------------------------
           Guardar acción
           ---------------------------------------------- */

        this.actions.push(
            action
        );

    }


    /* ------------------------------------------------------
       Registrar varias acciones
       ------------------------------------------------------ */

    addMany(
        actions
    ) {

        if (
            !Array.isArray(actions)
        ) {

            return;

        }


        actions.forEach(
            action => {

                this.add(
                    action
                );

            }
        );

    }


    /* ------------------------------------------------------
       Reiniciar
       ------------------------------------------------------ */

    reset() {

        this.total =
            0;

        this.right =
            0;

        this.left =
            0;

        this.byType =
            {};

        this.byCycle =
            {};

        this.actions =
            [];

    }


    /* ------------------------------------------------------
       Resumen
       ------------------------------------------------------ */

    summary() {

        return {

            total:
                this.total,

            right:
                this.right,

            left:
                this.left,

            byType:
                {
                    ...this.byType
                },

            byCycle:
                {
                    ...this.byCycle
                }

        };

    }

}



/* ==========================================================
   CONTADOR DE MOVIMIENTOS
   ========================================================== */

class MovementCounter {

    constructor(
        options = {}
    ) {

        this.name =
            options.name ??
            "movement";

        this.threshold =
            options.threshold ??
            null;

        this.direction =
            options.direction ??
            "greater";

        this.count =
            0;

        this.active =
            false;

        this.startTime =
            null;

        this.endTime =
            null;

        this.duration =
            0;

        this.episodes =
            [];

        this.maximum =
            null;

        this.values =
            [];

    }


    /* ------------------------------------------------------
       Alimentar contador
       ------------------------------------------------------ */

    feed(
        value,
        time = null
    ) {

        const numericValue =
            Number(value);


        if (
            !Number.isFinite(
                numericValue
            )
        ) {

            return null;

        }


        this.values.push(
            {
                value:
                    numericValue,

                time:
                    time
            }
        );


        /* ----------------------------------------------
           Máximo
           ---------------------------------------------- */

        if (
            this.maximum === null ||
            numericValue > this.maximum
        ) {

            this.maximum =
                numericValue;

        }


        /* ----------------------------------------------
           Comprobar umbral
           ---------------------------------------------- */

        let exceeds =
            false;


        if (
            this.threshold !== null &&
            Number.isFinite(
                Number(this.threshold)
            )
        ) {

            const threshold =
                Number(
                    this.threshold
                );


            if (
                this.direction ===
                "less"
            ) {

                exceeds =
                    numericValue <=
                    threshold;

            } else {

                exceeds =
                    numericValue >=
                    threshold;

            }

        }


        /* ----------------------------------------------
           Inicio episodio
           ---------------------------------------------- */

        if (
            exceeds &&
            !this.active
        ) {

            this.active =
                true;

            this.count++;

            this.startTime =
                time;

        }


        /* ----------------------------------------------
           Fin episodio
           ---------------------------------------------- */

        if (
            !exceeds &&
            this.active
        ) {

            this.active =
                false;

            this.endTime =
                time;


            this._closeEpisode();

        }


        return {

            value:
                numericValue,

            exceeds:
                exceeds,

            active:
                this.active

        };

    }


    /* ------------------------------------------------------
       Cerrar episodio
       ------------------------------------------------------ */

    _closeEpisode() {

        if (
            this.startTime === null
        ) {

            return;

        }


        const end =
            this.endTime ??
            this.startTime;


        const start =
            this.startTime;


        const duration =
            Math.max(
                0,
                Number(end) -
                Number(start)
            );


        this.duration +=
            duration;


        this.episodes.push({

            start:
                start,

            end:
                end,

            duration:
                duration

        });


        this.startTime =
            null;

        this.endTime =
            null;

    }


    /* ------------------------------------------------------
       Finalizar
       ------------------------------------------------------ */

    finish(
        finalTime = null
    ) {

        if (
            this.active
        ) {

            this.active =
                false;

            this.endTime =
                finalTime;

            this._closeEpisode();

        }


        return this.summary();

    }


    /* ------------------------------------------------------
       Resumen
       ------------------------------------------------------ */

    summary() {

        return {

            name:
                this.name,

            threshold:
                this.threshold,

            direction:
                this.direction,

            count:
                this.count,

            duration:
                this.duration,

            maximum:
                this.maximum,

            episodes:
                this.episodes.slice()

        };

    }


    /* ------------------------------------------------------
       Reiniciar
       ------------------------------------------------------ */

    reset() {

        this.count =
            0;

        this.active =
            false;

        this.startTime =
            null;

        this.endTime =
            null;

        this.duration =
            0;

        this.episodes =
            [];

        this.maximum =
            null;

        this.values =
            [];

    }

}



/* ==========================================================
   EXPORTACIÓN GLOBAL
   ========================================================== */

window.ActionCounter =
    ActionCounter;

window.MovementCounter =
    MovementCounter;


/* ==========================================================
   COMPATIBILIDAD
   ========================================================== */

window.Counter =
    ActionCounter;


window.OCRACounter = {

    ActionCounter,
    MovementCounter

};


console.log(
    "OCRA Video Analyzer: counter.js cargado correctamente"
);