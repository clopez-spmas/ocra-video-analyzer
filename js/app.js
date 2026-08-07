"use strict";

/*
=========================================================
OCRA Video Analyzer
Main Application Controller

Flujo:

Kinovea JSON
      |
      v
kinovea.js
      |
      v
marker_mapping.js
      |
      v
biomechanical_adapter.js
      |
      v
biomechanics.js
      |
      v
AnalysisResult

=========================================================
*/


let analysisResult = null;



document.addEventListener(
    "DOMContentLoaded",
    () => {


        const fileInput =
            document.getElementById(
                "jsonFile"
            );


        const analyzeButton =
            document.getElementById(
                "analyzeButton"
            );


        const status =
            document.getElementById(
                "status"
            );


        let selectedFile = null;



        if (!fileInput) {

            console.error(
                "No existe jsonFile"
            );

            return;

        }





        fileInput.addEventListener(
            "change",
            event => {


                if (
                    !event.target.files.length
                ) {

                    selectedFile = null;

                    analyzeButton.disabled =
                        true;

                    status.textContent =
                        "Esperando un archivo JSON...";


                    return;

                }



                selectedFile =
                    event.target.files[0];



                updateFileInfo(
                    selectedFile
                );



                status.textContent =
                    "Archivo cargado correctamente.";



                analyzeButton.disabled =
                    false;


            }
        );







        analyzeButton.addEventListener(
            "click",
            () => {


                if (!selectedFile) {


                    alert(
                        "Seleccione un archivo JSON"
                    );


                    return;

                }



                status.textContent =
                    "Procesando JSON Kinovea...";



                readKinoveaJSON(
                    selectedFile
                );


            }
        );


    }

);





/*
=========================================================
Lectura JSON
=========================================================
*/


function readKinoveaJSON(
    file
) {


    const reader =
        new FileReader();



    reader.onload =
        event => {


            try {


                const json =
                    JSON.parse(
                        event.target.result
                    );



                if (
                    typeof parseKinoveaJSON !==
                    "function"
                ) {

                    throw new Error(
                        "kinovea.js no cargado"
                    );

                }




                const kinoveaData =
                    parseKinoveaJSON(
                        json
                    );





                /*
                Crear interfaz mapping
                */

                if (
                    typeof createMarkerMappingUI ===
                    "function"
                ) {

                    createMarkerMappingUI(
                        kinoveaData.markers
                    );

                }





                /*
                Comprobar frames
                */

                if (
                    !kinoveaData.frames ||
                    kinoveaData.frames.length === 0
                ) {


                    throw new Error(
                        "No hay frames Kinovea"
                    );

                }





                /*
                Convertir marcadores Kinovea
                a anatomía
                */


                let anatomicalFrames = [];



                if (
                    typeof adaptKinoveaFrames ===
                    "function"
                ) {


                    anatomicalFrames =
                        adaptKinoveaFrames(
                            kinoveaData.frames,
                            saveMarkerMapping()
                        );


                }







                /*
                Crear resultado principal
                */


                analysisResult =
                    new AnalysisResult();




                analysisResult.setMetadata({

                    fileName:
                        file.name,


                    created:
                        new Date()
                        .toISOString()

                });





                analysisResult.setPoseFrames(
                    kinoveaData.frames
                );





                analysisResult.setAnatomicalFrames(
                    anatomicalFrames
                );







                /*
                Biomecánica
                */


                let biomechanicalResults =
                    [];



                if (
                    typeof Biomechanics !==
                    "undefined"
                    &&
                    anatomicalFrames.length > 0
                ) {


                    biomechanicalResults =
                        Biomechanics.analyzeBiomechanics(
                            anatomicalFrames
                        );


                }



                analysisResult.setBiomechanicalFrames(
                    biomechanicalResults
                );







                updateStatistics(
                    kinoveaData,
                    file
                );





                document.getElementById(
                    "status"
                ).textContent =
                    "✔ Análisis completado";





                showBiomechanicalResults(
                    analysisResult
                );



                console.log(
                    "AnalysisResult:",
                    analysisResult
                );



            }


            catch(error) {


                console.error(
                    error
                );


                document.getElementById(
                    "status"
                ).textContent =
                    "❌ Error: "
                    +
                    error.message;


            }


        };



    reader.readAsText(
        file
    );


}







/*
=========================================================
Información archivo
=========================================================
*/


function updateFileInfo(
    file
) {


    document.getElementById(
        "fileName"
    ).textContent =
        file.name;



    document.getElementById(
        "fileSize"
    ).textContent =
        (
            file.size / 1024
        )
        .toFixed(2)
        +
        " KB";


}






function updateStatistics(
    kinoveaData,
    file
) {



    document.getElementById(
        "frameCount"
    ).textContent =
        kinoveaData.frameCount;



    document.getElementById(
        "landmarkCount"
    ).textContent =
        kinoveaData.markers.length;



}







/*
=========================================================
Panel biomecánico
=========================================================
*/


function showBiomechanicalResults(
    result
) {


    const container =
        document.getElementById(
            "biomechanics"
        );


    if (!container) {

        return;

    }



    const data =
        result.biomechanicalFrames;



    if (
        !data ||
        data.length === 0
    ) {


        container.textContent =
            "Sin resultados biomecánicos";

        return;

    }




    container.innerHTML =
        "<pre>"
        +
        JSON.stringify(
            data,
            null,
            2
        )
        +
        "</pre>";

}
