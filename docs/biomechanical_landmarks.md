# Catálogo de Landmarks y Dependencias — Biomechanical Model Reference

Versión: 1.0 (Borrador técnico)
Fecha: 2026-07-30

Este documento complementa la especificación general del modelo biomecánico y define el catálogo completo de landmarks usados por el sistema (landmarks reales provenientes de MediaPipe y landmarks virtuales derivados), las reglas de cálculo propuestas para los virtuales cuando proceda, las tablas de segmentos y ángulos y una matriz de dependencias indicando qué cálculos dejan de ser válidos si falta un determinado landmark.

Nota importante sobre decisiones pendientes
------------------------------------------
Donde una decisión técnica aún no está cerrada, la sección correspondiente se marca explícitamente como "Pendiente de definición" y no se asume una solución final. Estas pendientes coinciden con las señaladas en docs/biomechanical_model.md.

1. Catálogo de landmarks
-------------------------
Se distinguen:
- Landmarks reales: índices y nombres tal como los proporciona MediaPipe Pose (referencia inicial).
- Landmarks virtuales: puntos calculados a partir de landmarks reales (o de otros virtuales). Para cada virtual se indica método de cálculo propuesto o si está pendiente de definición.

1.1 Landmarks reales (MediaPipe Pose — índices y nombres)

| ID | Nombre (MediaPipe) |
|----:|-------------------|
| 0  | NOSE |
| 1  | LEFT_EYE_INNER |
| 2  | LEFT_EYE |
| 3  | LEFT_EYE_OUTER |
| 4  | RIGHT_EYE_INNER |
| 5  | RIGHT_EYE |
| 6  | RIGHT_EYE_OUTER |
| 7  | LEFT_EAR |
| 8  | RIGHT_EAR |
| 9  | MOUTH_LEFT |
| 10 | MOUTH_RIGHT |
| 11 | LEFT_SHOULDER |
| 12 | RIGHT_SHOULDER |
| 13 | LEFT_ELBOW |
| 14 | RIGHT_ELBOW |
| 15 | LEFT_WRIST |
| 16 | RIGHT_WRIST |
| 17 | LEFT_PINKY |
| 18 | RIGHT_PINKY |
| 19 | LEFT_INDEX |
| 20 | RIGHT_INDEX |
| 21 | LEFT_THUMB |
| 22 | RIGHT_THUMB |
| 23 | LEFT_HIP |
| 24 | RIGHT_HIP |
| 25 | LEFT_KNEE |
| 26 | RIGHT_KNEE |
| 27 | LEFT_ANKLE |
| 28 | RIGHT_ANKLE |
| 29 | LEFT_HEEL |
| 30 | RIGHT_HEEL |
| 31 | LEFT_FOOT_INDEX |
| 32 | RIGHT_FOOT_INDEX |

1.2 Landmarks virtuales (IDs internos y descripción)

Los landmarks virtuales llevan un identificador textual interno porque no forman parte del índice numérico de MediaPipe. Se proponen los siguientes nombres internos y métodos de cálculo cuando procede.

| ID interno | Nombre anatómico | Origen | Método de cálculo / Observaciones | Segmentos que lo usan |
|------------|------------------|--------|-----------------------------------|------------------------|
| V_SHOULDER_CENTER | Shoulder_Center | virtual | (LEFT_SHOULDER + RIGHT_SHOULDER)/2 — media aritmética de ambos hombros. | Tronco, Hombro |
| V_HIP_CENTER | Hip_Center | virtual | (LEFT_HIP + RIGHT_HIP)/2 — media aritmética de ambas caderas. | Tronco, Pelvis |
| V_SPINE_MID | Spine_Mid | virtual | (V_HIP_CENTER + V_SHOULDER_CENTER)/2 — aproximación de la línea media torácica. | Tronco |
| V_NECK_BASE | Neck_Base | virtual | Pendiente de definición: ver docs/biomechanical_model.md — necesita decisión (posibles opciones: media de clavículas, proyección entre head_center y shoulder_center, etc.). | Cuello, Cabeza |
| V_HEAD_CENTER | Head_Center | virtual | Pendiente de definición: combinación robusta de NOSE + ojos + orejas para estimar centro craneal. | Cabeza, Cuello |
| V_SHOULDER_VECTOR_L | Shoulder_Vector_Left | virtual | Vector aproximado del tronco relativo al hombro izquierdo: use V_SHOULDER_CENTER->LEFT_SHOULDER para ciertos cálculos locales. | Hombro |
| V_SHOULDER_VECTOR_R | Shoulder_Vector_Right | virtual | Vector aproximado del tronco relativo al hombro derecho. | Hombro |
| V_ANKLE_CENTER | Ankle_Center | virtual | (LEFT_ANKLE + RIGHT_ANKLE)/2 — opcional, uso en análisis de base de soporte. | Tobillos, Tronco |
| V_FEET_CENTER | Feet_Center | virtual | (LEFT_FOOT_INDEX + RIGHT_FOOT_INDEX)/2 — opcional. | Piernas |

Observaciones sobre virtuales:
- Los virtuales cuya definición aparece como "Pendiente de definición" NO deben implementarse hasta que haya una decisión formal. Se incluyen aquí para que la discusión técnica sea explícita.
- Los cálculos propuestos para virtuales simples (medias aritméticas) son estándar y suficientes para muchos análisis; sin embargo, su robustez frente a oclusión debe validarse.

2. Tabla de segmentos y landmarks que los definen
-------------------------------------------------
Esta tabla agrupa los segmentos corporales usados en cálculos y los landmarks (reales o virtuales) necesarios para definir cada segmento.

| Segmento | Landmarks mínimos requeridos | Notas |
|----------|------------------------------|-------|
| Hombro izquierdo | LEFT_SHOULDER (11), LEFT_ELBOW (13) | Se usan para definir vector hombro->codo y eje del miembro superior. |
| Hombro derecho | RIGHT_SHOULDER (12), RIGHT_ELBOW (14) | |
| Brazo superior izquierdo | LEFT_SHOULDER (11), LEFT_ELBOW (13) | |
| Brazo superior derecho | RIGHT_SHOULDER (12), RIGHT_ELBOW (14) | |
| Antebrazo izquierdo | LEFT_ELBOW (13), LEFT_WRIST (15) | |
| Antebrazo derecho | RIGHT_ELBOW (14), RIGHT_WRIST (16) | |
| Muñeca izquierda | LEFT_WRIST (15), LEFT_INDEX (19) or LEFT_PINKY (17) | Referencia de la mano puede variar; pendiente elección INDEX vs MIDDLE si está disponible. |
| Muñeca derecha | RIGHT_WRIST (16), RIGHT_INDEX (20) or RIGHT_PINKY (18) | |
| Mano izquierda | LEFT_WRIST (15), LEFT_INDEX (19) | Uso limitado a dirección y control de amplitud. |
| Mano derecha | RIGHT_WRIST (16), RIGHT_INDEX (20) | |
| Tronco | V_HIP_CENTER (virtual), V_SHOULDER_CENTER (virtual) o LEFT_HIP/RIGHT_HIP y LEFT_SHOULDER/RIGHT_SHOULDER | Se sugiere usar virtuales para estabilidad. |
| Cuello | V_NECK_BASE (virtual), V_HEAD_CENTER (virtual) o combinación NOSE + shoulders | Pendiente de definición para neck_base/head_center. |
| Cabeza | V_HEAD_CENTER (virtual), NOSE (0), LEFT_EAR (7), RIGHT_EAR (8) | |
| Cadera izquierda | LEFT_HIP (23), LEFT_KNEE (25) | |
| Cadera derecha | RIGHT_HIP (24), RIGHT_KNEE (26) | |
| Rodilla izquierda | LEFT_HIP (23), LEFT_KNEE (25), LEFT_ANKLE (27) |_tripleta para ángulo de rodilla_
| Rodilla derecha | RIGHT_HIP (24), RIGHT_KNEE (26), RIGHT_ANKLE (28) | |
| Tobillo izquierdo | LEFT_KNEE (25), LEFT_ANKLE (27), LEFT_FOOT_INDEX (31) or LEFT_HEEL (29) | Pendiente elección de referencia pie. |
| Tobillo derecho | RIGHT_KNEE (26), RIGHT_ANKLE (28), RIGHT_FOOT_INDEX (32) or RIGHT_HEEL (30) | |

3. Tabla de ángulos biomecánicos (propuesta)
--------------------------------------------
Se listan los ángulos que el sistema calculará o soportará, con la información necesaria para su cálculo.

| Nombre del ángulo | Segmentos implicados | Plano anatómico | Referencia (global/local) | Landmarks necesarios (orden A–B–C) |
|-------------------|----------------------|-----------------|---------------------------|-----------------------------------|
| Tronco: flexión/extension | Tronco | Sagital | Global (vertical mundo) / Local (spine axis) | V_HIP_CENTER (B), V_SHOULDER_CENTER (A) y eje vertical del mundo (para proyección).  (Implementación: angle between vector hip_center->shoulder_center and vertical projected on sagital plane). |
| Tronco: inclinación lateral | Tronco | Frontal | Global/local | V_HIP_CENTER (B), V_SHOULDER_CENTER (A) and vertical projected on frontal plane. |
| Cuello: flexión/extension | Cuello, Cabeza | Sagital | Local (neck relative to trunk) | V_HEAD_CENTER (A) – V_NECK_BASE (B) – V_SHOULDER_CENTER (C) (pendiente neck_base/head_center). |
| Cuello: rotación axial | Cuello | Transversal (axial) | Local | NOSE / HEAD_CENTER orientation vs trunk transverse axis — requiere V_HEAD_CENTER y V_NECK_BASE (pendiente definición). |
| Cabeza: inclinación lateral | Cabeza | Frontal | Local/global | NOSE (A) – V_HEAD_CENTER (B) – V_NECK_BASE (C) (pendiente). |
| Cabeza: rotación axial | Cabeza | Transversal | Local | NOSE (A) – V_HEAD_CENTER (B) – midpoint of ears or shoulder axis (C). |
| Hombro: flexión/extension | Hombro | Sagital | Local (shoulder relative to trunk) | SHOULDER (B) with HIP_CENTER or SPINE_MID as reference and ELBOW (C): A–B–C = hip_center->shoulder->elbow (o shoulder->spine vs shoulder->elbow). |
| Hombro: abducción/aducción | Hombro | Frontal | Local | opposite_shoulder/shoulder_center reference and shoulder->elbow vector.
| Codo: flexión/extension | Codo | Sagital (principal) | Local | SHOULDER (A) – ELBOW (B) – WRIST (C) (standard triplet). |
| Muñeca: flexion/extension | Muñeca | Sagital | Local | ELBOW (A) – WRIST (B) – INDEX/MIDDLE (C) (depend on chosen manual landmark). |
| Muñeca: desviación radial/ulnar | Muñeca | Frontal | Local | ELBOW (A) – WRIST (B) – INDEX/PINKY (C). |
| Rodilla: flexión | Rodilla | Sagital | Local | HIP (A) – KNEE (B) – ANKLE (C). |
| Tobillo: dorsiflexion/plantarflexion | Tobillo | Sagital | Local | KNEE (A) – ANKLE (B) – FOOT_INDEX or HEEL (C). |

Notas sobre la tabla de ángulos:
- "Referencia" indica si el ángulo se expresa relativo a un eje del mundo (p. ej. vertical) o relativo a un eje local del cuerpo (p. ej. eje de la columna o eje del tronco). En muchos casos se ofrecen ambas alternativas; la decisión final de referencia local/global para algunos ángulos está pendiente.
- Para cálculos robustos se recomienda proyectar los vectores al plano anatómico objetivo antes de medir el ángulo firmado (usar cross/dot y signed_angle con convención de signos definida en docs/biomechanical_model.md).

4. Matriz de dependencias (resumen)
-----------------------------------
La matriz resume qué cálculos (ángulos/estadísticas) dejan de ser válidos cuando falta un determinado landmark. Por "faltar" entendemos que el landmark está marcado como invalid (valid == false) o no está presente en el PoseFrame.

En la práctica, se recomienda que la capa de ingestión y las funciones de cálculo verifiquen la validez de cada landmark antes de usarlo. La siguiente tabla es una guía de dependencias directas.

Columnas: listadas operaciones/ángulos principales. Filas: landmarks (reales y virtuales). Marca "X" = dependencia directa.

Operaciones listadas (columnas):
- T_TRUNK_FLEX: Tronco flexión/extension
- T_TRUNK_LAT: Tronco inclinación lateral
- N_FLEX: Cuello flex/ext
- N_ROT: Cuello rotación axial
- H_FLEX: Hombro flex/ext (lado)
- H_ABD: Hombro abducción (lado)
- E_FLEX: Codo flex/ext (lado)
- W_FLEX: Muñeca flex/ext (lado)
- K_FLEX: Rodilla flexión (lado)
- A_DORS: Tobillo dorsiflex (lado)

| Landmark | T_TRUNK_FLEX | T_TRUNK_LAT | N_FLEX | N_ROT | H_FLEX | H_ABD | E_FLEX | W_FLEX | K_FLEX | A_DORS |
|----------|:------------:|:-----------:|:------:|:-----:|:------:|:-----:|:------:|:------:|:------:|:-----:|
| LEFT_SHOULDER (11)  | X | X |   |   | X | X | X |   |   |   |
| RIGHT_SHOULDER (12) | X | X |   |   | X | X | X |   |   |   |
| LEFT_HIP (23)       | X | X |   |   |   |   |   |   | X |   |
| RIGHT_HIP (24)      | X | X |   |   |   |   |   |   | X |   |
| V_SHOULDER_CENTER   | X | X |   |   | X | X |   |   |   |   |
| V_HIP_CENTER        | X | X |   |   |   |   |   |   | X |   |
| V_SPINE_MID         | X | X |   |   |   |   |   |   |   |   |
| NOSE (0)            |   |   | X | X |   |   |   |   |   |   |
| LEFT_EAR (7)        |   |   |   | X |   |   |   |   |   |   |
| RIGHT_EAR (8)       |   |   |   | X |   |   |   |   |   |   |
| V_NECK_BASE         |   |   | X | X |   |   |   |   |   |   |
| LEFT_ELBOW (13)     |   |   |   |   | X | X | X |   |   |   |
| RIGHT_ELBOW (14)    |   |   |   |   | X | X | X |   |   |   |
| LEFT_WRIST (15)     |   |   |   |   |   |   |   | X |   |   |
| RIGHT_WRIST (16)    |   |   |   |   |   |   |   | X |   |   |
| LEFT_KNEE (25)      |   |   |   |   |   |   |   |   | X | X |
| RIGHT_KNEE (26)     |   |   |   |   |   |   |   |   | X | X |
| LEFT_ANKLE (27)     |   |   |   |   |   |   |   |   | X | X |
| RIGHT_ANKLE (28)    |   |   |   |   |   |   |   |   | X | X |

Notas sobre la matriz:
- La matriz indica dependencias directas para el cálculo de ángulos; muchas métricas derivadas (frecuencias, tiempos) dependerán indirectamente de estos cálculos.
- Si un virtual como V_SHOULDER_CENTER no puede calcularse porque faltan ambos hombros, entonces todos los cálculos que dependen de V_SHOULDER_CENTER quedan inválidos.
- Implementaciones deben verificar validez transitiva: por ejemplo, si V_HIP_CENTER se deriva de LEFT_HIP o RIGHT_HIP y cualquiera de éstos falta, V_HIP_CENTER no podrá calcularse y por tanto las métricas que dependen de V_HIP_CENTER serán inválidas.

5. Recomendaciones operativas
-----------------------------
- Validación previa: antes de ejecutar cálculos angulares, comprobar el campo `valid` de cada landmark y la presencia de los landmarks requeridos; documentar en metadata los frames con datos insuficientes.
- Preferir virtuales calculados a partir de múltiple contribución (p. ej. promedios) para mayor robustez, pero siempre documentar la fórmula y el fallback si algún input falta.
- Mantener un registro por frame de qué cálculos han sido efectivamente calculados y cuáles han sido omitidos por falta de datos — esto facilita la revisión por el ergonomista.

6. Historial y control de cambios
---------------------------------
- 1.0 (Borrador técnico) — 2026‑07‑30: catálogo inicial de landmarks, segmentos, ángulos y matriz de dependencias. Muchas decisiones técnicas (neck_base, head_center, thresholds) siguen pendientes y deben versionarse cuando se tomen.


Fin del documento.
