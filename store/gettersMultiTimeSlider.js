/**
 * Getters für das MultiTimeSlider Modul.
 * @module addons/multiTimeSlider/store/gettersMultiTimeSlider
 */
const getters = {
    description: state => state.description,
    icon: state => state.icon,
    hasMouseMapInteractions: state => state.hasMouseMapInteractions,
    name: state => state.name,
    supportedDevices: state => state.supportedDevices,
    supportedMapModes: state => state.supportedMapModes,
    type: state => state.type,
    active: state => state.active,
    layerIds: state => state.layerIds,
    layers: state => state.layers,
    activeLayerId: state => state.activeLayerId,
    timeSteps: state => state.timeSteps,
    currentStepIndex: state => state.currentStepIndex,
    sliderPosition: state => state.sliderPosition,
    isPlaying: state => state.isPlaying,
    playbackSpeed: state => state.playbackSpeed,
    isLooping: state => state.isLooping,
    playbackTimer: state => state.playbackTimer,

    /**
     * Liefert das aktuelle Zeitstufen-Element basierend auf currentStepIndex.
     * @param {Object} state Modul-State.
     * @returns {String|null} Aktueller Zeitstempel oder null.
     */
    currentTimeStep: state => {
        if (state.timeSteps && state.timeSteps.length > 0 && state.currentStepIndex >= 0 && state.currentStepIndex < state.timeSteps.length) {
            return state.timeSteps[state.currentStepIndex];
        }
        return null;
    },

    /**
     * Liefert das aktuell ausgewählte Layer-Objekt.
     * @param {Object} state Modul-State.
     * @returns {Object|null} Layer-Objekt oder null.
     */
    activeLayer: state => {
        if (!state.activeLayerId || !state.layers || state.layers.length === 0) {
            return null;
        }
        return state.layers.find(layer => layer.id === state.activeLayerId) || null;
    },

    /**
     * Prüft, ob der aktive Layer eine Multi-Layer-Sequenz ist.
     * @param {Object} state Modul-State.
     * @param {Object} getters Modul-Getters.
     * @returns {Boolean} true wenn Multi-Layer-Sequenz.
     */
    isLayerSequence: (state, getters) => {
        const active = getters.activeLayer;

        return Boolean(active && Array.isArray(active.layerIds) && active.layerIds.length > 0);
    }
};

export default getters;
