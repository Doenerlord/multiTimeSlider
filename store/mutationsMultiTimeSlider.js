/**
 * Mutations für das MultiTimeSlider Modul.
 * @module addons/multiTimeSlider/store/mutationsMultiTimeSlider
 */
const mutations = {
    setActive (state, active) {
        state.active = active;
    },
    setLayerIds (state, layerIds) {
        state.layerIds = layerIds;
    },
    setLayers (state, layers) {
        state.layers = layers;
    },
    setActiveLayerId (state, activeLayerId) {
        state.activeLayerId = activeLayerId;
    },
    setTimeSteps (state, timeSteps) {
        state.timeSteps = timeSteps;
    },
    setCurrentStepIndex (state, currentStepIndex) {
        state.currentStepIndex = currentStepIndex;
    },
    setIsPlaying (state, isPlaying) {
        state.isPlaying = isPlaying;
    },
    setPlaybackSpeed (state, playbackSpeed) {
        state.playbackSpeed = playbackSpeed;
    },
    setName (state, name) {
        state.name = name;
    },
    setIcon (state, icon) {
        state.icon = icon;
    },
    setDescription (state, description) {
        state.description = description;
    }
};

export default mutations;
