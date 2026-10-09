<script>
import {mapGetters, mapMutations, mapActions} from "vuex";
import LayerSelector from "./LayerSelector.vue";
import TimeSliderBar from "./TimeSliderBar.vue";
import PlaybackControls from "./PlaybackControls.vue";

/**
 * MultiTimeSlider - Hauptkomponente für das MultiTimeSlider-AddOn.
 * @module addons/multiTimeSlider/components/MultiTimeSlider
 */
export default {
    name: "MultiTimeSlider",
    components: {
        LayerSelector,
        TimeSliderBar,
        PlaybackControls
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
            "active",
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
        active (newVal) {
            // Beim Schließen des Tools: Wiedergabe stoppen und Cleanup ausführen
            if (!newVal) {
                this.cleanup();
            }
        },
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
    beforeUnmount () {
        this.cleanup();
    },
    unmounted () {
        this.cleanup();
    },
    methods: {
        ...mapMutations("Modules/MultiTimeSlider", [
            "setActive"
        ]),
        ...mapActions("Modules/MultiTimeSlider", [
            "selectLayer",
            "cleanup"
        ])
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

        <!-- 2. Slider & Playback Steuerung -->
        <div class="card bg-light border-0 p-3 mb-3">
            <!-- TimeSliderBar mit Live Drag-Tooltip und Ticks -->
            <TimeSliderBar />

            <!-- Playback-Steuerung (Play/Pause, Vor, Zurück, Loop, Tempo) -->
            <div class="mt-3 pt-2 border-top">
                <PlaybackControls />
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
