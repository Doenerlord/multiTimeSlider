import state from "./stateMultiTimeSlider.js";
import getters from "./gettersMultiTimeSlider.js";
import mutations from "./mutationsMultiTimeSlider.js";
import actions from "./actionsMultiTimeSlider.js";

/**
 * MultiTimeSlider Vuex Store Modul.
 */
export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
