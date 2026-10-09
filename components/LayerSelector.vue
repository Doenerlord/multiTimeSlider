<script>
import {mapGetters, mapActions} from "vuex";

/**
 * LayerSelector - Auswahlkomponente für konfigurierte Zeit-Layer im Masterportal-Stil.
 * @module addons/multiTimeSlider/components/LayerSelector
 */
export default {
    name: "LayerSelector",
    computed: {
        ...mapGetters("Modules/MultiTimeSlider", [
            "layers",
            "activeLayerId",
            "activeLayer"
        ])
    },
    methods: {
        ...mapActions("Modules/MultiTimeSlider", [
            "selectLayer"
        ]),

        /**
         * Behandelt die Änderung des ausgewählten Layers im Dropdown.
         * @param {Event} event Das Change-Event des Select-Felds.
         * @returns {void}
         */
        onLayerChange (event) {
            this.selectLayer(event.target.value);
        }
    }
};
</script>

<template>
    <div class="layer-selector-component mb-3">
        <label
            for="multi-time-slider-layer-select"
            class="form-label fw-bold mb-1"
        >
            {{ $t("additional:modules.tools.multiTimeSlider.selectLayer") }}
        </label>
        <div class="input-group input-group-sm">
            <span class="input-group-text bg-white border-end-0">
                <i
                    class="bi bi-layers-fill text-muted"
                    aria-hidden="true"
                />
            </span>
            <select
                id="multi-time-slider-layer-select"
                class="form-select form-select-sm border-start-0"
                :value="activeLayerId || ''"
                :disabled="layers.length === 0"
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
    </div>
</template>

<style lang="scss" scoped>
.layer-selector-component {
    width: 100%;

    .form-select {
        cursor: pointer;

        &:disabled {
            cursor: not-allowed;
            background-color: var(--bs-gray-200);
        }
    }
}
</style>
