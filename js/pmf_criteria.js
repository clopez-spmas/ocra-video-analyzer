"use strict";

/*
=========================================================
PMF CRITERIA
Posturas y Movimientos Forzados
Criterios codificados desde el documento interno
"VALORACIÓN POSTURAS Y MOVIMIENTOS FORZADOS - MARZO 2026".

IMPORTANTE:
- No existe resultado global.
- Cada sección corporal se resuelve de forma independiente.
- Cuando el criterio exige una condición no inferible de Kinovea
  (p. ej. soporte completo), el motor devuelve REQUIERE_CONFIRMACION.
=========================================================
*/

const PMF_RESULT = Object.freeze({
    ACCEPTABLE: "ACEPTABLE",
    NOT_ACCEPTABLE: "NO_ACEPTABLE",
    NEEDS_CONFIRMATION: "REQUIERE_CONFIRMACION",
    NOT_EVALUATED: "NO_EVALUADO"
});

const PMF_FREQUENCY_LIMIT = 2;
const PMF_CRITICAL_TIME_LIMIT_PERCENT = 60;
const PMF_STATIC_MIN_SECONDS = 4;

function pmfResult(status, reason, criterionId, inputs = {}) {
    return { status, reason, criterionId, inputs };
}

function evaluateTrunkFlexionDynamic({ angle, frequencyPerMinute, fullTrunkSupport = null }) {
    const a = Number(angle);
    const f = Number(frequencyPerMinute);
    if (!Number.isFinite(a) || !Number.isFinite(f)) {
        return pmfResult(PMF_RESULT.NOT_EVALUATED, "Faltan ángulo o frecuencia válidos.", "DYN_TRUNK_FLEX");
    }

    if (a >= 1 && a <= 20) {
        return pmfResult(PMF_RESULT.ACCEPTABLE, "Flexión de tronco entre 1° y 20°.", "DYN_TRUNK_FLEX_1_20", {angle:a,frequencyPerMinute:f});
    }

    if (a >= 21 && a <= 60) {
        return pmfResult(
            f < PMF_FREQUENCY_LIMIT ? PMF_RESULT.ACCEPTABLE : PMF_RESULT.NOT_ACCEPTABLE,
            f < PMF_FREQUENCY_LIMIT
                ? "Flexión entre 21° y 60° con frecuencia inferior a 2 mov/min."
                : "Flexión entre 21° y 60° con frecuencia igual o superior a 2 mov/min.",
            "DYN_TRUNK_FLEX_21_60",
            {angle:a,frequencyPerMinute:f}
        );
    }

    if ((a >= 61 && a <= 90) || a <= 0) {
        if (f >= PMF_FREQUENCY_LIMIT) {
            return pmfResult(PMF_RESULT.NOT_ACCEPTABLE, "Postura crítica con frecuencia igual o superior a 2 mov/min.", "DYN_TRUNK_FLEX_CRITICAL_FREQ", {angle:a,frequencyPerMinute:f,fullTrunkSupport});
        }
        if (fullTrunkSupport === null) {
            return pmfResult(PMF_RESULT.NEEDS_CONFIRMATION, "Debe confirmarse manualmente si existe soporte completo del tronco.", "DYN_TRUNK_FLEX_SUPPORT", {angle:a,frequencyPerMinute:f,fullTrunkSupport});
        }
        return pmfResult(
            fullTrunkSupport ? PMF_RESULT.ACCEPTABLE : PMF_RESULT.NOT_ACCEPTABLE,
            fullTrunkSupport
                ? "Frecuencia inferior a 2 mov/min y soporte completo del tronco."
                : "Frecuencia inferior a 2 mov/min pero sin soporte completo del tronco.",
            "DYN_TRUNK_FLEX_SUPPORT",
            {angle:a,frequencyPerMinute:f,fullTrunkSupport}
        );
    }

    return pmfResult(PMF_RESULT.NOT_EVALUATED, "Ángulo fuera del intervalo codificado del criterio.", "DYN_TRUNK_FLEX_RANGE", {angle:a,frequencyPerMinute:f});
}

function evaluateSymmetricDynamic({ angle, frequencyPerMinute, criticalTimePercent, neutralMin, neutralMax, criterionId, label }) {
    const a = Number(angle);
    const f = Number(frequencyPerMinute);
    const t = Number(criticalTimePercent);

    if (!Number.isFinite(a) || !Number.isFinite(f)) {
        return pmfResult(PMF_RESULT.NOT_EVALUATED, "Faltan ángulo o frecuencia válidos.", criterionId);
    }

    if (a >= neutralMin && a <= neutralMax) {
        return pmfResult(PMF_RESULT.ACCEPTABLE, `${label}: ángulo dentro del rango aceptable.`, criterionId + "_NEUTRAL", {angle:a,frequencyPerMinute:f,criticalTimePercent:t});
    }

    if (f >= PMF_FREQUENCY_LIMIT) {
        return pmfResult(PMF_RESULT.NOT_ACCEPTABLE, `${label}: fuera del rango aceptable y frecuencia igual o superior a 2 mov/min.`, criterionId + "_HIGH_FREQ", {angle:a,frequencyPerMinute:f,criticalTimePercent:t});
    }

    if (!Number.isFinite(t)) {
        return pmfResult(PMF_RESULT.NEEDS_CONFIRMATION, `${label}: debe determinarse el porcentaje de tiempo en postura crítica.`, criterionId + "_TIME", {angle:a,frequencyPerMinute:f,criticalTimePercent:null});
    }

    return pmfResult(
        t > PMF_CRITICAL_TIME_LIMIT_PERCENT ? PMF_RESULT.NOT_ACCEPTABLE : PMF_RESULT.ACCEPTABLE,
        t > PMF_CRITICAL_TIME_LIMIT_PERCENT
            ? `${label}: postura crítica durante más del 60% del tiempo de la tarea.`
            : `${label}: frecuencia inferior a 2 mov/min y postura crítica no superior al 60% del tiempo de la tarea.`,
        criterionId + "_TIME",
        {angle:a,frequencyPerMinute:f,criticalTimePercent:t}
    );
}

function evaluateTrunkLateralDynamic(inputs) {
    return evaluateSymmetricDynamic({...inputs,neutralMin:-10,neutralMax:10,criterionId:"DYN_TRUNK_LATERAL",label:"Inclinación lateral de tronco"});
}
function evaluateTrunkRotationDynamic(inputs) {
    return evaluateSymmetricDynamic({...inputs,neutralMin:-10,neutralMax:10,criterionId:"DYN_TRUNK_ROTATION",label:"Rotación axial de tronco"});
}
function evaluateHeadLateralDynamic(inputs) {
    return evaluateSymmetricDynamic({...inputs,neutralMin:-10,neutralMax:10,criterionId:"DYN_HEAD_LATERAL",label:"Lateralización de cabeza"});
}
function evaluateHeadRotationDynamic(inputs) {
    return evaluateSymmetricDynamic({...inputs,neutralMin:-45,neutralMax:45,criterionId:"DYN_HEAD_ROTATION",label:"Rotación axial de cabeza"});
}

function evaluateHeadFlexionDynamic({ angle, frequencyPerMinute, criticalTimePercent }) {
    const a=Number(angle), f=Number(frequencyPerMinute), t=Number(criticalTimePercent);
    if(!Number.isFinite(a)||!Number.isFinite(f)) return pmfResult(PMF_RESULT.NOT_EVALUATED,"Faltan ángulo o frecuencia válidos.","DYN_HEAD_FLEX");
    if(a>=-40 && a<=0) return pmfResult(PMF_RESULT.ACCEPTABLE,"Flexión/extensión de cabeza entre -40° y 0°.","DYN_HEAD_FLEX_NEUTRAL",{angle:a,frequencyPerMinute:f,criticalTimePercent:t});
    if(f>=PMF_FREQUENCY_LIMIT) return pmfResult(PMF_RESULT.NOT_ACCEPTABLE,"Fuera del rango -40° a 0° y frecuencia igual o superior a 2 mov/min.","DYN_HEAD_FLEX_HIGH_FREQ",{angle:a,frequencyPerMinute:f,criticalTimePercent:t});
    if(!Number.isFinite(t)) return pmfResult(PMF_RESULT.NEEDS_CONFIRMATION,"Debe determinarse el porcentaje de tiempo en postura crítica.","DYN_HEAD_FLEX_TIME",{angle:a,frequencyPerMinute:f});
    return pmfResult(t>60?PMF_RESULT.NOT_ACCEPTABLE:PMF_RESULT.ACCEPTABLE,t>60?"Postura crítica durante más del 60% del tiempo de la tarea.":"Frecuencia inferior a 2 mov/min y postura crítica no superior al 60% del tiempo de la tarea.","DYN_HEAD_FLEX_TIME",{angle:a,frequencyPerMinute:f,criticalTimePercent:t});
}

function evaluateTrunkStatic({ motion, angle, fullTrunkSupport = null, durationCriterionResult = null, lumbarConvex = null }) {
    const a = Number(angle);

    if (motion === "lumbar_convex") {
        if (lumbarConvex === null) return pmfResult(PMF_RESULT.NEEDS_CONFIRMATION,"Debe confirmarse manualmente la existencia de postura convexa lumbar.","STAT_TRUNK_CONVEX");
        return pmfResult(lumbarConvex?PMF_RESULT.NOT_ACCEPTABLE:PMF_RESULT.ACCEPTABLE,lumbarConvex?"Existe postura convexa de la espina lumbar.":"No existe postura convexa de la espina lumbar.","STAT_TRUNK_CONVEX",{lumbarConvex});
    }

    if(!Number.isFinite(a)) return pmfResult(PMF_RESULT.NOT_EVALUATED,"Falta ángulo válido.","STAT_TRUNK");

    if (motion === "lateral" || motion === "rotation") {
        return pmfResult(
            a < -10 || a > 10 ? PMF_RESULT.NOT_ACCEPTABLE : PMF_RESULT.ACCEPTABLE,
            a < -10 || a > 10 ? "Postura estática fuera del rango -10° a 10°." : "Postura estática dentro del rango -10° a 10°.",
            motion === "lateral" ? "STAT_TRUNK_LATERAL" : "STAT_TRUNK_ROTATION",
            {angle:a}
        );
    }

    if (motion === "flexion") {
        if (a > 60) return pmfResult(PMF_RESULT.NOT_ACCEPTABLE,"Flexión estática de tronco superior a 60°.","STAT_TRUNK_FLEX_GT60",{angle:a});
        if (a >= 0 && a <= 20) return pmfResult(PMF_RESULT.ACCEPTABLE,"Flexión estática de tronco entre 0° y 20°.","STAT_TRUNK_FLEX_0_20",{angle:a});
        if (a > 20 && a <= 60) {
            if (fullTrunkSupport === true) return pmfResult(PMF_RESULT.ACCEPTABLE,"Flexión entre 20° y 60° con soporte completo del tronco.","STAT_TRUNK_FLEX_20_60_SUPPORT",{angle:a,fullTrunkSupport});
            if (fullTrunkSupport === null) return pmfResult(PMF_RESULT.NEEDS_CONFIRMATION,"Debe confirmarse si existe soporte completo del tronco.","STAT_TRUNK_FLEX_20_60_SUPPORT",{angle:a});
            if (durationCriterionResult === PMF_RESULT.ACCEPTABLE || durationCriterionResult === PMF_RESULT.NOT_ACCEPTABLE) {
                return pmfResult(durationCriterionResult,"Resultado según criterio de duración de la tabla 5.10.","STAT_TRUNK_FLEX_20_60_DURATION",{angle:a,fullTrunkSupport,durationCriterionResult});
            }
            return pmfResult(PMF_RESULT.NEEDS_CONFIRMATION,"Sin soporte completo: falta aplicar el criterio de duración de la tabla 5.10.","STAT_TRUNK_FLEX_20_60_DURATION",{angle:a,fullTrunkSupport});
        }
        if (a < 0) {
            if (fullTrunkSupport === null) return pmfResult(PMF_RESULT.NEEDS_CONFIRMATION,"Debe confirmarse el soporte completo del tronco.","STAT_TRUNK_EXTENSION_SUPPORT",{angle:a});
            return pmfResult(fullTrunkSupport?PMF_RESULT.ACCEPTABLE:PMF_RESULT.NOT_ACCEPTABLE,fullTrunkSupport?"Extensión con soporte completo del tronco.":"Extensión sin soporte completo del tronco.","STAT_TRUNK_EXTENSION_SUPPORT",{angle:a,fullTrunkSupport});
        }
    }

    return pmfResult(PMF_RESULT.NOT_EVALUATED,"Combinación estática de tronco no codificada.","STAT_TRUNK_UNKNOWN",{motion,angle:a});
}

function evaluateHeadStatic({ motion, angle, fullHeadSupport = null }) {
    const a=Number(angle);
    if(!Number.isFinite(a)) return pmfResult(PMF_RESULT.NOT_EVALUATED,"Falta ángulo válido.","STAT_HEAD");

    if(motion==="lateral") return pmfResult(a<-10||a>10?PMF_RESULT.NOT_ACCEPTABLE:PMF_RESULT.ACCEPTABLE,a<-10||a>10?"Lateralización estática fuera de -10° a 10°.":"Lateralización estática entre -10° y 10°.","STAT_HEAD_LATERAL",{angle:a});
    if(motion==="rotation") return pmfResult(a<-45||a>45?PMF_RESULT.NOT_ACCEPTABLE:PMF_RESULT.ACCEPTABLE,a<-45||a>45?"Rotación axial estática fuera de -45° a 45°.":"Rotación axial estática entre -45° y 45°.","STAT_HEAD_ROTATION",{angle:a});
    if(motion==="neck_flexion") return pmfResult(a<0||a>25?PMF_RESULT.NOT_ACCEPTABLE:PMF_RESULT.ACCEPTABLE,a<0||a>25?"Flexo-extensión de cuello fuera de 0° a 25°.":"Flexo-extensión de cuello entre 0° y 25°.","STAT_NECK_FLEX",{angle:a});
    if(motion==="head_extension") {
        if(a>=0) return pmfResult(PMF_RESULT.NOT_EVALUATED,"Este criterio corresponde a extensión de cabeza (<0°).","STAT_HEAD_EXTENSION",{angle:a});
        if(fullHeadSupport===null) return pmfResult(PMF_RESULT.NEEDS_CONFIRMATION,"Debe confirmarse el soporte completo de la cabeza.","STAT_HEAD_EXTENSION_SUPPORT",{angle:a});
        return pmfResult(fullHeadSupport?PMF_RESULT.ACCEPTABLE:PMF_RESULT.NOT_ACCEPTABLE,fullHeadSupport?"Extensión de cabeza con soporte completo.":"Extensión de cabeza sin soporte completo.","STAT_HEAD_EXTENSION_SUPPORT",{angle:a,fullHeadSupport});
    }
    return pmfResult(PMF_RESULT.NEEDS_CONFIRMATION,"El criterio seleccionado requiere datos adicionales o criterio de duración no codificado todavía.","STAT_HEAD_PENDING",{motion,angle:a});
}

window.PMFCriteria = {
    RESULT: PMF_RESULT,
    LIMITS: {frequencyPerMinute:PMF_FREQUENCY_LIMIT,criticalTimePercent:PMF_CRITICAL_TIME_LIMIT_PERCENT,staticMinSeconds:PMF_STATIC_MIN_SECONDS},
    dynamic: {
        trunkFlexion:evaluateTrunkFlexionDynamic,
        trunkLateral:evaluateTrunkLateralDynamic,
        trunkRotation:evaluateTrunkRotationDynamic,
        headFlexion:evaluateHeadFlexionDynamic,
        headLateral:evaluateHeadLateralDynamic,
        headRotation:evaluateHeadRotationDynamic
    },
    static: {
        trunk:evaluateTrunkStatic,
        head:evaluateHeadStatic
    }
};