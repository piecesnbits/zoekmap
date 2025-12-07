export default class OverlayManager {
  constructor(map, paneName = 'overlayPaneTop', zIndex = 200) {
    this.map = map;
    this.paneName = paneName;
    if (!this.map.getPane(this.paneName)) {
      this.map.createPane(this.paneName);
      this.map.getPane(this.paneName).style.zIndex = zIndex;
    }
  }

  register(toggleId, sliderId, layerConfigs, visibleByDefault = false) {
    const configs = Array.isArray(layerConfigs) ? layerConfigs : [layerConfigs];
    const layers = [];

    configs.forEach(cfg => {
      let layer;
      const options = {
        attribution: cfg.attribution,
        opacity: 1.0,
        pane: this.paneName,
        bounds: cfg.bounds,
        noWrap: true,
        continuousWorld: false,
        ...cfg.extraOptions
      };

      if (cfg.type === 'wms') {
        layer = L.tileLayer.wms(cfg.url, {
            ...options,
            layers: cfg.layers,
            format: 'image/png',
            transparent: true,
            version: cfg.version || '1.1.1'
        });
      } else {
        layer = L.tileLayer(cfg.url, options);
      }
      layers.push(layer);
      if (visibleByDefault) layer.addTo(this.map);
    });

    const checkbox = document.getElementById(toggleId);
    const slider = document.getElementById(sliderId);

    if (checkbox) {
      checkbox.checked = visibleByDefault;
      checkbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        layers.forEach(l => {
          if (isChecked) l.addTo(this.map);
          else this.map.removeLayer(l);
        });
      });
    }

    if (slider) {
      slider.addEventListener('input', (e) => {
        layers.forEach(l => l.setOpacity(e.target.value));
      });
    }

    return layers;
  }
}
