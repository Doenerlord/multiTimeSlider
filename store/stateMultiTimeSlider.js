/**
 * State des MultiTimeSlider Moduls.
 * @module addons/multiTimeSlider/store/stateMultiTimeSlider
 * @property {String} description Modulbeschreibung.
 * @property {String} icon Bootstrap Icon Klasse.
 * @property {Boolean} hasMouseMapInteractions Ob das Modul Mausinteraktionen auf der Karte nutzt.
 * @property {String} name Anzeigename / i18n Key.
 * @property {String[]} supportedDevices Unterstützte Geräte.
 * @property {String[]} supportedMapModes Unterstützte Kartenmodi.
 * @property {String} type Typ-ID des Moduls.
 * @property {Boolean} active Sichtbarkeitsstatus des Tools.
 * @property {Array<String|Object>} layerIds Konfigurierte Layer-IDs.
 * @property {Array<Object>} layers Erkannte bzw. konfigurierte Zeit-Layer {id, title, timeSteps, defaultStep}.
 * @property {String|null} activeLayerId Aktuell ausgewählte Layer-ID.
 * @property {Array<String>} timeSteps Verfügbare Zeitstufen (ISO 8601 Strings / Jahre).
 * @property {Number} currentStepIndex Aktueller Index in timeSteps.
 * @property {Boolean} isPlaying Status der Playback-Animation.
 * @property {Number} playbackSpeed Abspielgeschwindigkeit in ms.
 * @property {Boolean} isLooping Ob die Wiedergabe am Ende automatisch von vorne beginnt.
 * @property {Number|null} playbackTimer Handle des setInterval Timers.
 * @property {Object} originalLayerParams Gespeicherte Ausgangs-TIME-Parameter zur Wiederherstellung beim Cleanup.
 */
const state = {
    description: "additional:modules.tools.multiTimeSlider.description",
    icon: "bi-clock-history",
    hasMouseMapInteractions: false,
    name: "additional:modules.tools.multiTimeSlider.title",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    type: "multiTimeSlider",

    active: false,
    layerIds: [],
    layers: [],
    activeLayerId: null,
    timeSteps: [],
    currentStepIndex: 0,
    isPlaying: false,
    playbackSpeed: 1000,
    isLooping: false,
    playbackTimer: null,
    originalLayerParams: {}
};

export default state;
