/**
 * Actions für das MultiTimeSlider Modul.
 * @module addons/multiTimeSlider/store/actionsMultiTimeSlider
 */
const actions = {
    /**
     * Initialisiert oder wechselt den aktiven Layer und lädt dessen Zeitstufen.
     * @param {Object} context Vuex Action Context.
     * @param {String} layerId Ausgewählte Layer-ID.
     * @returns {void}
     */
    selectLayer ({commit, state}, layerId) {
        commit("setActiveLayerId", layerId);
        const targetLayer = state.layers.find(layer => layer.id === layerId);

        if (targetLayer && Array.isArray(targetLayer.timeSteps) && targetLayer.timeSteps.length > 0) {
            commit("setTimeSteps", targetLayer.timeSteps);

            let initialIndex = 0;
            if (targetLayer.defaultStep) {
                const foundIndex = targetLayer.timeSteps.indexOf(targetLayer.defaultStep);
                if (foundIndex !== -1) {
                    initialIndex = foundIndex;
                }
            }
            commit("setCurrentStepIndex", initialIndex);
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
