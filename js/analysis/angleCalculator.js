"use strict";

/*
=========================================================
OCRA Video Analyzer
Angle Calculator Module
=========================================================

Responsabilidades:

- Calcular ángulos articulares.
- Trabajar con landmarks Kinovea.
- Preparar datos para análisis OCRA.

Entrada:
    Frame con landmarks

Salida:
    Objeto con ángulos articulares

=========================================================
*/


const AngleCalculator = {



    /*
    -----------------------------------------------------
    Calcula ángulo formado por tres puntos
    -----------------------------------------------------

    A ---- B ---- C

    B es la articulación

    -----------------------------------------------------
    */

    calculateAngle(pointA, pointB, pointC) {


        if (
            !pointA ||
            !pointB ||
            !pointC
        ) {

            return null;

        }


        const BA = {

            x: pointA.x - pointB.x,

            y: pointA.y - pointB.y

        };


        const BC = {

            x: pointC.x - pointB.x,

            y: pointC.y - pointB.y

        };



        const dot =

            BA.x * BC.x
            +
            BA.y * BC.y;



        const magnitudeA =

            Math.sqrt(
                BA.x * BA.x
                +
                BA.y * BA.y
            );



        const magnitudeC =

            Math.sqrt(
                BC.x * BC.x
                +
                BC.y * BC.y
            );



        if (
            magnitudeA === 0
            ||
            magnitudeC === 0
        ) {

            return null;

        }



        const cosine =

            dot /
            (
                magnitudeA *
                magnitudeC
            );



        const angle =

            Math.acos(
                Math.min(
                    1,
                    Math.max(
                        -1,
                        cosine
                    )
                )
            );



        return (

            angle *
            180 /
            Math.PI

        );

    },





    /*
    -----------------------------------------------------
    Extrae ángulos de un frame
    -----------------------------------------------------

    Se espera:

    landmarks:
    [
        {
            name:"",
            x:,
            y:
        }
    ]

    -----------------------------------------------------
    */


    calculateFrameAngles(frame) {



        if (
            !frame ||
            !Array.isArray(frame.landmarks)
        ) {


            return {};

        }



        const points =
            {};



        frame.landmarks.forEach(
            landmark => {


                if (
                    landmark.name
                ) {


                    points[
                        landmark.name
                    ] = landmark;


                }


            }
        );



        return {


            leftElbow:

                this.calculateAngle(

                    points.leftShoulder,

                    points.leftElbow,

                    points.leftWrist

                ),



            rightElbow:

                this.calculateAngle(

                    points.rightShoulder,

                    points.rightElbow,

                    points.rightWrist

                ),



            leftShoulder:

                this.calculateAngle(

                    points.leftHip,

                    points.leftShoulder,

                    points.leftElbow

                ),



            rightShoulder:

                this.calculateAngle(

                    points.rightHip,

                    points.rightShoulder,

                    points.rightElbow

                ),



            leftWrist:

                this.calculateAngle(

                    points.leftElbow,

                    points.leftWrist,

                    points.leftIndex

                ),



            rightWrist:

                this.calculateAngle(

                    points.rightElbow,

                    points.rightWrist,

                    points.rightIndex

                )


        };


    }





};



// Export para navegador

window.AngleCalculator =
    AngleCalculator;
