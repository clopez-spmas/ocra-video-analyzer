"use strict";

/*
=========================================================
Biomechanical Adapter

Responsabilidades:

- Convertir datos de Kinovea a estructura anatómica.
- Usar markerMapping.js como fuente de correspondencia.
- No modificar datos originales.
- Preparar frames para biomechanics.js.

Entrada:

Kinovea:

frames:[
 {
   index:0,
   time:0,
   landmarks:{
       "Marcador 1":{
           x:100,
           y:200
       }
   }
 }
]


Salida:

frames:[
 {
   index:0,
   time:0,
   landmarks:{
       left_shoulder:{
           x:100,
           y:200
       }
   }
 }
]

=========================================================
*/


function adaptKinoveaFrames(
    frames,
    mapping
) {


    if (
        !frames ||
        !Array.isArray(frames)
    ) {

        throw new Error(
            "No existen frames Kinovea"
        );

    }



    if (
        !mapping
    ) {

        throw new Error(
            "No existe marker mapping"
        );

    }



    const adaptedFrames = [];



    frames.forEach(
        frame => {


            const anatomicalLandmarks = {};



            Object.entries(
                mapping
            )
            .forEach(
                ([joint, marker]) => {


                    if (
                        !marker
                    ) {

                        return;

                    }



                    if (
                        frame.landmarks &&
                        frame.landmarks[marker]
                    ) {


                        anatomicalLandmarks[joint] =
                            frame.landmarks[marker];


                    }
                    else {


                        anatomicalLandmarks[joint] =
                            null;


                    }


                }
            );



            adaptedFrames.push({

                index:
                    frame.index,


                time:
                    frame.time,


                landmarks:
                    anatomicalLandmarks


            });


        }
    );



    return adaptedFrames;

}



/*
=========================================================
Conversión inversa opcional

Útil para depuración
=========================================================
*/


function printMappingStatus(
    mapping
) {


    console.log(
        "Mapa anatómico actual:"
    );


    Object.entries(
        mapping
    )
    .forEach(
        ([joint,marker])=>{


            console.log(
                joint,
                "<-",
                marker
            );


        }
    );


}
