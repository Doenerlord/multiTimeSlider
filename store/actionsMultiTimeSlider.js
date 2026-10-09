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
     * Umschaltlogik: Wird ein Layer ausgewählt, liest der Store dessen timeSteps aus
     * und setzt den aktuellen Zeitindex auf den konfigurierten defaultStep (oder 0).
     * @param {Object} context Vuex Action Context.
     * @param {String} layerId Die ID des ausgewählten Layers.
     * @returns {void}
     */
    selectLayer ({commit, state}, layerId) {
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

            commit("setCurrentStepIndex", targetIndex);
        }
        else {
            commit("setTimeSteps", []);
            commit("setCurrentStepIndex", 0);
        }
    },

    /**
     * Wechselt zur nächsten oder vorherigen Zeitstufe.
     * @param {Object} context Vuex Action Context.
     * @param {Boolean} [forward=true] Vorwärts (true) oder rückwärts (false).
     * @returns {void}
     */
    step ({commit, state}, forward = true) {
        if (!state.timeSteps || state.timeSteps.length === 0) {
            return;
        }

        const delta = forward ? 1 : -1,
            nextIndex = state.currentStepIndex + delta;

        if (nextIndex >= 0 && nextIndex < state.timeSteps.length) {
            commit("setCurrentStepIndex", nextIndex);
        }
    }
};

export default actions;
