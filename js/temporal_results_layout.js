"use strict";

/* =========================================================
   OCRA VIDEO ANALYZER
   Presentación visual del análisis temporal
   Estructura equivalente a Resultados biomecánicos.
   No modifica ningún cálculo.
========================================================= */

(function () {

    let rebuilding = false;
    let timer = null;

    function card(className) {
        const el = document.createElement("div");
        el.className = `temporal-result-card ${className || ""}`.trim();
        return el;
    }

    function takeUntil(nodes, start, end) {
        return nodes.slice(start, end);
    }

    function build() {
        const container = document.getElementById("postureResults");
        if (!container || rebuilding) return;

        const nodes = Array.from(container.children);
        const frequencyIndex = nodes.findIndex(
            el => el.tagName === "H3" && el.textContent.trim() === "Frecuencia de adopción de posturas"
        );
        if (frequencyIndex < 0) return;

        const maintained = nodes.slice(0, frequencyIndex);
        const frequency = nodes.slice(frequencyIndex);

        const maintainedGlobalIndex = maintained.findIndex(
            el => el.tagName === "H3" && el.textContent.trim() === "Resultados globales"
        );

        const frequencyGlobalIndex = frequency.findIndex(
            el => el.tagName === "H3" && el.textContent.trim() === "Resultados globales"
        );

        if (maintainedGlobalIndex < 0 || frequencyGlobalIndex < 0) return;

        rebuilding = true;

        /* =====================================================
           POSTURAS MANTENIDAS
           Una tarjeta blanca para los resultados individuales,
           otra para los resultados globales.
        ===================================================== */

        const maintainedIndividual = card("temporal-maintained-individual");
        takeUntil(maintained, 0, maintainedGlobalIndex).forEach(node => {
            maintainedIndividual.appendChild(node);
        });

        const maintainedGlobal = card("temporal-maintained-global");
        takeUntil(maintained, maintainedGlobalIndex, maintained.length).forEach(node => {
            maintainedGlobal.appendChild(node);
        });

        /* =====================================================
           FRECUENCIA
           Una tarjeta blanca para los resultados individuales,
           otra para los resultados globales.
        ===================================================== */

        const frequencyIndividual = card("temporal-frequency-individual");
        takeUntil(frequency, 0, frequencyGlobalIndex).forEach(node => {
            frequencyIndividual.appendChild(node);
        });

        const frequencyGlobal = card("temporal-frequency-global");
        takeUntil(frequency, frequencyGlobalIndex, frequency.length).forEach(node => {
            frequencyGlobal.appendChild(node);
        });

        container.replaceChildren(
            maintainedIndividual,
            maintainedGlobal,
            frequencyIndividual,
            frequencyGlobal
        );

        container.dataset.temporalLayoutApplied = "true";
        rebuilding = false;
    }

    function schedule() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            build();
        }, 0);
    }

    function init() {
        const container = document.getElementById("postureResults");
        if (!container) return;

        const observer = new MutationObserver(() => {
            if (!rebuilding) schedule();
        });

        observer.observe(container, {
            childList: true,
            subtree: true
        });

        schedule();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
