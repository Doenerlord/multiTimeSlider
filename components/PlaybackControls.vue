<script>
import {mapGetters, mapMutations, mapActions} from "vuex";

/**
 * PlaybackControls - Steuerungseinheit für Wiedergabe, Richtungswechsel, Tempo und Loop.
 * @module addons/multiTimeSlider/components/PlaybackControls
 */
export default {
    name: "PlaybackControls",
    data () {
        return {
            speedOptions: [
                {label: "0.5s", value: 500},
                {label: "1.0s", value: 1000},
                {label: "1.5s", value: 1500},
                {label: "2.0s", value: 2000},
                {label: "3.0s", value: 3000}
            ]
        };
    },
    computed: {
        ...mapGetters("Modules/MultiTimeSlider", [
            "isPlaying",
            "isLooping",
            "playbackSpeed",
            "timeSteps",
            "currentStepIndex"
        ]),

        /**
         * Ob die Steuerungselemente deaktiviert sein sollen.
         * @returns {Boolean} true wenn keine Zeitstufen vorhanden sind.
         */
        isDisabled () {
            return !this.timeSteps || this.timeSteps.length <= 1;
        },

        /**
         * Ob der "Zurück"-Button deaktiviert sein soll.
         * @returns {Boolean} true wenn am Anfang und kein Loop aktiv.
         */
        isBackDisabled () {
            return this.isDisabled || (this.currentStepIndex <= 0 && !this.isLooping);
        },

        /**
         * Ob der "Vor"-Button deaktiviert sein soll.
         * @returns {Boolean} true wenn am Ende und kein Loop aktiv.
         */
        isForwardDisabled () {
            return this.isDisabled || (this.currentStepIndex >= this.timeSteps.length - 1 && !this.isLooping);
        }
    },
    methods: {
        ...mapMutations("Modules/MultiTimeSlider", [
            "setIsLooping"
        ]),
        ...mapActions("Modules/MultiTimeSlider", [
            "step",
            "togglePlayback",
            "setSpeed"
        ]),

        /**
         * Ändert die Geschwindigkeit über das Dropdown.
         * @param {Event} event Das Change-Event.
         */
        onSpeedChange (event) {
            this.setSpeed(Number(event.target.value));
        },

        /**
         * Schaltet den Loop-Modus um.
         */
        toggleLoop () {
            this.setIsLooping(!this.isLooping);
        }
    }
};
</script>

<template>
    <div class="playback-controls-component">
        <!-- Hauptsteuerung Buttons -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <!-- Vor- / Zurück- / Play-Buttons -->
            <div class="btn-group btn-group-sm" role="group">
                <!-- Schritt zurück -->
                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    :title="$t('additional:modules.tools.multiTimeSlider.stepBack')"
                    :disabled="isBackDisabled"
                    @click="step(false)"
                >
                    <i class="bi bi-skip-start-fill" aria-hidden="true" />
                </button>

                <!-- Play / Pause -->
                <button
                    type="button"
                    class="btn px-3"
                    :class="isPlaying ? 'btn-warning text-dark' : 'btn-primary'"
                    :title="isPlaying ? $t('additional:modules.tools.multiTimeSlider.pause') : $t('additional:modules.tools.multiTimeSlider.play')"
                    :disabled="isDisabled"
                    @click="togglePlayback"
                >
                    <i
                        :class="isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill'"
                        aria-hidden="true"
                    />
                </button>

                <!-- Schritt vor -->
                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    :title="$t('additional:modules.tools.multiTimeSlider.stepForward')"
                    :disabled="isForwardDisabled"
                    @click="step(true)"
                >
                    <i class="bi bi-skip-end-fill" aria-hidden="true" />
                </button>
            </div>

            <!-- Loop Schalter -->
            <button
                type="button"
                class="btn btn-sm"
                :class="isLooping ? 'btn-primary' : 'btn-outline-secondary'"
                :title="isLooping ? $t('additional:modules.tools.multiTimeSlider.loopActive') : $t('additional:modules.tools.multiTimeSlider.loopInactive')"
                :disabled="isDisabled"
                @click="toggleLoop"
            >
                <i class="bi bi-arrow-repeat me-1" aria-hidden="true" />
                <span class="d-none d-sm-inline">{{ $t('additional:modules.tools.multiTimeSlider.loop') }}</span>
            </button>

            <!-- Geschwindigkeitsauswahl -->
            <div class="d-flex align-items-center gap-1">
                <label
                    for="multi-time-slider-speed"
                    class="small text-muted mb-0 me-1"
                >
                    {{ $t('additional:modules.tools.multiTimeSlider.speed') }}:
                </label>
                <select
                    id="multi-time-slider-speed"
                    class="form-select form-select-sm speed-select"
                    :value="playbackSpeed"
                    :disabled="isDisabled"
                    @change="onSpeedChange"
                >
                    <option
                        v-for="opt in speedOptions"
                        :key="opt.value"
                        :value="opt.value"
                    >
                        {{ opt.label }}
                    </option>
                </select>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.playback-controls-component {
    width: 100%;

    .speed-select {
        width: auto;
        min-width: 75px;
        cursor: pointer;
    }
}
</style>
