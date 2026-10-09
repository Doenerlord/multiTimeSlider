import layerCollection from "@core/layers/js/layerCollection.js";

/**
 * Service zur Steuerung zeitbehafteter OpenLayers-Layer im Masterportal.
 * @module addons/multiTimeSlider/services/layerTimeService
 */

/**
 * Ermittelt die OpenLayers-Layer-Instanz anhand der Layer-ID.
 * @param {String} layerId Die ID des Layers.
 * @returns {import("ol/layer/Layer").default|null} Die OpenLayers Layer-Instanz oder null.
 */
export function getOlLayer (layerId) {
    if (!layerId) {
        return null;
    }

    try {
        const mpLayer = layerCollection.getLayerById(layerId);

        if (mpLayer) {
            if (typeof mpLayer.getLayer === "function") {
                return mpLayer.getLayer();
            }
            if (mpLayer.layer) {
                return mpLayer.layer;
            }
            return mpLayer;
        }

        // Fallback: Direkte Suche in der 2D-Karten-Layercollection
        if (typeof mapCollection !== "undefined" && mapCollection.getMap) {
            const map2D = mapCollection.getMap("2D");

            if (map2D && typeof map2D.getLayers === "function") {
                const olLayers = map2D.getLayers().getArray();

                return olLayers.find(layer => layer.get("id") === layerId) || null;
            }
        }
    }
    catch (e) {
        console.warn(`[multiTimeSlider] Fehler beim Ermitteln des Layers "${layerId}":`, e);
    }

    return null;
}

/**
 * Aktualisiert den TIME-Parameter auf der OpenLayers-Quelle des angegebenen Layers.
 * @param {String} layerId Die ID des Ziel-Layers.
 * @param {String|Number} timeValue Der zu setzende Zeitwert (z.B. "2024" oder ISO-String).
 * @returns {Boolean} true wenn erfolgreich aktualisiert, sonst false.
 */
export function updateLayerTime (layerId, timeValue) {
    if (!layerId || timeValue === undefined || timeValue === null) {
        return false;
    }

    const olLayer = getOlLayer(layerId);

    if (!olLayer) {
        return false;
    }

    try {
        if (typeof olLayer.getSource === "function") {
            const source = olLayer.getSource();

            if (source && typeof source.updateParams === "function") {
                source.updateParams({TIME: String(timeValue)});
                return true;
            }
        }

        // Alternative für WFS / Vektor-Layer mit features-Filter oder Custom updateTime
        const mpLayer = layerCollection.getLayerById(layerId);

        if (mpLayer && typeof mpLayer.updateTime === "function") {
            mpLayer.updateTime(layerId, "TIME", String(timeValue));
            return true;
        }
    }
    catch (e) {
        console.warn(`[multiTimeSlider] Fehler beim Aktualisieren der Zeitstufe für Layer "${layerId}":`, e);
    }

    return false;
}

/**
 * Liest den aktuell gesetzten TIME-Parameter eines Layers aus.
 * @param {String} layerId Die ID des Layers.
 * @returns {String|null} Der aktuelle TIME-Parameter oder null.
 */
export function getLayerTime (layerId) {
    const olLayer = getOlLayer(layerId);

    if (olLayer && typeof olLayer.getSource === "function") {
        const source = olLayer.getSource();

        if (source && typeof source.getParams === "function") {
            const params = source.getParams();

            return params?.TIME || null;
        }
    }
    return null;
}

export default {
    getOlLayer,
    updateLayerTime,
    getLayerTime
};
