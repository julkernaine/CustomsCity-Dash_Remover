// ==UserScript==
// @name         Remove Dash from 2nd Floating Filter Only
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Removes dashes only from the second ag-Grid floating filter input and plays a low-volume beep.
// @author       You
// @match        https://app.customscity.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let audioCtx = null;

    // --------------------------
    // Low-volume beep
    // --------------------------
    function playLowBeep() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }

            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = "sine";
            oscillator.frequency.value = 440;

            // Very low volume
            gainNode.gain.value = 0.05;

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } catch (err) {
            console.error(err);
        }
    }

    // --------------------------
    // Handle typing
    // --------------------------
    function handleInput(e) {

        // Find all floating filter inputs
        const filters = document.querySelectorAll('input[ref="eFloatingFilterText"]');

        // Make sure there are at least two
        if (filters.length < 2) return;

        // Only target the SECOND one
        const secondFilter = filters[1];

        // Ignore every other input
        if (e.target !== secondFilter) return;

        if (!secondFilter.value.includes('-')) return;

        // Small delay so AG Grid finishes updating
        setTimeout(() => {

            const original = secondFilter.value;
            const cleaned = original.replace(/-/g, '');

            if (original !== cleaned) {

                secondFilter.value = cleaned;

                playLowBeep();

                secondFilter.dispatchEvent(new Event("input", { bubbles: true }));
                secondFilter.dispatchEvent(new Event("change", { bubbles: true }));

            }

        }, 10);
    }

    // Listen for typing
    document.addEventListener("input", handleInput, true);
    document.addEventListener("keyup", handleInput, true);

})();