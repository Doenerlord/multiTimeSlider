/**
 * Algorithmus zur dynamischen Beschriftungsreduktion (Decluttering) für Zeitstufen-Skalen.
 * @module addons/multiTimeSlider/utils/labelDeclutter
 */

/**
 * Berechnet für alle Zeitstufen, ob ihre Beschriftung auf der Skala sichtbar sein soll.
 * Start-, End- und die aktuell ausgewählte Zeitstufe werden stets priorisiert.
 *
 * @param {Array<String|Number>} timeSteps Liste aller Zeitstufen.
 * @param {Number} currentIndex Aktueller Index der ausgewählten Zeitstufe.
 * @param {Number} [containerWidth=320] Verfügbare Breite des Containers in Pixeln.
 * @param {Number} [estimatedLabelWidth=50] Geschätzte Mindestbreite pro Label inkl. Abstand in Pixeln.
 * @returns {Array<Object>} Array von Objekten mit { index, label, isVisible, isCurrent, isEndpoint, percent }
 */
export function calculateDeclutteredLabels (
    timeSteps = [],
    currentIndex = 0,
    containerWidth = 320,
    estimatedLabelWidth = 50
) {
    if (!Array.isArray(timeSteps) || timeSteps.length === 0) {
        return [];
    }

    const count = timeSteps.length,
        lastIndex = count - 1;

    // Basis-Mapping
    const items = timeSteps.map((step, index) => ({
        index,
        label: String(step),
        isVisible: false,
        isCurrent: index === currentIndex,
        isEndpoint: index === 0 || index === lastIndex,
        percent: count > 1 ? (index / lastIndex) * 100 : 50
    }));

    // Bei bis zu 6 Schritten oder ausreichend Platz: Alle Labels anzeigen
    const maxLabels = Math.max(2, Math.floor(containerWidth / estimatedLabelWidth));

    if (count <= maxLabels || count <= 5) {
        return items.map(item => ({
            ...item,
            isVisible: true
        }));
    }

    // Bei vielen Stufen: Endpunkte & aktuellen Wert immer sichtbar schalten
    items[0].isVisible = true;
    items[lastIndex].isVisible = true;

    if (currentIndex >= 0 && currentIndex < count) {
        items[currentIndex].isVisible = true;
    }

    // Berechne gleichmäßige Schrittweite für Zwischenlabels
    const interval = Math.ceil(count / (maxLabels - 1));

    for (let i = interval; i < lastIndex; i += interval) {
        // Vermeide Kollision: Mindestens 1 Schritt Abstand zum Start, Ende und aktuellem Index
        const distToStart = i,
            distToEnd = lastIndex - i,
            distToCurrent = Math.abs(i - currentIndex);

        // Mindestabstand in Pixeln / Prozent
        const minIndexDistance = Math.max(1, Math.floor(interval * 0.6));

        if (distToStart >= minIndexDistance && distToEnd >= minIndexDistance && distToCurrent >= minIndexDistance) {
            items[i].isVisible = true;
        }
    }

    return items;
}

export default {
    calculateDeclutteredLabels
};
