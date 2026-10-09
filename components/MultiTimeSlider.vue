<script>
import {mapGetters, mapMutations, mapActions} from "vuex";

/**
 * MultiTimeSlider - Hauptkomponente für das MultiTimeSlider-AddOn.
 * @module addons/multiTimeSlider/components/MultiTimeSlider
 */
export default {
    name: "MultiTimeSlider",
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
    methods: {
        ...mapMutations("Modules/MultiTimeSlider", [
            "setActive",
            "setActiveLayerId",
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
        },

        /**
         * Behandelt Änderung des Sliders per Input-Event.
         * @param {Event} event Das Input-Event.
         */
        onSliderInput (event) {
            this.setCurrentStepIndex(Number(event.target.value));
        },

        /**
         * Behandelt Auswahl eines neuen Layers.
         * @param {Event} event Das Change-Event.
         */
        onLayerChange (event) {
            this.selectLayer(event.target.value);
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

        <!-- 1. Layerauswahl -->
        <div class="mb-3">
            <label
                for="multi-time-slider-layer-select"
                class="form-label fw-bold mb-1"
            >
                {{ $t("additional:modules.tools.multiTimeSlider.selectLayer") }}
            </label>
            <select
                id="multi-time-slider-layer-select"
                class="form-select form-select-sm"
                :value="activeLayerId || ''"
                @change="onLayerChange"
            >
                <option
                    v-if="layers.length === 0"
                    value=""
                    disabled
                >
                    {{ $t("additional:modules.tools.multiTimeSlider.noLayersAvailable") }}
                </option>
                <option
                    v-for="layer in layers"
                    :key="layer.id"
                    :value="layer.id"
                >
                    {{ layer.title || layer.name || layer.id }}
                </option>
            </select>
        </div>

        <!-- 2. Playback-Steuerung & Zeitstufen-Slider -->
        <div class="card bg-light border-0 p-3 mb-3">
            <!-- Aktuelle Zeitstufe Badge -->
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small">
                    {{ $t("additional:modules.tools.multiTimeSlider.currentTime") }}:
                </span>
                <span
                    v-if="currentTimeStep"
                    class="badge bg-primary fs-6 px-2 py-1"
                >
                    {{ currentTimeStep }}
                </span>
                <span
                    v-else
                    class="badge bg-secondary fs-6 px-2 py-1"
                >
                    {{ $t("additional:modules.tools.multiTimeSlider.noTimeStepSelected") }}
                </span>
            </div>

            <!-- Schieberegler -->
            <div class="mb-3">
                <input
                    id="multi-time-slider-range"
                    type="range"
                    class="form-range"
                    min="0"
                    :max="timeSteps.length > 0 ? timeSteps.length - 1 : 0"
                    :value="currentStepIndex"
                    :disabled="timeSteps.length === 0"
                    @input="onSliderInput"
                >
                <div
                    v-if="timeSteps.length > 0"
                    class="d-flex justify-content-between text-muted small px-1"
                >
                    <span>{{ timeSteps[0] }}</span>
                    <span>{{ timeSteps[timeSteps.length - 1] }}</span>
                </div>
            </div>

            <!-- Steuerungs-Buttons -->
            <div class="d-flex justify-content-center align-items-center gap-2">
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

    .form-range {
        cursor: pointer;

        &:disabled {
            cursor: not-allowed;
        }
    }
}
</style>
