# Biomechanical Validation Protocol

Version: 1.0
Date: 2026-07-30

Purpose
-------
Este documento describe el procedimiento estándar para validar las mediciones
angulares del motor biomecánico frente a una referencia externa (p. ej. export
de Kinovea, goniómetro manual, o medidas obtenidas de fotografías controladas).

Objetivos
---------
- Evaluar la precisión numérica de cada medición (codo, hombro, tronco, cuello,
  cabeza, rodilla, tobillo) comparando los valores de ángulo obtenidos por el
  analizador con los valores de referencia.
- Calcular métricas estadísticas básicas: error absoluto medio (MAE), error
  máximo, desviación estándar (SD) y porcentaje de mediciones dentro de una
  tolerancia configurable.

Estructura de los casos de referencia
-------------------------------------
Los casos de referencia se guardan en JSON o CSV dentro del directorio
`validation/reference_cases/`.
El formato JSON recomendado es:

{
  "case_id": "example_case",
  "source": "Kinovea_export_xyz_or_gonio_or_photos",
  "tolerance_deg": 5.0,
  "frames": [
    {
      "frame_index": 0,
      "measurements": {
        "elbow_flexion_left": 90.0,
        "knee_flexion_left": 5.0
      }
    },
    {
      "frame_index": 1,
      "measurements": { ... }
    }
  ]
}

Cada entrada de frame contiene los ángulos esperados para un conjunto de
mediciones. El campo `tolerance_deg` es opcional y puede sobreescribirse al
llamar al runner.

Protocolo de validación
-----------------------
1. Preparación:
   - Generar (o seleccionar) un caso de referencia con las mediciones de
     referencia y ponerlo en `validation/reference_cases/`.
   - Asegurarse de que el analizador (BiochemicalAnalyzer) puede procesar los
     mismos frames (por índice) y devolver BiomechanicalFrame con las claves
     de medición esperadas.

2. Ejecución:
   - Para cada frame del caso de referencia, ejecutar el analizador y obtener
     la BiomechanicalFrame correspondiente.
   - Para cada medición presente en el caso de referencia, comparar el valor
     obtenido con el valor esperado si la medición del analizador es `valid`.
   - Si la medición del analizador está marcada como `valid == False`, contar
     el registro como "invalid" y no incluirlo en los cálculos de error, pero
     registrar su razón (reason).

3. Métricas calculadas (por medición):
   - Mean Absolute Error (MAE): promedio del valor absoluto de las diferencias.
   - Max Error: máxima diferencia absoluta observada.
   - Standard Deviation (SD): desviación estándar de los errores absolutos.
   - Percent within tolerance: porcentaje de mediciones (válidas) cuya
     diferencia absoluta es <= tolerance_deg.

4. Informes:
   - El runner produce un resumen por medición con las métricas arriba indicadas
     y un resumen global con conteos (total frames, válidos, inválidos, faltantes).

Notas de integridad
-------------------
- El runner no modificará el estado del analizador ni de los PoseFrame.
- La validación es estrictamente de comparación numérica; no aplica
  interpolaciones ni rellenos.

Revisión y aceptación
---------------------
- Para aceptar un componente como suficientemente preciso, el equipo debe
  acordar los umbrales de tolerancia por medición (ej. 5° para codos, 10° para
  tronco, etc.) y documentarlos en la ficha del caso de referencia.

