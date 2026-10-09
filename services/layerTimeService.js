import layerCollection from "@core/layers/js/layerCollection.js";

/**
 * Service zur Steuerung zeitbehafteter OpenLayers-Layer im Masterportal.
 * Unterstützt sowohl:
 * 1. Multi-Layer-Sequenzen (z.B. Wien historische Luftbilder oder thematische WFS-Layer wie Hundezonen, Sammelstellen)
 *    inklusive stufenlosem Überblenden (Crossfading/Transparenz).
 * 2. Klassische WMS-T Layer mit TIME-Parameter (updateParams({ TIME })).
 *
 * @module addons/multiTimeSlider/services/layerTimeService
 */

// Cache für ursprüngliche Layer-Zustände vor Öffnen des Tools
const initialLayerStates = new Map();

/**
 * Ermittelt das OpenLayers-Layer-Objekt und den Masterportal-Wrapper für eine Layer-ID.
 * @param {String} layerId Die ID des Layers.
 * @returns {{ mpLayer: Object|null, olLayer: Object|null }}
 */
export function getLayers (layerId) {
    if (!layerId) {
        return {mpLayer: null, olLayer: null};
    }

    try {
        const mpLayer = layerCollection.getLayerById(layerId);
        let olLayer = null;

        if (mpLayer) {
            olLayer = typeof mpLayer.getLayer === "function" ? mpLayer.getLayer() : mpLayer.layer || null;
        }

        if (!olLayer && typeof mapCollection !== "undefined" && mapCollection.getMap) {
            const map2D = mapCollection.getMap("2D");

            if (map2D && typeof map2D.getLayers === "function") {
                olLayer = map2D.getLayers().getArray().find(l => l.get("id") === layerId) || null;
            }
        }

        return {mpLayer, olLayer};
    }
    catch (e) {
        console.warn(`[multiTimeSlider] Fehler beim Ermitteln des Layers "${layerId}":`, e);
        return {mpLayer: null, olLayer: null};
    }
}

/**
 * Speichert den Ausgangszustand eines Layers, falls noch nicht gesichert.
 * @param {String} layerId Layer-ID.
 * @param {Object} [rootGetters=null] Vuex rootGetters zur Ermittlung des Zustands.
 * @returns {void}
 */
export function recordInitialState (layerId, rootGetters = null) {
    if (!layerId || initialLayerStates.has(layerId)) {
        return;
    }

    const {mpLayer, olLayer} = getLayers(layerId);
    let visibility = false,
        transparency = 0;

    if (olLayer && typeof olLayer.getVisible === "function") {
        visibility = olLayer.getVisible();
        transparency = Math.round(100 - (olLayer.getOpacity() * 100));
    }
    else if (rootGetters?.allLayerConfigs) {
        const cfg = rootGetters.allLayerConfigs.find(c => c.id === layerId);

        if (cfg) {
            visibility = cfg.visibility ?? false;
            transparency = cfg.transparency ?? 0;
        }
    }

    initialLayerStates.set(layerId, {visibility, transparency});
}

/**
 * Setzt Sichtbarkeit und Transparenz für einen Layer synchron im Masterportal-Store und auf OpenLayers.
 * @param {String} layerId Die ID des Layers.
 * @param {Boolean} visibility Sichtbarkeit (true/false).
 * @param {Number} [transparency=0] Transparenz in Prozent (0 bis 100).
 * @param {Function} [dispatch=null] Vuex dispatch-Funktion.
 * @returns {void}
 */
export function setLayerVisibilityAndTransparency (layerId, visibility, transparency = 0, dispatch = null) {
    if (!layerId) {
        return;
    }

    const clampedTransparency = Math.max(0, Math.min(100, Math.round(transparency))),
        opacity = Math.max(0, Math.min(1, 1 - (clampedTransparency / 100))),
        {mpLayer, olLayer} = getLayers(layerId);

    // 1. Direkt auf OpenLayers anwenden (für flüssige 60fps-Animation)
    if (olLayer) {
        if (typeof olLayer.setVisible === "function") {
            olLayer.setVisible(visibility);
        }
        if (typeof olLayer.setOpacity === "function") {
            olLayer.setOpacity(opacity);
        }
    }

    if (mpLayer) {
        if (typeof mpLayer.setVisible === "function") {
            mpLayer.setVisible(visibility);
        }
        if (typeof mpLayer.setTransparency === "function") {
            mpLayer.setTransparency(clampedTransparency);
        }
    }

    // 2. Masterportal-LayerConfig im Root-Store synchronisieren
    if (typeof dispatch === "function") {
        if (!mpLayer && visibility) {
            // Falls der Layer (z.B. WFS) noch gar nicht im Layertree aktiv ist, dynamisch laden
            dispatch("addOrReplaceLayer", {
                layerId,
                visibility: true,
                transparency: clampedTransparency
            }, {root: true});
        }
        else {
            dispatch("replaceByIdInLayerConfig", {
                layerConfigs: [{
                    id: layerId,
                    layer: {
                        visibility,
                        transparency: clampedTransparency
                    }
                }]
            }, {root: true});
        }
    }
}

/**
 * Führt ein sanftes Überblenden (Crossfading) zwischen benachbarten Layern einer Sequenz durch.
 * Wenn position eine Kommazahl ist (z. B. 2.4), wird Layer 2 mit 60% Deckkraft und Layer 3 mit 40% Deckkraft angezeigt.
 *
 * @param {Array<Object>} layerSequence Array von { title, layerId }.
 * @param {Number} position Fließkomma-Position auf der Skala (0 bis layerSequence.length - 1).
 * @param {Function} [dispatch=null] Vuex dispatch-Funktion.
 * @returns {void}
 */
export function crossfadeLayerSequence (layerSequence = [], position = 0, dispatch = null) {
    if (!Array.isArray(layerSequence) || layerSequence.length === 0) {
        return;
    }

    const count = layerSequence.length,
        clampedPos = Math.max(0, Math.min(count - 1, position)),
        lowerIndex = Math.floor(clampedPos),
        upperIndex = Math.ceil(clampedPos),
        fraction = clampedPos - lowerIndex;

    layerSequence.forEach((item, index) => {
        const id = item.layerId;

        if (!id) {
            return;
        }

        // Ausgangszustand festhalten
        recordInitialState(id);

        if (lowerIndex === upperIndex) {
            // Exakt auf einer Zeitstufe
            if (index === lowerIndex) {
                setLayerVisibilityAndTransparency(id, true, 0, dispatch);
            }
            else {
                setLayerVisibilityAndTransparency(id, false, 0, dispatch);
            }
        }
        else {
            // Zwischen zwei Zeitstufen: Weiches Überblenden
            if (index === lowerIndex) {
                // Linker Layer blendet aus
                const trans = fraction * 100;

                setLayerVisibilityAndTransparency(id, true, trans, dispatch);
            }
            else if (index === upperIndex) {
                // Rechter Layer blendet ein
                const trans = (1 - fraction) * 100;

                setLayerVisibilityAndTransparency(id, true, trans, dispatch);
            }
            else {
                // Alle übrigen Layer inaktiv
                setLayerVisibilityAndTransparency(id, false, 0, dispatch);
            }
        }
    });
}

/**
 * Aktiviert exakt den Ziel-Layer an index und blendet alle anderen aus.
 * @param {Array<Object>} layerSequence Sequenz von { title, layerId }.
 * @param {Number} targetIndex Zielindex.
 * @param {Function} [dispatch=null] Vuex dispatch.
 * @returns {void}
 */
export function showExactLayer (layerSequence = [], targetIndex = 0, dispatch = null) {
    crossfadeLayerSequence(layerSequence, targetIndex, dispatch);
}

/**
 * Aktualisiert den TIME-Parameter für klassische WMS-T Layer.
 * @param {String} layerId Layer-ID.
 * @param {String|Number} timeValue Zeitwert.
 * @returns {Boolean}
 */
export function updateWmsTime (layerId, timeValue) {
    if (!layerId || timeValue === undefined || timeValue === null) {
        return false;
    }

    const {olLayer, mpLayer} = getLayers(layerId);

    if (olLayer && typeof olLayer.getSource === "function") {
        const source = olLayer.getSource();

        if (source && typeof source.updateParams === "function") {
            source.updateParams({TIME: String(timeValue)});
            return true;
        }
    }

    if (mpLayer && typeof mpLayer.updateTime === "function") {
        mpLayer.updateTime(layerId, "TIME", String(timeValue));
        return true;
    }

    return false;
}

/**
 * Liest den TIME-Parameter aus.
 * @param {String} layerId Layer-ID.
 * @returns {String|null}
 */
export function getWmsTime (layerId) {
    const {olLayer} = getLayers(layerId);

    if (olLayer && typeof olLayer.getSource === "function") {
        const source = olLayer.getSource();

        if (source && typeof source.getParams === "function") {
            return source.getParams()?.TIME || null;
        }
    }
    return null;
}

/**
 * Stellt die ursprünglichen Zustände aller geänderten Layer wieder her (Cleanup).
 * @param {Function} [dispatch=null] Vuex dispatch.
 * @returns {void}
 */
export function restoreAllInitialStates (dispatch = null) {
    initialLayerStates.forEach((state, layerId) => {
        setLayerVisibilityAndTransparency(layerId, state.visibility, state.transparency, dispatch);
    });
    initialLayerStates.clear();
}

export default {
    getLayers,
    recordInitialState,
    setLayerVisibilityAndTransparency,
    crossfadeLayerSequence,
    showExactLayer,
    updateWmsTime,
    getWmsTime,
    restoreAllInitialStates
};
