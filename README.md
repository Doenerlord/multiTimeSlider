# multiTimeSlider AddOn for Masterportal

Masterportal 3.x AddOn zur synchronen und asynchronen zeitlichen Steuerung von mehreren WMS-T, WFS und Vektor-Layern.

## Features
- **Multi-Layer-Support:** Layerauswahl zur Steuerung mehrerer zeitbehafteter Layer.
- **Dynamische Skalen-Beschriftung:** Automatische Ausblendung überlappender Labels (Decluttering/Sampling) bei vielen Zeitstufen.
- **Live Drag-Tooltip:** Direkte Anzeige des aktuellen Datums / der Zeitstufe beim Ziehen des Sliders.
- **Playback-Steuerung:** Play, Pause, Vor-/Zurückschalten sowie konfigurierbare Abspielgeschwindigkeit.

## Struktur
```text
multiTimeSlider/
├── components/
│   └── MultiTimeSlider.vue
├── store/
│   ├── actionsMultiTimeSlider.js
│   ├── gettersMultiTimeSlider.js
│   ├── indexMultiTimeSlider.js
│   ├── mutationsMultiTimeSlider.js
│   └── stateMultiTimeSlider.js
├── locales/
│   ├── de/additional.json
│   └── en/additional.json
├── index.js
├── package.json
└── README.md
```

## Konfiguration

### `addonsConf.json`
```json
{
  "multiTimeSlider": {
    "type": "tool"
  }
}
```

### `config.js`
```javascript
Config.addons = [
  "multiTimeSlider"
];
```

### `config.json`
```json
{
  "type": "multiTimeSlider",
  "name": "Multi Time Slider",
  "icon": "bi-clock-history",
  "layers": [
    {
      "id": "wien_orthofoto_zeitreihe",
      "title": "Orthofotos Historisch",
      "timeSteps": ["1938", "1956", "1971", "1981", "1992", "2004", "2014", "2020", "2024"],
      "defaultStep": "2024"
    }
  ],
  "playbackSpeed": 1000
}
```
