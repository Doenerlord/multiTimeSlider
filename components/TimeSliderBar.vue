<script>
import {mapGetters, mapMutations} from "vuex";
import {calculateDeclutteredLabels} from "../utils/labelDeclutter.js";

/**
 * TimeSliderBar - Schieberegler mit Live-Drag-Tooltip, Ticks und dynamischem Label-Decluttering.
 * @module addons/multiTimeSlider/components/TimeSliderBar
 */
export default {
    name: "TimeSliderBar",
    data () {
        return {
            isDragging: false,
            containerWidth: 320,
            resizeObserver: null
        };
    },
    computed: {
        ...mapGetters("Modules/MultiTimeSlider", [
            "timeSteps",
            "currentStepIndex",
            "currentTimeStep"
        ]),

        /**
         * Maximale Anzahl an Schritten (0-basiert).
         * @returns {Number} Maximaler Slider-Wert.
         */
        maxStepIndex () {
            return this.timeSteps.length > 0 ? this.timeSteps.length - 1 : 0;
        },

        /**
         * Prozentuale Position des Slider-Daumens (0 bis 100).
         * @returns {Number} Position in Prozent.
         */
        thumbPercent () {
            if (this.maxStepIndex === 0) {
                return 50;
            }
            return (this.currentStepIndex / this.maxStepIndex) * 100;
        },

        /**
         * Berechnete Position des Tooltips in Pixeln für exakte Ausrichtung über dem Daumen.
         * @returns {String} CSS-Position in Pixeln.
         */
        tooltipLeftStyle () {
            const thumbWidth = 16,
                usableWidth = Math.max(0, this.containerWidth - thumbWidth),
                leftPx = (this.thumbPercent / 100) * usableWidth + (thumbWidth / 2);

            return `${leftPx}px`;
        },

        /**
         * Liste der nach Decluttering-Algorithmus sichtbaren Labels.
         * @returns {Array<Object>} Berechnete Label-Objekte.
         */
        scaleItems () {
            return calculateDeclutteredLabels(
                this.timeSteps,
                this.currentStepIndex,
                this.containerWidth,
                55
            );
        }
    },
    mounted () {
        this.initResizeObserver();
    },
    beforeUnmount () {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    },
    methods: {
        ...mapMutations("Modules/MultiTimeSlider", [
            "setCurrentStepIndex"
        ]),

        /**
         * Initialisiert den ResizeObserver zur responsiven Breitenanpassung.
         * @returns {void}
         */
        initResizeObserver () {
            if (this.$refs.sliderContainer) {
                this.containerWidth = this.$refs.sliderContainer.clientWidth || 320;

                if (window.ResizeObserver) {
                    this.resizeObserver = new ResizeObserver(entries => {
                        for (const entry of entries) {
                            if (entry.contentRect && entry.contentRect.width > 0) {
                                this.containerWidth = entry.contentRect.width;
                            }
                        }
                    });
                    this.resizeObserver.observe(this.$refs.sliderContainer);
                }
            }
        },

        /**
         * Reagiert auf die Änderung des Sliders (Live-Drag / Input-Event).
         * @param {Event} event Das HTML-Input-Event.
         * @returns {void}
         */
        onInput (event) {
            const newIndex = Number(event.target.value);

            this.setCurrentStepIndex(newIndex);
        },

        /**
         * Setzt den Drag-Zustand auf aktiv für den Tooltip.
         * @returns {void}
         */
        onDragStart () {
            this.isDragging = true;
        },

        /**
         * Beendet den Drag-Zustand.
         * @returns {void}
         */
        onDragEnd () {
            this.isDragging = false;
        },

        /**
         * Klick auf ein Ticks-Label springt direkt zu diesem Zeitschritt.
         * @param {Number} index Der Zielindex.
         * @returns {void}
         */
        onLabelClick (index) {
            this.setCurrentStepIndex(index);
        }
    }
};
</script>

<template>
    <div
        ref="sliderContainer"
        class="time-slider-bar-container py-2"
    >
        <!-- 1. Live Tooltip / Badge oberhalb des Daumens -->
        <div class="tooltip-track position-relative mb-1">
            <div
                v-if="currentTimeStep"
                class="thumb-tooltip badge shadow-sm"
                :class="isDragging ? 'bg-primary is-dragging' : 'bg-dark text-white'"
                :style="{left: tooltipLeftStyle}"
                aria-live="polite"
            >
                {{ currentTimeStep }}
                <div class="tooltip-arrow" />
            </div>
        </div>

        <!-- 2. HTML5 Range Slider mit Event-Bindung -->
        <div class="slider-wrapper position-relative">
            <input
                id="multi-time-slider-range-input"
                type="range"
                class="form-range custom-time-range"
                min="0"
                :max="maxStepIndex"
                :value="currentStepIndex"
                :disabled="timeSteps.length === 0"
                aria-label="Zeitschieberegler"
                @input="onInput"
                @mousedown="onDragStart"
                @touchstart="onDragStart"
                @mouseup="onDragEnd"
                @touchend="onDragEnd"
            >

            <!-- Ticks (Markierungsstriche) -->
            <div
                v-if="timeSteps.length > 1"
                class="slider-ticks position-relative"
                aria-hidden="true"
            >
                <span
                    v-for="item in scaleItems"
                    :key="`tick-${item.index}`"
                    class="slider-tick"
                    :class="{
                        'active': item.index === currentStepIndex,
                        'endpoint': item.isEndpoint
                    }"
                    :style="{left: `${item.percent}%`}"
                />
            </div>
        </div>

        <!-- 3. Skalenbeschriftung mit Decluttering -->
        <div
            v-if="timeSteps.length > 0"
            class="scale-labels position-relative mt-2"
        >
            <span
                v-for="item in scaleItems"
                :key="`label-${item.index}`"
                class="scale-label small"
                :class="{
                    'visible': item.isVisible,
                    'current-active fw-bold text-primary': item.isCurrent,
                    'text-muted': !item.isCurrent
                }"
                :style="{left: `${item.percent}%`}"
                @click="onLabelClick(item.index)"
            >
                <template v-if="item.isVisible">
                    {{ item.label }}
                </template>
            </span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.time-slider-bar-container {
    width: 100%;
    user-select: none;

    .tooltip-track {
        height: 28px;
    }

    .thumb-tooltip {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        font-size: 0.75rem;
        padding: 0.35rem 0.6rem;
        white-space: nowrap;
        pointer-events: none;
        transition: transform 0.1s ease, background-color 0.15s ease;
        z-index: 10;

        &.is-dragging {
            transform: translateX(-50%) scale(1.08);
        }

        .tooltip-arrow {
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 4px solid var(--bs-dark);
        }

        &.bg-primary .tooltip-arrow {
            border-top-color: var(--bs-primary);
        }
    }

    .slider-wrapper {
        padding: 0 8px;

        .custom-time-range {
            cursor: pointer;
            width: 100%;
            margin: 0;

            &:disabled {
                cursor: not-allowed;
            }
        }
    }

    .slider-ticks {
        height: 6px;
        margin-top: -2px;

        .slider-tick {
            position: absolute;
            top: 0;
            width: 2px;
            height: 5px;
            background-color: var(--bs-gray-400);
            transform: translateX(-50%);
            pointer-events: none;

            &.endpoint {
                height: 7px;
                background-color: var(--bs-gray-600);
            }

            &.active {
                background-color: var(--bs-primary);
                height: 8px;
                width: 3px;
            }
        }
    }

    .scale-labels {
        height: 18px;
        margin: 0 8px;

        .scale-label {
            position: absolute;
            transform: translateX(-50%);
            font-size: 0.75rem;
            cursor: pointer;
            white-space: nowrap;
            transition: color 0.15s ease;

            &:hover {
                color: var(--bs-primary) !important;
            }

            &.current-active {
                text-decoration: underline;
            }
        }
    }
}
</style>
