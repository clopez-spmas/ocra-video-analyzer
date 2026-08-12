"use strict";

/* =========================================================
   OCRA VIDEO ANALYZER
   Presentación visual del análisis temporal
   No modifica ningún cálculo: solo organiza los resultados.
========================================================= */

(function () {

    function createCard(className) {
        const card = document.createElement("div");
        card.className = `temporal-result-card ${className || ""}`.trim();
        return card;
    }

    function moveUntil(node, stop) {
        const nodes = [];
        let current = node;
        while (current && current !== stop) {
            const next = current.nextSibling;
            nodes.push(current);
            current = next;
        }
        return nodes;
    }

    function buildTemporalLayout() {
        const container = document.getElementById("postureResults");
        if (!container || container.dataset.temporalLayoutApplied === "true") return;

        const children = Array.from(container.children);
        const frequencyTitle = children.find(
            el => el.tagName === "H3" && el.textContent.trim() === "Frecuencia de adopción de posturas"
        );

        if (!frequencyTitle) return;

        const frequencySeparator = frequencyTitle.previousElementSibling;
        const frequencyStart = frequencySeparator && frequencySeparator.tagName === "HR"
            ? frequencySeparator
            : frequencyTitle;

        const maintainedNodes = moveUntil(container.firstElementChild, frequencyStart);
        const frequencyNodes = [];
        let current = frequencyStart.nextElementSibling;
        while (current) {
            frequencyNodes.push(current);
            current = current.nextElementSibling;
        }

        if (!maintainedNodes.length || !frequencyNodes.length) return;

        const maintainedBlock = createCard("temporal-maintained-block");
        const frequencyBlock = createCard("temporal-frequency-block");

        /* ---------- POSTURAS MANTENIDAS ---------- */
        let currentCard = null;
        maintainedNodes.forEach(node => {
            if (node.tagName === "H4" && /^Vídeo\s+/i.test(node.textContent.trim())) {
                currentCard = createCard("temporal-video-card");
                maintainedBlock.appendChild(currentCard);
                currentCard.appendChild(node);
                return;
            }

            if (node.tagName === "H3" && node.textContent.trim() === "Resultados globales") {
                currentCard = createCard("temporal-global-card");
                maintainedBlock.appendChild(currentCard);
                currentCard.appendChild(node);
                return;
            }

            if (node.tagName === "H4" && node.textContent.trim() === "Rangos y franjas estudiados") {
                currentCard = createCard("temporal-ranges-card");
                maintainedBlock.appendChild(currentCard);
                currentCard.appendChild(node);
                return;
            }

            if (currentCard) {
                currentCard.appendChild(node);
            } else {
                maintainedBlock.appendChild(node);
            }
        });

        /* ---------- FRECUENCIA ---------- */
        let frequencyCard = null;
        frequencyNodes.forEach(node => {
            if (node.tagName === "H4" && /^Vídeo\s+/i.test(node.textContent.trim())) {
                frequencyCard = createCard("temporal-video-card");
                frequencyBlock.appendChild(frequencyCard);
                frequencyCard.appendChild(node);
                return;
            }

            if (node.tagName === "H3" && node.textContent.trim() === "Resultados globales") {
                frequencyCard = createCard("temporal-global-card");
                frequencyBlock.appendChild(frequencyCard);
                frequencyCard.appendChild(node);
                return;
            }

            if (frequencyCard) {
                frequencyCard.appendChild(node);
            } else {
                frequencyBlock.appendChild(node);
            }
        });

        container.replaceChildren(maintainedBlock, frequencyBlock);
        container.dataset.temporalLayoutApplied = "true";
    }

    function scheduleLayout() {
        requestAnimationFrame(() => {
            buildTemporalLayout();
        });
    }

    function init() {
        const container = document.getElementById("postureResults");
        if (!container) return;

        const observer = new MutationObserver(() => {
            if (container.dataset.temporalLayoutApplied === "true") return;
            scheduleLayout();
        });

        observer.observe(container, {
            childList: true,
            subtree: true
        });

        scheduleLayout();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
