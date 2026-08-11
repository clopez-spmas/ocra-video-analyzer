"use strict";

/*
=========================================================
OCRA Video Analyzer
Marker Assignment Dialog
=========================================================

Responsabilidades:
- Crear dinámicamente la tabla de asignación.
- Permitir seleccionar un marcador para cada punto anatómico.
- Devolver un objeto MarkerAssignment.

No realiza cálculos biomecánicos.
=========================================================
*/

class MarkerDialog {

    constructor(markerCount) {

        this.markerCount = markerCount;

        this.assignment =
            new MarkerAssignment(markerCount);

    }

    //-----------------------------------------------------
    // Mostrar diálogo
    //-----------------------------------------------------

    show() {

        const container =
            document.getElementById("markerDialog");

        container.innerHTML = "";

        const table =
            document.createElement("table");

        table.className =
            "table table-striped table-sm";

        //-------------------------------------------------
        // Cabecera
        //-------------------------------------------------

        const thead =
            document.createElement("thead");

        thead.innerHTML =
            `
            <tr>
                <th>Punto anatómico</th>
                <th>Marcador</th>
            </tr>
            `;

        table.appendChild(thead);

        //-------------------------------------------------
        // Cuerpo
        //-------------------------------------------------

        const tbody =
            document.createElement("tbody");

        getAllLandmarks().forEach(landmark => {

            const row =
                document.createElement("tr");

            //-------------------------------------------------

            const nameCell =
                document.createElement("td");

            nameCell.textContent =
                landmark.name;

            //-------------------------------------------------

            const selectCell =
                document.createElement("td");

            const select =
                document.createElement("select");

            select.className =
                "form-select form-select-sm";

            //-------------------------------------------------
            // No visible
            //-------------------------------------------------

            const none =
                document.createElement("option");

            none.value = "";

            none.textContent =
                "No visible";

            select.appendChild(none);

            //-------------------------------------------------
            // Marcadores disponibles
            //-------------------------------------------------

            for (
                let i = 1;
                i <= this.markerCount;
                i++
            ) {

                const option =
                    document.createElement("option");

                option.value = i;

                option.textContent =
                    "Marcador " + i;

                select.appendChild(option);

            }

            //-------------------------------------------------

            select.addEventListener(
                "change",
                () => {

                    const value =
                        select.value === ""
                            ? null
                            : Number(select.value);

                    this.assignment.assign(
                        landmark.id,
                        value
                    );

                }
            );

            //-------------------------------------------------

            selectCell.appendChild(select);

            row.appendChild(nameCell);

            row.appendChild(selectCell);

            tbody.appendChild(row);

        });

        table.appendChild(tbody);

        container.appendChild(table);

    }

    //-----------------------------------------------------
    // Obtener resultado
    //-----------------------------------------------------

    getAssignment() {

        return this.assignment;

    }

}
