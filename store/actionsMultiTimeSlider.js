import {
    crossfadeLayerSequence,
    showExactLayer,
    updateWmsTime,
    getWmsTime,
    restoreAllInitialStates,
    recordInitialState
} from "../services/layerTimeService.js";

/**
 * Hilfsfunktion zum chronologischen Sortieren einer Layer-Sequenz (z.B. 1938 -> 2025).
 * @param {Array<Object>} layerIds Array von { title, layerId }.
 * @returns {Array<Object>} Sortierte Kopie des Arrays.
 */
function sortLayerIdsChronologically (layerIds = []) {
    return [...layerIds].sort((a, b) => {
        const numA = parseInt(a.title, 10),
            numB = parseInt(b.title, 10);

        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        return String(a.title).localeCompare(String(b.title));
    });
}

/**
 * Actions für das MultiTimeSlider Modul.
 * @module addons/multiTimeSlider/store/actionsMultiTimeSlider
 */
const actions = {
    /**
     * Initialisiert und normalisiert die Layer aus der Konfiguration.
     * Unterstützt sowohl Root-Eintrag "layerIds: [...]" (wie alter LayerSlider)
     * als auch "layers: [...]" mit Multi-Layer-Sequenzen oder WMS-T Layern.
     *
     * @param {Object} context Vuex Action Context.
     * @returns {void}
     */
    initLayers ({commit, dispatch, state, rootGetters}) {
        let normalizedLayers = [];

        // Fall 1: Root-Konfiguration hat direkt layerIds (wie alter LayerSlider)
        if (Array.isArray(state.layerIds) && state.layerIds.length > 0 && typeof state.layerIds[0] === "object") {
            const sortedIds = sortLayerIdsChronologically(state.layerIds);

            // Initiale Zustände im Service festhalten
            sortedIds.forEach(item => recordInitialState(item.layerId, rootGetters));

            normalizedLayers.push({
                id: "rootLayerSequence",
                title: state.name || "Historische Luftbilder",
                layerIds: sortedIds,
                timeSteps: sortedIds.map(item => item.title),
                defaultStep: state.defaultStep || sortedIds[sortedIds.length - 1].title
            });
        }
        // Fall 2: Array von Schichten unter "layers: [...]"
        else if (Array.isArray(state.layers) && state.layers.length > 0) {
            normalizedLayers = state.layers.map(layer => {
                if (Array.isArray(layer.layerIds) && layer.layerIds.length > 0) {
                    const sortedIds = sortLayerIdsChronologically(layer.layerIds);

                    sortedIds.forEach(item => recordInitialState(item.layerId, rootGetters));

                    return {
                        ...layer,
                        layerIds: sortedIds,
                        timeSteps: sortedIds.map(item => item.title),
                        defaultStep: layer.defaultStep || sortedIds[sortedIds.length - 1].title
                    };
                }
                return layer;
            });
        }

        if (normalizedLayers.length > 0) {
            commit("setLayers", normalizedLayers);

            const initialLayerId = state.activeLayerId || normalizedLayers[0].id;

            dispatch("selectLayer", initialLayerId);
        }
    },

    /**
     * Wählt einen Layer bzw. eine Sequenz aus und springt zum defaultStep.
     * @param {Object} context Vuex Action Context.
     * @param {String} layerId Die ID des Ziel-Layers.
     * @returns {void}
     */
    selectLayer ({commit, state, dispatch}, layerId) {
        commit("setActiveLayerId", layerId);

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
            commit("setSliderPosition", 0);
        }
    },

    /**
     * Setzt die kontinuierliche Slider-Position (während Drag) und führt Live-Überblendung durch.
     * @param {Object} context Vuex Action Context.
     * @param {Number} position Fließkomma-Position auf der Skala.
     * @returns {void}
     */
    setSliderPosition ({commit, state, getters, dispatch}, position) {
        const count = state.timeSteps.length;

        if (count === 0) {
            return;
        }

        const clampedPos = Math.max(0, Math.min(count - 1, position)),
            nearestIndex = Math.round(clampedPos);

        commit("setSliderPosition", clampedPos);
        commit("setCurrentStepIndex", nearestIndex);

        if (getters.isLayerSequence && getters.activeLayer?.layerIds) {
            crossfadeLayerSequence(getters.activeLayer.layerIds, clampedPos, dispatch);
        }
        else {
            dispatch("syncLayerTime");
        }
    },

    /**
     * Setzt einen exakten ganzzahligen Zeitindex (Klick, Schritt vor/zurück, Playback).
     * @param {Object} context Vuex Action Context.
     * @param {Number} index Der neue Zeitstufen-Index.
     * @returns {void}
     */
    setStepIndex ({commit, dispatch, state, getters}, index) {
        if (index >= 0 && index < state.timeSteps.length) {
            commit("setCurrentStepIndex", index);
            commit("setSliderPosition", index);

            if (getters.isLayerSequence && getters.activeLayer?.layerIds) {
                showExactLayer(getters.activeLayer.layerIds, index, dispatch);
            }
            else {
                dispatch("syncLayerTime");
            }
        }
    },

    /**
     * Synchronisiert den TIME-Parameter für klassische WMS-T Layer.
     * @param {Object} context Vuex Action Context.
     * @returns {void}
     */
    syncLayerTime ({state}) {
        if (!state.activeLayerId || !state.timeSteps || state.timeSteps.length === 0) {
            return;
        }

        const currentStep = state.timeSteps[state.currentStepIndex];

        if (currentStep !== undefined && currentStep !== null) {
            updateWmsTime(state.activeLayerId, currentStep);
        }
    },

    /**
     * Schaltet zur nächsten oder vorherigen Zeitstufe.
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
     * Ändert die Abspielgeschwindigkeit.
     * @param {Object} context Vuex Action Context.
     * @param {Number} speed Neue Geschwindigkeit in ms.
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
     * Stoppt Wiedergabe und stellt vorherige Layer-Zustände wieder her.
     * @param {Object} context Vuex Action Context.
     * @returns {void}
     */
    cleanup ({dispatch}) {
        dispatch("stopPlayback");
        restoreAllInitialStates(dispatch);
    }
};

export default actions;
