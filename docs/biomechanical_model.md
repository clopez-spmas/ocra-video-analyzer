# Biomechanical Model Specification — Versión 1.0 (Borrador de Diseño)

Fecha: 2026-07-30
Estado: Borrador de diseño. Esta versión recoge las decisiones ya aprobadas para el proyecto y marca explícitamente como "Pendiente de definición" los aspectos que aún requieren una decisión técnica o validación.

Resumen
-------
Este documento especifica el modelo biomecánico usado por el proyecto ocra-video-analyzer para la extracción de métricas que apoyen la aplicación manual del método OCRA y otras evaluaciones ergonómicas. No incluye ningún intento de puntuación automática ni clasificaciones de riesgo: el sistema se limita a extraer y normalizar métricas cuantitativas.

1. Objetivo del sistema
----------------------
Proveer un conjunto reproducible y trazable de métricas biomecánicas (postura y movimiento) extraídas de secuencias temporales de landmarks (p. ej. MediaPipe Pose) o fuentes equivalentes, que permitan a un ergonomista completar la OCRA Checklist (extracción de datos base para miembros superiores) y realizar análisis complementarios del tronco, cuello, cabeza y extremidades inferiores.

2. Alcance del proyecto
-----------------------
- Extracción de métricas temporales y de movimiento para miembro superior izquierdo/derecho, tronco, cuello, cabeza, rodillas y tobillos.
- Soporte para alimentar conteadores de movimiento (MovementCounter) y agregarlos por articulación (MovementManager).
- Producción de objetos métricos unificados (AnalysisMetrics) y salidas en formato JSON/dict.

No incluye (por decisión explícita):
- Implementación o aplicación automática del puntaje OCRA (solo se extraen y entregan datos base para que un experto complete la checklist).
- Valoración automática de riesgo, factores de fuerza, recuperación o recomendaciones.

3. Normativa utilizada
----------------------
El sistema se inspira y está diseñado para facilitar el cumplimiento y la verificación con las siguientes normas técnicas y documentos:
- OCRA Checklist — el sistema extrae indicadores base (frecuencia, número de acciones, tiempos de postura por rangos articulares) necesarios para que un ergonomista complete la checklist, pero NO calcula la puntuación OCRA.
- UNE‑EN 1005‑4+A1 — referencias para aspectos de rendimiento humano y biomecánica en la interacción con maquinaria (uso como marco de referencia para definiciones de pruebas y documentación).
- ISO 11226 — ergonomía: posturas estáticas de trabajo (uso para categorización y documentación de posturas sostenidas).
- ISO/TR 12295 — orientaciones técnicas relacionadas con la evaluación ergonómica. Se usa como referencia para conceptos de repetición y movimiento.

Nota: el documento no reproduce textualmente la normativa ni sustituye su lectura; se cita únicamente como marco técnico de referencia.

4. Sistema anatómico local
--------------------------
El sistema anatómico local definido para el proyecto agrupa landmarks y segmentos de la siguiente forma (ver "Landmarks de MediaPipe" más abajo para correspondencia exacta):
- Cabeza: puntos craneales (p. ej. oído / ojo / nariz) usados principalmente para orientación y rotación de la cabeza.
- Cuello: región entre cabeza y tronco (se deriva de la posición relativa de ojos/oídos y hombros/nível de clavícula/mediancenter de hombros).
- Tronco: eje torso/columna local estimado a partir de caderas y hombros (línea media pelvis -> torso -> hombros).
- Miembros superiores (cada lado): hombro, brazo superior (húmero), antebrazo, muñeca y mano.
- Miembros inferiores (cada lado): cadera, rodilla, tobillo y pie.

5. Convención de signos
-----------------------
Las siguientes convenciones se aplican de forma consistente a todos los ángulos y variables angulares reportadas por el sistema:
- Flexión: positiva.
- Extensión: negativa.
- Inclinación lateral derecha: positiva.
- Inclinación lateral izquierda: negativa.
- Rotación axial derecha: positiva.
- Rotación axial izquierda: negativa.

Estas convenciones se mantienen tanto en los valores brutos (ángulos) como en las categorías derivadas (cuando proceda). En los outputs se documentará la convención usada para cada campo numérico.

6. Segmentos corporales
-----------------------
Segmentos modelados (por cada lado cuando aplica):
- Hombro (segmento proximal del miembro superior)
- Brazo (húmero: hombro -> codo)
- Antebrazo (codo -> muñeca)
- Mano (muñeca -> dedos; uso limitado a conteo/posición)
- Tronco (pelvis/torso -> hombros)
- Cuello (base cráneo / clavícula -> cabeza)
- Cabeza
- Muslo (cadera -> rodilla)
- Pierna (rodilla -> tobillo)
- Pie

7. Landmarks de MediaPipe utilizados para cada segmento
------------------------------------------------------
Se asume que la entrada proviene de MediaPipe Pose (pose landmarks). Se usan los siguientes landmarks (nombres tal como en MediaPipe Pose):
- KEYPOINTS relevantes:
  - NOSE
  - LEFT_EYE_INNER, LEFT_EYE, LEFT_EYE_OUTER
  - RIGHT_EYE_INNER, RIGHT_EYE, RIGHT_EYE_OUTER
  - LEFT_EAR, RIGHT_EAR
  - MOUTH_LEFT, MOUTH_RIGHT (cuando se requiera)
  - LEFT_SHOULDER, RIGHT_SHOULDER
  - LEFT_ELBOW, RIGHT_ELBOW
  - LEFT_WRIST, RIGHT_WRIST
  - LEFT_INDEX, RIGHT_INDEX, LEFT_PINKY, RIGHT_PINKY, LEFT_THUMB, RIGHT_THUMB (mano, opcional)
  - LEFT_HIP, RIGHT_HIP
  - LEFT_KNEE, RIGHT_KNEE
  - LEFT_ANKLE, RIGHT_ANKLE
  - LEFT_HEEL, RIGHT_HEEL, LEFT_FOOT_INDEX, RIGHT_FOOT_INDEX

Mapeo de segmentación (ejemplos):
- Hombro (lado izquierdo): LEFT_SHOULDER
- Codo (lado izquierdo): LEFT_ELBOW
- Muñeca (lado izquierdo): LEFT_WRIST
- Cadera (izquierda): LEFT_HIP
- Rodilla (izquierda): LEFT_KNEE
- Tobillo (izquierda): LEFT_ANKLE
- Cabeza/cuello: combinación de NOSE, EYES, EARS y la línea de hombros.

Pendiente de definición:
- En qué medida se utilizarán landmarks faciales (ojos/oídos) frente a un "neck base" calculado para definir con precisión el centro del cuello. Esta decisión técnica está pendiente y se documentará cuando se acuerde el método de estimación del punto base del cuello.

8. Definición geométrica de cada segmento y ángulos calculados
-------------------------------------------------------------
A continuación se describen las definiciones geométricas propuestas para los ángulos que el sistema calculará. Cuando exista ambigüedad o varias alternativas técnicas equivalentes, la sección "Pendiente de definición" indicará la decisión pendiente.

Regla general para ángulos: los ángulos articulares se calculan normalmente como ángulos entre dos vectores formados por tripletas de landmarks A–B–C, donde el ángulo se mide en B entre vectores BA y BC:
- vector1 = A - B
- vector2 = C - B
- ángulo = signed_angle(vector1, vector2) según la convención de signos descrita

Ángulos por articulación (definiciones):

- Tronco (flexión/extensión e inclinación lateral):
  - Flexión/extensión: ángulo entre el vector medio pelvis->torax (p. ej. hip_center -> shoulder_center) y el eje vertical del mundo proyectado en el plano sagital del cuerpo.
  - Inclinación lateral: ángulo entre el mismo vector medio pelvis->torax y el eje vertical proyectado en el plano frontal.
  - Pendiente de definición: la referencia exacta para shoulder_center (¿media de LEFT_SHOULDER/RIGHT_SHOULDER vs. proyección de columna?) y la proyección del plano corporal deben definirse formalmente.

- Cuello (flexión/extensión e inclinación lateral, rotación axial):
  - Flexión/extensión: ángulo cabeza-cuello-tronco medido como ángulo entre vector head_center->neck_base y neck_base->shoulder_center.
  - Rotación axial del cuello: medida a partir de la orientación relativa de la cabeza frente al torso (por ejemplo, vector nariz->oreja(s) comparado con eje transversal del torso).
  - Pendiente de definición: fórmula exacta para head_center y neck_base (qué landmarks usar y cómo combinar) y la convención de planos para la rotación axial.

- Cabeza (inclinación y rotación):
  - Rotación axial: ángulo entre la línea nariz->medio-orejas y el eje longitudinal del tronco.
  - Inclinación lateral: ángulo entre vector nariz->medio-orejas proyectado en plano frontal.
  - Pendiente de definición: método exacto para robustecer head_center frente a oclusiones faciales.

- Hombro (flexión / abducción / rotación):
  - Flexión/Extensión del hombro: ángulo entre vector shoulder->hip_center (o shoulder->spine approximated) y shoulder->elbow, proyectado en plano sagital.
  - Abducción/aducción: ángulo en el plano frontal entre shoulder->elbow y shoulder->opposite_shoulder.
  - Pendiente de definición: elección de referencias para el eje del tronco (hip_center vs. average hips) y manejo de casos con rotación combinada.

- Codo (flexión / extensión):
  - Definición geométrica estándar: ángulo en el codo medido entre shoulder->elbow y wrist->elbow (tripleta: SHOULDER–ELBOW–WRIST). Signo según convención.
  - Este ángulo se registrará como valor absoluto y signo según flexión(+)/extensión(-).

- Muñeca (flexión / extensión y desviación radial/ulnar):
  - Flexión/extensión: ángulo en la muñeca entre elbow->wrist y hand_direction (p. ej. wrist->index or wrist->middle_finger).
  - Desviación radial/ulnar: ángulo en el plano frontal entre wrist->index/pinky y el eje del antebrazo.
  - Pendiente de definición: elección exacta de landmark(s) de mano a usar como referencia para hand_direction (INDEX vs. MIDDLE vs. AVERAGE) y robustez frente a oclusión de dedos.

- Rodilla:
  - Ángulo en la rodilla medido entre hip->knee y ankle->knee (tripleta: HIP–KNEE–ANKLE). Flexión positiva.

- Tobillo:
  - Ángulo en el tobillo medido entre knee->ankle y foot_index/heel->ankle.
  - Pendiente de definición: si usar FOOT_INDEX o HEEL como referencia primaria según disponibilidad del landmark y orientación del pie en la escena.

9. Categorías biomecánicas previstas para cada articulación
-----------------------------------------------------------
Se documentan las categorías (nombres) que se utilizarán para agrupar rangos angulares por articulación. Los valores umbrales numéricos que delimitan cada categoría están PENDIENTES DE DEFINICIÓN y se acordarán en una fase de validación clínica/ergonómica.

Formato: para cada articulación se dispondrá de categorías nominales (ej.: "neutra", "leve", "moderada", "severa").

Ejemplo de lista de categorías (nombres solamente):
- Tronco: neutral / leve_flexion / moderada_flexion / severa_flexion
- Cuello: neutral / leve / moderado / severo
- Cabeza: neutral / inclinada_izq / inclinada_der / rotada
- Hombro: neutral / elevacion_leve / elevacion_moderada / elevacion_severa
- Codo: extension_neutra / flexion_leve / flexion_moderada / flexion_severa
- Muñeca: neutral / flexion_leve / flexion_moderada / flexion_severa / desviacion_radial / desviacion_ulnar
- Rodilla: extendida / flexion_leve / flexion_moderada / flexion_severa
- Tobillo: neutral / dorsiflexion / plantiflexion / desviacion

Pendiente de definición:
- Umbrales angulares (grados) exactos que definen cada categoría.
- Si las categorías incluirán sub-clasificaciones (p. ej. separar flexión sostenida vs. transitoria).

10. Tratamiento de datos perdidos e interpolación
-------------------------------------------------
Regla primaria (decisión de proyecto):
- Queda expresamente prohibida cualquier interpolación automática de datos en esta versión del proyecto.
- Toda interpolación solo podrá implementarse si existe una decisión explícita y documentada en una versión futura del proyecto; hasta entonces el software NO interpolará datos bajo ninguna circunstancia.

Política de validez y cálculo de métricas:
- El sistema NUNCA eliminará fotogramas ni mediciones del registro. Todas las muestras capturadas se conservarán tal cual en los outputs junto con su metadato de validez.
- En presencia de huecos o muestras no válidas, las métricas temporales (p. ej. porcentaje de tiempo, duración continua) se calcularán únicamente sobre el tiempo efectivo considerado válido según las reglas de validez descritas en la sección "Reglas de diseño: validez de mediciones y integridad de datos" más abajo.

Pendiente de definición:
- gap_max_seconds y políticas de cómo reportar grandes intervalos inválidos (por ejemplo, flags en metadata) — estas políticas deben acordarse y documentarse para versiones futuras.

11. Suavizado temporal
----------------------
Objetivo: reducir ruido de detección y minimizar oscilaciones rápidas que afectarían a conteos de movimiento y a clasificaciones de duración continua.

Recomendación de diseño (paradigma):
- Aplicar un filtro paso‑bajo temporal sobre las coordenadas 2D/3D o sobre las series angulares (dependiendo de la etapa del pipeline) antes de computar derivadas o detectar eventos.
- Filtrado supervisable por parámetros: tipo de filtro (moving average, Savitzky‑Golay, Butterworth), ventana / cutoff y orden.

Pendiente de definición:
- Tipo de filtro adoptado por defecto y parámetros (p. ej. ventana en segundos o frecuencia de corte en Hz).
- Si el suavizado se aplicará sobre coordenadas o sobre ángulos derivados (o ambas).

12. Formato de salida de las métricas
------------------------------------
Se definirá un formato JSON (o dict en Python) basado en el modelo AnalysisMetrics ya implementado en ocra.metrics.analysis_metrics.AnalysisMetrics. A modo de ejemplo se proporciona una estructura sugerida (schema simplificado):

Ejemplo (JSON simplificado):

{
  "analysis_id": "string",
  "subject_id": "string",
  "start_time": 0.0,    # segundos (epoch relativo al vídeo)
  "end_time": 60.0,
  "duration": 60.0,
  "metadata": {"fps": 30, "camera": "cam1"},
  "right_upper_limb": {
      "accumulated_time": 12.0,
      "percent_time": 20.0,
      "number_of_episodes": 4,
      "max_continuous_duration": 5.0,
      "frequency_per_minute": 6.0
  },
  "left_upper_limb": { ... },
  "trunk": { ... },
  "neck": { ... },
  "head": { ... },
  "knees": { ... },
  "ankles": { ... }
}

Observaciones:
- Todas las unidades temporales están en segundos.
- Los porcentajes están en 0..100.
- Campos opcionales (p. ej. frequency_per_minute) pueden ser null/None cuando no aplican o no hay datos suficientes.

13. Reglas de diseño: validez de mediciones e integridad de datos
---------------------------------------------------------------
Principios de proyecto (obligatorios):
- El software es un extractor objetivo de información biomecánica; la interpretación y valoración de las mediciones corresponde exclusivamente al ergonomista o profesional cualificado.
- El sistema NUNCA eliminará fotogramas ni mediciones del registro original.
- Para cada medición capturada (cada landmark en cada fotograma) el sistema incluirá, de forma obligatoria, los siguientes campos en el registro:
  - valid: boolean — indica si la medición se considera válida para uso en métricas.
  - confidence: número (0..100) — solo estará presente cuando valid == true; representa la confianza estimada en la medición en porcentaje.
  - reason: cadena — solo estará presente cuando valid == false; indica la razón por la que la muestra es inválida.

Valores permitidos para reason (lista cerrada):
- outside_frame
- occluded
- landmarks_missing
- low_visibility
- tracking_lost
- calculation_error

Notas sobre uso:
- Si valid == false, el campo confidence NO se incluirá y el campo reason deberá contener exactamente uno de los valores listados arriba.
- Si valid == true, el campo reason NO se incluirá y confidence contendrá un valor entre 0 y 100 (inclusive). El sistema podrá documentar además una medida de calidad interna, pero esta no sustituye el campo confidence.
- Estos metadatos se conservarán en todos los outputs y por tanto permiten al ergonomista decidir posteriormente si usar, filtrar o ponderar las mediciones.

14. Limitaciones conocidas
--------------------------
- Calidad de entrada dependiente de la detección de landmarks: oclusiones, mala iluminación, ángulos de cámara extremos y ropa pueden degradar la precisión.
- Estimación de planos anatómicos y eje longitudinal del tronco es aproximada cuando solo hay vistas 2D o monoculares; para análisis robusto se recomienda vídeo con cámara lateral o sistemas multi‑cámara/3D.
- Detección de ángulos complejos (p. ej. rotación axial del tronco) puede ser inconsistente en entornos monoculares sin profundidad.
- Conteo de movimientos sensible a parámetros de umbral y a suavizado temporal: parámetros inadecuados pueden generar sobreconteo o subconteo.

15. Aspectos pendientes de validación
------------------------------------
Esta sección recoge las decisiones técnicas que quedan por definir y validar experimentalmente con datos reales y con ergonomistas que revisen los resultados:

- Definición exacta de puntos de referencia para "neck_base" y "head_center" (qué landmarks usar y cómo combinar).
- Umbrales numéricos de las categorías biomecánicas por articulación (valores angulares en grados que delimitan neutral/leves/moderadas/severas).
- Política concreta sobre reporting de huecos largos (gap_max_seconds) y flags asociados — definir cómo se representará en metadata.
- Parámetros de suavizado por defecto (tipo de filtro y configuración) y si el suavizado se aplica sobre coordenadas o sobre ángulos.
- Estrategia de fusión/duplicación cuando múltiples sensores o múltiples contadores aportan señales para la misma articulación (p. ej. deduplicación temporal).
- Umbral de confianza mínimo por sample para considerarla válida (vinculado al score de detección de la librería de landmarks).
- Validación clínica/ergonómica: pruebas con usuarios y comparación con medidas de referencia (goniometría o sistemas de captura de movimiento) para estimar error y calibrar umbrales.

16. Anexos: buenas prácticas para la implementación
---------------------------------------------------
- Loguear la tasa de muestras válidas y los gaps detectados para cada sesión.
- Incluir metadatos de captura (fps, resolución, intrinsics si están disponibles) para facilitar trazabilidad y reproducibilidad.
- Versionar el modelo (ej.: "biomech_model_version": "1.0-draft") en el metadata.
- Mantener registros de validación y casos de prueba con vídeos etiquetados para permitir evaluación continua.

17. Historial de versiones
--------------------------
- 1.0 (Borrador de Diseño) — 2026‑07‑30: primera versión del documento; recoge estructura, convenciones y se marcan explícitamente las decisiones pendientes de definición.


Fin del documento.
