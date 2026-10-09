import {updateLayerTime, getLayerTime} from "../services/layerTimeService.js";

/**
 * Actions für das MultiTimeSlider Modul.
 * @module addons/multiTimeSlider/store/actionsMultiTimeSlider
 */
const actions = {
    /**
     * Initialisiert die konfigurierten Layer aus der Portal-Konfiguration und setzt den ersten Layer aktiv.
     * @param {Object} context Vuex Action Context.
     * @param {Array<Object>} layers Liste der konfigurierten Zeit-Layer.
     * @returns {void}
     */
    initLayers ({commit, dispatch, state}, layers) {
        if (Array.isArray(layers) && layers.length > 0) {
            commit("setLayers", layers);

            const initialLayerId = state.activeLayerId || layers[0].id;

            dispatch("selectLayer", initialLayerId);
        }
    },

    /**
     * Umschaltlogik: Wird ein Layer ausgewählt, liest der Store dessen timeSteps aus,
     * merkt sich bei Bedarf den ursprünglichen Zustand und setzt den Zielwert.
     * @param {Object} context Vuex Action Context.
     * @param {String} layerId Die ID des ausgewählten Layers.
     * @returns {void}
     */
    selectLayer ({commit, state, dispatch}, layerId) {
        commit("setActiveLayerId", layerId);

        // Original-Parameter merken, falls noch nicht hinterlegt
        if (layerId && state.originalLayerParams[layerId] === undefined) {
            const originalTime = getLayerTime(layerId);

            commit("setOriginalLayerParam", {layerId, param: originalTime});
        }

        const targetLayer = state.layers.find(layer => layer.id === layerId);

        if (targetLayer && Array.isArray(targetLayer.timeSteps) && targetLayer.timeSteps.length > 0) {
            commit("setTimeSteps", targetLayer.timeSteps);

            let targetIndex = 0;

            if (targetLayer.defaultStep !== undefined && targetLayer.defaultStep !== null) {
                const foundIndex = targetLayer.timeSteps.findIndex(
                    step => String(step) === String(targetLayer.defaultStep)
                );

                if (foundIndex !== -1) {
                    targetIndex = foundIndex;
                }
            }

            dispatch("setStepIndex", targetIndex);
        }
        else {
            commit("setTimeSteps", []);
            commit("setCurrentStepIndex", 0);
        }
    },

    /**
     * Setzt den aktuellen Zeitindex und synchronisiert den Ziel-Layer auf der Karte.
     * @param {Object} context Vuex Action Context.
     * @param {Number} index Der neue Zeitstufen-Index.
     * @returns {void}
     */
    setStepIndex ({commit, dispatch, state}, index) {
        if (index >= 0 && index < state.timeSteps.length) {
            commit("setCurrentStepIndex", index);
            dispatch("syncLayerTime");
        }
    },

    /**
     * Synchronisiert die aktive Zeitstufe mit dem Ziel-Layer auf der OpenLayers-Karte.
     * @param {Object} context Vuex Action Context.
     * @returns {void}
     */
    syncLayerTime ({state}) {
        if (!state.activeLayerId || !state.timeSteps || state.timeSteps.length === 0) {
            return;
        }

        const currentStep = state.timeSteps[state.currentStepIndex];

        if (currentStep !== undefined && currentStep !== null) {
            updateLayerTime(state.activeLayerId, currentStep);
        }
    },

    /**
     * Wechselt zur nächsten oder vorherigen Zeitstufe.
     * @param {Object} context Vuex Action Context.
     * @param {Boolean} [forward=true] Vorwärts (true) oder rückwärts (false).
     * @returns {void}
     */
    step ({state, dispatch}, forward = true) {
        if (!state.timeSteps || state.timeSteps.length === 0) {
            return;
        }

        const delta = forward ? 1 : -1,
            nextIndex = state.currentStepIndex + delta;

        if (nextIndex >= 0 && nextIndex < state.timeSteps.length) {
            dispatch("setStepIndex", nextIndex);
        }
        else if (forward && state.isLooping) {
            // Im Loop-Modus am Ende wieder an den Anfang springen
            dispatch("setStepIndex", 0);
        }
    },

    /**
     * Startet den Playback-Loop (Intervallsteuerung).
     * @param {Object} context Vuex Action Context.
     * @returns {void}
     */
    startPlayback ({commit, state, dispatch}) {
        if (state.isPlaying || !state.timeSteps || state.timeSteps.length <= 1) {
            return;
        }

        // Falls wir am Ende stehen und kein Loop aktiv ist, am Anfang starten
        if (state.currentStepIndex >= state.timeSteps.length - 1) {
            dispatch("setStepIndex", 0);
        }

        commit("setIsPlaying", true);

        const timer = setInterval(() => {
            const nextIndex = state.currentStepIndex + 1;

            if (nextIndex < state.timeSteps.length) {
                dispatch("setStepIndex", nextIndex);
            }
            else if (state.isLooping) {
                dispatch("setStepIndex", 0);
            }
            else {
                dispatch("stopPlayback");
            }
        }, state.playbackSpeed);

        commit("setPlaybackTimer", timer);
    },

    /**
     * Stoppt die automatische Wiedergabe.
     * @param {Object} context Vuex Action Context.
     * @returns {void}
     */
    stopPlayback ({commit, state}) {
        if (state.playbackTimer) {
            clearInterval(state.playbackTimer);
            commit("setPlaybackTimer", null);
        }
        commit("setIsPlaying", false);
    },

    /**
     * Schaltet Play/Pause um.
     * @param {Object} context Vuex Action Context.
     * @returns {void}
     */
    togglePlayback ({state, dispatch}) {
        if (state.isPlaying) {
            dispatch("stopPlayback");
        }
        else {
            dispatch("startPlayback");
        }
    },

    /**
     * Ändert die Abspielgeschwindigkeit und passt laufendes Playback an.
     * @param {Object} context Vuex Action Context.
     * @param {Number} speed Neue Geschwindigkeit in Millisekunden.
     * @returns {void}
     */
    setSpeed ({commit, state, dispatch}, speed) {
        commit("setPlaybackSpeed", speed);

        if (state.isPlaying) {
            dispatch("stopPlayback");
            dispatch("startPlayback");
        }
    },

    /**
     * Bereinigung beim Schließen des Tools:
     * Stoppt laufendes Playback und stellt die ursprünglichen TIME-Parameter wieder her.
     * @param {Object} context Vuex Action Context.
     * @returns {void}
     */
    cleanup ({dispatch, state}) {
        dispatch("stopPlayback");

        // Gespeicherte Originalwerte für alle manipulierten Layer wiederherstellen
        if (state.originalLayerParams) {
            Object.entries(state.originalLayerParams).forEach(([layerId, originalTime]) => {
                if (originalTime !== null && originalTime !== undefined) {
                    updateLayerTime(layerId, originalTime);
                }
            });
        }
    }
};

export default actions;
