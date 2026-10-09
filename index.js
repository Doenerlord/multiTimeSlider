import MultiTimeSliderComponent from "./components/MultiTimeSlider.vue";
import MultiTimeSliderStore from "./store/indexMultiTimeSlider.js";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

/**
 * MultiTimeSlider Addon Entry Point.
 */
export default {
    component: MultiTimeSliderComponent,
    store: MultiTimeSliderStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
