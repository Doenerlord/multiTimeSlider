<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import LayerSelector from "./LayerSelector.vue";
import TimeSliderBar from "./TimeSliderBar.vue";

/**
 * MultiTimeSlider - Hauptkomponente für das MultiTimeSlider-AddOn.
 * @module addons/multiTimeSlider/components/MultiTimeSlider
 */
export default {
    name: "MultiTimeSlider",
    components: {
        LayerSelector,
        TimeSliderBar
    },
    props: {
        /** Side of the menu (mainMenu or secondaryMenu) */
        side: {
            type: String,
            default: "secondaryMenu"
        }
    },
    computed: {
        ...mapGetters("Modules/MultiTimeSlider", [
            "name",
            "icon",
            "layers",
            "activeLayerId",
            "activeLayer",
            "timeSteps",
            "currentStepIndex",
            "currentTimeStep",
            "isPlaying",
            "playbackSpeed"
        ])
    },
    watch: {
        layers: {
            immediate: true,
            handler (newLayers) {
                if (Array.isArray(newLayers) && newLayers.length > 0 && (!this.activeLayerId || this.timeSteps.length === 0)) {
                    this.selectLayer(this.activeLayerId || newLayers[0].id);
                }
            }
        }
    },
    mounted () {
        if (Array.isArray(this.layers) && this.layers.length > 0 && (!this.activeLayerId || this.timeSteps.length === 0)) {
            this.selectLayer(this.activeLayerId || this.layers[0].id);
        }
    },
    methods: {
        ...mapMutations("Modules/MultiTimeSlider", [
            "setActive",
            "setCurrentStepIndex",
            "setIsPlaying"
        ]),
        ...mapActions("Modules/MultiTimeSlider", [
            "selectLayer",
            "step"
        ]),

        /**
         * Schaltet die Animation an/aus.
         */
        togglePlay () {
            this.setIsPlaying(!this.isPlaying);
        }
    }
};
</script>

<template>
    <div
        id="multi-time-slider"
        class="multi-time-slider-container p-3"
    >
        <!-- Header / Info -->
        <div class="d-flex align-items-center mb-3 border-bottom pb-2">
            <i
                :class="[icon, 'fs-4 me-2 text-primary']"
                aria-hidden="true"
            />
            <h5 class="mb-0">
                {{ $t(name) }}
            </h5>
        </div>

        <!-- 1. Layerauswahl via LayerSelector-Komponente -->
        <LayerSelector />

        <!-- 2. Playback-Steuerung & Zeitstufen-Slider -->
        <div class="card bg-light border-0 p-3 mb-3">
            <!-- TimeSliderBar mit Live Drag-Tooltip und Ticks -->
            <TimeSliderBar />

            <!-- Steuerungs-Buttons -->
            <div class="d-flex justify-content-center align-items-center gap-2 mt-3 pt-2 border-top">
                <!-- Schritt zurück -->
                <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    :title="$t('additional:modules.tools.multiTimeSlider.stepBack')"
                    :disabled="timeSteps.length === 0 || currentStepIndex <= 0"
                    @click="step(false)"
                >
                    <i class="bi bi-skip-start-fill" />
                </button>

                <!-- Play / Pause -->
                <button
                    type="button"
                    class="btn btn-primary btn-sm px-3"
                    :title="isPlaying ? $t('additional:modules.tools.multiTimeSlider.pause') : $t('additional:modules.tools.multiTimeSlider.play')"
                    :disabled="timeSteps.length === 0"
                    @click="togglePlay"
                >
                    <i :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'" />
                </button>

                <!-- Schritt vor -->
                <button
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    :title="$t('additional:modules.tools.multiTimeSlider.stepForward')"
                    :disabled="timeSteps.length === 0 || currentStepIndex >= timeSteps.length - 1"
                    @click="step(true)"
                >
                    <i class="bi bi-skip-end-fill" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.multi-time-slider-container {
    width: 100%;
    min-width: 280px;
}
</style>
